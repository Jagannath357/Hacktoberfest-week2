# SoloBooks AI — Technology Stack

## 1. Frontend Framework & UI
- **Next.js 16 (App Router):** Server-rendered layouts, API route handlers, and React 19 Client Components.
- **React 19:** State management, responsive hooks, context-driven theme system.
- **TypeScript (Strict Mode):** Type safety across all domain models, schemas, and API contracts.
- **Tailwind CSS v4:** Modern CSS variables with custom forest green / deep emerald color palette, subtle dark-mode surfaces, glassmorphism, and micro-interactions.
- **Lucide React:** Consistent iconography for finances, documents, analytics, and status flags.
- **Recharts:** Client-side charts for monthly cash flow and categorical expense breakdown.

## 2. Local Database & Persistence
- **SQLite Engine via `@libsql/client`:** Zero-configuration, zero-native-build-failure, embedded SQLite client supporting local files (`file:data/solobooks.db`), transactions, WAL mode, and parameter binding.
- **Minor Unit Storage:** Financial monetary values are stored as integers (e.g. `12500` for ₹125.00 or $125.00) to ensure mathematical precision without floating-point drift.
- **Zod 3:** Strict runtime validation for request payloads, schema parsing, and LLM JSON output validation.

## 3. Document Processing & Local OCR
- **Tesseract.js v7:** Pure JavaScript and WebAssembly OCR engine for scanned receipts and images. Runs in a dedicated background worker without requiring external C++ OCR packages.
- **PDF-Parse:** Extracts native text streams from digital invoices and PDF receipts without OCR overhead.

## 4. Local AI & Inference
- **Ollama CLI / Service:** Manages local model lifecycle and exposes a local REST API (`http://127.0.0.1:11434`).
- **Verified Models:**
  - `llama3:latest` (8B parameters, Meta open-weight)
  - `qwen2.5:3b` / `qwen2.5:1.5b` (Qwen open-weight, Alibaba Cloud, Apache 2.0 license)
- **Structured JSON Mode:** Enforces `format: "json"` in inference requests, followed by Zod parsing to guarantee schema compliance.

## 5. Automated Testing
- **Vitest:** Fast unit and integration test runner with path alias support.
