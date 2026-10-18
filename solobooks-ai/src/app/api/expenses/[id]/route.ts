import { NextRequest, NextResponse } from 'next/server';
import { getExpenseById, updateExpense, deleteExpense } from '@/lib/db';
import { toMinorUnits } from '@/lib/currency';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const expense = await getExpenseById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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
    } = body;

    let amountMinor: number | undefined = undefined;
    if (typeof providedMinor === 'number') {
      amountMinor = providedMinor;
    } else if (typeof amount === 'number') {
      amountMinor = toMinorUnits(amount);
    } else if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      if (!isNaN(parsed)) amountMinor = toMinorUnits(parsed);
    }

    const updated = await updateExpense(id, {
      ...(merchant ? { merchant: merchant.trim() } : {}),
      ...(date ? { date } : {}),
      ...(amountMinor !== undefined ? { amountMinor } : {}),
      ...(currency ? { currency } : {}),
      ...(categoryName ? { categoryName: categoryName.trim() } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(paymentMethod !== undefined ? { paymentMethod } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteExpense(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
