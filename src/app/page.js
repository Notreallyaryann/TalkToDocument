"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0c11] text-white overflow-hidden">
            {/* Ambient background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] animate-float" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] animate-float-delayed" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0b0c11]/80 backdrop-blur-xl border-b border-white/5' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-white/10">
                                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                RagSphere
                            </span>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/auth/signin"
                                className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                                id="nav-login"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/auth/signin"
                                className="px-6 py-2.5 text-sm font-semibold bg-white text-black hover:bg-white/90 rounded-full transition-all duration-200"
                                id="nav-signup"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-32 px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-sm text-white/60">Next-Generation AI Intelligence</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter leading-[1] mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Turn Complex PDFs into
                        <br />
                        <span className="text-white/60">
                            Easy-to-Understand Summaries in Seconds
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg lg:text-xl text-white/40 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Stop wasting time searching through PDFs. Get instant answers, highlights, and summaries—so you can focus on acing your exams.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link
                            href="/auth/signin"
                            className="px-8 py-4 bg-white text-black hover:bg-white/90 font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
                            id="cta-get-started"
                        >
                            Start for free
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="px-8 py-4 bg-transparent border border-white/20 hover:border-white/40 text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-2"
                            id="cta-try-gpt"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Try Our GPT
                        </Link>
                    </div>
                </div>

                {/* Floating Feature Cards */}
                <div className="max-w-6xl mx-auto mt-20 lg:mt-28">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                ),
                                title: "Upload & Parse",
                                description: "Drop PDFs and Excel spreadsheets. We chunk, embed, and index them with vector search in seconds.",
                                gradient: "from-brand-500/20 to-brand-600/5",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                    </svg>
                                ),
                                title: "Chat Naturally",
                                description: "Ask questions in plain language. Get accurate answers grounded in your actual document content.",
                                gradient: "from-cyan-500/20 to-cyan-600/5",
                            },
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                    </svg>
                                ),
                                title: "Knowledge Discovery",
                                description: "Advanced knowledge graphs connect concepts across your documents for deeper insights and cross-file intelligence.",
                                gradient: "from-amber-500/20 to-amber-600/5",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
                            >
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/70 mb-5 group-hover:border-white/20 transition-colors duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action / Info Section */}
            <section className="relative py-24 lg:py-40 px-6 lg:px-8 border-t border-white/5 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8 animate-fade-in-left">
                            <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">
                                Get Instant Answers <br />
                                <span className="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">from Any PDF or Excel</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed">
                                Save Hours of Study Time. No more struggling with dense PDF textbooks or complex spreadsheets.
                                Just ask your questions, and let RagSphere break it down into easy-to-understand insights—anytime, anywhere.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Break down complex academic material</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Analyze Excel spreadsheets in seconds</span>
                                </div>
                            </div>
                            <p className="text-lg text-brand-400 font-semibold italic">
                                Make your academic and professional life easier with RagSphere.
                            </p>
                        </div>

                        <div className="relative animate-fade-in-right">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-cyan-500 rounded-2xl blur opacity-20" />
                            <div className="relative bg-[#0b0c11] border border-white/10 rounded-2xl p-8 shadow-2xl">
                                <div className="flex flex-col gap-6">
                                    <div className="h-4 w-1/3 bg-white/10 rounded-full animate-pulse" />
                                    <div className="space-y-3">
                                        <div className="h-4 w-full bg-white/5 rounded-full" />
                                        <div className="h-4 w-[90%] bg-white/5 rounded-full" />
                                        <div className="h-4 w-[95%] bg-white/5 rounded-full" />
                                    </div>
                                    <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-400" />
                                            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">AI Insight</span>
                                        </div>
                                        <p className="text-sm text-white/70 italic">
                                            &quot;Based on your document, the core concept hinges on the relationship between variable X and Y...&quot;
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="h-10 w-32 bg-brand-500 rounded-xl flex items-center justify-center text-xs font-bold">RagSphere AI</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-white/30 text-sm">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        RagSphere
                    </div>
                    <div className="text-white/20 text-sm">
                        &copy; {new Date().getFullYear()} RagSphere. Advanced AI Document Intelligence.
                    </div>
                </div>
            </footer>
        </div>
    );
}
