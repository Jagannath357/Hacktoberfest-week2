import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import {
  Category,
  DocumentRecord,
  Expense,
  Invoice,
  InvoiceStatus,
  Settings,
} from './types';

let clientInstance: Client | null = null;
let initialized = false;

const DATA_DIR = path.join(process.cwd(), 'data');
const DOCUMENTS_DIR = path.join(DATA_DIR, 'documents');
const DB_PATH = path.join(DATA_DIR, 'solobooks.db');

export function ensureDirectories(): { dataDir: string; documentsDir: string } {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DOCUMENTS_DIR)) {
    fs.mkdirSync(DOCUMENTS_DIR, { recursive: true });
  }
  return { dataDir: DATA_DIR, documentsDir: DOCUMENTS_DIR };
}

export function getDb(): Client {
  if (!clientInstance) {
    ensureDirectories();
    clientInstance = createClient({
      url: `file:${DB_PATH.replace(/\\/g, '/')}`,
    });
  }
  return clientInstance;
}

export const DEFAULT_CATEGORIES = [
  { name: 'Software & Subscriptions', color: '#059669' },
  { name: 'Hardware & Equipment', color: '#0284c7' },
  { name: 'Office Supplies', color: '#d97706' },
  { name: 'Travel & Commute', color: '#7c3aed' },
  { name: 'Food & Client Meals', color: '#e11d48' },
  { name: 'Marketing & Advertising', color: '#ea580c' },
  { name: 'Utilities & Internet', color: '#0d9488' },
  { name: 'Professional & Legal', color: '#4f46e5' },
  { name: 'Other Business Expense', color: '#64748b' },
];

export async function initDatabase(): Promise<void> {
  if (initialized) return;
  const db = getDb();

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      extracted_text TEXT,
      ocr_applied INTEGER NOT NULL DEFAULT 0,
      review_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL DEFAULT '#059669',
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      merchant TEXT NOT NULL,
      date TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      category_name TEXT NOT NULL,
      description TEXT,
      payment_method TEXT,
      is_ai_suggested INTEGER NOT NULL DEFAULT 0,
      ai_explanation TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      invoice_number TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      issue_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      amount_minor INTEGER NOT NULL,
      tax_minor INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'draft',
      paid_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default settings
  await db.execute({
    sql: `INSERT OR IGNORE INTO settings (key, value) VALUES ('default_currency', 'INR')`,
    args: [],
  });
  await db.execute({
    sql: `INSERT OR IGNORE INTO settings (key, value) VALUES ('ollama_endpoint', 'http://127.0.0.1:11434')`,
    args: [],
  });
  await db.execute({
    sql: `INSERT OR IGNORE INTO settings (key, value) VALUES ('selected_model', 'llama3:latest')`,
    args: [],
  });

  // Seed default categories
  for (const cat of DEFAULT_CATEGORIES) {
    const id = `cat_${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    await db.execute({
      sql: `INSERT OR IGNORE INTO categories (id, name, color, is_custom, created_at)
            VALUES (?, ?, ?, 0, ?)`,
      args: [id, cat.name, cat.color, new Date().toISOString()],
    });
  }

  initialized = true;
}

// ----------------- SETTINGS REPO -----------------

export async function getSettings(): Promise<Settings> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute('SELECT key, value FROM settings');
  const map: Record<string, string> = {};
  for (const row of res.rows) {
    map[row.key as string] = row.value as string;
  }
  return {
    defaultCurrency: map.default_currency || 'INR',
    ollamaEndpoint: map.ollama_endpoint || 'http://127.0.0.1:11434',
    selectedModel: map.selected_model || 'llama3:latest',
    theme: map.theme || 'system',
  };
}

export async function updateSetting(key: string, value: string): Promise<void> {
  await initDatabase();
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [key, value],
  });
}

// ----------------- CATEGORIES REPO -----------------

export async function getCategories(): Promise<Category[]> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute('SELECT * FROM categories ORDER BY is_custom ASC, name ASC');
  return res.rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    isCustom: Boolean(r.is_custom),
    createdAt: r.created_at as string,
  }));
}

export async function addCategory(name: string, color: string = '#059669'): Promise<Category> {
  await initDatabase();
  const db = getDb();
  const id = `cat_custom_${Date.now()}`;
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO categories (id, name, color, is_custom, created_at) VALUES (?, ?, ?, 1, ?)`,
    args: [id, name.trim(), color, now],
  });
  return { id, name: name.trim(), color, isCustom: true, createdAt: now };
}

