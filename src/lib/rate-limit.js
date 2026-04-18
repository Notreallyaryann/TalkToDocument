import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


let redis = null;
let ratelimit = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Create a generic ratelimit instance - though we'll often use dynamic limits
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"), // Default fallback
        analytics: true,
        prefix: "@ragsphere/ratelimit",
    });
} else {
    console.warn("⚠️ Upstash Redis credentials missing. Rate limiting will fall back to in-memory (not serverless-safe).");
}

const rateLimitStore = new Map();
const CLEANUP_INTERVAL = 60 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetAt) rateLimitStore.delete(key);
    }
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    return `${Math.ceil(seconds / 3600)} hours`;
}

/**
 * Check rate limit for a given key.
 * Now ASYNCHRONOUS to support Redis.
 * 
 * @param {string} key - Unique identifier
 * @param {number} limit - Max requests
 * @param {number|string} window - Time window (ms for memory, string e.g. "12h" for Redis)
 */
export async function checkRateLimit(key, limit = 100, window = "12h") {
    // If Redis is configured, use it
    if (redis) {
        try {
            // Re-initialize with specific limit/window for this call
            const specificRatelimit = new Ratelimit({
                redis: redis,
                limiter: Ratelimit.slidingWindow(limit, typeof window === 'number' ? `${Math.floor(window / 1000)} s` : window),
                prefix: "@ragsphere/ratelimit",
            });

            const result = await specificRatelimit.limit(key);
            return {
                limited: !result.success,
                remaining: result.remaining,
                retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
                total: result.limit
            };
        } catch (error) {
            console.error("Rate limit Redis error:", error);
            // Fall through to in-memory on Redis failure
        }
    }

    // Fallback: In-memory Map
    cleanup();
    const now = Date.now();
    const windowMs = typeof window === 'string' ? parseWindow(window) : window;
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, remaining: limit - 1 };
    }

    entry.count++;
    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { limited: true, remaining: 0, retryAfter };
    }

    return { limited: false, remaining: limit - entry.count };
}

function parseWindow(window) {
    const unit = window.slice(-1);
    const val = parseInt(window.slice(0, -1));
    switch (unit) {
        case 's': return val * 1000;
        case 'm': return val * 60 * 1000;
        case 'h': return val * 60 * 60 * 1000;
        case 'd': return val * 24 * 60 * 60 * 1000;
        default: return 12 * 60 * 60 * 1000;
    }
}

/**
 * Return a 429 Too Many Requests response.
 */
export function rateLimitResponse(result) {
    return NextResponse.json(
        {
            error: "Rate limit exceeded",
            message: `Too many requests. Try again in ${formatDuration(result.retryAfter)}.`,
            retryAfter: result.retryAfter,
        },
        {
            status: 429,
            headers: {
                "Retry-After": String(result.retryAfter),
                "X-RateLimit-Limit": String(result.total || ""),
                "X-RateLimit-Remaining": String(result.remaining),
            },
        }
    );
}

// Pre-configured rate limits
export const RATE_LIMITS = {
    CHAT: { limit: 200, window: "12h" },
    CHAT_HISTORY: { limit: 500, window: "12h" },
    UPLOAD: { limit: 30, window: "12h" },
    YOUTUBE: { limit: 30, window: "12h" },
    WEB_INGEST: { limit: 30, window: "12h" },
    DOCUMENTS: { limit: 500, window: "12h" },
    DOCUMENTS_DELETE: { limit: 50, window: "12h" },
    USER_KEYS: { limit: 50, window: "12h" },
    A2A_TASKS: { limit: 100, window: "12h" },
};
