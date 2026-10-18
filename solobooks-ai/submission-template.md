---
title: "SoloBooks AI — Your business finances. Organized privately."
published: false
tags: "hacktoberfest, opensource, ai, productivity"
---

This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).

---

## What I Built

**SoloBooks AI** is a privacy-first, local-first financial document assistant designed specifically for freelancers, independent software developers, creative studios, tutors, and small business owners.

### The Problem
Solo operators are routinely bombarded with receipts, software subscription invoices, contractor timesheets, client billing PDFs, and dining slips in fragmented formats. Traditional accounting platforms pose two major drawbacks for independent professionals:
1. **Privacy & Data Security Risks:** Commercial tools mandate uploading private bank invoices, tax IDs, and confidential client rates to third-party cloud servers and proprietary AI APIs.
2. **Excessive Subscription Overhead:** Monolithic accounting suites cost between $30 and $60 per month for complex enterprise features that solo entrepreneurs rarely need.

### The Solution
SoloBooks AI replaces manual spreadsheet entry with local open-weight intelligence while guaranteeing that financial documents remain quarantined on the user's personal hardware:
- **Local Document Ingestion:** Processes PDF invoices, PNG receipts, and JPEG photos through on-device text parsing and local Tesseract.js WebAssembly OCR.
- **Local Open-Weight Extraction:** Integrates with local Ollama to extract candidate financial fields (merchant, date, subtotal, tax, total amount, category, and payment status).
- **Human-in-the-Loop Verification:** AI extractions are strictly treated as draft proposals. Users review, edit, and confirm values before committing them to SQLite.
- **Deterministic Math:** Financial amounts are stored in integer minor units (paise/cents) to eliminate floating-point drift and prevent hallucinated numbers.
- **Grounded AI Financial Assistant:** Answers natural-language questions (e.g., *"How much did I spend on software this month?"*) by executing deterministic SQL queries and presenting verified supporting transaction cards alongside narrative summaries.
- **Data Sovereignty & Direct Exports:** Records and files stay in local `./data/` directories, with one-click RFC 4180 CSV and structured JSON exports.

---

## Demo

<!-- Provide links to your live demo, walkthrough video, or screenshot gallery below. -->
<!-- Note: If your application runs locally, record a video walkthrough or link to uploaded screenshots. -->

- **Video Demonstration:** <!-- [Insert link to video demo or loom/youtube walkthrough here] -->
- **Live Demo (Optional):** <!-- [Insert live demo URL if hosted, or specify: "Designed for local execution on localhost:3000"] -->

### Verified Local Walkthrough Screenshots

<!-- You can embed or upload screenshots of the running application here: -->
<!-- 1. Landing Page with Hero & Privacy Guarantees -->
<!-- 2. Real-Time Financial Dashboard with Cash Flow & Category Distribution Charts -->
<!-- 3. Document Import & Editable Review Form with Math Discrepancy Detection -->
<!-- 4. Grounded AI Assistant answering questions with verified SQL database cards -->
<!-- 5. Settings Screen displaying live Ollama connection status and dynamic model discovery -->

---

## Code

<!-- Provide your public GitHub repository URL below. Do not leave placeholder text upon final submission. -->

