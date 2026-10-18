# SoloBooks AI — Privacy & Security Architecture

SoloBooks AI is built on the tenet that **financial records belong exclusively on the user's computer**.

---

## 1. Privacy Guarantees

- **No Remote AI API Calls:** Inference runs strictly via `http://127.0.0.1:11434` on localhost.
- **No Cloud Database:** All records persist in an embedded SQLite database (`./data/solobooks.db`).
- **No Third-Party Telemetry:** Zero external analytics, tracking pixels, or marketing SDKs.
- **Local Document Storage:** Uploaded receipts and PDFs are saved in `./data/documents/` on the local filesystem.
- **Complete Data Erasure:** The user can purge all records and uploaded documents locally with a single click.

---

## 2. Security Safeguards

- **Strict File Upload Validation:** File sizes are capped at 15MB. MIME types are checked against an explicit whitelist (`application/pdf`, `image/png`, `image/jpeg`).
- **Path Traversal Prevention:** Files are renamed using cryptographic UUIDs (`uuidv4`) and stored in a quarantined `./data/documents` directory.
- **Prompt Injection Defense:** Invoice text extracted via OCR or PDF parsing is treated as **untrusted data**. The prompt wraps text in bounded delimiters and instructs the local LLM to disregard any instruction inside the document trying to alter the system prompt or override extraction formats.
- **Deterministic Math:** Financial balances and sums are calculated strictly via procedural arithmetic, eliminating hallucinated financial figures.
