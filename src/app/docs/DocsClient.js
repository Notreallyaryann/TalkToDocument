"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const BASE_URL = "https://ragsphere.vercel.app";
const API_TASKS = `${BASE_URL}/api/a2a/tasks`;


function CodeBlock({ code, lang = "" }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                <span className="text-xs font-mono text-white/30">{lang}</span>
                <button
                    onClick={copy}
                    className="text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5"
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy
                        </>
                    )}
                </button>
            </div>
            <div className="bg-[#080910] p-5 overflow-x-auto">
                <pre className="text-sm text-white/80 leading-relaxed font-mono whitespace-pre">{code}</pre>
            </div>
        </div>
    );
}

function MethodBadge({ method, color = "blue" }) {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${colors[color]}`}>
            {method}
        </span>
    );
}

function StatusBadge({ code }) {
    const color = code < 300 ? "text-green-400 bg-green-500/10 border-green-500/20"
        : code < 500 ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
            : "text-red-400 bg-red-500/10 border-red-500/20";
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border font-mono ${color}`}>
            {code}
        </span>
    );
}

function ParamRow({ name, type, required, defaultVal, description }) {
    return (
        <tr className="border-b border-white/[0.04]">
            <td className="py-3 pr-4 align-top whitespace-nowrap">
                <code className="text-sm text-indigo-400 font-mono">{name}</code>
                {required && <span className="ml-2 text-[10px] text-red-400 uppercase tracking-wider font-bold">required</span>}
            </td>
            <td className="py-3 pr-6 align-top whitespace-nowrap">
                <code className="text-xs text-white/40 font-mono">{type}</code>
                {defaultVal && <span className="ml-2 text-[10px] text-white/25 font-mono">= {defaultVal}</span>}
            </td>
            <td className="py-3 text-sm text-white/50 leading-relaxed">{description}</td>
        </tr>
    );
}

function StepNumber({ n }) {
    return (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-sm font-bold">
            {n}
        </div>
    );
}

function CalloutBox({ type = "info", children }) {
    const styles = {
        info: "bg-indigo-500/[0.06] border-indigo-500/20 text-indigo-300",
        warning: "bg-amber-500/[0.06] border-amber-500/20 text-amber-300",
        success: "bg-green-500/[0.06] border-green-500/20 text-green-300",
        tip: "bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-300",
    };
    const icons = {
        info: "ℹ️",
        warning: "⚠️",
        success: "✅",
        tip: "💡",
    };
    return (
        <div className={`flex gap-3 p-4 rounded-xl border text-sm leading-relaxed ${styles[type]}`}>
            <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
            <div className="text-white/60">{children}</div>
        </div>
    );
}


