
export async function scrapeUrl(url) {
    const JINA_KEY = process.env.JINA_API_KEY;


    const readerUrl = `https://r.jina.ai/${url}`;

    try {
        const response = await fetch(readerUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${JINA_KEY}`,
                // We want the text/markdown response
                'Accept': 'text/plain'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Jina Reader Error (${response.status}):`, errorText);
            throw new Error(`Failed to scrape website: ${response.statusText}`);
        }

        const text = await response.text();
        return text;
    } catch (error) {
        console.error("Scraper Library Error:", error);
        throw error;
    }
}
