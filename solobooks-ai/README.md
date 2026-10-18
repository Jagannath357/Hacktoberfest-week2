# SoloBooks AI

> **Tagline:** Your business finances. Organized privately.  
> **Challenge:** Hacktoberfest Open-Source AI Challenge 2026 — Week 2: Side Hustle  
> **License:** MIT License (Application) • Compatible with Apache 2.0 & Open-Weight Weights

---

## 1. What SoloBooks AI Does

**SoloBooks AI** is a privacy-first, locally-hosted financial document assistant built specifically for freelancers, indie hackers, independent software developers, creative studios, tutors, and small business owners.

Instead of paying $30 to $60/month for cloud accounting platforms that force you to upload bank invoices, confidential client contracts, and tax receipts to third-party servers, SoloBooks AI runs **100% locally on your computer**:

1. **Document Import & OCR:** Ingests PDF invoices, PNG receipts, and JPEG billing photos. Text is extracted locally using Tesseract.js (WASM) or native PDF text parsing without sending files to the cloud.
2. **Local Open-Weight AI Extraction:** Connects to local Ollama (`qwen2.5:3b`, `llama3:latest`, or `llama3.2:3b`) to extract candidate fields (vendor, date, subtotal, tax, total, category).
3. **Human-in-the-Loop Review:** AI extractions are treated as draft proposals, never blindly accepted. You can review, correct, and verify fields side-by-side with your document before committing to your records.
4. **Deterministic Accounting:** Monetary amounts are stored in integer minor units (paise/cents). All balances, category breakdowns, and charts are calculated using procedural arithmetic—the language model **never** invents financial numbers.
5. **Grounded AI Financial Assistant:** Ask questions like *"How much did I spend on software this month?"* or *"Which invoices are overdue?"*. The assistant queries your local SQLite database directly and provides factual summaries with supporting transaction cards.
6. **Data Sovereignty & Exports:** Stored in `./data/solobooks.db` and `./data/documents/`. Generate RFC 4180-compliant CSV and JSON exports with one click.

---

## 2. Who It Is For

- **Freelancers & Independent Contractors:** Keep track of deductible expenses and client receivables.
- **Independent Developers & Indie Hackers:** Tame SaaS bills (AWS, Vercel, Supabase, domains) with automated parsing.
- **Designers & Creative Studios:** Track project retainers, software licenses, and equipment purchases.
- **Online Tutors & Coaches:** Monitor tuition receipts and payment statuses neatly for tax season.
- **Microbusiness Owners:** Enjoy financial clarity without sacrificing business privacy.

---

## 3. Why Local Open-Weight AI Matters

| Feature | Traditional Cloud AI Accounting | SoloBooks AI (Local Open-Weight) |
| :--- | :--- | :--- |
| **Data Privacy** | Sensitive receipts uploaded to cloud servers & APIs | 100% on localhost (`http://127.0.0.1:11434`) |
| **Ongoing API Costs** | Token-based pricing adds up per receipt | **$0.00 marginal cost** forever |
| **Offline Reliability** | Requires active internet & commercial API uptime | Fully operational offline on your laptop |
| **Lock-in** | Proprietary walled gardens | Open SQLite database + RFC 4180 CSV export |
| **Model Flexibility** | Fixed to proprietary vendor model | Swap models (`qwen2.5:3b`, `llama3:latest`, etc.) |

---

## 4. Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                              SoloBooks AI Client                                  |
|   Next.js App Router (React 19, TypeScript, Tailwind CSS v4, Lucide, Recharts)    |
+-----------------------------------------------------------------------------------+
        |                                       |
        | Server Actions / Local API Routes     | Client State & Themes
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

---

## 5. Verified Application Features

