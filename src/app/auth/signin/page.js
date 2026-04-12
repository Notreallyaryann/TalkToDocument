"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignIn() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center relative px-4">
            {/* Background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-10 backdrop-blur-xl shadow-2xl shadow-brand-500/5">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            RagSphere
                        </h1>
                    </div>

                    <p className="text-white/40 text-center text-sm mb-10">
                        Sign in to upload documents and chat with AI
                    </p>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <button
                            className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-white/80 hover:text-white font-medium text-sm transition-all duration-300 hover:-translate-y-0.5"
                            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                            id="signin-google"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            className="w-full group flex items-center justify-center gap-3 px-5 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-white/80 hover:text-white font-medium text-sm transition-all duration-300 hover:-translate-y-0.5"
                            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                            id="signin-github"
                        >
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            Continue with GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-xs text-white/20 uppercase tracking-wider">Features</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: "📄", label: "PDF & Excel" },
                            { icon: "🔍", label: "Smart Search" },
                            { icon: "🧠", label: "Knowledge Graph" },
                            { icon: "⚡", label: "Fast AI Answers" },
                        ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <span className="text-sm">{feat.icon}</span>
                                <span className="text-xs text-white/30">{feat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <a href="/" className="text-sm text-white/20 hover:text-white/50 transition-colors">
                        ← Back to home
                    </a>
                </div>
            </div>
        </div>
    );
}
