# SoloBooks AI — System Architecture

```
+-----------------------------------------------------------------------------------+
|                              SoloBooks AI Client                                  |
|   Next.js App Router (React 19, TypeScript, Tailwind CSS, Lucide, Recharts)       |
+-----------------------------------------------------------------------------------+
        |                                       |
        | Next.js Server Actions / API Routes   | Direct Local State
        v                                       v
+-----------------------------------------------------------------------------------+
|                           Local Application Services Layer                        |
|                                                                                   |
|  +-------------------------+  +-------------------------+  +--------------------+ |
|  |     Document Service    |  |       OCR & Parser      |  |   Model Adapter    | |
|  | (Validation, Storage)   |  | (pdf-parse, Tesseract)  |  | (Ollama Connector) | |
|  +-------------------------+  +-------------------------+  +--------------------+ |
|               |                            |                          |           |
|               v                            v                          v           |
|  +------------------------------------------------------------------------------+ |
|  |                         Deterministic Accounting Engine                      | |
|  |       (Minor-unit integer math, aggregation, date filters, deduplication)     | |
|  +------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
        |                                                         |
        v                                                         v
+----------------------------------+          +-------------------------------------+
|        Local SQLite Database     |          |       Local Ollama Daemon           |
|     (via @libsql/client engine)  |          |      (http://127.0.0.1:11434)       |
|    Path: ./data/solobooks.db     |          |   Models: llama3:latest, qwen2.5:3b |
+----------------------------------+          +-------------------------------------+
```

## Architectural Highlights

### 1. Zero Cloud Dependency
SoloBooks AI operates with 100% local persistence and local inference. There are no external analytics, no cloud database connections, and no remote API keys required.

### 2. Strict Separation: Deterministic Math vs. AI Interpretation
- **Math & Balances:** All financial calculations (subtotals, tax sums, grand totals, category totals, monthly balances) are computed using deterministic code using integer minor units (e.g. cents/paise) to prevent floating-point inaccuracies.
- **AI Role:** Open-weight LLMs are leveraged exclusively for text interpretation, semantic category suggestions, document field extraction, and narrative summarization grounded in verified database query results.

### 3. Model Adapter Layer
The Ollama client is abstracted behind an agnostic `ModelAdapter` interface (`src/lib/ai/adapter.ts`). This allows switching between local models (`llama3:latest`, `qwen2.5:3b`, `llama3.2:3b`, etc.) or mocking the LLM in automated test environments without altering core application logic.

### 4. Storage & File System Isolation
Documents uploaded through the UI are sanitized (sanitized filenames, UUID-based storage references, path traversal guards) and saved into `./data/documents/`. Only relative storage paths and metadata are stored in SQLite. Binary blobs are never stuffed into SQL tables.
