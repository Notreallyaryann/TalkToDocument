import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deleteDocumentFromGraph } from "@/lib/neo4j";
import { deleteDocumentVectors } from "@/lib/qdrant";
import connectDB from "@/lib/db";
import Document from "@/models/Document";
import Chat from "@/models/Chat";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check
        const rl = checkRateLimit(`${userId}:documents`, RATE_LIMITS.DOCUMENTS.limit, RATE_LIMITS.DOCUMENTS.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        await connectDB();
        
        // Fetch documents
        const docs = await Document.find({ userId }).sort({ uploadDate: -1 }).lean();
        
        // Enrich with last chat message
        const enrichedDocs = await Promise.all(docs.map(async (doc) => {
            const chat = await Chat.findOne({ userId, documentId: doc.documentId }).lean();
            const lastMessage = chat?.messages?.[chat.messages.length - 1]?.content || null;
            return {
                ...doc,
                lastMessage: lastMessage ? (lastMessage.length > 60 ? lastMessage.substring(0, 60) + "..." : lastMessage) : null
            };
        }));
        
        return NextResponse.json({ documents: enrichedDocs });
    } catch (error) {
        console.error("Documents list error:", error);
        return NextResponse.json(
            { error: "Failed to list documents" },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check
        const rl = checkRateLimit(`${userId}:documents_delete`, RATE_LIMITS.DOCUMENTS_DELETE.limit, RATE_LIMITS.DOCUMENTS_DELETE.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        const { documentId } = await req.json();
        if (!documentId) {
            return NextResponse.json({ error: "No documentId provided" }, { status: 400 });
        }

        await connectDB();

        // Delete from all databases
        await Promise.all([
            deleteDocumentVectors(userId, documentId),
            deleteDocumentFromGraph(userId, documentId),
            Document.deleteOne({ userId, documentId }),
            Chat.deleteOne({ userId, documentId })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Document delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete document" },
            { status: 500 }
        );
    }
}
