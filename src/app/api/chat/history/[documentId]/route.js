import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check
        const rl = checkRateLimit(`${userId}:chat_history`, RATE_LIMITS.CHAT_HISTORY.limit, RATE_LIMITS.CHAT_HISTORY.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        const { documentId } = params;

        if (!documentId) {
            return NextResponse.json({ error: "No documentId provided" }, { status: 400 });
        }

        await connectDB();
        
        // Return only last 50 messages for performance (prevents multi-MB responses)
        const chatDoc = await Chat.findOne(
            { userId, documentId },
            { messages: { $slice: -50 } }
        );
        
        return NextResponse.json({ 
            messages: chatDoc?.messages || [] 
        });
    } catch (error) {
        console.error("Chat history error:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat history" },
            { status: 500 }
        );
    }
}