export default function DocsClient() {
    const { data: session } = useSession();

    const navSections = [
        { id: "overview", label: "Overview" },
        { id: "step-1", label: "Step 1 — Get API Key" },
        { id: "step-2", label: "Step 2 — Ingest a Document" },
        { id: "step-3", label: "Step 3 — Query Knowledge" },
        { id: "step-4", label: "Step 4 — Handle Responses" },
        {
            id: "reference", label: "API Reference", children: [
                { id: "auth-ref", label: "Authentication" },
                { id: "ingest-ref", label: "Ingest Skill" },
                { id: "query-ref", label: "Query Skill" },
                { id: "errors-ref", label: "Error Codes" },
                { id: "rate-limits-ref", label: "Rate Limits" },
            ]
        },
        { id: "examples", label: "Code Examples" },
    ];

    return (
        <div className="min-h-screen bg-[#0b0c11] text-white">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />
            </div>

            {/* Top Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0c11]/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="text-base font-bold tracking-tight">RagSphere</span>
                            <span className="text-white/30 text-base">/</span>
                            <span className="text-white/50 text-sm font-medium">Docs</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {session ? (
                                <Link href="/dashboard" className="text-sm text-white/50 hover:text-white/80 transition-colors">
                                    Dashboard →
                                </Link>
                            ) : (
                                <Link href="/auth/signin" className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium">
                                    Get API Key
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-20 pb-24 flex flex-col lg:flex-row gap-12">

                {/* Sidebar */}
                <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0 lg:sticky lg:top-24 h-fit pt-10">
                    <p className="text-[10px] uppercase tracking-widest text-white/25 font-bold px-3 mb-3">On this page</p>
                    <nav className="space-y-0.5">
                        {navSections.map((section) => (
                            <div key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="block px-3 py-2 text-sm font-medium text-white/50 hover:text-white/80 rounded-lg transition-colors"
                                >
                                    {section.label}
                                </a>
                                {section.children && (
                                    <div className="ml-4 mt-0.5 border-l border-white/[0.06] pl-3">
                                        {section.children.map((child) => (
                                            <a key={child.id} href={`#${child.id}`} className="block px-3 py-1.5 text-xs text-white/35 hover:text-white/65 transition-colors">
                                                {child.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pt-10 space-y-24">

                    {/* ── Overview ── */}
                    <section id="overview">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                            A2A Protocol v0.3.0
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-tight">
                            RagSphere API Docs
                        </h1>
                        <p className="text-lg text-white/50 leading-relaxed max-w-2xl mb-8">
                            RagSphere is an <strong className="text-white/80">Agent-to-Agent (A2A)</strong> compliant service that lets you ingest documents and query them using hybrid RAG — combining vector search, knowledge graphs, and optional live web intelligence.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: "📄", title: "PDF, Excel, YouTube", desc: "Ingest any of these source types via a public URL." },
                                { icon: "🔀", title: "Hybrid RAG", desc: "Answers combine vector, graph, and web search results." },
                                { icon: "🔐", title: "Per-User API Keys", desc: "Each key is scoped to your account — fully isolated." },
                            ].map((card) => (
                                <div key={card.title} className="p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                                    <div className="text-2xl mb-3">{card.icon}</div>
                                    <div className="text-sm font-semibold text-white/80 mb-1">{card.title}</div>
                                    <div className="text-xs text-white/40 leading-relaxed">{card.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Step 1: Get API Key ── */}
                    <section id="step-1">
                        <div className="flex items-center gap-4 mb-6">
                            <StepNumber n={1} />
                            <h2 className="text-2xl font-bold">Get Your API Key</h2>
                        </div>
                        <p className="text-white/50 mb-6 leading-relaxed">
                            Every request to RagSphere must include your personal API key. Sign in to your dashboard to generate one.
                        </p>

                        {session ? (
                            <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/[0.05] flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-400 mb-1">You&apos;re signed in as {session.user?.email}</p>
                                    <p className="text-xs text-white/40">Head to your dashboard to copy your API key.</p>
                                </div>
                                <Link href="/dashboard" className="flex-shrink-0 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-semibold text-white text-center">
                                    Go to Dashboard →
                                </Link>
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.05] flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-indigo-300 mb-1">Sign in to get your free API key</p>
                                    <p className="text-xs text-white/40">Create a free account and generate your key in the dashboard.</p>
                                </div>
                                <Link href="/auth/signin" className="flex-shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-semibold text-white text-center">
                                    Get API Key →
                                </Link>
                            </div>
                        )}

                        <div className="mt-6">
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Include key in every request header</p>
                            <CodeBlock lang="http" code={`x-a2a-key: YOUR_API_KEY`} />
                        </div>
                    </section>

                    {/* ── Step 2: Ingest ── */}
                    <section id="step-2">
                        <div className="flex items-center gap-4 mb-6">
                            <StepNumber n={2} />
                            <h2 className="text-2xl font-bold">Ingest a Document</h2>
                        </div>
                        <p className="text-white/50 mb-6 leading-relaxed">
                            Send a URL pointing to a <strong className="text-white/70">PDF</strong>, <strong className="text-white/70">Excel file</strong>, or <strong className="text-white/70">YouTube video</strong>. RagSphere will download, parse, embed, and index it — then return a <code className="text-indigo-400 font-mono text-sm">document_id</code> you&apos;ll use for querying.
                        </p>

                        <div className="mb-4">
                            <CalloutBox type="info">
                                <strong className="text-white/70">Using a local file?</strong> Your agent should temporarily host it at a public URL and pass that link to RagSphere. This keeps the A2A protocol clean — JSON only, no binary uploads needed.
                            </CalloutBox>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Request</p>
                            <CodeBlock lang="bash" code={`curl -X POST ${API_TASKS} \\
  -H "x-a2a-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "ingest",
    "input": {
      "source_url": "https://example.com/report.pdf"
    }
  }'`} />
                        </div>

                        <div>
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Success Response <StatusBadge code={200} /></p>
                            <CodeBlock lang="json" code={`{
  "status": "success",
  "output": {
    "document_id": "64f3a1b2c9e77d001a4e5f21",
    "chunks": 18,
    "source": "report.pdf"
  }
}`} />
                        </div>

                        <div className="mt-4">
                            <CalloutBox type="warning">
                                <strong className="text-white/70">Save the <code className="font-mono text-amber-300">document_id</code>!</strong> You will need it in Step 3 to query this document. RagSphere does not expose a document listing endpoint.
                            </CalloutBox>
                        </div>
                    </section>

                    {/* ── Step 3: Query ── */}
                    <section id="step-3">
                        <div className="flex items-center gap-4 mb-6">
                            <StepNumber n={3} />
                            <h2 className="text-2xl font-bold">Query Your Knowledge</h2>
                        </div>
                        <p className="text-white/50 mb-6 leading-relaxed">
                            Ask any question about your ingested document. RagSphere runs a <strong className="text-white/70">Triple-Query</strong> across vector embeddings, the Neo4j knowledge graph, and optionally the live web — then synthesises a single answer.
                        </p>

                        <div className="mb-4">
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Request</p>
                            <CodeBlock lang="bash" code={`curl -X POST ${API_TASKS} \\
  -H "x-a2a-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "query",
    "input": {
      "question": "What are the key findings in Q3?",
      "document_id": "64f3a1b2c9e77d001a4e5f21",
      "use_web_search": false
    }
  }'`} />
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-white/30 mb-3 uppercase tracking-wider font-semibold">Success Response <StatusBadge code={200} /></p>
                            <CodeBlock lang="json" code={`{
  "status": "success",
  "output": {
    "answer": "The Q3 report highlights a 23% YoY revenue increase...",
    "document_id": "64f3a1b2c9e77d001a4e5f21"
  }
}`} />
                        </div>

                        <div>
                            <CalloutBox type="tip">
                                Set <code className="text-cyan-300 font-mono text-sm">&quot;use_web_search&quot;: true</code> to augment the answer with live search results from the web. Useful for documents referencing recent events or external data.
                            </CalloutBox>
                        </div>
                    </section>

                    {/* ── Step 4: Handle Responses ── */}
                    <section id="step-4">
                        <div className="flex items-center gap-4 mb-6">
                            <StepNumber n={4} />
                            <h2 className="text-2xl font-bold">Handle Responses</h2>
                        </div>
                        <p className="text-white/50 mb-8 leading-relaxed">
                            All responses are JSON. Check the HTTP status code first, then read the body. Here are the patterns you should handle in your agent.
                        </p>

                        <div className="space-y-4">
                            {[
                                {
                                    code: 200, title: "Success", desc: "Your request completed. The result is in the output field.",
                                    example: `{ "status": "success", "output": { ... } }`
                                },
                                {
                                    code: 400, title: "Bad Request", desc: "A required field is missing or invalid. Check the details field.",
                                    example: `{ "error": "Bad Request", "message": "Invalid input parameters", "details": { ... } }`
                                },
                                {
                                    code: 401, title: "Unauthorized", desc: "API key is missing or invalid.",
                                    example: `{ "error": "Unauthorized", "message": "Missing x-a2a-key header" }`
                                },
                                {
                                    code: 404, title: "Not Found", desc: "document_id not found — the document may not have been ingested yet.",
                                    example: `{ "error": "Resource Not Found", "message": "No context found for the given document_id." }`
                                },
                                {
                                    code: 429, title: "Rate Limited", desc: "You have exceeded the 100 requests / 12h limit. Wait and retry.",
                                    example: `{ "error": "Rate limit exceeded", "retryAfter": 3600 }`
                                },
                                {
                                    code: 500, title: "Server Error", desc: "Something went wrong on our end. Retry with exponential backoff.",
                                    example: `{ "error": "Internal Server Error", "message": "..." }`
                                },
                            ].map((item) => (
                                <div key={item.code} className="rounded-xl border border-white/[0.06] overflow-hidden">
                                    <div className="flex items-center gap-3 px-5 py-3 bg-white/[0.02] border-b border-white/[0.05]">
                                        <StatusBadge code={item.code} />
                                        <span className="text-sm font-semibold text-white/80">{item.title}</span>
                                        <span className="text-xs text-white/35 ml-1">{item.desc}</span>
                                    </div>
                                    <div className="bg-[#080910] px-5 py-4">
                                        <pre className="text-xs text-white/50 font-mono leading-relaxed">{item.example}</pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Full API Reference ── */}
                    <section id="reference">
                        <h2 className="text-3xl font-bold mb-2">API Reference</h2>
                        <p className="text-white/40 mb-12 text-sm">Complete parameter reference for all skills and endpoints.</p>

                        {/* Auth */}
                        <div id="auth-ref" className="mb-16">
                            <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                                <MethodBadge method="HEADER" color="amber" /> Authentication
                            </h3>
                            <p className="text-sm text-white/40 mb-6 ml-[68px]">Required on every request to <code className="text-indigo-400 font-mono">POST /api/a2a/tasks</code></p>
                            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-left">
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Header</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <ParamRow name="x-a2a-key" type="string" required description="Your personal API key from the RagSphere dashboard." />
                                        <ParamRow name="Content-Type" type="string" required description={`Must be "application/json".`} />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Ingest Skill */}
                        <div id="ingest-ref" className="mb-16">
                            <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                                <MethodBadge method="POST" /> Ingest Skill
                            </h3>
                            <p className="text-sm text-white/40 mb-6 ml-[68px]">Process a remote document and add it to your knowledge base.</p>
                            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-left">
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Parameter</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="px-5">
                                        <ParamRow name="skill" type={`"ingest"`} required description='Literal string that selects the ingest skill.' />
                                        <ParamRow name="input.source_url" type="string (URL)" required description="Public URL to a PDF, Excel (.xlsx), or YouTube video. The resource must be publicly accessible — no auth-protected links." />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Query Skill */}
                        <div id="query-ref" className="mb-16">
                            <h3 className="text-xl font-bold mb-1 flex items-center gap-3">
                                <MethodBadge method="POST" /> Query Skill
                            </h3>
                            <p className="text-sm text-white/40 mb-6 ml-[68px]">Ask a natural language question against an ingested document.</p>
                            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-left">
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Parameter</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <ParamRow name="skill" type={`"query"`} required description='Literal string that selects the query skill.' />
                                        <ParamRow name="input.question" type="string" required description="The natural language question to answer." />
                                        <ParamRow name="input.document_id" type="string" required description="The document_id returned from a previous ingest call." />
                                        <ParamRow name="input.use_web_search" type="boolean" defaultVal="false" description="When true, augments the answer with live Tavily web search results. Useful for time-sensitive topics." />
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Error Codes */}
                        <div id="errors-ref" className="mb-16">
                            <h3 className="text-xl font-bold mb-6">Error Codes</h3>
                            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-left">
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Error</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">How to fix</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {[
                                            { code: 400, error: "Bad Request", fix: "Ensure all required fields are present and source_url is a valid URL." },
                                            { code: 400, error: "Unsupported Source", fix: `Only PDF, Excel, and YouTube URLs are accepted.` },
                                            { code: 401, error: "Unauthorized", fix: "Include a valid x-a2a-key header. Generate one from the dashboard." },
                                            { code: 404, error: "Resource Not Found", fix: "The document_id does not exist for your account. Re-ingest the document first." },
                                            { code: 429, error: "Rate Limit Exceeded", fix: "You've hit the 100 req / 12h limit. Check the Retry-After header and wait." },
                                            { code: 500, error: "Internal Server Error", fix: "Transient server error. Retry with exponential backoff." },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-white/[0.04]">
                                                <td className="py-3 px-5"><StatusBadge code={row.code} /></td>
                                                <td className="py-3 px-5 text-white/60 font-mono text-xs">{row.error}</td>
                                                <td className="py-3 px-5 text-white/40 text-sm leading-relaxed">{row.fix}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Rate Limits */}
                        <div id="rate-limits-ref">
                            <h3 className="text-xl font-bold mb-6">Rate Limits</h3>
                            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/[0.06] text-left">
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Endpoint</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Limit</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Window</th>
                                            <th className="py-3 px-5 text-xs text-white/30 font-semibold uppercase tracking-wider">Scope</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        <tr>
                                            <td className="py-3 px-5 font-mono text-xs text-indigo-400">POST /api/a2a/tasks</td>
                                            <td className="py-3 px-5 text-white/60">100 requests</td>
                                            <td className="py-3 px-5 text-white/60">12 hours</td>
                                            <td className="py-3 px-5 text-white/40">Per API key</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-4 text-xs text-white/30 leading-relaxed">
                                A sliding window algorithm is used. When limited, the response includes a <code className="font-mono text-white/40">Retry-After</code> header (in seconds) and a <code className="font-mono text-white/40">retryAfter</code> field in the body.
                            </p>
                        </div>
                    </section>

                    {/* ── Code Examples ── */}
                    <section id="examples">
                        <h2 className="text-3xl font-bold mb-2">Code Examples</h2>
                        <p className="text-white/40 mb-10 text-sm">Copy-paste ready snippets in common agent languages.</p>

                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-semibold text-white/60 mb-3">Python — Ingest + Query</p>
                                <CodeBlock lang="python" code={`import requests

API_KEY = "your_api_key_here"
BASE    = "https://ragsphere.vercel.app/api/a2a/tasks"
HEADERS = {"x-a2a-key": API_KEY, "Content-Type": "application/json"}

# Step 1: Ingest a document
ingest_res = requests.post(BASE, headers=HEADERS, json={
    "skill": "ingest",
    "input": {"source_url": "https://example.com/report.pdf"}
})
data = ingest_res.json()
document_id = data["output"]["document_id"]
print(f"Ingested! document_id = {document_id}")

# Step 2: Query the document
query_res = requests.post(BASE, headers=HEADERS, json={
    "skill": "query",
    "input": {
        "question": "Summarise the key findings.",
        "document_id": document_id,
        "use_web_search": False
    }
})
answer = query_res.json()["output"]["answer"]
print(f"Answer: {answer}")`} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white/60 mb-3">JavaScript / Node.js — Ingest + Query</p>
                                <CodeBlock lang="javascript" code={`const API_KEY = "your_api_key_here";
const BASE    = "https://ragsphere.vercel.app/api/a2a/tasks";
const headers = { "x-a2a-key": API_KEY, "Content-Type": "application/json" };

// Step 1: Ingest
const ingestRes = await fetch(BASE, {
  method: "POST",
  headers,
  body: JSON.stringify({
    skill: "ingest",
    input: { source_url: "https://example.com/report.pdf" },
  }),
});
const { output: { document_id } } = await ingestRes.json();
console.log("document_id:", document_id);

// Step 2: Query
const queryRes = await fetch(BASE, {
  method: "POST",
  headers,
  body: JSON.stringify({
    skill: "query",
    input: {
      question: "What are the key findings?",
      document_id,
      use_web_search: false,
    },
  }),
});
const { output: { answer } } = await queryRes.json();
console.log("Answer:", answer);`} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white/60 mb-3">cURL — Quick test</p>
                                <CodeBlock lang="bash" code={`# Ingest
curl -X POST ${API_TASKS} \\
  -H "x-a2a-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skill":"ingest","input":{"source_url":"https://example.com/report.pdf"}}'

# Query (replace DOCUMENT_ID with value from above)
curl -X POST ${API_TASKS} \\
  -H "x-a2a-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"skill":"query","input":{"question":"Key findings?","document_id":"DOCUMENT_ID","use_web_search":false}}'`} />
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="pt-12 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-white/25">
                        <span>© {new Date().getFullYear()} RagSphere — A2A Protocol v0.3.0</span>
                        <div className="flex items-center gap-5">
                            <a href="/.well-known/agent-card.json" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">
                                agent-card.json ↗
                            </a>
                            <Link href="/" className="hover:text-white/50 transition-colors">Home</Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
