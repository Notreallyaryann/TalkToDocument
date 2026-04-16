import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { searchVectors } from "@/lib/qdrant";
import { chatWithCerebras, extractEntities } from "@/lib/cerebras";
import { webSearch } from "@/lib/tavily";
import {
    storeConversation,
    getConversationHistory,
    queryKnowledgeGraph,
} from "@/lib/neo4j";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import connectDB from "@/lib/db";
import Document from "@/models/Document";

// Max message length to prevent abuse
const MAX_MESSAGE_LENGTH = 10000;
// Max messages to keep in chat history (prevents MongoDB 16MB limit)
const MAX_CHAT_MESSAGES = 200;
// Messages older than this are purged
const CHAT_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check (per user, 12h window)
        const rl = await checkRateLimit(`${userId}:chat`, RATE_LIMITS.CHAT.limit, RATE_LIMITS.CHAT.window);
        if (rl.limited) return rateLimitResponse(rl);

        const { message, documentId, useWebSearch } = await req.json();

        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 });
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            return NextResponse.json(
                { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.` },
                { status: 400 }
            );
        }

        // Document ownership verification
        if (documentId) {
            await connectDB();
            const doc = await Document.findOne({ userId, documentId });
            if (!doc) {
                return NextResponse.json({ error: "Document not found" }, { status: 404 });
            }
        }

        //  Get RAG context from Qdrant
        let ragContext = "";
        if (documentId) {
            try {
                const { getEmbedding } = await import('@/lib/embeddings');

                console.log('🔍 Generating embedding for query...');
                const queryEmbedding = await getEmbedding(message);

                const results = await searchVectors(queryEmbedding, userId, documentId, 5);
                if (results && results.length > 0) {
                    ragContext = results
                        .map((r) => {
                            const sourceLabel = r.payload.source === "youtube" ? "🎥 YOUTUBE TRANSCRIPT" : "📄 DOCUMENT";
                            return `[Source: ${sourceLabel} - ${r.payload.fileName}]\n${r.payload.text}`;
                        })
                        .join("\n\n---\n\n");
                }
            } catch (error) {
                console.error("RAG retrieval error:", error.message);
            }
        }

        //  Web search if requested
        let webContext = "";
        let webResults = [];
        if (useWebSearch) {
            try {
                const searchData = await webSearch(message);
                if (searchData.answer) {
                    webContext = `Web Search Answer: ${searchData.answer}`;
                }
                webResults = searchData.results || [];
                if (webResults.length > 0 && !webContext) {
                    webContext = webResults
                        .map((r, i) => `${i + 1}. ${r.title}: ${r.content}`)
                        .join("\n\n");
                }
            } catch (error) {
                console.error("Web search error:", error.message);
            }
        }

        //  Knowledge graph context
        let kgContext = "";
        try {
            kgContext = await queryKnowledgeGraph(userId, message);
            if (kgContext === "Knowledge graph not configured." || kgContext === "No related information found in knowledge graph.") {
                kgContext = "";
            }
        } catch (error) {
            console.error("Knowledge graph error:", error.message);
        }

        // Get conversation history from MongoDB
        let history = [];
        if (documentId) {
            try {
                const Chat = (await import('@/models/Chat')).default;
                await connectDB();
                
                const chatDoc = await Chat.findOne({ userId, documentId });
                if (chatDoc && chatDoc.messages) {
                    // Take last 5 messages (or last 10 roles)
                    history = chatDoc.messages.slice(-5);
                }
            } catch (error) {
                console.error("MongoDB history retrieval error:", error.message);
            }
        }

        //  Build messages for Cerebras
        let systemContent = `You are RagSphere AI, an intelligent assistant that helps users understand their documents and videos.
You answer questions accurately based on the provided context. The context may include text from PDFs, Excel sheets, or YouTube transcripts.
If the context mentions a video transcript, treat it as video content.
Format your responses using Markdown for better readability.`;

        if (ragContext) {
            systemContent += `\n\n📄 DOCUMENT CONTEXT:\n${ragContext}`;
        }

        if (webContext) {
            systemContent += `\n\n🌐 WEB SEARCH RESULTS:\n${webContext}`;
        }

        if (kgContext) {
            systemContent += `\n\n KNOWLEDGE GRAPH CONTEXT:\n${kgContext}`;
        }

        const messages = [{ role: "system", content: systemContent }];

        // Add conversation history
        for (const h of history) {
            messages.push({ role: h.role, content: h.content });
        }

        messages.push({ role: "user", content: message });

        //  Get response from Cerebras
        const answer = await chatWithCerebras(messages);

        //  Store in MongoDB with $slice to cap array + purge old messages
        try {
            const Chat = (await import('@/models/Chat')).default;
            await connectDB();
            
            // Push new messages with $slice cap to prevent unbounded growth
            await Chat.findOneAndUpdate(
                { userId, documentId },
                { 
                    $push: { 
                        messages: {
                            $each: [
                                { role: "user", content: message },
                                { role: "assistant", content: answer }
                            ],
                            $slice: -MAX_CHAT_MESSAGES
                        }
                    } 
                },
                { upsert: true, returnDocument: "after" }
            );

            // Purge messages older than 2 days
            const twoDaysAgo = new Date(Date.now() - CHAT_TTL_MS);
            await Chat.updateOne(
                { userId, documentId },
                { $pull: { messages: { timestamp: { $lt: twoDaysAgo } } } }
            ).catch(err => console.error("Chat TTL cleanup error:", err.message));
        } catch (mongoError) {
            console.error("MongoDB chat storage error:", mongoError);
        }

        //  Store conversation in Neo4j (async, don't await)
        if (documentId) {
            const entities = await extractEntities(message + " " + answer);
            storeConversation(userId, documentId, message, answer, entities).catch(
                (err) => console.error("Store conversation error:", err.message)
            );
        }

        return NextResponse.json({
            answer,
            sources: {
                hasDocumentContext: !!ragContext,
                hasWebSearch: !!webContext,
                webResults,
                hasKnowledgeGraph: !!kgContext,
            },
        });
    } catch (error) {
        console.error("Chat error:", error.message);
        return NextResponse.json(
            { error: "I'm having trouble connecting to the AI right now. Please try again in a moment." },
            { status: 500 }
        );
    }
}
