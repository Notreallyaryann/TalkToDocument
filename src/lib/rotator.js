
let keyIndex = 0;

/**
 @returns {string} The next API key to use.
 */
export function getNextCerebrasKey() {
    // Collect all keys from env that match the pattern
    const keys = [
        process.env.CEREBRAS_KEY_1,
        process.env.CEREBRAS_KEY_2,
        process.env.CEREBRAS_KEY_3,
    ].filter(Boolean);

    if (keys.length === 0) {
        console.warn("⚠️ No Cerebras API keys found in environment variables.");
        return "";
    }

    const key = keys[keyIndex];
    console.log(`🔄 Using Cerebras API Key ${keyIndex + 1}/${keys.length}`);

    // Increment for next time
    keyIndex = (keyIndex + 1) % keys.length;

    return key;
}
