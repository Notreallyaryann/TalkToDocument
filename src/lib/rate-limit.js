import { NextResponse } from "next/server";

const rateLimitStore = new Map();

// Clean up stale entries periodically to prevent memory leak
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`;
    return `${Math.ceil(seconds / 3600)} hours`;
}

/**
 * Check rate limit for a given key.
 * @param {string} key - Unique identifier (e.g., `${userId}:chat`)
 * @param {number} limit - Max requests allowed in window
 * @param {number} windowMs - Time window in ms (default: 12 hours)
 * @returns {{ limited: boolean, remaining: number, retryAfter?: number }}
 */
export function checkRateLimit(key, limit = 100, windowMs = 12 * 60 * 60 * 1000) {
    cleanup();

    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, remaining: limit - 1 };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { limited: true, remaining: 0, retryAfter };
    }

    return { limited: false, remaining: limit - entry.count };
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
                "X-RateLimit-Remaining": "0",
            },
        }
    );
}

// Pre-configured rate limits for each endpoint (12-hour windows)
export const RATE_LIMITS = {
    CHAT:             { limit: 200, windowMs: 12 * 60 * 60 * 1000 },
    CHAT_HISTORY:     { limit: 500, windowMs: 12 * 60 * 60 * 1000 },
    UPLOAD:           { limit: 30,  windowMs: 12 * 60 * 60 * 1000 },
    YOUTUBE:          { limit: 30,  windowMs: 12 * 60 * 60 * 1000 },
    DOCUMENTS:        { limit: 500, windowMs: 12 * 60 * 60 * 1000 },
    DOCUMENTS_DELETE: { limit: 50,  windowMs: 12 * 60 * 60 * 1000 },
    USER_KEYS:        { limit: 50,  windowMs: 12 * 60 * 60 * 1000 },
    A2A_TASKS:        { limit: 100, windowMs: 12 * 60 * 60 * 1000 },
};
