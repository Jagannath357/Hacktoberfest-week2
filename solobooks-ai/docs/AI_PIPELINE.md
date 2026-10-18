# SoloBooks AI — Structured AI Pipeline

The SoloBooks AI document pipeline translates raw user documents into structured, human-reviewed financial records through a 6-stage deterministic & probabilistic flow.

---

## The 6-Stage Pipeline

```
[Uploaded Document (PDF / Image)]
                |
                v
       [Stage 1: Validation]
       - Max file size (15 MB)
       - Allowed MIME types (pdf, png, jpeg)
       - Path sanitization
                |
                v
  [Stage 2: Deterministic Extraction]
  - If PDF with text stream -> pdf-parse
  - If Image or scanned PDF -> Tesseract.js WASM OCR
                |
                v
      [Stage 3: Text Pruning & Prompt Guard]
      - Truncate excessively long noise
      - Strip potential prompt injection attempts
                |
                v
    [Stage 4: Structured Model Inference]
    - Ollama /api/generate with format: "json"
    - Strict instruction prompt
                |
                v
      [Stage 5: Schema Validation & Normalization]
      - Zod schema validation
      - Integer minor units conversion
      - Field absence marked as null (no hallucinations)
                |
                v
     [Stage 6: Interactive Human Review]
     - User inspects candidate values side-by-side with document
     - Confirmation / manual override before committing to SQLite
```

---

## 2. Guardrails Against Hallucination

1. **No Artificial Precision:** If an invoice date or tax rate is missing from the document, the model is strictly instructed to return `null` instead of guessing.
2. **Explicit Verification Status:** Stored records carry an `is_ai_suggested` flag. AI-derived values are never presented as verified legal records until the user clicks **"Save & Confirm"**.
3. **Prompt Injection Resistance:** Document text is passed in a dedicated delimited context block (`<document_text>...</document_text>`) with explicit system instructions to ignore any operational commands found within the receipt text.