**GitHub Repository:** <!-- [Insert your public GitHub repository link here, e.g., https://github.com/your-username/solobooks-ai] -->

*SoloBooks AI is released under the permissive [MIT License](https://opensource.org/licenses/MIT).*

---

## How I Built It

SoloBooks AI is built on a modern, decoupled architecture prioritizing local persistence, deterministic calculations, and modular AI inference.

```
+-----------------------------------------------------------------------------------+
|                              SoloBooks AI Client                                  |
|   Next.js 16 App Router (React 19, TypeScript Strict, Tailwind CSS v4, Recharts)  |
+-----------------------------------------------------------------------------------+
        |                                       |
        | Server Actions / Local API Routes     | Client State & Dark/Light Theme
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

### 1. Frontend & Visual Design
- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript in strict mode.
- **Styling:** Tailwind CSS v4 customized with a dedicated forest green and deep emerald design system (`#059669` / `#10b981`), soft-neutral light mode surfaces, and deep charcoal dark mode surfaces.
- **Charts:** Recharts for client-side monthly cash flow bar charts and categorical expense distribution pie charts.
- **Icons:** Lucide React for consistent financial and interface iconography.

### 2. Local Database & Persistence
- **Engine:** SQLite managed via `@libsql/client`, providing crash-proof, zero-native-build embedded database operations across platforms.
- **Data Integrity:** All currency values are stored as integer minor units (e.g., `4500000` paise for ₹45,000.00 or `4999` cents for $49.99). This completely eliminates floating-point precision drift.
- **File Quarantine:** Uploaded receipts and invoices are validated (15 MB limit, whitelist of MIME types, path traversal stripping) and saved to `./data/documents/` using random UUIDs. Only relative storage paths are tracked in the database.

### 3. Document Processing & Local OCR
- **Tesseract.js v7:** Pure JavaScript and WebAssembly OCR engine for scanned receipts and photos. Runs in a dedicated background worker without needing external C++ system binaries.
- **PDF-Parse:** Extracts native text streams from digital invoices and e-receipts without OCR latency.

### 4. Local Open-Weight AI & Structured Validation
- **Ollama Local API:** Connects via `http://127.0.0.1:11434` to execute inference entirely on-device.
- **Verified Models:**
  - `llama3:latest` (8.03B parameters, Meta Llama 3 Community License) — Verified locally.
  - `qwen2.5:3b` (3.09B parameters, Apache 2.0 Open-Source License) — Supported lightweight model for 8GB RAM laptops.
- **Schema Validation with Zod:** Extraction prompts enforce `format: "json"`, and raw responses are validated through a strict `ExtractedLlmSchema`. Missing fields are preserved as `null` rather than allowing the model to hallucinate dates or invoice numbers.
- **Prompt Injection Defense:** Document text is passed in delimited `<document_text>` blocks with explicit system instructions to ignore prompt injection attempts embedded inside invoices.
- **Replaceable Model Adapter:** AI communication is decoupled behind a generic `ModelAdapter` interface (`src/lib/ai/adapter.ts`), enabling seamless model swapping and automated mocking in tests.

### 5. Automated Testing
- Verified test suite running on Vitest (`npm test`): **17 passed out of 17 tests** covering minor-unit arithmetic, document security, schema validation, duplicate detection, invoice state transitions, and real Ollama connectivity.

---

## Why Does Open Innovation Matter?

Commercial AI platforms have democratized language capabilities, but sending proprietary financial records, client names, invoice totals, and tax documents to remote APIs introduces severe compliance, confidentiality, and financial liabilities for independent business operators.

### Key Benefits of Open Innovation in Small-Business AI:
1. **Absolute Data Sovereignty:** When a model runs locally, your client lists, hourly rates, and tax deductions never leave your device.
2. **Zero Marginal Inference Cost:** Once weights are downloaded, analyzing 10 receipts or 10,000 receipts costs exactly $0.00 in API tokens.
3. **Freedom from Vendor Lock-In:** With open-weight models (like Qwen 2.5 under Apache 2.0), developers and users are not vulnerable to arbitrary pricing hikes, deprecation notices, or sudden API terms changes.

### Honest Technical Trade-offs & Limitations:
- **Local Storage Overhead:** Downloading model weights requires between ~1.9 GB (for 3B models) and ~4.7 GB (for 8B models) of disk space.
- **Hardware Requirements:** Smooth inference requires at least 8 GB of RAM for 3B parameter models and 16 GB of RAM (or dedicated VRAM) for 8B models.
- **Processing Time:** On pure CPU hardware, local OCR and inference may take 5 to 15 seconds per document, compared to near-instant results on GPU-accelerated rigs.
- **Offline vs. Local:** While model inference and database operations run 100% offline once setup is complete, initial setup requires downloading Ollama and pulling model weights while connected to the internet.
- **Verified Behavior:**
  <!-- Confirm the exact offline / local behavior you personally verified during your local runs: -->
  *I personally verified that with the network disconnected, SoloBooks AI continues to serve the full dashboard, process local PDF text, execute SQLite queries, calculate deterministic totals, and export RFC 4180 CSV files.*

---

## Business Model: Who Might Pay for It?

SoloBooks AI is conceived as a sustainable side hustle aimed at solo operators who want professional recordkeeping without enterprise SaaS subscriptions.

### Current Implementation vs. Commercial Roadmap
- **Free Core (Currently Implemented & Open-Source):**
  - Unlimited local document OCR and PDF extraction.
  - Local Ollama model integration and schema validation.
  - Expense and invoice tracking with status transitions.
  - Grounded AI Financial Assistant.
  - RFC 4180 CSV and JSON data exports.
- **Proposed Pro Tier (Planned Commercial Feature Concept):**
  - *Automated Bank Statement CSV Mapping:* Intelligent schema mapping for diverse credit card and bank export formats.
  - *Bulk Queue Processing:* Drag-and-drop batch import of up to 50 documents simultaneously.
  - *Encrypted Local Backups:* One-click password-encrypted snapshot archives for tax audit preparation.
  - *Native Desktop Packaging:* Tauri-based single-binary executable for zero-terminal installation.
  - *Target Pricing Concept:* Proposed at a modest ₹499/month ($6/month) one-time or subscription license.

*(Note: In accordance with challenge rules, payment processing and subscriptions are strictly proposals and have not been falsely implemented.)*

---

## My First User

<!-- NOTE FOR SUBMITTER: Since this project is submitted individually, complete this section only if you shared the app with a real tester (colleague, freelancer, or friend). If you have not gathered external feedback yet, remove this section prior to publishing. -->

- **Tester Profile:** <!-- [e.g., Freelance UI/UX designer managing client invoices and monthly software expenses] -->
- **Workflow Tested:** <!-- [e.g., Imported 3 sample PDF receipts (AWS, Figma, Coworking pass), reviewed extracted candidate values, and exported a month-end CSV] -->
- **Actual Feedback Received:** <!-- [Insert direct quote or genuine observations from your tester] -->
- **Willingness to Pay:** <!-- [Record their honest reaction to the proposed side-hustle pricing model] -->

---

## My Agent Session

<!-- Optional: If you utilized an agentic workflow or have a DevRelay session link, provide it below. Otherwise, omit this section. -->

- **Agent Framework / Tooling:** Built with Google Antigravity Advanced Agentic Coding pairing on architecture, database schema, local AI adapter, and Vitest test suite.
- **Session Reference:** <!-- [Insert DevRelay or agent transcript reference if available, or omit] -->

---

## Prize Categories

<!-- Select only the partner prize categories that genuinely apply and that you are eligible to enter. Verify each category before submitting. -->

- **Primary Category:** Hacktoberfest Week 2: Side Hustle
- **Applicable Partner Categories:** <!-- [List eligible partner categories, e.g., Ollama / Open-Source AI integration, or remove if not applicable] -->

---

## Individual Submission Note

This project was conceived, architected, and built individually by me for the Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle. All source code, database schemas, local model adapters, and UI components were developed without uncredited external collaborators.

---

## Closing

SoloBooks AI demonstrates that local open-weight AI is not merely an alternative to cloud APIs—it is the foundational technology that makes privacy-first, zero-marginal-cost software a viable and sustainable side hustle for the next generation of independent creators.
