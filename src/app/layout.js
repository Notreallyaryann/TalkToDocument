import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
    metadataBase: new URL("https://ragsphere.vercel.app"),
    title: {
        default: "RagSphere — AI Document Intelligence",
        template: "%s | RagSphere",
    },
    description:
        "Chat with PDFs, Excel spreadsheets, and YouTube videos using advanced AI. Powered by hybrid RAG — combining vector search, Neo4j knowledge graphs, and live web intelligence.",
    openGraph: {
        title: "RagSphere — AI Document Intelligence",
        description:
            "Chat with PDFs, Excel spreadsheets, and YouTube videos using advanced AI. Powered by hybrid RAG.",
        url: "https://ragsphere.vercel.app",
        siteName: "RagSphere",
        type: "website",
        locale: "en_US",
        images: [
            {
                url: "/api/og",
                width: 1200,
                height: 630,
                alt: "RagSphere — AI Document Intelligence",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "RagSphere — AI Document Intelligence",
        description:
            "Chat with PDFs, Excel spreadsheets, and YouTube videos using advanced AI.",
        images: ["/api/og"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RagSphere",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://ragsphere.vercel.app",
    description:
        "AI-powered document intelligence. Chat with PDFs, Excel spreadsheets, and YouTube videos using hybrid RAG and knowledge graphs.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    );
}