- [x] **Product Landing Page:** Explains privacy architecture, side-hustle pricing model, and 3-step workflow.
- [x] **Real-time Financial Dashboard:** Displays total income, total expenses, net balance, overdue count, cash flow chart, and category distribution.
- [x] **Document Repository:** Ingests PDFs, PNGs, and JPEGs. Quarantines raw files on disk and tracks OCR status.
- [x] **Import & Editable Review Step:** OCR + local AI extract fields into an editable form; flags math inconsistencies and duplicate transactions before committing.
- [x] **Expense Management:** Full CRUD, source receipt linking, custom categories, and duplicate warning alerts.
- [x] **Invoice Management:** Complete lifecycle (`Draft` → `Sent` → `Paid` → `Overdue` → `Cancelled`), printable invoice preview, and mark-as-paid confirmation modal.
- [x] **Grounded AI Financial Assistant:** Natural-language chat grounded in verified SQL queries with supporting database transaction cards.
- [x] **Reports & Exports:** Generates RFC 4180-compliant CSV and JSON files with proper quotation escaping.
- [x] **Settings & Privacy Audit:** Live Ollama connection badge, dynamic model switching via `/api/tags`, currency switcher, and sample data loader / reset controls.
- [x] **Persistent Theme Toggle:** Seamless light and dark mode with forest green and deep emerald surfaces.

---

## 6. Prerequisites & Hardware Requirements

- **Operating System:** Windows 10/11, macOS, or Linux (Verified on Windows 11 x64).
- **Node.js:** v20.x or v22.x LTS (Verified on Node v22.11.0).
- **NPM:** v10.x or v11.x (Verified on npm 11.15.0).
- **Ollama:** Ollama runner (Version 0.3+ / 0.18+ verified).
- **Memory & RAM:**
  - **8 GB RAM:** Suitable for lightweight models like `qwen2.5:3b` (Apache 2.0, ~1.9 GB disk).
  - **16 GB RAM:** Recommended for 8B models like `llama3:latest` (Open Weight, ~4.7 GB disk).
- **Graceful Offline Degradation:** If Ollama is offline or uninstalled, the app automatically switches to deterministic keyword heuristics and provides clear connection guides without blocking manual workflows.

---

## 7. Quickstart Installation Guide

### Step 1: Clone the Repository
```bash
git clone <repo-url>
cd solobooks-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Ollama (in a separate terminal)
```bash
ollama serve
```

### Step 4: Pull Your Model of Choice
```bash
# Recommended lightweight model (3B parameters, ~1.9 GB):
ollama pull qwen2.5:3b

# Or pull Llama 3 (8B parameters, ~4.7 GB):
ollama pull llama3:latest
```

### Step 5: Start the Development Server
```bash
npm run dev
```

Open your browser to:
```
http://localhost:3000
```

---

## 8. Running Automated Tests

SoloBooks AI includes automated test coverage with Vitest:

```bash
npm test
```

### Verified Test Suite Results:
- `✓ tests/currency.test.ts (4 tests)` — Minor-unit arithmetic, float drift prevention, and currency parsing.
- `✓ tests/document-validation.test.ts (4 tests)` — MIME validation, 15 MB size limits, and path traversal guards.
- `✓ tests/ai-adapter-mock.test.ts (3 tests)` — Schema validation, null field handling, and heuristic fallback.
- `✓ tests/db-accounting.test.ts (5 tests)` — CRUD operations, invoice status transitions, and deterministic dashboard metrics.
- `✓ tests/ai-real-model.test.ts (1 test)` — Live Ollama connection check on port 11434 with model discovery.
- **Total: 17 passed (17 tests across 5 test suites).**

To build for production:
```bash
npm run build
```

---

## 9. Important Limitations & Disclosures

1. **Not Certified Accounting/Tax Advice:** SoloBooks AI is a private organization and recordkeeping assistant. It does not file official tax documents or calculate legal tax liabilities.
2. **Scanned vs. Native PDFs:** High-resolution digital PDFs extract instantly. Faded thermal receipts or handwritten receipts rely on Tesseract OCR; users should always review candidate values in the review form.
3. **Multi-Currency Segregation:** Financial totals are calculated per currency (default: INR) to avoid inaccurate aggregations without explicit real-time exchange rates.

---

## 10. Open-Source License & Model Attribution

- **SoloBooks AI Application:** Licensed under the [MIT License](LICENSE).
- **Model Licensing:**
  - `qwen2.5:3b` is licensed under the **Apache 2.0 License** (Open Source).
  - `llama3:latest` is licensed under the **Meta Llama 3 Community License** (Open Weight).
