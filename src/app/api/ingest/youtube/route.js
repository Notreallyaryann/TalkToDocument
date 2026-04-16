import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { YoutubeTranscript } from 'youtube-transcript';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check (30 YouTube ingestions per 12h)
        const rl = checkRateLimit(`${userId}:youtube`, RATE_LIMITS.YOUTUBE.limit, RATE_LIMITS.YOUTUBE.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        const { url } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        if (url.length > 500) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        // Extract video ID - supports watch, embed, shorts, and youtube links
        const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
        }

        console.log(`🎥 Fetching transcript for video: ${videoId}`);

        let transcriptData;
        try {
            transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        } catch (error) {
            console.error("Transcript fetch error:", error);
            return NextResponse.json({ error: "Could not fetch transcript. The video might not have captions enabled." }, { status: 400 });
        }

        if (!transcriptData || transcriptData.length === 0) {
            return NextResponse.json({ error: "Empty transcript" }, { status: 400 });
        }

        // Combine transcript segments
        const fullText = transcriptData
            .map(item => item.text)
            .join(" ")
            .replace(/&#39;/g, "'") //converted into HTML Entities
            .replace(/&quot;/g, '"');

        const { processDocument } = await import('@/lib/ingestion');
        const fileName = `YouTube: ${videoId}`;
        
        const result = await processDocument(userId, fileName, "youtube", fullText);

        return NextResponse.json({
            success: true,
            ...result,
            videoId
        });
    } catch (error) {
        console.error("YouTube ingestion error:", error);
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "Failed to process YouTube video. Please try again.";
        return NextResponse.json(
            { error: safeError },
            { status: 500 }
        );
    }
}