// ----------------- DOCUMENTS REPO -----------------

export async function getDocuments(statusFilter?: string): Promise<DocumentRecord[]> {
  await initDatabase();
  const db = getDb();
  let sql = 'SELECT * FROM documents';
  const args: (string | number)[] = [];
  if (statusFilter && statusFilter !== 'all') {
    sql += ' WHERE review_status = ?';
    args.push(statusFilter);
  }
  sql += ' ORDER BY created_at DESC';

  const res = await db.execute({ sql, args });
  return res.rows.map((r) => ({
    id: r.id as string,
    fileName: r.file_name as string,
    filePath: r.file_path as string,
    fileSize: Number(r.file_size),
    mimeType: r.mime_type as string,
    extractedText: r.extracted_text as string | null,
    ocrApplied: Boolean(r.ocr_applied),
    reviewStatus: r.review_status as DocumentRecord['reviewStatus'],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}

export async function getDocumentById(id: string): Promise<DocumentRecord | null> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM documents WHERE id = ?',
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: r.id as string,
    fileName: r.file_name as string,
    filePath: r.file_path as string,
    fileSize: Number(r.file_size),
    mimeType: r.mime_type as string,
    extractedText: r.extracted_text as string | null,
    ocrApplied: Boolean(r.ocr_applied),
    reviewStatus: r.review_status as DocumentRecord['reviewStatus'],
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function insertDocument(doc: {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  extractedText: string | null;
  ocrApplied: boolean;
  reviewStatus?: DocumentRecord['reviewStatus'];
}): Promise<DocumentRecord> {
  await initDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  const reviewStatus = doc.reviewStatus || 'pending';

  await db.execute({
    sql: `INSERT INTO documents (id, file_name, file_path, file_size, mime_type, extracted_text, ocr_applied, review_status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      doc.id,
      doc.fileName,
      doc.filePath,
      doc.fileSize,
      doc.mimeType,
      doc.extractedText,
      doc.ocrApplied ? 1 : 0,
      reviewStatus,
      now,
      now,
    ],
  });

  return {
    id: doc.id,
    fileName: doc.fileName,
    filePath: doc.filePath,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    extractedText: doc.extractedText,
    ocrApplied: doc.ocrApplied,
    reviewStatus,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateDocumentReviewStatus(
  id: string,
  status: DocumentRecord['reviewStatus'],
  extractedText?: string
): Promise<void> {
  await initDatabase();
  const db = getDb();
  const now = new Date().toISOString();
  if (extractedText !== undefined) {
    await db.execute({
      sql: `UPDATE documents SET review_status = ?, extracted_text = ?, updated_at = ? WHERE id = ?`,
      args: [status, extractedText, now, id],
    });
  } else {
    await db.execute({
      sql: `UPDATE documents SET review_status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, id],
    });
  }
}

export async function deleteDocument(id: string, deleteFile = true): Promise<void> {
  await initDatabase();
  const doc = await getDocumentById(id);
  if (!doc) return;

  const db = getDb();
  await db.execute({ sql: 'DELETE FROM documents WHERE id = ?', args: [id] });

  if (deleteFile && doc.filePath) {
    try {
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
    } catch (e) {
      console.warn('Could not remove file on disk:', e);
    }
  }
}

// ----------------- EXPENSES REPO -----------------

export async function getExpenses(filters?: {
  merchant?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}): Promise<Expense[]> {
  await initDatabase();
  const db = getDb();
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const args: (string | number)[] = [];

  if (filters?.merchant) {
    sql += ' AND LOWER(merchant) LIKE ?';
    args.push(`%${filters.merchant.toLowerCase().trim()}%`);
  }
  if (filters?.category && filters.category !== 'all') {
    sql += ' AND (category_name = ? OR category_id = ?)';
    args.push(filters.category, filters.category);
  }
  if (filters?.startDate) {
    sql += ' AND date >= ?';
    args.push(filters.startDate);
  }
  if (filters?.endDate) {
    sql += ' AND date <= ?';
    args.push(filters.endDate);
  }
  if (filters?.paymentMethod && filters.paymentMethod !== 'all') {
    sql += ' AND payment_method = ?';
    args.push(filters.paymentMethod);
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  const res = await db.execute({ sql, args });
  return res.rows.map((r) => ({
    id: r.id as string,
    documentId: r.document_id as string | null,
    merchant: r.merchant as string,
    date: r.date as string,
    amountMinor: Number(r.amount_minor),
    currency: r.currency as string,
    categoryId: r.category_id as string | null,
    categoryName: r.category_name as string,
    description: r.description as string | null,
    paymentMethod: r.payment_method as string | null,
    isAiSuggested: Boolean(r.is_ai_suggested),
    aiExplanation: r.ai_explanation as string | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }));
}

export async function getExpenseById(id: string): Promise<Expense | null> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM expenses WHERE id = ?',
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: r.id as string,
    documentId: r.document_id as string | null,
    merchant: r.merchant as string,
    date: r.date as string,
    amountMinor: Number(r.amount_minor),
    currency: r.currency as string,
    categoryId: r.category_id as string | null,
    categoryName: r.category_name as string,
    description: r.description as string | null,
    paymentMethod: r.payment_method as string | null,
    isAiSuggested: Boolean(r.is_ai_suggested),
    aiExplanation: r.ai_explanation as string | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function insertExpense(expense: {
  id?: string;
  documentId?: string | null;
  merchant: string;
  date: string;
  amountMinor: number;
  currency?: string;
  categoryId?: string | null;
  categoryName: string;
  description?: string | null;
  paymentMethod?: string | null;
  isAiSuggested?: boolean;
  aiExplanation?: string | null;
}): Promise<Expense> {
  await initDatabase();
  const db = getDb();
  const id = expense.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const currency = expense.currency || 'INR';

  await db.execute({
    sql: `INSERT INTO expenses (
      id, document_id, merchant, date, amount_minor, currency,
      category_id, category_name, description, payment_method,
      is_ai_suggested, ai_explanation, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      expense.documentId || null,
      expense.merchant.trim(),
      expense.date,
      expense.amountMinor,
      currency,
      expense.categoryId || null,
      expense.categoryName.trim(),
      expense.description || null,
      expense.paymentMethod || null,
      expense.isAiSuggested ? 1 : 0,
      expense.aiExplanation || null,
      now,
      now,
    ],
  });

  return {
    id,
    documentId: expense.documentId || null,
    merchant: expense.merchant.trim(),
    date: expense.date,
    amountMinor: expense.amountMinor,
    currency,
    categoryId: expense.categoryId || null,
    categoryName: expense.categoryName.trim(),
    description: expense.description || null,
    paymentMethod: expense.paymentMethod || null,
    isAiSuggested: Boolean(expense.isAiSuggested),
    aiExplanation: expense.aiExplanation || null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Expense | null> {
  await initDatabase();
  const current = await getExpenseById(id);
  if (!current) return null;

  const db = getDb();
  const now = new Date().toISOString();
  const updated: Expense = {
    ...current,
    ...data,
    updatedAt: now,
  };

  await db.execute({
    sql: `UPDATE expenses SET
      merchant = ?, date = ?, amount_minor = ?, currency = ?,
      category_id = ?, category_name = ?, description = ?,
      payment_method = ?, is_ai_suggested = ?, ai_explanation = ?,
      updated_at = ?
    WHERE id = ?`,
    args: [
      updated.merchant,
      updated.date,
      updated.amountMinor,
      updated.currency,
      updated.categoryId,
      updated.categoryName,
      updated.description,
      updated.paymentMethod,
      updated.isAiSuggested ? 1 : 0,
      updated.aiExplanation,
      now,
      id,
    ],
  });

  return updated;
}

export async function deleteExpense(id: string): Promise<boolean> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute({ sql: 'DELETE FROM expenses WHERE id = ?', args: [id] });
  return res.rowsAffected > 0;
}

/**
 * Detect possible duplicate expenses based on same merchant, date, and amount.
 */
export async function detectDuplicateExpense(
  merchant: string,
  date: string,
  amountMinor: number,
  excludeId?: string
): Promise<Expense | null> {
  await initDatabase();
  const db = getDb();
  let sql = `SELECT * FROM expenses WHERE LOWER(merchant) = ? AND date = ? AND amount_minor = ?`;
  const args: (string | number)[] = [merchant.toLowerCase().trim(), date, amountMinor];
  if (excludeId) {
    sql += ` AND id != ?`;
    args.push(excludeId);
  }
  const res = await db.execute({ sql, args });
  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: r.id as string,
    documentId: r.document_id as string | null,
    merchant: r.merchant as string,
    date: r.date as string,
    amountMinor: Number(r.amount_minor),
    currency: r.currency as string,
    categoryId: r.category_id as string | null,
    categoryName: r.category_name as string,
    description: r.description as string | null,
    paymentMethod: r.payment_method as string | null,
    isAiSuggested: Boolean(r.is_ai_suggested),
    aiExplanation: r.ai_explanation as string | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

// ----------------- INVOICES REPO -----------------

export async function getInvoices(filters?: {
  status?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Invoice[]> {
  await initDatabase();
  const db = getDb();
  let sql = 'SELECT * FROM invoices WHERE 1=1';
  const args: (string | number)[] = [];

  if (filters?.client) {
    sql += ' AND LOWER(client_name) LIKE ?';
    args.push(`%${filters.client.toLowerCase().trim()}%`);
  }
  if (filters?.status && filters.status !== 'all') {
    sql += ' AND status = ?';
    args.push(filters.status);
  }
  if (filters?.startDate) {
    sql += ' AND issue_date >= ?';
    args.push(filters.startDate);
  }
  if (filters?.endDate) {
    sql += ' AND issue_date <= ?';
    args.push(filters.endDate);
  }

  sql += ' ORDER BY issue_date DESC, created_at DESC';

  const res = await db.execute({ sql, args });
  const today = new Date().toISOString().split('T')[0];

  return res.rows.map((r) => {
    let status = r.status as InvoiceStatus;
    const dueDate = r.due_date as string;
    // Mark overdue dynamically if due_date has passed and status is still sent or draft
    if ((status === 'sent' || status === 'draft') && dueDate < today) {
      status = 'overdue';
    }
    return {
      id: r.id as string,
      documentId: r.document_id as string | null,
      invoiceNumber: r.invoice_number as string,
      clientName: r.client_name as string,
      clientEmail: r.client_email as string | null,
      issueDate: r.issue_date as string,
      dueDate: r.due_date as string,
      amountMinor: Number(r.amount_minor),
      taxMinor: Number(r.tax_minor || 0),
      currency: r.currency as string,
      status,
      paidDate: r.paid_date as string | null,
      notes: r.notes as string | null,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
    };
  });
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM invoices WHERE id = ?',
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  let status = r.status as InvoiceStatus;
  const today = new Date().toISOString().split('T')[0];
  if ((status === 'sent' || status === 'draft') && (r.due_date as string) < today) {
    status = 'overdue';
  }
  return {
    id: r.id as string,
    documentId: r.document_id as string | null,
    invoiceNumber: r.invoice_number as string,
    clientName: r.client_name as string,
    clientEmail: r.client_email as string | null,
    issueDate: r.issue_date as string,
    dueDate: r.due_date as string,
    amountMinor: Number(r.amount_minor),
    taxMinor: Number(r.tax_minor || 0),
    currency: r.currency as string,
    status,
    paidDate: r.paid_date as string | null,
    notes: r.notes as string | null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

export async function insertInvoice(invoice: {
  id?: string;
  documentId?: string | null;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string | null;
  issueDate: string;
  dueDate: string;
  amountMinor: number;
  taxMinor?: number;
  currency?: string;
  status?: InvoiceStatus;
  notes?: string | null;
}): Promise<Invoice> {
  await initDatabase();
  const db = getDb();
  const id = invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const currency = invoice.currency || 'INR';
  const status = invoice.status || 'draft';

  await db.execute({
    sql: `INSERT INTO invoices (
      id, document_id, invoice_number, client_name, client_email,
      issue_date, due_date, amount_minor, tax_minor, currency,
      status, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      invoice.documentId || null,
      invoice.invoiceNumber.trim(),
      invoice.clientName.trim(),
      invoice.clientEmail || null,
      invoice.issueDate,
      invoice.dueDate,
      invoice.amountMinor,
      invoice.taxMinor || 0,
      currency,
      status,
      invoice.notes || null,
      now,
      now,
    ],
  });

  return {
    id,
    documentId: invoice.documentId || null,
    invoiceNumber: invoice.invoiceNumber.trim(),
    clientName: invoice.clientName.trim(),
    clientEmail: invoice.clientEmail || null,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    amountMinor: invoice.amountMinor,
    taxMinor: invoice.taxMinor || 0,
    currency,
    status,
    paidDate: null,
    notes: invoice.notes || null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function markInvoiceAsPaid(id: string, paidDate?: string): Promise<Invoice | null> {
  await initDatabase();
  const dateStr = paidDate || new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const db = getDb();
  await db.execute({
    sql: `UPDATE invoices SET status = 'paid', paid_date = ?, updated_at = ? WHERE id = ?`,
    args: [dateStr, now, id],
  });
  return getInvoiceById(id);
}

export async function updateInvoice(
  id: string,
  data: Partial<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Invoice | null> {
  await initDatabase();
  const current = await getInvoiceById(id);
  if (!current) return null;

  const db = getDb();
  const now = new Date().toISOString();
  const updated: Invoice = {
    ...current,
    ...data,
    updatedAt: now,
  };

  await db.execute({
    sql: `UPDATE invoices SET
      invoice_number = ?, client_name = ?, client_email = ?,
      issue_date = ?, due_date = ?, amount_minor = ?, tax_minor = ?,
      currency = ?, status = ?, paid_date = ?, notes = ?, updated_at = ?
    WHERE id = ?`,
    args: [
      updated.invoiceNumber,
      updated.clientName,
      updated.clientEmail,
      updated.issueDate,
      updated.dueDate,
      updated.amountMinor,
      updated.taxMinor,
      updated.currency,
      updated.status,
      updated.paidDate,
      updated.notes,
      now,
      id,
    ],
  });

  return updated;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  await initDatabase();
  const db = getDb();
  const res = await db.execute({ sql: 'DELETE FROM invoices WHERE id = ?', args: [id] });
  return res.rowsAffected > 0;
}

// ----------------- AGGREGATION & METRICS -----------------

export interface DashboardMetrics {
  totalIncomeMinor: number;
  totalExpensesMinor: number;
  netBalanceMinor: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmountMinor: number;
  pendingReviewCount: number;
  currency: string;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    title: string;
    subtitle: string;
    date: string;
    amountMinor: number;
    currency: string;
    statusBadge?: string;
  }>;
  monthlyCashflow: Array<{
    month: string; // "Jan", "Feb", etc.
    income: number; // formatted in standard units
    expenses: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    amountMinor: number;
    color: string;
    percentage: number;
  }>;
}

export async function getDashboardMetrics(selectedCurrency = 'INR'): Promise<DashboardMetrics> {
  await initDatabase();
  const expenses = await getExpenses();
  const invoices = await getInvoices();
  const documents = await getDocuments();

  // Filter for selected currency to avoid mixing currencies
  const filteredExpenses = expenses.filter((e) => e.currency === selectedCurrency);
  const filteredInvoices = invoices.filter((i) => i.currency === selectedCurrency);

  // Total recorded expenses
  const totalExpensesMinor = filteredExpenses.reduce((sum, e) => sum + e.amountMinor, 0);

  // Total recorded income (only PAID invoices count towards realized income)
  const paidInvoices = filteredInvoices.filter((i) => i.status === 'paid');
  const totalIncomeMinor = paidInvoices.reduce((sum, i) => sum + i.amountMinor, 0);

  const netBalanceMinor = totalIncomeMinor - totalExpensesMinor;

  // Unpaid invoices (sent, overdue, draft)
  const unpaidInvoices = filteredInvoices.filter(
    (i) => i.status === 'sent' || i.status === 'overdue'
  );
  const unpaidInvoicesAmountMinor = unpaidInvoices.reduce((sum, i) => sum + i.amountMinor, 0);

  // Pending documents review
  const pendingReviewCount = documents.filter((d) => d.reviewStatus === 'pending').length;

  // Recent transactions (merged expenses + invoices sorted by date desc)
  const txList: DashboardMetrics['recentTransactions'] = [];
  for (const exp of filteredExpenses.slice(0, 5)) {
    txList.push({
      id: exp.id,
      type: 'expense',
      title: exp.merchant,
      subtitle: exp.categoryName,
      date: exp.date,
      amountMinor: exp.amountMinor,
      currency: exp.currency,
    });
  }
  for (const inv of filteredInvoices.slice(0, 5)) {
    txList.push({
      id: inv.id,
      type: 'income',
      title: inv.clientName,
      subtitle: `Invoice #${inv.invoiceNumber} (${inv.status})`,
      date: inv.paidDate || inv.issueDate,
      amountMinor: inv.amountMinor,
      currency: inv.currency,
      statusBadge: inv.status,
    });
  }
  txList.sort((a, b) => b.date.localeCompare(a.date));

  // Monthly cash flow (past 6 months)
  const monthsMap = new Map<string, { incomeMinor: number; expenseMinor: number }>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthsMap.set(key, { incomeMinor: 0, expenseMinor: 0 });
  }

  for (const exp of filteredExpenses) {
    const d = new Date(exp.date);
    const key = d.toLocaleString('en-US', { month: 'short' });
    if (monthsMap.has(key)) {
      monthsMap.get(key)!.expenseMinor += exp.amountMinor;
    }
  }
  for (const inv of paidInvoices) {
    const d = new Date(inv.paidDate || inv.issueDate);
    const key = d.toLocaleString('en-US', { month: 'short' });
    if (monthsMap.has(key)) {
      monthsMap.get(key)!.incomeMinor += inv.amountMinor;
    }
  }

  const monthlyCashflow = Array.from(monthsMap.entries()).map(([month, data]) => ({
    month,
    income: Number((data.incomeMinor / 100).toFixed(2)),
    expenses: Number((data.expenseMinor / 100).toFixed(2)),
  }));

  // Category breakdown
  const catMap = new Map<string, { minor: number; color: string }>();
  const allCategories = await getCategories();
  const colorMap = new Map(allCategories.map((c) => [c.name, c.color]));

  for (const exp of filteredExpenses) {
    const cur = catMap.get(exp.categoryName) || {
      minor: 0,
      color: colorMap.get(exp.categoryName) || '#10b981',
    };
    cur.minor += exp.amountMinor;
    catMap.set(exp.categoryName, cur);
  }

  const categoryBreakdown = Array.from(catMap.entries()).map(([name, val]) => ({
    name,
    amount: Number((val.minor / 100).toFixed(2)),
    amountMinor: val.minor,
    color: val.color,
    percentage:
      totalExpensesMinor > 0 ? Number(((val.minor / totalExpensesMinor) * 100).toFixed(1)) : 0,
  }));
  categoryBreakdown.sort((a, b) => b.amountMinor - a.amountMinor);

  return {
    totalIncomeMinor,
    totalExpensesMinor,
    netBalanceMinor,
    unpaidInvoicesCount: unpaidInvoices.length,
    unpaidInvoicesAmountMinor,
    pendingReviewCount,
    currency: selectedCurrency,
    recentTransactions: txList.slice(0, 6),
    monthlyCashflow,
    categoryBreakdown,
  };
}

// ----------------- RESET WORKSPACE -----------------

export async function resetWorkspace(): Promise<void> {
  await initDatabase();
  const db = getDb();
  await db.execute('DELETE FROM expenses');
  await db.execute('DELETE FROM invoices');
  await db.execute('DELETE FROM documents');
  await db.execute('DELETE FROM categories WHERE is_custom = 1');

  // Clear documents folder
  if (fs.existsSync(DOCUMENTS_DIR)) {
    try {
      const files = fs.readdirSync(DOCUMENTS_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(DOCUMENTS_DIR, file));
      }
    } catch (e) {
      console.warn('Failed clearing files:', e);
    }
  }
}
