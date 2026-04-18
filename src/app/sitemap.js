export default function sitemap() {
    const baseUrl = "https://ragsphere.vercel.app";
    const lastModified = new Date();

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: "monthly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/docs`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.9,
        },
    ];
}
