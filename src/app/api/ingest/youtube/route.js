import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
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
            .replace(/&amp;#39;/g, "'") //converted into HTML Entities
            .replace(/&quot;/g, '"');

        const { chunkText, getEmbeddings } = await import('@/lib/embeddings');

        // Chunk the text
        const chunks = chunkText(fullText, 1000, 200);
        const documentId = uuidv4();
        const fileName = `YouTube: ${videoId}`;

        // Get embeddings in batches
        const batchSize = 10;
        const allPoints = [];

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const embeddings = await getEmbeddings(batch);

            for (let j = 0; j < batch.length; j++) {
                allPoints.push({
                    id: uuidv4(),
                    vector: embeddings[j],
                    payload: {
                        text: batch[j],
                        userId,
                        documentId,
                        fileName,
                        chunkIndex: i + j,
                        totalChunks: chunks.length,
                        source: "youtube",
                        videoId: videoId
                    },
                });
            }
        }

        const { upsertVectors } = await import('@/lib/qdrant');
        await upsertVectors(allPoints);

        const { storeDocumentMetadata } = await import('@/lib/neo4j');
        await storeDocumentMetadata(userId, documentId, fileName, chunks.length);

        return NextResponse.json({
            success: true,
            documentId,
            fileName,
            chunks: chunks.length,
            videoId
        });
    } catch (error) {
        console.error("YouTube ingestion error:", error);
        return NextResponse.json(
            { error: "Failed to process YouTube video: " + error.message },
            { status: 500 }
        );
    }
}
