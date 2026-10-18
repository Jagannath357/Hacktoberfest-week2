'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  ArrowRight,
  ShieldAlert,
  Loader2,
  RefreshCw,
  X,
  Check,
} from 'lucide-react';
import { ExtractedDocumentData, DocumentRecord } from '@/lib/types';
import { fromMinorUnits, toMinorUnits, formatCurrency } from '@/lib/currency';

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Extracted Document State
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);

  // Editable Form State
  const [recordType, setRecordType] = useState<'expense' | 'invoice'>('expense');
  const [merchant, setMerchant] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtotal, setSubtotal] = useState<string>('');
  const [tax, setTax] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [currency, setCurrency] = useState('INR');
  const [categoryName, setCategoryName] = useState('Other Business Expense');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [description, setDescription] = useState('');
  const [aiExplanation, setAiExplanation] = useState('');
  const [rawText, setRawText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFileSelect = (selected: File) => {
    setError(null);
    setSaveSuccess(false);

    // Validate size
    if (selected.size > 15 * 1024 * 1024) {
      setError('File exceeds 15 MB limit.');
      return;
    }
    // Validate type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(selected.type)) {
      setError('Please upload a valid PDF, PNG, or JPEG file.');
      return;
    }

    setFile(selected);
    uploadAndExtract(selected);
  };

  const uploadAndExtract = async (f: File) => {
    try {
      setProcessing(true);
      setStage('Validating file & saving locally...');

      const formData = new FormData();
      formData.append('file', f);

      setStage('Running OCR & extracting text streams...');
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Document processing failed.');
      }

      setStage('Interpreting financial fields via local AI model...');
      const data = await res.json();

      setDocumentRecord(data.document);
      setRawText(data.document.extractedText || '');

      const ext: ExtractedDocumentData = data.extractedData || {
        documentType: 'receipt',
        merchantOrCustomer: null,
        invoiceNumber: null,
        date: new Date().toISOString().split('T')[0],
        dueDate: null,
        subtotalMinor: null,
        taxMinor: null,
        totalMinor: null,
        currency: 'INR',
        suggestedCategory: 'Other Business Expense',
        categoryExplanation: 'No local model extraction available.',
        paymentStatus: 'unknown',
        shortDescription: '',
      };

      setExtractedData(ext);

      // Populate Editable Review Form
      setRecordType(ext.documentType === 'invoice' ? 'invoice' : 'expense');
      setMerchant(ext.merchantOrCustomer || '');
      setInvoiceNumber(ext.invoiceNumber || '');
      setDate(ext.date || new Date().toISOString().split('T')[0]);
      setDueDate(ext.dueDate || '');
      setSubtotal(ext.subtotalMinor !== null ? fromMinorUnits(ext.subtotalMinor).toString() : '');
      setTax(ext.taxMinor !== null ? fromMinorUnits(ext.taxMinor).toString() : '');
      setTotal(ext.totalMinor !== null ? fromMinorUnits(ext.totalMinor).toString() : '');
      setCurrency(ext.currency || 'INR');
      setCategoryName(ext.suggestedCategory || 'Other Business Expense');
      setAiExplanation(ext.categoryExplanation || '');
      setPaymentStatus(ext.paymentStatus === 'paid' ? 'paid' : 'unpaid');
      setDescription(ext.shortDescription || '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setProcessing(false);
      setStage('');
    }
  };

  const handleSaveRecord = async () => {
    if (!merchant.trim()) {
      setError('Merchant or Client name is required.');
      return;
    }
    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      setError('Please provide a valid total amount greater than zero.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (recordType === 'expense') {
        const payload = {
          documentId: documentRecord?.id || null,
          merchant,
          date,
          amountMinor: toMinorUnits(totalNum),
          currency,
          categoryName,
          description: description || `Extracted from ${documentRecord?.fileName || 'document'}`,
          paymentMethod,
          isAiSuggested: true,
          aiExplanation,
          confirmDuplicate: true,
        };

        const res = await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save expense.');
        }
      } else {
        const payload = {
          documentId: documentRecord?.id || null,
          invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
          clientName: merchant,
          issueDate: date,
          dueDate: dueDate || date,
          amountMinor: toMinorUnits(totalNum),
          taxMinor: tax ? toMinorUnits(parseFloat(tax)) : 0,
          currency,
          status: paymentStatus === 'paid' ? 'paid' : 'sent',
          notes: description,
        };

        const res = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to save invoice.');
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push(recordType === 'expense' ? '/expenses' : '/invoices');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Check arithmetic consistency
  const subNum = parseFloat(subtotal) || 0;
  const taxNum = parseFloat(tax) || 0;
  const totNum = parseFloat(total) || 0;
  const isMathInconsistent = subNum > 0 && taxNum > 0 && totNum > 0 && Math.abs(subNum + taxNum - totNum) > 0.05;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Document Import & AI Review
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Import receipts or invoices. OCR and local open-weight AI extract candidate fields for your review before saving.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Import Issue</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Success Notice */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Record Successfully Verified & Saved!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Redirecting to {recordType === 'expense' ? 'Expenses' : 'Invoices'} ledger...
            </p>
          </div>
        </div>
      )}

      {/* Step 1: Dropzone (visible if no document loaded or if resetting) */}
      {!documentRecord && !processing && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          id="import-dropzone"
          className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop your receipt or invoice
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Supports PDF documents, PNG receipts, and JPEG photos (up to 15 MB).
            Text is parsed locally via PDF-Parse or Tesseract OCR.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              id="choose-file-btn"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Browse Local Files
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
            <span>✓ Scanned OCR Support</span>
            <span>•</span>
            <span>✓ Zero Cloud Upload</span>
            <span>•</span>
            <span>✓ Private Extraction</span>
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {processing && (
        <div className="p-12 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Processing Local Document
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium animate-pulse">
            {stage}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Inference runs on localhost. Documents never leave your device.
          </p>
        </div>
      )}

      {/* Step 2: Human-In-The-Loop Editable Review Step */}
      {documentRecord && !processing && (
        <div className="space-y-6">
          {/* Top Banner with File Info */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{documentRecord.fileName}</p>
                <p className="text-slate-500">
                  {(documentRecord.fileSize / 1024).toFixed(1)} KB •{' '}
                  {documentRecord.ocrApplied ? 'Tesseract OCR Applied' : 'PDF Native Text'} • Status:{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Awaiting Your Review</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRawText(!showRawText)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
              >
                {showRawText ? 'Hide Raw Text' : 'View Raw Extracted Text'}
              </button>
              <button
                onClick={() => {
                  setDocumentRecord(null);
                  setFile(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium cursor-pointer"
              >
                Discard & Upload Another
              </button>
            </div>
          </div>

          {/* Raw Text Collapsible Panel */}
          {showRawText && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono max-h-56 overflow-y-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {rawText || 'No text extracted from document.'}
            </div>
          )}

          {/* Mathematical Inconsistency Alert */}
          {isMathInconsistent && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Warning:</strong> Extracted Subtotal ({subtotal}) + Tax ({tax}) does not equal Total ({total}). Please verify and adjust the values before confirming.
              </span>
            </div>
          )}

          {/* Review Form Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>Review AI Extracted Fields</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Verify or correct values. Fields marked with AI icons are suggested and require your confirmation.
                </p>
              </div>

              {/* Record Type Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRecordType('expense')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recordType === 'expense'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Save as Expense
                </button>
                <button
                  type="button"
                  onClick={() => setRecordType('invoice')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    recordType === 'invoice'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Save as Invoice
                </button>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Vendor / Client */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {recordType === 'expense' ? 'Vendor / Merchant Name' : 'Client Name'} *
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Amazon Web Services, Figma, Blue Tokai"
                  id="review-merchant-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice / Receipt # (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-98421"
                  id="review-invoice-number-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  id="review-date-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Due Date (for invoices) */}
              {recordType === 'invoice' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    id="review-due-date-input"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Currency */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  id="review-currency-select"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              {/* Subtotal */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subtotal
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                  placeholder="0.00"
                  id="review-subtotal-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tax Amount */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tax Amount (GST / VAT / Sales Tax)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  placeholder="0.00"
                  id="review-tax-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Final Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0.00"
                  id="review-total-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category (for Expense) */}
              {recordType === 'expense' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Expense Category
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Suggested
                    </span>
                  </div>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    id="review-category-select"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Hardware & Equipment">Hardware & Equipment</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Travel & Commute">Travel & Commute</option>
                    <option value="Food & Client Meals">Food & Client Meals</option>
                    <option value="Marketing & Advertising">Marketing & Advertising</option>
                    <option value="Utilities & Internet">Utilities & Internet</option>
                    <option value="Professional & Legal">Professional & Legal</option>
                    <option value="Other Business Expense">Other Business Expense</option>
                  </select>
                  {aiExplanation && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                      Reason: {aiExplanation}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              {recordType === 'expense' ? (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    id="review-payment-method-select"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    id="review-invoice-status-select"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="paid">Paid (Payment Received)</option>
                    <option value="unpaid">Sent / Unpaid (Awaiting Payment)</option>
                  </select>
                </div>
              )}

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Line Items / Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. EC2 Cloud Servers, 2x Cortado, Figma Seat"
                  id="review-description-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500">
                <span>By confirming, this record is permanently committed to your local SQLite database.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDocumentRecord(null);
                    setFile(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveRecord}
                  disabled={saving}
                  id="confirm-and-save-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Save to Books</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
