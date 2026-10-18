# SoloBooks AI — Project Overview

> **Tagline:** Your business finances. Organized privately.  
> **Challenge:** Hacktoberfest Open-Source AI Challenge 2026 — Week 2: Side Hustle  

---

## 1. Product Vision & Mission

**SoloBooks AI** is a privacy-first, locally-hosted financial document assistant built specifically for solo business operators:
- Freelancers and independent contractors
- Small creative agencies and studios
- Independent software developers and indie hackers
- Online sellers, course creators, and tutors
- Consultants and microbusiness owners

Unlike monolithic, expensive cloud accounting suites (which charge recurring subscription fees and mandate uploading sensitive tax records, bank invoices, and client lists to remote servers), SoloBooks AI runs **entirely on the user's local machine**.

Documents, extracted line items, transaction totals, and conversational prompts never leave the local environment unless the user explicitly exports them.

---

## 2. Core Capabilities

1. **Document Import & Safe Validation:**
   - Supports text and scanned PDF invoices, PNG receipts, and JPEG billing slips.
   - Strict size limit checks, mime-type verification, and path-traversal safeguards.
   - Original binary documents stay in the local application storage.

2. **Local AI & OCR Pipeline:**
   - Optical Character Recognition (OCR) via local WASM-based Tesseract engine.
   - Text parsing from vector PDFs via `pdf-parse`.
   - Local instruction-tuned open-weight language model inference (via local Ollama, supporting models like Llama 3 and Qwen 2.5).
   - Strict Zod schema validation on structured model responses.
   - Transparent fallback and status reporting when Ollama is offline.

3. **Human-in-the-Loop Review:**
   - AI extractions are presented as **draft proposals**, never blindly trusted facts.
   - Interactive review step to edit merchant names, dates, tax amounts, totals, and currency before saving.

4. **Expense & Category Management:**
   - Full CRUD for business expenses linked to their source receipts.
   - Standard categories (Software, Travel, Food & Dining, Office Supplies, Equipment, Marketing, Utilities, Consulting) plus custom user-defined categories.
   - AI category suggestions with reasoned explanations.
   - Heuristic duplicate transaction detection.

5. **Invoice Tracking:**
   - Invoicing lifecycle: `Draft` → `Sent` → `Paid` → `Overdue` → `Cancelled`.
   - Overdue calculation based on issue date and payment terms.
   - Local upcoming payment reminders.

6. **Deterministic Calculations & Grounded AI Assistant:**
   - All financial aggregates, net balances, category breakdowns, and charts are calculated using deterministic arithmetic (stored in minor units / cents / paise) — the LLM never hallucinates numbers.
   - Grounded AI Financial Assistant queries local database records directly and generates natural-language summaries based exclusively on verified stored transactions.

7. **Export & Privacy Transparency:**
   - RFC 4180-compliant CSV export with quote-escaping.
   - Structured JSON export.
   - Live privacy audit screen showing data storage locations, active model, and network isolation status.
