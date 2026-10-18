import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, getInvoices, getDocuments, getSettings } from '@/lib/db';
import { formatCurrency, fromMinorUnits } from '@/lib/currency';
import { modelAdapter } from '@/lib/ai/adapter';
import { Expense, Invoice, DocumentRecord } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: string = (body.query || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Please enter a question.' }, { status: 400 });
    }

    const settings = await getSettings();
    const currency = settings.defaultCurrency || 'INR';

    const allExpenses = await getExpenses();
    const allInvoices = await getInvoices();
    const allDocuments = await getDocuments();

    const lowerQuery = query.toLowerCase();

    // Context & supporting records accumulator
    let supportingExpenses: Expense[] = [];
    let supportingInvoices: Invoice[] = [];
    let supportingDocs: DocumentRecord[] = [];
    let contextSummary = '';

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentMonthIso = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    // Intent Detection
    if (lowerQuery.includes('overdue')) {
      // Overdue invoices query
      supportingInvoices = allInvoices.filter((i) => i.status === 'overdue');
      const totalOverdue = supportingInvoices.reduce((sum, i) => sum + i.amountMinor, 0);

      contextSummary = `QUERY: Overdue invoices.\n`;
      contextSummary += `FOUND: ${supportingInvoices.length} overdue invoices totaling ${formatCurrency(totalOverdue, currency)}.\n`;
      supportingInvoices.forEach((i, idx) => {
        contextSummary += `${idx + 1}. Invoice #${i.invoiceNumber} to ${i.clientName} for ${formatCurrency(i.amountMinor, i.currency)}, due on ${i.dueDate}.\n`;
      });
    } else if (lowerQuery.includes('unpaid') || lowerQuery.includes('pending invoice') || (lowerQuery.includes('invoice') && lowerQuery.includes('status'))) {
      // Unpaid invoices query
      supportingInvoices = allInvoices.filter((i) => i.status === 'sent' || i.status === 'overdue');
      const totalUnpaid = supportingInvoices.reduce((sum, i) => sum + i.amountMinor, 0);

      contextSummary = `QUERY: Unpaid invoices.\n`;
      contextSummary += `FOUND: ${supportingInvoices.length} unpaid invoices totaling ${formatCurrency(totalUnpaid, currency)}.\n`;
      supportingInvoices.forEach((i, idx) => {
        contextSummary += `${idx + 1}. #${i.invoiceNumber} to ${i.clientName} - ${formatCurrency(i.amountMinor, i.currency)} (${i.status.toUpperCase()}, due ${i.dueDate})\n`;
      });
    } else if (lowerQuery.includes('review') || lowerQuery.includes('receipts still need') || lowerQuery.includes('unreviewed')) {
      // Unreviewed documents query
      supportingDocs = allDocuments.filter((d) => d.reviewStatus === 'pending');
      contextSummary = `QUERY: Documents awaiting review.\n`;
      contextSummary += `FOUND: ${supportingDocs.length} pending documents.\n`;
      supportingDocs.forEach((d, idx) => {
        contextSummary += `${idx + 1}. ${d.fileName} (${(d.fileSize / 1024).toFixed(1)} KB, uploaded ${d.createdAt.split('T')[0]})\n`;
      });
    } else if (lowerQuery.includes('largest') || lowerQuery.includes('biggest') || lowerQuery.includes('top expense')) {
      // Top expenses query
      const sorted = [...allExpenses].sort((a, b) => b.amountMinor - a.amountMinor);
      const limitMatch = lowerQuery.match(/\b(\d+)\b/);
      const limit = limitMatch ? parseInt(limitMatch[1], 10) : 5;
      supportingExpenses = sorted.slice(0, Math.min(limit, 10));

      contextSummary = `QUERY: ${limit} largest expenses recorded.\n`;
      supportingExpenses.forEach((e, idx) => {
        contextSummary += `${idx + 1}. ${e.merchant}: ${formatCurrency(e.amountMinor, e.currency)} on ${e.date} (${e.categoryName})\n`;
      });
    } else if (
      lowerQuery.includes('software') ||
      lowerQuery.includes('travel') ||
      lowerQuery.includes('food') ||
      lowerQuery.includes('equipment') ||
      lowerQuery.includes('supplies') ||
      lowerQuery.includes('utilities') ||
      lowerQuery.includes('marketing')
    ) {
      // Category specific query
      let targetCategoryKeyword = 'software';
      if (lowerQuery.includes('travel')) targetCategoryKeyword = 'travel';
      else if (lowerQuery.includes('food')) targetCategoryKeyword = 'food';
      else if (lowerQuery.includes('equipment') || lowerQuery.includes('hardware')) targetCategoryKeyword = 'hardware';
      else if (lowerQuery.includes('supplies') || lowerQuery.includes('office')) targetCategoryKeyword = 'office';
      else if (lowerQuery.includes('utilities') || lowerQuery.includes('internet')) targetCategoryKeyword = 'utilities';
      else if (lowerQuery.includes('marketing')) targetCategoryKeyword = 'marketing';

      const filtered = allExpenses.filter((e) =>
        e.categoryName.toLowerCase().includes(targetCategoryKeyword)
      );

      // Check if "this month" was requested
      const isThisMonth = lowerQuery.includes('this month');
      const finalExp = isThisMonth
        ? filtered.filter((e) => e.date.startsWith(currentMonthIso))
        : filtered;

      supportingExpenses = finalExp;
      const totalAmount = finalExp.reduce((sum, e) => sum + e.amountMinor, 0);

      contextSummary = `QUERY: Expenses in category matching '${targetCategoryKeyword}' ${isThisMonth ? `for current month (${currentMonthIso})` : 'all time'}.\n`;
      contextSummary += `FOUND: ${finalExp.length} transactions totaling ${formatCurrency(totalAmount, currency)}.\n`;
      finalExp.forEach((e, idx) => {
        contextSummary += `${idx + 1}. ${e.merchant}: ${formatCurrency(e.amountMinor, e.currency)} (${e.date}) - ${e.description || 'No description'}\n`;
      });
    } else {
      // General spending or summary query
      const isThisMonth = lowerQuery.includes('this month') || lowerQuery.includes('recent');
      const filteredExp = isThisMonth
        ? allExpenses.filter((e) => e.date.startsWith(currentMonthIso))
        : allExpenses;

      const totalExp = filteredExp.reduce((sum, e) => sum + e.amountMinor, 0);
      const paidInvoices = allInvoices.filter((i) => i.status === 'paid');
      const totalInc = paidInvoices.reduce((sum, i) => sum + i.amountMinor, 0);

      supportingExpenses = filteredExp.slice(0, 8);
      contextSummary = `FINANCIAL OVERVIEW:\n`;
      contextSummary += `- Currency: ${currency}\n`;
      contextSummary += `- Total Recorded Income (Paid Invoices): ${formatCurrency(totalInc, currency)} (${paidInvoices.length} invoices)\n`;
      contextSummary += `- Total Recorded Expenses: ${formatCurrency(totalExp, currency)} (${filteredExp.length} transactions)\n`;
      contextSummary += `- Net Balance: ${formatCurrency(totalInc - totalExp, currency)}\n`;
      contextSummary += `- Pending Document Reviews: ${allDocuments.filter((d) => d.reviewStatus === 'pending').length}\n`;
      contextSummary += `Sample Transactions:\n`;
      filteredExp.slice(0, 5).forEach((e, idx) => {
        contextSummary += `  ${idx + 1}. ${e.merchant} (${formatCurrency(e.amountMinor, e.currency)}, ${e.date})\n`;
      });
    }

    // Call Model Adapter to generate grounded natural language response
    const aiAnswer = await modelAdapter.generateAssistant(query, contextSummary, {
      endpoint: settings.ollamaEndpoint,
      model: settings.selectedModel,
    });

    return NextResponse.json({
      query,
      answer: aiAnswer,
      groundedContext: contextSummary,
      supportingData: {
        expenses: supportingExpenses,
        invoices: supportingInvoices,
        documents: supportingDocs,
      },
      stats: {
        totalExpensesCount: supportingExpenses.length,
        totalInvoicesCount: supportingInvoices.length,
        totalDocumentsCount: supportingDocs.length,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
