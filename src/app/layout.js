import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
    title: "RagSphere - AI Document Intelligence",
    description:
        "Upload PDFs and Excel files, chat with your documents using advanced AI. Get intelligent answers powered by vector search and knowledge graphs.",
    keywords: "RAG, AI, PDF, Excel, document, chat, vector search, knowledge graph",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
