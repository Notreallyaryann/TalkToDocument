
export function getNextOpenRouterKey() {
    const keys = Object.keys(process.env)
        .filter(k => k.startsWith("OPENROUTER_KEY_"))
        .map(k => process.env[k])
        .filter(Boolean);

    if (keys.length === 0) {
        if (process.env.OPENROUTER_API_KEY) {
            return process.env.OPENROUTER_API_KEY;
        }
        console.warn("⚠️ No OpenRouter API keys found in environment variables (checked OPENROUTER_KEY_* and OPENROUTER_API_KEY).");
        return "";
    }

    // Pick a random index
    const randomIndex = Math.floor(Math.random() * keys.length);
    const key = keys[randomIndex];

    // Log the selection for debugging (shows index for transparency)
    console.log(`🔄 [Serverless] Using OpenRouter API Key (Index ${randomIndex + 1}/${keys.length})`);

    return key;
}
