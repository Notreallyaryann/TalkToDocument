
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

// Generate a secure random API key
function generateApiKey() {
    return 'rs_' + crypto.randomBytes(24).toString('hex');
}

// Hash API key for secure storage (one-way: can never be recovered from DB)
function hashApiKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit check
        const rl = checkRateLimit(`${session.user.id}:user_keys`, RATE_LIMITS.USER_KEYS.limit, RATE_LIMITS.USER_KEYS.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        await connectDB();
        const user = await User.findById(session.user.id);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // We can only tell the user IF they have a key, not WHAT it is (it's hashed)
        return NextResponse.json({ hasApiKey: !!user.apiKey });
    } catch (error) {
        console.error("Get API key error:", error);
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "An internal error occurred";
        return NextResponse.json({ error: safeError }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit check
        const rl = checkRateLimit(`${session.user.id}:user_keys`, RATE_LIMITS.USER_KEYS.limit, RATE_LIMITS.USER_KEYS.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        await connectDB();
        const rawKey = generateApiKey();
        const hashedKey = hashApiKey(rawKey);
        
        await User.findByIdAndUpdate(
            session.user.id,
            { apiKey: hashedKey },
            { new: true, upsert: true }
        );

        // Return the plaintext key ONCE — user must save it now, we can't show it again
        return NextResponse.json({ apiKey: rawKey });
    } catch (error) {
        console.error("Generate API key error:", error);
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "An internal error occurred";
        return NextResponse.json({ error: safeError }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit check
        const rl = checkRateLimit(`${session.user.id}:user_keys`, RATE_LIMITS.USER_KEYS.limit, RATE_LIMITS.USER_KEYS.windowMs);
        if (rl.limited) return rateLimitResponse(rl);

        await connectDB();
        await User.findByIdAndUpdate(session.user.id, { $unset: { apiKey: "" } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete API key error:", error);
        const safeError = process.env.NODE_ENV === "development"
            ? error.message
            : "An internal error occurred";
        return NextResponse.json({ error: safeError }, { status: 500 });
    }
}
