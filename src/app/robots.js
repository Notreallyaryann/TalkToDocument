export default function robots() {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/docs"],
                disallow: ["/dashboard", "/api/", "/chat/", "/auth/"],
            },
        ],
        sitemap: "https://ragsphere.vercel.app/sitemap.xml",
    };
}
