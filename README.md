# RagSphere (TalkToDocument)

![Architecture](https://github.com/Notreallyaryann/TalkToDocument/blob/main/Architecture.png)

RagSphere is a high-performance **Multi-Agent Hybrid RAG system** designed for the agentic era. It synchronizes PDFs, Excel files, and YouTube transcripts across a **Tri-Database stack** (Vector, Graph, and Metadata) to provide deep, real-time intelligence.

---

## 🚀 Key Features

*   **Hybrid RAG Architecture:** Combines **Vector Search** (semantic meaning), **Graph Traversed Context** (complex relationships), and **Web Search** (real-time facts).
*   **A2A (Agent-to-Agent) Protocol:** RagSphere is a fully compatible A2A Agent. It can be discovered, composed, and used by other agents as a specialized knowledge service.
*   **Multi-Source Ingestion:** Seamlessly parse PDFs, Excel sheets, and YouTube transcripts.
*   **Knowledge Graph Integration:** Uses **Neo4j** to map entities and concepts across different documents automatically.
*   **Privacy-Centric Embeddings:** Utilizes `@xenova/transformers` for local embedding generation, ensuring data privacy.

---

## 🏗️ Architecture Overview

The system operates through three primary layers to ensure data is not just stored, but understood:

### 1. The Tri-Database Sync
*   **Qdrant (Vector Store):** Handles semantic search by storing high-dimensional embeddings of text chunks.
*   **Neo4j (Graph Store):** Tracks relationships between people, places, and concepts.
*   **MongoDB (Metadata Store):** Manages user states, document processing, and chat history.

### 2. The A2A Layer (Agent-to-Agent)
RagSphere exposes its intelligence through the A2A protocol, allowing it to act as a "Skill Provider" for other agents.
*   **Discovery:** `/.well-known/agent-card.json` describes capabilities for registries.
*   **Authentication:** Per-user API keys (generated on the dashboard) ensure secure, isolated access.
*   **Skill Sets:** Exposes `ingest` (remote URL processing) and `query` (hybrid retrieval) skills.

### 3. High-Level Workflow
1.  **Ingestion:** Files or URLs are parsed, chunked, and embedded locally. Data is then distributed across the Tri-Database stack.
2.  **Retrieval:** A "Triple-Query" system triggers simultaneous searches across **Qdrant**, **Neo4j**, and the **Tavily Web API**.
3.  **Generation:** The **Context Aggregator** bundles all retrieved data into a precision prompt for the **Cerebras-hosted Llama 3.1** model.

---

## 🛠️ Developer Integration (A2A)

Other developers can integrate RagSphere into their agentic workflows by providing their personal API Key in the request header.

**Endpoint:** `POST https://ragsphere.vercel.app/api/a2a/tasks`  
**Header:** `x-a2a-key: <your_personal_api_key>`

### 📂 1. Ingest a Document/Video
```json
{
  "skill": "ingest",
  "input": {
    "source_url": "https://www.youtube.com/watch?v=5MgBikgcWnY"
  }
}
```

### 💬 2. Query Knowledge Base
```json
{
  "skill": "query",
  "input": {
    "question": "What are the core concepts explained in this video?",
    "document_id": "your_document_id_here",
    "use_web_search": true
  }
}
```

---

## 💻 Tech Stack

*   **Frontend/Backend:** Next.js
*   **LLM:** Llama 3.1 (via Cerebras API)
*   **Embeddings:** `@xenova/transformers` 
*   **Databases:** Qdrant, Neo4j, MongoDB
*   **Web Search:** Tavily API
