"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const documentId = params.documentId;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
                const doc = data.documents?.find((d) => d.documentId === documentId);
                setCurrentDoc(doc || null);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    }, [documentId]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
        if (status === "authenticated") {
            fetchDocuments();
        }
    }, [status, router, fetchDocuments]);

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    documentId,
                    useWebSearch: webSearchEnabled,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: data.answer,
                        sources: data.sources,
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: `Error: ${data.error}`,
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Failed to send message: ${error.message}`,
                },
            ]);
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleTextareaChange = (e) => {
        setInput(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const handleSuggestion = (text) => {
        setInput(text);
        textareaRef.current?.focus();
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-[#0b0c11] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="min-h-screen bg-[#0b0c11] flex text-white">
            {/* Sidebar overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0e0e14] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Sidebar Header */}
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-white/10">
                            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold tracking-tight">RagSphere</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-3">
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] text-white/50 hover:text-white/80 text-sm font-medium transition-colors duration-200"
                        onClick={() => router.push("/dashboard")}
                        id="nav-back-dashboard"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </button>
                </nav>

                {/* Documents list */}
                <div className="px-4 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Documents</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {documents.map((doc) => (
                        <button
                            key={doc.documentId}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 text-left ${
                                doc.documentId === documentId
                                    ? 'bg-white/10 border border-white/20 text-white'
                                    : 'hover:bg-white/[0.04] text-white/50 hover:text-white/80'
                            }`}
                            onClick={() => {
                                router.push(`/chat/${doc.documentId}`);
                                setSidebarOpen(false);
                            }}
                            id={`sidebar-doc-${doc.documentId}`}
                        >
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <span className="flex-1 truncate">{doc.fileName}</span>
                            {doc.documentId === documentId && (
                                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">active</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* User card */}
                <div className="p-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors duration-200">
                        {session.user.image ? (
                            <Image src={session.user.image} alt={session.user.name} width={32} height={32} className="rounded-full object-cover ring-2 ring-white/10" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-black">
                                {session.user.name?.[0] || "U"}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate text-white/80">{session.user.name}</div>
                            <div className="text-[11px] text-white/30 truncate">{session.user.email}</div>
                        </div>
                        <button
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors duration-200"
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            title="Sign out"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-16 px-6 flex items-center justify-between border-b border-white/[0.06] bg-[#0b0c11]/80 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/[0.06] text-white/40"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                        </svg>
                        <h1 className="text-sm font-semibold text-white/80 truncate">{currentDoc?.fileName || "Chat"}</h1>
                    </div>
                    {currentDoc && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                            <span className="text-xs text-white/40 font-medium">{currentDoc.chunkCount} chunks indexed</span>
                        </div>
                    )}
                </header>

                {/* Chat */}
                <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-60">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                                    <svg className="w-7 h-7 text-brand-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white/60 mb-2">Chat with your document</h2>
                                    <p className="text-sm text-white/30 max-w-md">
                                        {currentDoc
                                            ? `Ask anything about "${currentDoc.fileName}". I'll find the relevant information for you.`
                                            : "Select a document to start chatting."}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center mt-2">
                                    {[
                                        { icon: "📝", label: "Summarize this document" },
                                        { icon: "🔑", label: "What are the key points?" },
                                        { icon: "💡", label: "Explain the main concepts" },
                                    ].map((s, i) => (
                                        <button
                                            key={i}
                                            className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] rounded-xl text-xs text-white/40 hover:text-white/70 transition-all duration-200 hover:-translate-y-0.5"
                                            onClick={() => handleSuggestion(s.label)}
                                        >
                                            {s.icon} {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 max-w-[85%] animate-fade-in ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-br from-brand-500 to-cyan-500 text-white font-bold'
                                            : 'bg-white/[0.06] border border-white/[0.08]'
                                    }`}>
                                        {msg.role === "user" ? (session.user.name?.[0] || "U") : (
                                            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-white text-black font-semibold rounded-br-md shadow-lg shadow-white/5'
                                                : 'bg-white/[0.04] border border-white/[0.06] text-white/80 rounded-bl-md prose-chat'
                                        }`}>
                                            {msg.role === "assistant" ? (
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                        </div>
                                        {msg.sources && (
                                            <div className="flex gap-1.5 mt-2 flex-wrap">
                                                {msg.sources.hasDocumentContext && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-[10px] text-brand-300">📄 Document</span>
                                                )}
                                                {msg.sources.hasWebSearch && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] text-cyan-300">🌐 Web</span>
                                                )}
                                                {msg.sources.hasKnowledgeGraph && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-300">🧠 Graph</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {loading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white/[0.06] border border-white/[0.08]">
                                    <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06]">
                                    <div className="flex gap-1.5">
                                        <div className="typing-dot animate-typing-1" />
                                        <div className="typing-dot animate-typing-2" />
                                        <div className="typing-dot animate-typing-3" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 lg:px-6 py-4 border-t border-white/[0.06] bg-[#0b0c11]/80 backdrop-blur-xl">
                        <form onSubmit={sendMessage} className="flex gap-3 items-end max-w-4xl mx-auto">
                            <div className="flex-1 flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all duration-200">
                                <textarea
                                    ref={textareaRef}
                                    className="flex-1 bg-transparent border-none outline-none text-white/80 text-sm resize-none max-h-[120px] min-h-[24px] leading-relaxed placeholder:text-white/20 font-sans"
                                    value={input}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={currentDoc ? `Ask about ${currentDoc.fileName}...` : "Type your message..."}
                                    rows={1}
                                    disabled={loading}
                                    id="chat-input"
                                />
                                <button
                                    type="button"
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap ${
                                        webSearchEnabled
                                            ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-300'
                                            : 'text-white/20 hover:text-white/40 border border-transparent'
                                    }`}
                                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                    title="Toggle web search"
                                    id="web-search-toggle"
                                >
                                    🌐 {webSearchEnabled ? "On" : "Off"}
                                </button>
                            </div>
                                <button
                                    type="submit"
                                    className="w-11 h-11 rounded-xl bg-white text-black flex items-center justify-center transition-all duration-200 shadow-lg shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 hover:scale-105"
                                    disabled={!input.trim() || loading}
                                    id="send-btn"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    )}
                                </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
