import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get("title") ?? "RagSphere — AI Document Intelligence";
    const subtitle = searchParams.get("subtitle") ?? "Chat with PDFs, Excel & YouTube using hybrid RAG";

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    backgroundColor: "#0b0c11",
                    padding: "80px",
                    backgroundImage:
                        "radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(6,182,212,0.10) 0%, transparent 50%)",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Logo row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        marginBottom: "48px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                        }}
                    >
                        💡
                    </div>
                    <span style={{ color: "white", fontSize: "28px", fontWeight: 700 }}>
                        RagSphere
                    </span>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: "64px",
                        fontWeight: 800,
                        color: "white",
                        lineHeight: 1.1,
                        marginBottom: "24px",
                        maxWidth: "900px",
                    }}
                >
                    {title}
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: "28px",
                        color: "rgba(255,255,255,0.5)",
                        maxWidth: "800px",
                        lineHeight: 1.4,
                    }}
                >
                    {subtitle}
                </div>

                {/* Bottom badge */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "60px",
                        right: "80px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 20px",
                        borderRadius: "999px",
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        color: "rgba(165,180,252,1)",
                        fontSize: "18px",
                        fontWeight: 600,
                    }}
                >
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
                    A2A Protocol v0.3.0
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
