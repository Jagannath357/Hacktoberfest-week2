import { describe, it, expect } from 'vitest';
import {
  ExtractedLlmSchema,
  heuristicExtract,
} from '../src/lib/ai/adapter';

describe('AI Pipeline & Schema Robustness Suite', () => {
  it('validates a complete, structured extraction output successfully', () => {
    const rawData = {
      documentType: 'receipt',
      merchantOrCustomer: 'Amazon Web Services',
      invoiceNumber: 'INV-9842109',
      date: '2026-10-14',
      dueDate: null,
      subtotal: 2923.73,
      tax: 526.27,
      total: 3450.0,
      currency: 'INR',
      suggestedCategory: 'Software & Subscriptions',
      categoryExplanation: 'Cloud infrastructure hosting vendor.',
      paymentStatus: 'paid',
      shortDescription: 'AWS cloud instances',
    };

    const validated = ExtractedLlmSchema.parse(rawData);
    expect(validated.merchantOrCustomer).toBe('Amazon Web Services');
    expect(validated.total).toBe(3450.0);
    expect(validated.paymentStatus).toBe('paid');
  });

  it('safely handles missing or incomplete fields without throwing', () => {
    const incompleteData = {
      // Missing merchant, missing tax, missing invoice number
      total: 450.0,
    };

    const validated = ExtractedLlmSchema.parse(incompleteData);
    expect(validated.merchantOrCustomer).toBeNull();
    expect(validated.invoiceNumber).toBeNull();
    expect(validated.tax).toBeNull();
    expect(validated.total).toBe(450.0);
    expect(validated.currency).toBe('INR');
    expect(validated.paymentStatus).toBe('unknown');
  });

  it('runs deterministic heuristic fallback on raw text when Ollama is offline', () => {
    const sampleText = `GitHub Inc.\nReceipt #: GH-88912\nDate: 2026-10-10\nCopilot Developer Seat: ₹850.00\nTotal: ₹850.00\nStatus: Paid with Credit Card`;

    const result = heuristicExtract(sampleText);
    expect(result.merchantOrCustomer).toContain('GitHub');
    expect(result.invoiceNumber).toBe('GH-88912');
    expect(result.date).toBe('2026-10-10');
    expect(result.totalMinor).toBe(85000); // 850 * 100 paise
    expect(result.currency).toBe('INR');
    expect(result.paymentStatus).toBe('paid');
    expect(result.suggestedCategory).toBe('Software & Subscriptions');
  });
});
