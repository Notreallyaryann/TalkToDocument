import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

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
                { error: "File too large. Maximum size is 30MB." },
                { status: 413 }
            );
        }

        const fileNameLower = (file.name || "").toLowerCase();
        if (!fileNameLower.endsWith(".pdf") && !fileNameLower.endsWith(".xlsx") && !fileNameLower.endsWith(".xls")) {
            return NextResponse.json({ error: "Only PDF and Excel files (.pdf, .xlsx, .xls) are supported" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";
        let numPages = 0;

        // Use centralized extraction functions for consistency
        const { extractPdfText, extractExcelText, processDocument } = await import('@/lib/ingestion');

        if (fileNameLower.endsWith(".pdf")) {
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

        const fileType = fileNameLower.endsWith(".pdf") ? "pdf" : "excel";
        const result = await processDocument(userId, file.name, fileType, text);

        return NextResponse.json({
            success: true,
            ...result,
            pages: numPages,
        });
    } catch (error) {
        console.error("Upload error:", error);
        
        // Categorize document parsing / user input / security errors as 400 Bad Request
        const isClientError = error.message?.includes("corrupted") ||
            error.message?.includes("cross-reference table") ||
            error.message?.includes("password") ||
            error.message?.includes("valid PDF") ||
            error.message?.includes("Could not extract") ||
            error.message?.includes("empty") ||
            error.message?.includes("Security Violation") ||
            error.message?.includes("Failed to parse PDF");

        const statusCode = isClientError ? 400 : 500;
        const safeError = isClientError
            ? error.message
            : process.env.NODE_ENV === "development"
                ? error.message
                : "Failed to process document. Please try again.";

        return NextResponse.json(
            { error: safeError },
            { status: statusCode }
        );
    }
}
