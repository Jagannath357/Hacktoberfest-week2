# DEV Community Submission Draft — Hacktoberfest 2026 Week 2: Side Hustle

**Post Title:** SoloBooks AI: Your Business Finances. Organized Privately With Local Open-Weight AI.

---

### What I Built

For the Hacktoberfest Open-Source AI Challenge (Week 2: Side Hustle), I built **SoloBooks AI** — a privacy-first, locally-hosted financial document assistant engineered specifically for freelancers, indie hackers, creative studios, tutors, and microbusiness owners.

Freelancers and solo operators are constantly bombarded with receipts, software invoices, contractor billing PDFs, and dining expenses in inconsistent formats. Traditional accounting platforms are both expensive and require uploading private financial data, client lists, and receipts to third-party cloud servers.

**SoloBooks AI runs entirely on your own hardware:**
- **Local OCR & Parsing:** Tesseract.js WASM + native PDF parser extract raw text on-device.
- **Local AI Inference:** Connects to Ollama (supporting verified open-weight models like Qwen 2.5 and Llama 3) for structured field extraction and expense classification.
- **Deterministic Math:** Stored in integer minor units (paise/cents) to eliminate hallucinated numbers or floating-point rounding bugs.
- **Editable Review Step:** AI extractions are treated as drafts until confirmed by the user.
- **Grounded Assistant:** Answers questions ("How much did I spend on software this month?") by querying stored database records directly and generating verifiable summaries.
- **Zero Cloud Leaks:** Your bank statements, client invoices, and receipts never leave your computer.

---

### Demo & Screenshots

*(Add repository and local demo screenshots here)*

---

### Why Open-Source & Open-Weight AI Matters for Small Business

Commercial AI APIs charge per token, rate-limit requests, and retain user queries for model training unless expensive enterprise agreements are signed. For a solo entrepreneur or freelancer managing their side hustle, sending proprietary financial records to a remote API represents a needless security and privacy vulnerability.

By leveraging local open-weight instruction models via Ollama and embedded SQLite persistence:
1. **Zero Marginal Inference Cost:** Analyze thousands of receipts with zero API bills.
2. **Total Confidentiality:** Financial data, tax IDs, and client rates remain quarantined locally.
3. **No Vendor Lock-in:** The model adapter allows swapping models seamlessly as better open weights are published.

---

### Tech Stack
- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
- **Database:** Local SQLite engine via `@libsql/client` with minor-unit accounting
- **OCR:** Tesseract.js (pure JS/WASM worker) & PDF-Parse
- **AI Inference:** Ollama local runner (`llama3:latest`, `qwen2.5:3b`, etc.)
- **Testing:** Vitest automated test suite

---

### Repository & Setup Instructions
Check out the complete source code and setup instructions:
[GitHub Repository Link]
