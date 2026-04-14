import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Chat from "@/models/Chat";

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { documentId } = params;
        const userId = session.user.id;

        if (!documentId) {
            return NextResponse.json({ error: "No documentId provided" }, { status: 400 });
        }

        await connectDB();
        
        const chatDoc = await Chat.findOne({ userId, documentId });
        
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
