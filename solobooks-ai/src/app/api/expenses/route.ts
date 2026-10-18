import { NextRequest, NextResponse } from 'next/server';
import {
  getExpenses,
  insertExpense,
  detectDuplicateExpense,
  updateDocumentReviewStatus,
  getSettings,
} from '@/lib/db';
import { toMinorUnits } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchant = searchParams.get('merchant') || undefined;
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;

    const expenses = await getExpenses({
      merchant,
      category,
      startDate,
      endDate,
      paymentMethod,
    });

    return NextResponse.json(expenses);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      merchant,
      date,
      amount,
      amountMinor: providedMinor,
      currency,
      categoryName,
      categoryId,
      description,
      paymentMethod,
      documentId,
      isAiSuggested,
      aiExplanation,
      confirmDuplicate,
    } = body;

    if (!merchant || !merchant.trim()) {
      return NextResponse.json({ error: 'Merchant name is required.' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required.' }, { status: 400 });
    }

    const settings = await getSettings();
    const finalCurrency = currency || settings.defaultCurrency || 'INR';

    // Calculate minor units safely
    let amountMinor = 0;
    if (typeof providedMinor === 'number' && Number.isFinite(providedMinor)) {
      amountMinor = providedMinor;
    } else if (typeof amount === 'number') {
      amountMinor = toMinorUnits(amount);
    } else if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      amountMinor = isNaN(parsed) ? 0 : toMinorUnits(parsed);
    }

    if (amountMinor <= 0) {
      return NextResponse.json({ error: 'Expense amount must be greater than zero.' }, { status: 400 });
    }

    // Check for potential duplicate transactions
    if (!confirmDuplicate) {
      const duplicate = await detectDuplicateExpense(merchant, date, amountMinor);
      if (duplicate) {
        return NextResponse.json(
          {
            warning: 'Possible duplicate transaction found.',
            duplicate,
          },
          { status: 409 }
        );
      }
    }

    const newExpense = await insertExpense({
      documentId: documentId || null,
      merchant: merchant.trim(),
      date,
      amountMinor,
      currency: finalCurrency,
      categoryId: categoryId || null,
      categoryName: categoryName || 'Other Business Expense',
      description: description || null,
      paymentMethod: paymentMethod || null,
      isAiSuggested: Boolean(isAiSuggested),
      aiExplanation: aiExplanation || null,
    });

    // If linked to a document, update review status to 'reviewed'
    if (documentId) {
      await updateDocumentReviewStatus(documentId, 'reviewed');
    }

    return NextResponse.json(newExpense, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
