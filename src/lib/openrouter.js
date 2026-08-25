export async function chatWithOpenRouter(messages, stream = false) {
    const { getNextOpenRouterKey } = await import("./rotator.js");
    const apiKey = getNextOpenRouterKey();
    const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://ragsphere.vercel.app",
            "X-Title": "RagSphere AI",
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 2048,
            stream,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    if (stream) {
        return response;
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function extractEntities(text) {
    try {
        const response = await chatWithOpenRouter([
            {
                role: "system",
                content:
                    'Extract named entities (people, places, organizations, dates, concepts) from the text. Return a JSON array with objects containing "name" and "type" keys. Return ONLY the JSON array, no other text.',
            },
            { role: "user", content: text },
        ]);

        const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        return [];
    }
}
