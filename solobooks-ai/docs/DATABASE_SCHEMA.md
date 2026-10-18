# SoloBooks AI — Database Schema & Data Models

SoloBooks AI uses local SQLite via `@libsql/client` with auto-migration and schema versioning.

---

## 1. Monetary Storage Convention

**Integer Minor Units:** All monetary values (`amount`, `subtotal`, `tax`, `total`) are stored as **64-bit integers** representing the minor currency unit:
- In `INR` (Indian Rupee): ₹120.50 is stored as `12050` paise.
- In `USD`: $49.99 is stored as `4999` cents.
- In `EUR`: €15.00 is stored as `1500` cents.

This prevents floating-point rounding bugs (e.g. `0.1 + 0.2 = 0.30000000000000004`) in all financial ledgers, tax totals, and exports.

---

## 2. Table Definitions

### `documents`
Stores metadata and review status for uploaded invoices, receipts, and billing notes.
```sql
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  extracted_text TEXT,
  ocr_applied INTEGER NOT NULL DEFAULT 0,
  review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'rejected'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### `categories`
Standard and user-defined financial categories.
```sql
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

### `expenses`
Business expense line items.
```sql
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  merchant TEXT NOT NULL,
  date TEXT NOT NULL,          -- ISO 8601 YYYY-MM-DD
  amount_minor INTEGER NOT NULL, -- Integer minor units
  currency TEXT NOT NULL DEFAULT 'INR',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,
  description TEXT,
  payment_method TEXT,         -- 'UPI', 'Credit Card', 'Bank Transfer', 'Cash'
  is_ai_suggested INTEGER NOT NULL DEFAULT 0,
  ai_explanation TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### `invoices`
Outbound client billing and receivables.
```sql
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  issue_date TEXT NOT NULL,    -- YYYY-MM-DD
  due_date TEXT NOT NULL,      -- YYYY-MM-DD
  amount_minor INTEGER NOT NULL,
  tax_minor INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  paid_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### `settings`
Persistent local configuration and preferences.
```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```
*(Default keys: `default_currency`: "INR", `ollama_endpoint`: "http://127.0.0.1:11434", `selected_model`: "llama3:latest", `theme`: "system")*
