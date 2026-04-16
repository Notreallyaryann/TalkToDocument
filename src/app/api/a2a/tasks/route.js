
import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchUrlAsBuffer, detectFileType } from "@/lib/fetch-url";
import { processDocument, extractPdfText, extractExcelText } from "@/lib/ingestion";
import { searchVectors } from "@/lib/qdrant";
import { chatWithCerebras } from "@/lib/cerebras";
import { webSearch } from "@/lib/tavily";
import { queryKnowledgeGraph } from "@/lib/neo4j";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// Hash API key to compare against stored hash
function hashApiKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
}

// CORS headers for external agent access
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-a2a-key",
};

// Define strict schemas for incoming requests
const IngestSchema = z.object({
    skill: z.literal("ingest"),
    input: z.object({
        source_url: z.string().url("Invalid source URL"),
    }),
});

const QuerySchema = z.object({
    skill: z.literal("query"),
    input: z.object({
        question: z.string().min(1, "Question cannot be empty"),
        document_id: z.string().min(1, "Document ID is required"),
        use_web_search: z.boolean().optional().default(false),
    }),
});

const RequestSchema = z.union([IngestSchema, QuerySchema]);

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req) {
    try {
        //  Authentication Check (compare hashed key)
        const apiKey = req.headers.get("x-a2a-key");
        if (!apiKey) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Missing x-a2a-key header" },
                { status: 401, headers: corsHeaders }
            );
        }

        await connectDB();
        const hashedKey = hashApiKey(apiKey);
        const user = await User.findOne({ apiKey: hashedKey });

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized", message: "Invalid API Key" },
                { status: 401, headers: corsHeaders }
            );
        }

        const userId = user._id.toString();

        // Rate limit check (per user, 100 requests per 12h)
        const rl = checkRateLimit(`${userId}:a2a`, RATE_LIMITS.A2A_TASKS.limit, RATE_LIMITS.A2A_TASKS.windowMs);
        if (rl.limited) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: `Too many requests. Try again later.`,
                    retryAfter: rl.retryAfter,
                },
                { status: 429, headers: { ...corsHeaders, "Retry-After": String(rl.retryAfter) } }
            );
        }

        // Body Parsing & Validation
        const body = await req.json().catch(() => ({}));
        const validation = RequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: "Bad Request",
                message: "Invalid input parameters",
                details: validation.error.format()
            }, { status: 400, headers: corsHeaders });
        }

        const { skill, input } = validation.data;

        //  Skill Implementation: Ingest
        if (skill === "ingest") {
            const { source_url } = input;
            const type = detectFileType(source_url);

            if (type === "youtube") {
                const videoIdMatch = source_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                if (!videoId) return NextResponse.json({ error: "Validation Error", message: "Invalid YouTube URL format" }, { status: 400, headers: corsHeaders });

                const { YoutubeTranscript } = await import('youtube-transcript');
                const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
                const fullText = transcriptData.map(item => item.text).join(" ");

                const result = await processDocument(userId, `YouTube: ${videoId}`, "youtube", fullText);
                return NextResponse.json({ status: "success", output: result }, { headers: corsHeaders });

            } else if (type === "pdf" || type === "excel") {
                const buffer = await fetchUrlAsBuffer(source_url);
                let text = "";
                const fileName = source_url.split('/').pop() || "downloaded_file";

                // Use centralized extraction functions for consistency with dashboard uploads
                if (type === "pdf") {
                    const result = await extractPdfText(buffer);
                    text = result.text;
                } else {
                    const result = extractExcelText(buffer);
                    text = result.text;
                }

                const result = await processDocument(userId, fileName, type, text);
                return NextResponse.json({ status: "success", output: result }, { headers: corsHeaders });
            } else {
                return NextResponse.json({
                    error: "Unsupported Source",
                    message: "Currently only YouTube, PDF, and Excel URLs are supported."
                }, { status: 400, headers: corsHeaders });
            }
        }

        //  Skill Implementation: Query
        if (skill === "query") {
            const { question, document_id, use_web_search } = input;

            // RAG Context Gathering
            const { getEmbedding } = await import('@/lib/embeddings');
            const queryEmbedding = await getEmbedding(question);
            const vectorResults = await searchVectors(queryEmbedding, userId, document_id, 5);

            if (!vectorResults || vectorResults.length === 0) {
                return NextResponse.json({
                    error: "Resource Not Found",
                    message: "No context found for the given document_id. Has it been ingested?"
                }, { status: 404, headers: corsHeaders });
            }

            const ragContext = vectorResults.map(r => r.payload.text).join("\n\n");
            const kgContext = await queryKnowledgeGraph(userId, question);

            let webContext = "";
            if (use_web_search) {
                const searchData = await webSearch(question);
                webContext = searchData.answer || (searchData.results || []).map(r => r.content).join("\n");
            }

            const systemContent = `You are RagSphere AI. Answer based on context.\n\nCONTEXT:\n${ragContext}\n\nKG:\n${kgContext}\n\nWEB:\n${webContext}`;
            const answer = await chatWithCerebras([
                { role: "system", content: systemContent },
                { role: "user", content: question }
            ]);

            return NextResponse.json({
                status: "success",
                output: { answer, document_id }
            }, { headers: corsHeaders });
        }

    } catch (error) {
        console.error("[A2A_TASK_ERROR]:", error);

        return NextResponse.json({
            error: "Internal Server Error",
            message: "An unexpected error occurred while processing your task.",
            debug_info: process.env.NODE_ENV === "development" ? error.message : undefined
        }, { status: 500, headers: corsHeaders });
    }
}
