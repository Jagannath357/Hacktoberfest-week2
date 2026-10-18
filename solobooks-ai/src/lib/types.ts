export type DocumentReviewStatus = 'pending' | 'reviewed' | 'rejected';

export interface DocumentRecord {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  extractedText: string | null;
  ocrApplied: boolean;
  reviewStatus: DocumentReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  documentId: string | null;
  merchant: string;
  date: string; // YYYY-MM-DD
  amountMinor: number;
  currency: string;
  categoryId: string | null;
  categoryName: string;
  description: string | null;
  paymentMethod: string | null;
  isAiSuggested: boolean;
  aiExplanation: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  documentId: string | null;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string | null;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  amountMinor: number;
  taxMinor: number;
  currency: string;
  status: InvoiceStatus;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  defaultCurrency: string;
  ollamaEndpoint: string;
  selectedModel: string;
  theme: string;
}

export interface ExtractedDocumentData {
  documentType: 'receipt' | 'invoice' | 'bill' | 'other';
  merchantOrCustomer: string | null;
  invoiceNumber: string | null;
  date: string | null; // YYYY-MM-DD
  dueDate: string | null;
  subtotalMinor: number | null;
  taxMinor: number | null;
  totalMinor: number | null;
  currency: string;
  suggestedCategory: string;
  categoryExplanation: string;
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'unknown';
  shortDescription: string;
  confidenceScore?: number;
}
