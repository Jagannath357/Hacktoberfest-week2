import { describe, it, expect, beforeAll } from 'vitest';
import {
  initDatabase,
  resetWorkspace,
  insertExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  detectDuplicateExpense,
  insertInvoice,
  getInvoices,
  markInvoiceAsPaid,
  getDashboardMetrics,
  getCategories,
} from '../src/lib/db';
import { toMinorUnits } from '../src/lib/currency';

describe('Database Persistence & Accounting Engine Suite', () => {
  beforeAll(async () => {
    await initDatabase();
    await resetWorkspace();
  });

  it('provisions default expense categories', async () => {
    const cats = await getCategories();
    expect(cats.length).toBeGreaterThanOrEqual(9);
    expect(cats.some((c) => c.name === 'Software & Subscriptions')).toBe(true);
  });

  it('creates, retrieves, and updates an expense record', async () => {
    const created = await insertExpense({
      merchant: 'Test Vendor Co',
      date: '2026-10-18',
      amountMinor: toMinorUnits(1500),
      currency: 'INR',
      categoryName: 'Software & Subscriptions',
      description: 'Monthly license',
      paymentMethod: 'UPI',
    });

    expect(created.id).toBeDefined();
    expect(created.amountMinor).toBe(150000);

    const fetched = await getExpenseById(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.merchant).toBe('Test Vendor Co');

    const updated = await updateExpense(created.id, {
      description: 'Updated license memo',
      amountMinor: toMinorUnits(1800),
    });
    expect(updated?.description).toBe('Updated license memo');
    expect(updated?.amountMinor).toBe(180000);
  });

  it('detects duplicate transactions with identical merchant, date, and amount', async () => {
    const dup = await detectDuplicateExpense(
      'Test Vendor Co',
      '2026-10-18',
      180000 // exact same amount from previous test
    );
    expect(dup).not.toBeNull();
    expect(dup?.merchant).toBe('Test Vendor Co');

    // Searching with different amount should return null
    const noDup = await detectDuplicateExpense('Test Vendor Co', '2026-10-18', 99999);
    expect(noDup).toBeNull();
  });

  it('manages invoices and marks paid with realized income calculations', async () => {
    const inv = await insertInvoice({
      invoiceNumber: 'INV-TEST-01',
      clientName: 'Global Client Corp',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      amountMinor: toMinorUnits(50000),
      currency: 'INR',
      status: 'sent',
    });

    expect(inv.id).toBeDefined();

    // Mark as paid
    const paid = await markInvoiceAsPaid(inv.id, '2026-10-10');
    expect(paid?.status).toBe('paid');
    expect(paid?.paidDate).toBe('2026-10-10');
  });

  it('computes deterministic dashboard metrics with zero arithmetic errors', async () => {
    const metrics = await getDashboardMetrics('INR');

    // Total income = 50,000 (from paid invoice above)
    expect(metrics.totalIncomeMinor).toBe(5000000);

    // Total expenses = 1,800 (from updated expense above)
    expect(metrics.totalExpensesMinor).toBe(180000);

    // Net balance = 50,000 - 1,800 = 48,200 (4,820,000 minor units)
    expect(metrics.netBalanceMinor).toBe(4820000);
  });
});
