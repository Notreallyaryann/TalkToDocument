import HomeClient from "./HomeClient";

export const metadata = {
    title: "RagSphere — Chat with PDFs, Excel & YouTube | Free AI",
    description:
        "Turn any PDF, Excel spreadsheet, or YouTube video into an interactive knowledge base. Ask questions and get instant AI-powered answers using hybrid RAG and knowledge graphs.",
    alternates: {
        canonical: "https://ragsphere.vercel.app",
    },
    openGraph: {
        title: "RagSphere — Chat with PDFs, Excel & YouTube",
        description:
            "Turn any PDF, Excel spreadsheet, or YouTube video into an interactive knowledge base. Powered by hybrid RAG and Neo4j knowledge graphs.",
        url: "https://ragsphere.vercel.app",
        siteName: "RagSphere",
        type: "website",
        images: [
            {
                url: "https://ragsphere.vercel.app/api/og",
                width: 1200,
                height: 630,
                alt: "RagSphere — AI Document Intelligence",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "RagSphere — Chat with PDFs, Excel & YouTube",
        description:
            "Turn any document or YouTube video into an interactive knowledge base. Free AI-powered RAG.",
        images: ["https://ragsphere.vercel.app/api/og"],
    },
};

export default function Home() {
    return <HomeClient />;
}
