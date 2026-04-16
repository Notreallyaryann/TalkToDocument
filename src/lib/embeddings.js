
import { pipeline, env } from '@xenova/transformers';

// Configure cache directory
if (process.env.VERCEL) {
    env.cacheDir = '/tmp/model_cache';
    env.localModelPath = '/tmp/model_cache';
    console.log('📁 Using Vercel /tmp cache');
} else {
    env.cacheDir = './.model_cache';
    env.localModelPath = './.model_cache';
    console.log('📁 Using local .model_cache');
}

env.allowRemoteModels = true;
env.useCache = true;

let extractor = null;
let modelPromise = null;

async function getExtractor() {
    if (modelPromise) return modelPromise;

    modelPromise = (async () => {
        try {
            console.log('⏳ Loading model with @xenova/transformers...');
            const start = Date.now();


            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true,
                progress_callback: (progress) => {
                    if (progress.status === 'download') {
                        const percent = Math.round(progress.progress * 100);
                        console.log(`📥 Downloading model: ${percent}%`);
                    }
                }
            });

            console.log(`✅ Model loaded in ${((Date.now() - start) / 1000).toFixed(2)}s`);
            return extractor;
        } catch (error) {
            console.error('❌ Failed to load model:', error);
            modelPromise = null;
            throw error;
        }
    })();

    return modelPromise;
}

export async function getEmbedding(text) {
    try {
        const extractor = await getExtractor();

        const output = await extractor([text], {
            pooling: 'mean',
            normalize: true
        });

        // Convert to array
        return Array.from(output.data);
    } catch (error) {
        console.error('Embedding error:', error);
        throw new Error(`Embedding failed: ${error.message}`);
    }
}

export async function getEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    try {
        const extractor = await getExtractor();

        const output = await extractor(texts, {
            pooling: 'mean',
            normalize: true
        });

        // Convert to array of arrays
        const data = output.tolist();
        return data;
    } catch (error) {
        console.error('Batch embedding error:', error);
        throw new Error(`Batch embedding failed: ${error.message}`);
    }
}

export function chunkText(text, chunkSize = 1000, overlap = 200) {
    if (!text || typeof text !== 'string') return [];

    const chunks = [];
    let start = 0;
    const textLength = text.length;

    while (start < textLength) {
        const end = Math.min(start + chunkSize, textLength);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }

    return chunks;
}