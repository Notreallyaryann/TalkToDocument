import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";
import { scrapeUrl } from "@/lib/scraper";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // Rate limit check
        const rl = await checkRateLimit(`${userId}:web_ingest`, RATE_LIMITS.WEB_INGEST.limit, RATE_LIMITS.WEB_INGEST.window);
        if (rl.limited) return rateLimitResponse(rl);

        const { url } = await req.json();

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "No URL provided" }, { status: 400 });
        }

        // Basic URL validation
        if (!url.startsWith("http")) {
            return NextResponse.json({ error: "Invalid URL. Must start with http:// or https://" }, { status: 400 });
        }

        console.log(`🌐 Scraping website: ${url}`);

        let text;
        try {
            text = await scrapeUrl(url);
        } catch (error) {
            console.error("Scrape error:", error);
            return NextResponse.json({ error: "Could not scrape the website. It may be blocking automated access." }, { status: 400 });
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Scraped content is empty" }, { status: 400 });
        }

        const { processDocument } = await import('@/lib/ingestion');
        // Extract a clean filename from the URL
        const fileName = url.replace(/^https?:\/\//, "").split("/")[0] || "web_page";

        const result = await processDocument(userId, `Web: ${fileName}`, "web", text);

        return NextResponse.json({
            success: true,
            ...result,
            url
        });
    } catch (error) {
        console.error("Web ingestion error:", error);
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "Failed to process website. Please try again.";
        return NextResponse.json(
            { error: safeError },
            { status: 500 }
        );
    }
}
