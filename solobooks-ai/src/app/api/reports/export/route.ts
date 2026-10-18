import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, getInvoices, getDocuments, getSettings } from '@/lib/db';
import { fromMinorUnits } from '@/lib/currency';

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'expenses'; // 'expenses' | 'invoices' | 'documents' | 'all'
    const format = (searchParams.get('format') || 'csv').toLowerCase(); // 'csv' | 'json'
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const category = searchParams.get('category') || undefined;

    const expenses = await getExpenses({ startDate, endDate, category });
    const invoices = await getInvoices({ startDate, endDate });
    const documents = await getDocuments();
    const settings = await getSettings();

    const timestamp = new Date().toISOString().split('T')[0];

    // JSON Export
    if (format === 'json') {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        currency: settings.defaultCurrency,
        ...(type === 'expenses' || type === 'all'
          ? {
              expenses: expenses.map((e) => ({
                id: e.id,
                date: e.date,
                merchant: e.merchant,
                category: e.categoryName,
                amount: fromMinorUnits(e.amountMinor),
                currency: e.currency,
                description: e.description,
                paymentMethod: e.paymentMethod,
                isAiSuggested: e.isAiSuggested,
                documentId: e.documentId,
              })),
            }
          : {}),
        ...(type === 'invoices' || type === 'all'
          ? {
              invoices: invoices.map((i) => ({
                id: i.id,
                invoiceNumber: i.invoiceNumber,
                clientName: i.clientName,
                clientEmail: i.clientEmail,
                issueDate: i.issueDate,
                dueDate: i.dueDate,
                amount: fromMinorUnits(i.amountMinor),
                tax: fromMinorUnits(i.taxMinor),
                currency: i.currency,
                status: i.status,
                paidDate: i.paidDate,
                notes: i.notes,
              })),
            }
          : {}),
        ...(type === 'documents' || type === 'all'
          ? {
              documents: documents.map((d) => ({
                id: d.id,
                fileName: d.fileName,
                fileSize: d.fileSize,
                mimeType: d.mimeType,
                reviewStatus: d.reviewStatus,
                ocrApplied: d.ocrApplied,
                createdAt: d.createdAt,
              })),
            }
          : {}),
      };

      return new NextResponse(JSON.stringify(exportPayload, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="solobooks_${type}_${timestamp}.json"`,
        },
      });
    }

    // CSV Export
    let csvContent = '';
    let fileName = `solobooks_${type}_${timestamp}.csv`;

    if (type === 'expenses') {
      const headers = [
        'ID',
        'Date',
        'Merchant',
        'Category',
        'Amount',
        'Currency',
        'Payment Method',
        'Description',
        'AI Suggested',
      ];
      csvContent += headers.map(escapeCsvCell).join(',') + '\r\n';

      for (const e of expenses) {
        const row = [
          e.id,
          e.date,
          e.merchant,
          e.categoryName,
          fromMinorUnits(e.amountMinor).toFixed(2),
          e.currency,
          e.paymentMethod || '',
          e.description || '',
          e.isAiSuggested ? 'Yes' : 'No',
        ];
        csvContent += row.map(escapeCsvCell).join(',') + '\r\n';
      }
    } else if (type === 'invoices') {
      const headers = [
        'ID',
        'Invoice Number',
        'Client Name',
        'Client Email',
        'Issue Date',
        'Due Date',
        'Amount',
        'Tax',
        'Currency',
        'Status',
        'Paid Date',
        'Notes',
      ];
      csvContent += headers.map(escapeCsvCell).join(',') + '\r\n';

      for (const i of invoices) {
        const row = [
          i.id,
          i.invoiceNumber,
          i.clientName,
          i.clientEmail || '',
          i.issueDate,
          i.dueDate,
          fromMinorUnits(i.amountMinor).toFixed(2),
          fromMinorUnits(i.taxMinor).toFixed(2),
          i.currency,
          i.status,
          i.paidDate || '',
          i.notes || '',
        ];
        csvContent += row.map(escapeCsvCell).join(',') + '\r\n';
      }
    } else if (type === 'documents') {
      const headers = ['ID', 'File Name', 'Size (Bytes)', 'MIME Type', 'Review Status', 'OCR Applied', 'Uploaded Date'];
      csvContent += headers.map(escapeCsvCell).join(',') + '\r\n';

      for (const d of documents) {
        const row = [
          d.id,
          d.fileName,
          d.fileSize,
          d.mimeType,
          d.reviewStatus,
          d.ocrApplied ? 'Yes' : 'No',
          d.createdAt.split('T')[0],
        ];
        csvContent += row.map(escapeCsvCell).join(',') + '\r\n';
      }
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
