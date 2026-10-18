import {
  insertExpense,
  insertInvoice,
  insertDocument,
  resetWorkspace,
  getExpenses,
  getInvoices,
} from './db';
import { toMinorUnits } from './currency';

export async function hasExistingData(): Promise<boolean> {
  const expenses = await getExpenses();
  const invoices = await getInvoices();
  return expenses.length > 0 || invoices.length > 0;
}

export async function seedSampleData(): Promise<{ expensesCount: number; invoicesCount: number }> {
  // Clear any existing data first to prevent double-seeding
  await resetWorkspace();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const formatDate = (offsetDays: number): string => {
    const d = new Date(year, month, now.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Sample Documents
  const sampleDoc1 = await insertDocument({
    id: 'doc_sample_aws_oct',
    fileName: 'AWS_Cloud_Invoice_Oct.pdf',
    filePath: '',
    fileSize: 142300,
    mimeType: 'application/pdf',
    extractedText: `AMAZON WEB SERVICES INDIA PRIVATE LIMITED\nInvoice #: INV-IN-9842109\nDate: ${formatDate(4)}\nTotal Amount: INR 3,450.00\nTax (GST 18%): INR 526.27\nDescription: EC2, S3 & Database Cloud Infrastructure\nPayment Status: Paid (Credit Card ending 8124)`,
    ocrApplied: false,
    reviewStatus: 'reviewed',
  });

  const sampleDoc2 = await insertDocument({
    id: 'doc_sample_figma',
    fileName: 'Figma_Subscription_Receipt.png',
    filePath: '',
    fileSize: 84200,
    mimeType: 'image/png',
    extractedText: `Figma, Inc.\nReceipt: FGM-2026-8812\nDate: ${formatDate(12)}\nItem: Professional Team Seat (1 seat)\nTotal: ₹1,200.00\nPayment Method: UPI Auto-debit`,
    ocrApplied: true,
    reviewStatus: 'reviewed',
  });

  const sampleDocPending = await insertDocument({
    id: 'doc_sample_pending_cafe',
    fileName: 'BlueTokai_Client_Coffee.jpg',
    filePath: '',
    fileSize: 62400,
    mimeType: 'image/jpeg',
    extractedText: `Blue Tokai Coffee Roasters\nBill No: BT-3019\nDate: ${formatDate(1)}\n2x Cortado, 1x Almond Croissant\nTotal: ₹680.00\nTax: ₹32.38\nThank you for visiting!`,
    ocrApplied: true,
    reviewStatus: 'pending',
  });

  // Sample Expenses
  const sampleExpenses = [
    {
      documentId: sampleDoc1.id,
      merchant: 'Amazon Web Services',
      date: formatDate(4),
      amountMinor: toMinorUnits(3450),
      currency: 'INR',
      categoryName: 'Software & Subscriptions',
      description: 'AWS hosting & databases for freelance projects',
      paymentMethod: 'Credit Card',
      isAiSuggested: true,
      aiExplanation: 'Matched cloud infrastructure merchant (Amazon Web Services) with monthly hosting.',
    },
    {
      documentId: sampleDoc2.id,
      merchant: 'Figma Inc.',
      date: formatDate(12),
      amountMinor: toMinorUnits(1200),
      currency: 'INR',
      categoryName: 'Software & Subscriptions',
      description: 'Figma Professional monthly designer subscription',
      paymentMethod: 'UPI',
      isAiSuggested: true,
      aiExplanation: 'Figma is standard design and prototyping software.',
    },
    {
      documentId: null,
      merchant: 'GitHub Copilot',
      date: formatDate(8),
      amountMinor: toMinorUnits(850),
      currency: 'INR',
      categoryName: 'Software & Subscriptions',
      description: 'GitHub Copilot developer seat',
      paymentMethod: 'Credit Card',
      isAiSuggested: false,
      aiExplanation: null,
    },
    {
      documentId: null,
      merchant: 'WeWork Coworking',
      date: formatDate(15),
      amountMinor: toMinorUnits(7500),
      currency: 'INR',
      categoryName: 'Office Supplies',
      description: 'Dedicated hot-desk day passes & conference room booking',
      paymentMethod: 'Bank Transfer',
      isAiSuggested: false,
      aiExplanation: null,
    },
    {
      documentId: null,
      merchant: 'Dell Store',
      date: formatDate(25),
      amountMinor: toMinorUnits(18900),
      currency: 'INR',
      categoryName: 'Hardware & Equipment',
      description: '27-inch 4K USB-C monitor for dual-screen productivity',
      paymentMethod: 'Credit Card',
      isAiSuggested: true,
      aiExplanation: 'Computer peripheral hardware asset.',
    },
    {
      documentId: null,
      merchant: 'Google Workspace',
      date: formatDate(35),
      amountMinor: toMinorUnits(420),
      currency: 'INR',
      categoryName: 'Software & Subscriptions',
      description: 'Custom domain business email & cloud storage',
      paymentMethod: 'UPI',
      isAiSuggested: false,
      aiExplanation: null,
    },
    {
      documentId: null,
      merchant: 'Uber Business',
      date: formatDate(18),
      amountMinor: toMinorUnits(1140),
      currency: 'INR',
      categoryName: 'Travel & Commute',
      description: 'Cab fare to client headquarters for milestone demo',
      paymentMethod: 'UPI',
      isAiSuggested: true,
      aiExplanation: 'Travel & transport ride hailing expense.',
    },
  ];

  for (const exp of sampleExpenses) {
    await insertExpense(exp);
  }

  // Sample Invoices
  const sampleInvoices = [
    {
      documentId: null,
      invoiceNumber: 'INV-2026-001',
      clientName: 'Acme SaaS Innovations',
      clientEmail: 'billing@acmesaas.com',
      issueDate: formatDate(28),
      dueDate: formatDate(7),
      amountMinor: toMinorUnits(45000),
      taxMinor: toMinorUnits(8100),
      currency: 'INR',
      status: 'paid' as const,
      notes: 'Full-stack dashboard design & Next.js frontend development milestone 1',
    },
    {
      documentId: null,
      invoiceNumber: 'INV-2026-002',
      clientName: 'DesignCraft Studio',
      clientEmail: 'finance@designcraft.co',
      issueDate: formatDate(10),
      dueDate: formatDate(-10), // 10 days in future
      amountMinor: toMinorUnits(28000),
      taxMinor: toMinorUnits(5040),
      currency: 'INR',
      status: 'sent' as const,
      notes: 'Brand identity system, logo assets & style guide documentation',
    },
    {
      documentId: null,
      invoiceNumber: 'INV-2026-003',
      clientName: 'HyperGrowth Labs',
      clientEmail: 'founder@hypergrowthlabs.io',
      issueDate: formatDate(40),
      dueDate: formatDate(10), // overdue by 10 days
      amountMinor: toMinorUnits(32000),
      taxMinor: toMinorUnits(5760),
      currency: 'INR',
      status: 'overdue' as const,
      notes: 'API backend integration & payment gateway checkout flow',
    },
    {
      documentId: null,
      invoiceNumber: 'INV-2026-004',
      clientName: 'EduTech Academy',
      clientEmail: 'accounts@edutech.in',
      issueDate: formatDate(2),
      dueDate: formatDate(-20),
      amountMinor: toMinorUnits(15000),
      taxMinor: toMinorUnits(2700),
      currency: 'INR',
      status: 'draft' as const,
      notes: 'Monthly maintenance retainer and bugfixes for October',
    },
  ];

  for (const inv of sampleInvoices) {
    await insertInvoice(inv);
  }

  return {
    expensesCount: sampleExpenses.length,
    invoicesCount: sampleInvoices.length,
  };
}
