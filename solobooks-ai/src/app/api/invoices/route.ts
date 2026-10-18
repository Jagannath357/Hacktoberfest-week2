import { NextRequest, NextResponse } from 'next/server';
import {
  getInvoices,
  insertInvoice,
  getSettings,
  updateDocumentReviewStatus,
} from '@/lib/db';
import { toMinorUnits } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const client = searchParams.get('client') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const invoices = await getInvoices({
      client,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(invoices);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      notes,
      documentId,
    } = body;

    if (!invoiceNumber || !invoiceNumber.trim()) {
      return NextResponse.json({ error: 'Invoice number is required.' }, { status: 400 });
    }
    if (!clientName || !clientName.trim()) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }
    if (!issueDate) {
      return NextResponse.json({ error: 'Issue date is required.' }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required.' }, { status: 400 });
    }

    const settings = await getSettings();
    const finalCurrency = currency || settings.defaultCurrency || 'INR';

    let amountMinor = 0;
    if (typeof providedMinor === 'number') {
      amountMinor = providedMinor;
    } else if (typeof amount === 'number') {
      amountMinor = toMinorUnits(amount);
    } else if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      amountMinor = isNaN(parsed) ? 0 : toMinorUnits(parsed);
    }

    if (amountMinor <= 0) {
      return NextResponse.json({ error: 'Invoice amount must be greater than zero.' }, { status: 400 });
    }

    let taxMinor = 0;
    if (typeof providedTaxMinor === 'number') {
      taxMinor = providedTaxMinor;
    } else if (typeof tax === 'number') {
      taxMinor = toMinorUnits(tax);
    }

    const newInvoice = await insertInvoice({
      documentId: documentId || null,
      invoiceNumber: invoiceNumber.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail || null,
      issueDate,
      dueDate,
      amountMinor,
      taxMinor,
      currency: finalCurrency,
      status: status || 'draft',
      notes: notes || null,
    });

    if (documentId) {
      await updateDocumentReviewStatus(documentId, 'reviewed');
    }

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
