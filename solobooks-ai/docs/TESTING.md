# SoloBooks AI — Testing Guide

SoloBooks AI enforces rigorous automated testing covering data persistence, mathematical accuracy, export format integrity, and AI extraction edge cases.

---

## 1. Running Tests

Run the full Vitest suite:
```bash
npm test
```

Or run Vitest in watch mode:
```bash
npx vitest
```

---

## 2. Test Coverage Matrix

1. **Deterministic Calculations & Currency Safety:**
   - Minor-unit integer arithmetic (no floating-point rounding errors).
   - Multi-currency segregation.
   - Income, expense, and net balance aggregation.

2. **Expense & Invoice Lifecycle:**
   - Expense creation, category assignment, date filtering.
   - Invoice status transitions (`draft` -> `sent` -> `paid` -> `overdue`).
   - Overdue calculation logic based on current date.

3. **Data Export Validation:**
   - RFC 4180-compliant CSV generation with escaped quotes, commas, and multiline values.
   - Valid JSON export structure.

4. **AI Pipeline & Model Adapter:**
   - Schema validation for complete, partial, and malformed model outputs.
   - Ollama offline connection failure handling and graceful degradation.
   - Inconsistent total detection and null field safety.
   - Grounded Assistant query validation against mock database fixtures.
