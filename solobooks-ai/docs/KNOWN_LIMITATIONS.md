# SoloBooks AI — Known Limitations & Boundaries

To maintain rigorous transparency, this document lists current technical boundaries and hardware expectations.

---

## 1. System Requirements & Hardware Trade-offs

- **Memory Overhead:** Running local 8B models (such as `llama3:latest`) requires at least 8GB to 16GB of system RAM. Users with lightweight laptops (8GB RAM) should configure `qwen2.5:3b` or `llama3.2:3b` in Settings for optimal response speed.
- **Inference Speed:** CPU-only inference on older laptops may take 5 to 15 seconds per receipt extraction, whereas GPU-accelerated Ollama instances execute in 1 to 2 seconds.

---

## 2. Document & OCR Scope

- **Handwritten Receipts:** Tesseract.js is tuned for printed Latin/alphanumeric characters. Highly stylized cursive or faded thermal receipts may yield lower OCR accuracy; the user is prompted to manually review and edit fields.
- **Multi-Page Heavy PDFs:** Very large PDFs (>50 pages) should be split; SoloBooks AI processes receipts and invoices up to 15 MB.

---

## 3. Financial & Legal Boundaries

- **Not Certified Tax/Accounting Advice:** SoloBooks AI is an organization, categorization, and recordkeeping tool. It does not file taxes, generate audited financial statements, or replace a Certified Public Accountant (CPA) / Chartered Accountant (CA).
- **Multi-Currency Aggregation:** Currencies (e.g. INR and USD) are segregated in reports rather than auto-converted using stale exchange rates, preventing misleading financial sums.
