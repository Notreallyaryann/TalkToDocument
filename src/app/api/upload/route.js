import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check (30 uploads per 12h)
        const rl = await checkRateLimit(`${userId}:upload`, RATE_LIMITS.UPLOAD.limit, RATE_LIMITS.UPLOAD.window);
        if (rl.limited) return rateLimitResponse(rl);

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Server-side file size enforcement
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 50MB." },
                { status: 413 }
            );
        }

        if (!file.name.endsWith(".pdf") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            return NextResponse.json({ error: "Only PDF and Excel files are supported" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";
        let numPages = 0;

        // Use centralized extraction functions for consistency
        const { extractPdfText, extractExcelText, processDocument } = await import('@/lib/ingestion');

        if (file.name.endsWith(".pdf")) {
            const result = await extractPdfText(buffer);
            text = result.text;
            numPages = result.numPages;
        } else {
            const result = extractExcelText(buffer);
            text = result.text;
            numPages = result.numSheets;
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from document" }, { status: 400 });
        }

        const fileType = file.name.endsWith(".pdf") ? "pdf" : "excel";
        const result = await processDocument(userId, file.name, fileType, text);

        return NextResponse.json({
            success: true,
            ...result,
            pages: numPages,
        });
    } catch (error) {
        console.error("Upload error:", error);
        // Sanitize error message — don't leak internals in production
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "Failed to process document. Please try again.";
        return NextResponse.json(
            { error: safeError },
            { status: 500 }
        );
    }
}
