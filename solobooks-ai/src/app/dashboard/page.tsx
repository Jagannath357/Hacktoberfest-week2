'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileClock,
  AlertTriangle,
  UploadCloud,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Receipt,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { DashboardMetrics } from '@/lib/db';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchMetrics = async (curr = currency) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/metrics?currency=${curr}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {
      console.error('Failed to load metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [currency]);

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/sample-data', { method: 'POST' });
      if (res.ok) {
        const d = await res.json();
        setMessage(d.message);
        await fetchMetrics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const hasNoData =
    !metrics ||
    (metrics.totalIncomeMinor === 0 &&
      metrics.totalExpensesMinor === 0 &&
      metrics.recentTransactions.length === 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time balance, expense categories, and invoice tracking from your local database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <span className="text-slate-400 font-medium">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              id="dashboard-currency-select"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <Link
            href="/import"
            id="dashboard-quick-import"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Receipt</span>
          </Link>
        </div>
      </div>

      {/* Temporary Notification Banner */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Empty State Banner with 1-click sample seeder */}
      {hasNoData && !loading && (
        <div className="p-6 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Workspace is ready for your records</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
              You haven't recorded any expenses or invoices in {currency} yet. You can import your first document or load sample freelance records to explore the full dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              id="dashboard-load-sample-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {seeding ? 'Loading Sample...' : 'Load Sample Data'}
            </button>
            <Link
              href="/import"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              Import Document
            </Link>
          </div>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics ? formatCurrency(metrics.totalIncomeMinor, currency) : '—'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Realized from paid invoices</span>
        </div>

        {/* Expenses Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Expenses</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {metrics ? formatCurrency(metrics.totalExpensesMinor, currency) : '—'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">From verified receipts</span>
        </div>

        {/* Net Balance Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Balance</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              metrics && metrics.netBalanceMinor >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {metrics ? formatCurrency(metrics.netBalanceMinor, currency) : '—'}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Income minus expenses</span>
        </div>

        {/* Pending Review & Unpaid Invoices */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Action Required</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics ? metrics.pendingReviewCount : 0}
            </span>
            <span className="text-xs text-slate-500">receipts to review</span>
          </div>
          <Link
            href="/invoices"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline mt-1 block font-medium"
          >
            {metrics?.unpaidInvoicesCount || 0} unpaid invoices (
            {metrics ? formatCurrency(metrics.unpaidInvoicesAmountMinor, currency) : 0})
          </Link>
        </div>
      </div>

      {/* Charts Section: Monthly Cashflow & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cash Flow Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Cash Flow</h3>
              <p className="text-xs text-slate-500">Income vs Expenses (past 6 months)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span className="text-slate-600 dark:text-slate-300">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {metrics && metrics.monthlyCashflow.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.monthlyCashflow} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No cash flow records to display
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart (1 col) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Expense Categories</h3>
            <p className="text-xs text-slate-500">Distribution by business category</p>
          </div>

          <div className="h-56 w-full my-auto">
            {metrics && metrics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.categoryBreakdown}
                    dataKey="amountMinor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {metrics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), currency)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data recorded
              </div>
            )}
          </div>

          {/* Mini Legend List */}
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {metrics?.categoryBreakdown.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate text-slate-700 dark:text-slate-300">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Financial Activity</h3>
            <p className="text-xs text-slate-500">Merged view of confirmed expenses and client invoices</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/expenses"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              View all expenses →
            </Link>
          </div>
        </div>

        {metrics && metrics.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title / Vendor</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {metrics.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      {tx.type === 'income' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" /> Expense
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{tx.title}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{tx.subtitle}</td>
                    <td className="py-3 px-3 text-slate-500">{tx.date}</td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amountMinor, tx.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No transactions recorded yet in {currency}.
          </div>
        )}
      </div>
    </div>
  );
}
