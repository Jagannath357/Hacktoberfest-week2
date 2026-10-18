'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/db';
import { formatCurrency } from '@/lib/currency';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/metrics?currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [currency]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Reports & Data Exports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic business summaries and RFC 4180 compliant CSV / JSON exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Reporting Currency:</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      {/* Export Center Box */}
      <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>Export Financial Data</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Exports contain real records with proper quote-escaping for quotation marks, commas, and Unicode characters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Expenses CSV */}
          <a
            href="/api/reports/export?type=expenses&format=csv"
            download
            id="export-expenses-csv"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-xs">Expenses (CSV)</p>
              <p className="text-[10px] text-slate-400">RFC 4180 spreadsheet</p>
            </div>
          </a>

          {/* Invoices CSV */}
          <a
            href="/api/reports/export?type=invoices&format=csv"
            download
            id="export-invoices-csv"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-xs">Invoices (CSV)</p>
              <p className="text-[10px] text-slate-400">Receivables & statuses</p>
            </div>
          </a>

          {/* Expenses JSON */}
          <a
            href="/api/reports/export?type=expenses&format=json"
            download
            id="export-expenses-json"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors shadow-2xs"
          >
            <FileCode className="w-5 h-5 text-teal-600" />
            <div>
              <p className="font-semibold text-xs">Expenses (JSON)</p>
              <p className="text-[10px] text-slate-400">Structured data format</p>
            </div>
          </a>

          {/* Complete JSON Archive */}
          <a
            href="/api/reports/export?type=all&format=json"
            download
            id="export-complete-json"
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200 flex items-center gap-3 transition-colors shadow-2xs"
          >
            <FileCode className="w-5 h-5 text-teal-600" />
            <div>
              <p className="font-semibold text-xs">Complete Archive (JSON)</p>
              <p className="text-[10px] text-slate-400">Expenses, invoices & docs</p>
            </div>
          </a>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income vs Expense Summary */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Income vs. Expense Ledger Summary
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {currency}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-slate-500">Realized Income (Paid Invoices):</span>
              <span className="font-bold text-emerald-600">
                {metrics ? formatCurrency(metrics.totalIncomeMinor, currency) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-slate-500">Verified Business Expenses:</span>
              <span className="font-bold text-rose-600">
                {metrics ? formatCurrency(metrics.totalExpensesMinor, currency) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm">
              <span className="text-slate-800 dark:text-slate-200">Net Balance:</span>
              <span
                className={
                  metrics && metrics.netBalanceMinor >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600'
                }
              >
                {metrics ? formatCurrency(metrics.netBalanceMinor, currency) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Receivables Status Report */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Invoice Receivables Status
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Summary</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-slate-500">Unpaid / Pending Invoices:</span>
              <span className="font-bold text-amber-600">
                {metrics?.unpaidInvoicesCount || 0} (
                {metrics ? formatCurrency(metrics.unpaidInvoicesAmountMinor, currency) : 0})
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-slate-500">Receipts Awaiting User Review:</span>
              <span className="font-bold text-amber-600">
                {metrics?.pendingReviewCount || 0} document{metrics?.pendingReviewCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 leading-relaxed">
              Amounts are calculated procedurally using minor currency units (paise/cents) to guarantee zero arithmetic errors.
            </div>
          </div>
        </div>

        {/* Expense Category Distribution Table (Full width on md) */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Category Distribution Report
            </h3>
            <span className="text-[11px] text-slate-400">Deductible Categories</span>
          </div>

          {metrics && metrics.categoryBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Category Name</th>
                    <th className="py-2.5 px-3 text-right">Percentage</th>
                    <th className="py-2.5 px-3 text-right">Total Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {metrics.categoryBreakdown.map((cat) => (
                    <tr key={cat.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-slate-900 dark:text-white">{cat.name}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {cat.percentage}%
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.amountMinor, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No expenses recorded in {currency}.
            </div>
          )}
        </div>
      </div>

      {/* Compliance / Disclaimer Notice */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong>Important Disclaimer:</strong> SoloBooks AI is an organization and recordkeeping tool for small businesses and freelancers. This report does not constitute certified tax advice or official legal tax filing documents. Consult a certified public accountant (CPA) or tax professional for statutory tax submissions.
        </div>
      </div>
    </div>
  );
}
