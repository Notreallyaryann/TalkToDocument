
import { v4 as uuidv4 } from "uuid";
import { chunkText, getEmbeddings } from "./embeddings";
import { upsertVectors } from "./qdrant";
import { storeDocumentMetadata } from "./neo4j";
import connectDB from "./db";
import Document from "@/models/Document";

/**
 * Extract text from a PDF buffer. Centralized to ensure consistent extraction.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{text: string, numPages: number}>}
 */
export async function extractPdfText(buffer) {
    const pdf = (await import('pdf-parse')).default;
    const pdfData = await pdf(buffer);
    return { text: pdfData.text, numPages: pdfData.numpages };
}

/**
 * Extract text from an Excel buffer. Centralized to ensure consistent extraction.
 * @param {Buffer} buffer - Excel file buffer
 * @returns {{text: string, numSheets: number}}
 */
export function extractExcelText(buffer) {
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let text = "";

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const sheetText = jsonSheet
            .map(row => row.filter(cell => cell !== null && cell !== undefined).join(" "))
            .filter(rowText => rowText.trim().length > 0)
            .join("\n");

        if (sheetText.trim().length > 0) {
            text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
        }
    });

    return { text, numSheets: workbook.SheetNames.length };
}

export async function processDocument(userId, fileName, fileType, text) {
    if (!text || text.trim().length === 0) {
        throw new Error("No text content for ingestion");
    }

    // Chunk the text
    const chunks = chunkText(text, 1000, 200);
    const documentId = uuidv4();

    // Get embeddings in batches
    const batchSize = 10;
    const allPoints = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await getEmbeddings(batch);

        for (let j = 0; j < batch.length; j++) {
            allPoints.push({
                id: uuidv4(),
                vector: embeddings[j],
                payload: {
                    text: batch[j],
                    userId,
                    documentId,
                    fileName,
                    chunkIndex: i + j,
                    totalChunks: chunks.length,
                    source: fileType === "youtube" ? "youtube" : "document"
                },
            });
        }
    }

    // Vector Store
    await upsertVectors(allPoints);

    // Knowledge Graph
    await storeDocumentMetadata(userId, documentId, fileName, chunks.length);

    // SQL/NoSQL Metadata
    await connectDB();
    await Document.create({
        userId,
        documentId,
        fileName,
        fileType,
        chunkCount: chunks.length,
        status: "ready"
    });

    return {
        documentId,
        fileName,
        chunks: chunks.length
    };
}
