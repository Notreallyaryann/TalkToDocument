"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomeClient() {
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

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-8 mr-8">
                            <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
                            <Link href="/docs" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Docs</Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/auth/signin"
                                className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 hidden md:flex items-center gap-2"
                                id="nav-api-key"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                </svg>
                                Get API Key
                            </Link>
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
                        PDFs, Excel & URLs
                        <br />
                        <span className="text-white/60">
                            into Insights
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg lg:text-xl text-white/40 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Stop wasting time searching through endless data. Get instant answers from PDFs, spreadsheets, websites, and YouTube videos—all in one intelligent interface.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link
                            href="/auth/signin"
                            className="px-8 py-4 bg-white text-black hover:bg-white/90 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-white/5"
                            id="cta-get-started"
                        >
                            Start for free
                        </Link>
                        <Link
                            href="/auth/signin"
                            className="px-8 py-4 bg-gradient-to-r from-brand-500 to-cyan-600 text-white hover:opacity-90 font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-brand-500/20"
                            id="cta-get-api-key"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                            </svg>
                            Get API Key
                        </Link>
                    </div>
                </div>

                {/* Floating Feature Cards */}
                <div className="max-w-6xl mx-auto mt-20 lg:mt-28" id="features">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {[
                            {
                                icon: (
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                    </svg>
                                ),
                                title: "Omni-Channel Intake",
                                description: "Drop PDFs, Excel spreadsheets, or paste any website or YouTube link. We scrape and index everything for instant retrieval.",
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
                                <span className="bg-gradient-to-r from-brand-400 to-red-400 bg-clip-text text-transparent">from Documents &amp; Videos</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed">
                                Save Hours of Research Time. No more struggling with dense PDF textbooks, complex spreadsheets, or long video lectures.
                                Just ask your questions, and let RagSphere break it down into easy-to-understand insights.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Break down complex PDFs in seconds</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Analyze Excel spreadsheets effortlessly</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Scrape and analyze any website link</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                                        </svg>
                                    </div>
                                    <span className="text-white/80 font-medium">Chat with YouTube video transcripts</span>
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

            {/* Developer Integration Section */}
            <section id="integration" className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white/[0.01] border-t border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative">
                    <div className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                        For Developers
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-6">Built for Automation</h2>
                    <p className="text-white/40 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
                        Our A2A (Agent-to-Agent) compliant API allows you to programmatically ingest documents and query insights. Powerful, secure, and easy to integrate.
                    </p>

                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 group"
                    >
                        View Full Documentation
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
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
