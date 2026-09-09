import { pipeline, env } from '@xenova/transformers';

const HF_MODEL = "BAAI/bge-small-en-v1.5";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

// Configure cache directory for local fallback
if (process.env.VERCEL) {
    env.cacheDir = '/tmp/model_cache';
    env.localModelPath = '/tmp/model_cache';
} else {
    env.cacheDir = './.model_cache';
    env.localModelPath = './.model_cache';
}

env.allowRemoteModels = true;
env.useCache = true;

let extractor = null;
let modelPromise = null;

/**
 * Fetch embeddings using Hugging Face Serverless Inference API (bge-small-en-v1.5, 384 dims)
 */
async function getHuggingFaceEmbedding(inputs) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
        throw new Error("HUGGINGFACE_API_KEY is missing");
    }

    const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API returned ${response.status}: ${errorText}`);
    }

    return await response.json();
}

async function getExtractor() {
    if (modelPromise) return modelPromise;

    modelPromise = (async () => {
        try {
            console.log('⏳ Loading fallback local model with @xenova/transformers...');
            const start = Date.now();

            extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                quantized: true,
            });

            console.log(`✅ Fallback local model loaded in ${((Date.now() - start) / 1000).toFixed(2)}s`);
            return extractor;
        } catch (error) {
            console.error('❌ Failed to load local model:', error);
            modelPromise = null;
            throw error;
        }
    })();

    return modelPromise;
}

export async function getEmbedding(text) {
    if (!text || typeof text !== 'string') return [];

    // Try Hugging Face Inference API first (fast serverless cloud API)
    if (process.env.HUGGINGFACE_API_KEY) {
        try {
            console.log('⚡ Generating query embedding via Hugging Face Inference API...');
            const data = await getHuggingFaceEmbedding(text);
            if (Array.isArray(data) && typeof data[0] === 'number') {
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Hugging Face Inference API failed, falling back to local ONNX model:', error.message);
        }
    }

    // Fallback to local ONNX pipeline
    try {
        const extractor = await getExtractor();
        const output = await extractor([text], {
            pooling: 'mean',
            normalize: true
        });
        return Array.from(output.data);
    } catch (error) {
        console.error('Embedding error:', error);
        throw new Error(`Embedding failed: ${error.message}`);
    }
}

export async function getEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    // Try Hugging Face Inference API first (fast serverless cloud API)
    if (process.env.HUGGINGFACE_API_KEY) {
        try {
            console.log(`⚡ Generating ${texts.length} batch embeddings via Hugging Face Inference API...`);
            const data = await getHuggingFaceEmbedding(texts);
            if (Array.isArray(data) && Array.isArray(data[0])) {
                return data;
            }
        } catch (error) {
            console.warn('⚠️ Hugging Face Inference API batch failed, falling back to local ONNX model:', error.message);
        }
    }

    // Fallback to local ONNX pipeline
    try {
        const extractor = await getExtractor();
        const output = await extractor(texts, {
            pooling: 'mean',
            normalize: true
        });
        return output.tolist();
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