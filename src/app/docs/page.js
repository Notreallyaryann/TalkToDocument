import DocsClient from "./DocsClient";

export const metadata = {
    title: "API Documentation — RagSphere A2A Developer Guide",
    description:
        "Complete developer reference for the RagSphere A2A API. Learn how to ingest PDFs, Excel files, and YouTube videos, then query them with natural language using the REST API.",
    alternates: {
        canonical: "https://ragsphere.vercel.app/docs",
    },
    openGraph: {
        title: "API Documentation — RagSphere A2A Developer Guide",
        description:
            "Ingest documents and query them with AI. Full REST API reference with code examples in Python, JavaScript, and cURL.",
        url: "https://ragsphere.vercel.app/docs",
        siteName: "RagSphere",
        type: "article",
        images: [
            {
                url: "https://ragsphere.vercel.app/api/og?title=RagSphere+API+Docs&subtitle=A2A+compliant+REST+API+for+document+intelligence",
                width: 1200,
                height: 630,
                alt: "RagSphere API Documentation",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "API Documentation — RagSphere A2A Developer Guide",
        description:
            "Ingest PDFs and YouTube videos, then query them with AI. Full REST API reference.",
        images: [
            "https://ragsphere.vercel.app/api/og?title=RagSphere+API+Docs&subtitle=A2A+compliant+REST+API+for+document+intelligence",
        ],
    },
};

export default function DocsPage() {
    return <DocsClient />;
}
