import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";


export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!file.name.endsWith(".pdf") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            return NextResponse.json({ error: "Only PDF and Excel files are supported" }, { status: 400 });
        }

        let text = "";
        let numPages = 0;

        if (file.name.endsWith(".pdf")) {
            const pdf = (await import('pdf-parse')).default;
            const buffer = Buffer.from(await file.arrayBuffer());
            const pdfData = await pdf(buffer);
            text = pdfData.text;
            numPages = pdfData.numpages;
        } else {
            const XLSX = await import('xlsx');
            const buffer = Buffer.from(await file.arrayBuffer());
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            
            // Extract text from all sheets
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                // Convert sheet to JSON/CSV-like text
                const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const sheetText = jsonSheet
                    .map(row => row.filter(cell => cell !== null && cell !== undefined).join(" "))
                    .filter(rowText => rowText.trim().length > 0)
                    .join("\n");
                
                if (sheetText.trim().length > 0) {
                    text += `Sheet: ${sheetName}\n${sheetText}\n\n`;
                }
            });
            numPages = workbook.SheetNames.length;
        }

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Could not extract text from document" }, { status: 400 });
        }

      
        const { chunkText, getEmbeddings } = await import('@/lib/embeddings');
        
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
                        fileName: file.name,
                        chunkIndex: i + j,
                        totalChunks: chunks.length,
                    },
                });
            }
        }

        const { upsertVectors } = await import('@/lib/qdrant');
        await upsertVectors(allPoints);

       
        const { storeDocumentMetadata } = await import('@/lib/neo4j');
        await storeDocumentMetadata(userId, documentId, file.name, chunks.length);

        //  Store in MongoDB
        try {
            const connectDB = (await import('@/lib/db')).default;
            const Document = (await import('@/models/Document')).default;
            await connectDB();
            await Document.create({
                userId,
                documentId,
                fileName: file.name,
                fileType: file.name.endsWith(".pdf") ? "pdf" : "excel",
                chunkCount: chunks.length,
                status: "ready"
            });
        } catch (mongoError) {
            console.error("MongoDB storage error:", mongoError);
            // We don't fail the whole request because Qdrant/Neo4j succeeded
        }

        return NextResponse.json({
            success: true,
            documentId,
            fileName: file.name,
            chunks: chunks.length,
            pages: numPages,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to process document: " + error.message },
            { status: 500 }
        );
    }
}
