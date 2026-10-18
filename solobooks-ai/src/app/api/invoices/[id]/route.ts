import { NextRequest, NextResponse } from 'next/server';
import { getInvoiceById, updateInvoice, deleteInvoice, markInvoiceAsPaid } from '@/lib/db';
import { toMinorUnits } from '@/lib/currency';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(invoice);
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
      invoiceNumber,
      clientName,
      clientEmail,
      issueDate,
      dueDate,
      amount,
      amountMinor: providedMinor,
      tax,
      taxMinor: providedTaxMinor,
      currency,
      status,
      paidDate,
      notes,
    } = body;

    let amountMinor: number | undefined = undefined;
    if (typeof providedMinor === 'number') {
      amountMinor = providedMinor;
    } else if (typeof amount === 'number') {
      amountMinor = toMinorUnits(amount);
    }

    let taxMinor: number | undefined = undefined;
    if (typeof providedTaxMinor === 'number') {
      taxMinor = providedTaxMinor;
    } else if (typeof tax === 'number') {
      taxMinor = toMinorUnits(tax);
    }

    const updated = await updateInvoice(id, {
      ...(invoiceNumber ? { invoiceNumber: invoiceNumber.trim() } : {}),
      ...(clientName ? { clientName: clientName.trim() } : {}),
      ...(clientEmail !== undefined ? { clientEmail } : {}),
      ...(issueDate ? { issueDate } : {}),
      ...(dueDate ? { dueDate } : {}),
      ...(amountMinor !== undefined ? { amountMinor } : {}),
      ...(taxMinor !== undefined ? { taxMinor } : {}),
      ...(currency ? { currency } : {}),
      ...(status ? { status } : {}),
      ...(paidDate !== undefined ? { paidDate } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, paidDate } = body;

    if (action === 'mark_paid') {
      const updated = await markInvoiceAsPaid(id, paidDate);
      if (!updated) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
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
    const deleted = await deleteInvoice(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
