import { NextResponse } from 'next/server';
import { seedSampleData, hasExistingData } from '@/lib/seed';
import { resetWorkspace } from '@/lib/db';

export async function GET() {
  try {
    const hasData = await hasExistingData();
    return NextResponse.json({ hasData });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST() {
  try {
    const res = await seedSampleData();
    return NextResponse.json({
      success: true,
      message: `Sample workspace loaded with ${res.expensesCount} expenses and ${res.invoicesCount} invoices.`,
      data: res,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await resetWorkspace();
    return NextResponse.json({
      success: true,
      message: 'Workspace reset to clean slate. All expenses, invoices, and documents cleared.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
