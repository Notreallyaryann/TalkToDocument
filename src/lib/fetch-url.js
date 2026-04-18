
import { URL } from "url";
// Prevents SSRF attacks.

function isSafeUrl(urlStr) {
    try {
        const url = new URL(urlStr);
        const protocol = url.protocol.toLowerCase();


        if (protocol !== 'http:' && protocol !== 'https:') return false;

        const hostname = url.hostname.toLowerCase();

        // Block localhost and common private IP ranges
        const privatePatterns = [
            /^localhost$/,
            /^127\./,
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./,
            /^169\.254\./, // Cloud metadata
            /^0\./,
            /^::1$/,
            /^fc00:/,
            /^fe80:/
        ];

        return !privatePatterns.some(pattern => pattern.test(hostname));
    } catch {
        return false;
    }
}

export async function fetchUrlAsBuffer(url) {
    if (!isSafeUrl(url)) {
        throw new Error("Security Error: Forbidden URL. Only public HTTP/HTTPS URLs are allowed.");
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

export function detectFileType(url, contentType) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.endsWith('.pdf') || (contentType && contentType.includes('pdf'))) {
        return 'pdf';
    }
    if (lowerUrl.endsWith('.xlsx') || lowerUrl.endsWith('.xls') || (contentType && (contentType.includes('excel') || contentType.includes('spreadsheet')))) {
        return 'excel';
    }

    return 'web';
}
