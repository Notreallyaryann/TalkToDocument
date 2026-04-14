"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [ytUrl, setYtUrl] = useState("");
    const [processingYt, setProcessingYt] = useState(false);
    const [toasts, setToasts] = useState([]);
    const fileInputRef = useRef(null);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await fetch("/api/documents");
            if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents || []);
            }
        } catch (error) {
            console.error("Error fetching documents:", error);
        }
    }, []);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
        if (status === "authenticated") {
            fetchDocuments();
        }
    }, [status, router, fetchDocuments]);

    const handleUpload = async (files) => {
        if (!files || files.length === 0) return;

        for (const file of files) {
            const isPDF = file.name.endsWith(".pdf");
            const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
            if (!isPDF && !isExcel) {
                addToast(`${file.name} is not a valid document file`, "error");
                continue;
            }

            setUploading(true);
            setUploadProgress(`Processing ${file.name}...`);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (res.ok) {
                    addToast(`${file.name} uploaded successfully (${data.chunks} chunks)`, "success");
                    fetchDocuments();
                } else {
                    addToast(`Upload failed: ${data.error}`, "error");
                }
            } catch (error) {
                addToast(`Upload failed: ${error.message}`, "error");
            }
        }

        setUploading(false);
        setUploadProgress("");
    };

    const handleYtProcess = async () => {
        if (!ytUrl || !ytUrl.trim()) {
            addToast("Please enter a valid YouTube URL", "error");
            return;
        }

        setProcessingYt(true);
        addToast("Starting YouTube transcript extraction...", "info");

        try {
            const res = await fetch("/api/ingest/youtube", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: ytUrl }),
            });

            const data = await res.json();

            if (res.ok) {
                addToast(`YouTube transcript processed successfully (${data.chunks} chunks)`, "success");
                setYtUrl("");
                fetchDocuments();
            } else {
                addToast(`Failed to process YouTube link: ${data.error}`, "error");
            }
        } catch (error) {
            addToast(`Error: ${error.message}`, "error");
        } finally {
            setProcessingYt(false);
        }
    };

    const handleDelete = async (documentId, fileName) => {
        if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

        try {
            const res = await fetch("/api/documents", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId }),
            });

            if (res.ok) {
                addToast(`${fileName} deleted`, "success");
                fetchDocuments();
            } else {
                addToast("Failed to delete document", "error");
            }
        } catch (error) {
            addToast(`Delete failed: ${error.message}`, "error");
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleUpload(e.dataTransfer.files);
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
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium" id="nav-dashboard">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </button>
                </nav>

                {/* Documents list */}
                <div className="px-4 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/20">Your Documents</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {documents.length === 0 ? (
                        <p className="px-3 py-4 text-xs text-white/20">No documents yet. Upload one to get started.</p>
                    ) : (
                        documents.map((doc) => (
                            <button
                                key={doc.documentId}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] text-white/50 hover:text-white/80 text-sm transition-colors duration-200 text-left"
                                onClick={() => router.push(`/chat/${doc.documentId}`)}
                                id={`doc-${doc.documentId}`}
                            >
                                <svg className="w-4 h-4 flex-shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <span className="flex-1 truncate">{doc.fileName}</span>
                                <span className="text-[10px] bg-white/[0.06] text-white/30 px-1.5 py-0.5 rounded-full">{doc.chunkCount}</span>
                            </button>
                        ))
                    )}
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
                            id="signout-btn"
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
                            id="mobile-menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <h1 className="text-base font-semibold text-white/80">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-emerald-400/90 font-medium">Connected</span>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                            Welcome back, {session.user.name?.split(" ")[0]} 👋
                        </h2>
                        <p className="text-white/40 text-sm">Upload documents and ask questions to get intelligent answers.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            ), value: documents.length, label: "Documents", color: "brand" },
                            { icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c-1.108-.169-2.03-.932-2.03-2.048 0-1.074.914-1.957 2.04-2.113a48.091 48.091 0 018.82 0c1.126.156 2.04 1.04 2.04 2.113 0 1.116-.922 1.879-2.03 2.048a48.527 48.527 0 01-4.163.3v0a.64.64 0 01-.657-.643v0z" />
                                </svg>
                            ), value: documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0), label: "Total Chunks", color: "cyan" },
                            { icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                </svg>
                            ), value: documents.reduce((sum, d) => sum + (d.chatCount || 0), 0), label: "Conversations", color: "amber" },
                            { icon: (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            ), value: "AI", label: "Integrated", color: "emerald" },
                        ].map((stat, i) => (
                            <div key={i} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5">
                                <div className={`w-10 h-10 rounded-xl bg-${stat.color === 'brand' ? 'brand-500' : stat.color === 'cyan' ? 'cyan-500' : stat.color === 'amber' ? 'amber-500' : 'emerald-500'}/10 flex items-center justify-center text-${stat.color === 'brand' ? 'brand-400' : stat.color === 'cyan' ? 'cyan-400' : stat.color === 'amber' ? 'amber-400' : 'emerald-400'} mb-3`}>
                                    {stat.icon}
                                </div>
                                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                                <div className="text-xs text-white/30">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Upload Zone */}
                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            Upload Document
                        </h3>
                        <div
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${dragActive
                                ? 'border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/10'
                                : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.01] hover:bg-white/[0.02]'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            id="upload-zone"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.xlsx,.xls"
                                multiple
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files)}
                                id="file-input"
                            />
                            <div className="flex flex-col items-center gap-3">
                                {uploading ? (
                                    <div className="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                        </svg>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-white/70">
                                        {uploading ? "Processing..." : dragActive ? "Drop your file here!" : "Drag & drop your file here, or click to browse"}
                                    </p>
                                    <p className="text-xs text-white/25 mt-1">Supports PDF and Excel files up to 50MB</p>
                                </div>
                                {uploading && (
                                    <div className="w-full max-w-xs mt-2">
                                        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full w-[60%] animate-pulse" />
                                        </div>
                                        <p className="text-xs text-white/30 mt-2">{uploadProgress}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* YouTube Link Zone */}
                    <div className="mb-8">
                        <h3 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                            </svg>
                            Process YouTube Video
                        </h3>
                        <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 overflow-hidden">
                            <input
                                type="text"
                                value={ytUrl}
                                onChange={(e) => setYtUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3 text-white/70 placeholder:text-white/20"
                                disabled={processingYt}
                            />
                            <button
                                onClick={handleYtProcess}
                                disabled={processingYt || !ytUrl.trim()}
                                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 mr-1 ${
                                    processingYt 
                                    ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/10'
                                }`}
                                id="process-yt-btn"
                            >
                                {processingYt ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    "Extract Transcript"
                                )}
                            </button>
                        </div>
                        <p className="text-[10px] text-white/20 mt-2 ml-1">We'll fetch the transcript, chunk it, and index it for chat.</p>
                    </div>

                    {/* Documents Grid */}
                    <div>
                        <h3 className="text-base font-semibold text-white/80 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                            </svg>
                            Your Documents
                        </h3>
                        {documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                                    </svg>
                                </div>
                                <h4 className="text-base font-semibold text-white/50 mb-1">No documents yet</h4>
                                <p className="text-sm text-white/20 max-w-sm">Upload your first document to start chatting with it using AI.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {documents.map((doc) => (
                                    <div key={doc.documentId} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5" id={`card-${doc.documentId}`}>
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                doc.fileName.startsWith('YouTube:') 
                                                ? 'bg-red-600/10 border border-red-600/20' 
                                                : 'bg-brand-500/10 border border-brand-500/20'
                                            }`}>
                                                {doc.fileName.startsWith('YouTube:') ? (
                                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-white/80 truncate">{doc.fileName}</div>
                                                <div className="text-xs text-white/25 mt-0.5">{doc.chunkCount} chunks · {doc.chatCount || 0} chats</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-white/90 text-xs font-bold transition-all duration-200"
                                                onClick={() => router.push(`/chat/${doc.documentId}`)}
                                                id={`chat-btn-${doc.documentId}`}
                                            >
                                                Chat
                                            </button>
                                            <button
                                                className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 text-xs font-medium transition-all duration-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(doc.documentId, doc.fileName);
                                                }}
                                                id={`delete-btn-${doc.documentId}`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Notifications */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-5 py-3 rounded-xl text-sm font-medium animate-slide-in-right backdrop-blur-xl shadow-xl ${
                            toast.type === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                                : toast.type === 'error'
                                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                                : 'bg-white/[0.06] border border-white/[0.1] text-white/70'
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
}
