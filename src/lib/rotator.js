
export function getNextCerebrasKey() {
    const keys = Object.keys(process.env)
        .filter(k => k.startsWith("CEREBRAS_KEY_"))
        .map(k => process.env[k])
        .filter(Boolean);

    if (keys.length === 0) {
        if (process.env.CEREBRAS_API_KEY) {
            return process.env.CEREBRAS_API_KEY;
        }
        console.warn("⚠️ No Cerebras API keys found in environment variables (checked CEREBRAS_KEY_* and CEREBRAS_API_KEY).");
        return "";
    }

    // Pick a random index
    const randomIndex = Math.floor(Math.random() * keys.length);
    const key = keys[randomIndex];

    // Log the selection for debugging (shows index for transparency)
    console.log(`🔄 [Serverless] Using Cerebras API Key (Index ${randomIndex + 1}/${keys.length})`);

    return key;
}
