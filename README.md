# RagSphere (TalkToDocument)

![Architecture](https://github.com/Notreallyaryann/TalkToDocument/blob/main/Architecture.png)

RagSphere is a high-performance Multi-Agent Hybrid RAG system that synchronizes PDFs, Excel files, and YouTube transcripts across a Tri-Database stack (Vector, Graph, and Metadata) for deep, real-time intelligence

## 🚀 Key Features

* **Hybrid RAG Architecture:** Combines **Vector Search** (semantic meaning), **Graph Traversal** (complex relationships), and **Web Search** (real-time facts).
* **Multi-Source Ingestion:** Seamlessly parse PDFs, Excel sheets, and YouTube transcripts.
* **Knowledge Graph Integration:** Uses **Neo4j** to map entities and concepts across different documents.
* **Local Embedding Execution:** Utilizes `@xenova/transformers` for local privacy-centric embedding generation.

---

## 🏗️ Architecture Overview

The system operates through three primary layers to ensure data is not just stored, but understood:

### 1. The Tri-Database Sync
* **Qdrant (Vector Store):** Handles semantic search by storing text chunks and their high-dimensional embeddings.
* **Neo4j (Graph Store):** Maps relationships between people, places, and concepts across your data.
* **MongoDB (Metadata Store):** Tracks user state, document processing status, and persistent chat logs.

### 2. High-Level Workflow
1.  **Ingestion:** Files or URLs are parsed, chunked, and embedded locally. Data is then distributed across the Tri-Database stack.
2.  **Retrieval:** A "Triple-Query" system triggers simultaneous searches across Qdrant, Neo4j, and the Tavily Web API.
3.  **Generation:** The **Context Aggregator** bundles all retrieved data into a precision prompt for the Cerebras-hosted Llama 3.1 model.

---

