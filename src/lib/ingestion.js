
import { v4 as uuidv4 } from "uuid";
import { chunkText, getEmbeddings } from "./embeddings.js";
import { upsertVectors } from "./qdrant.js";
import { storeDocumentMetadata } from "./neo4j.js";
import connectDB from "./db.js";
import Document from "../models/Document.js";

/**
 * Extract text from a PDF buffer. Centralized to ensure consistent extraction.
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<{text: string, numPages: number}>}
 */
export async function extractPdfText(buffer) {
    if (!buffer || buffer.length === 0) {
        throw new Error("PDF file buffer is empty.");
    }
    try {
        const pdf = (await import('pdf-parse')).default;
        const pdfData = await pdf(buffer);
        return { text: pdfData.text, numPages: pdfData.numpages };
    } catch (error) {
        const errMsg = error?.message || "";
        const errDetails = error?.details || "";
        const fullErrStr = `${errMsg} ${errDetails}`;

        if (fullErrStr.includes("bad XRef entry") || fullErrStr.includes("FormatError")) {
            throw new Error("The PDF document structure is corrupted or invalid (bad cross-reference table). Please re-save or repair the PDF before uploading.");
        }
        if (fullErrStr.toLowerCase().includes("password") || error?.name === "PasswordException") {
            throw new Error("The PDF document is password-protected or encrypted. Please remove password protection before uploading.");
        }
        if (fullErrStr.includes("Invalid PDF") || error?.name === "InvalidPDFException") {
            throw new Error("The file is not a valid PDF document or is severely corrupted.");
        }

        throw new Error(`Failed to parse PDF document: ${errMsg || "Unknown PDF parsing error"}`);
    }
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

/**
 * Security check: Rejects files containing shell scripts, exploit code, reverse shell payloads,
 * executable script tags, or dangerous double extensions.
 */
export function validateContentSafety(text, fileName) {
    if (!text || typeof text !== "string") {
        throw new Error("No readable text found in document.");
    }

    const lowerFileName = (fileName || "").toLowerCase();

    // Check for dangerous script/executable extensions (including double extension tricks like exploit.sh.pdf)
    const dangerousExtensions = [
        ".sh", ".exe", ".bat", ".cmd", ".js", ".py", ".vbs", ".php",
        ".rb", ".ps1", ".pl", ".elf", ".scr", ".jar", ".dll", ".so",
        ".asp", ".jsp", ".c", ".cpp", ".cs"
    ];

    for (const ext of dangerousExtensions) {
        if (lowerFileName.endsWith(ext) || lowerFileName.includes(`${ext}.`)) {
            throw new Error(`Security Violation: File '${fileName}' has a forbidden script or executable extension.`);
        }
    }

    // Exploit script & shell execution signatures to block
    const exploitPatterns = [
        /#!/i,                                         // Shebang line (#!/bin/bash, #!/usr/bin/python, etc.)
        /\/bin\/(bash|sh|zsh|dash|ksh)/i,              // Shell binary execution
        /nc(\.openbsd|\.traditional)?\s+-[eL]/i,       // Netcat reverse shell
        /bash\s+-i/i,                                  // Interactive bash shell
        /powershell(\.exe)?\s+-(nop|w\s+hidden|e)/i,  // Powershell stealth execution
        /Invoke-Expression|IEX\s*\(/i,                 // Powershell IEX exploit code
        /eval\s*\(\s*base64_decode/i,                  // PHP / web shell payload
        /<script[\s>]/i,                               // HTML / Javascript script tag injection
        /javascript:\s*/i,                             // Inline JS URI payload
        /document\.cookie/i,                           // XSS cookie stealer script
        /system\s*\(\s*['"](rm|curl|wget|chmod|cat)/i, // C / PHP system call exploit
        /subprocess\.(Popen|call|run)/i,               // Python process spawn exploit
        /os\.system\s*\(/i,                            // Python system execution exploit
        /curl\s+[^|\n]+\|\s*(bash|sh)/i,               // Remote script piping (curl | bash)
        /wget\s+[^|\n]+\|\s*(sh|bash)/i                // Remote script piping (wget | sh)
    ];

    for (const pattern of exploitPatterns) {
        if (pattern.test(text)) {
            throw new Error("Security Violation: Document contains forbidden script code or potential exploit payload.");
        }
    }
}

export async function processDocument(userId, fileName, fileType, text) {
    if (!text || text.trim().length === 0) {
        throw new Error("No text content for ingestion");
    }

    // Validate content against exploit scripts and executable payloads
    validateContentSafety(text, fileName);

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
