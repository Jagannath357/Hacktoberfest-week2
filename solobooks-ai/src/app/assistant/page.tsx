'use client';

import React, { useState } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  Receipt,
  FileCheck,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  CornerDownLeft,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { Expense, Invoice, DocumentRecord } from '@/lib/types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  groundedContext?: string;
  supportingData?: {
    expenses?: Expense[];
    invoices?: Invoice[];
    documents?: DocumentRecord[];
  };
  timestamp: string;
}

const EXAMPLE_QUESTIONS = [
  'How much did I spend on software this month?',
  'Show my five largest expenses.',
  'Which invoices are overdue?',
  'Summarize my spending.',
  'Find expenses related to travel.',
  'Which receipts still need review?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your SoloBooks AI Financial Assistant. Ask me anything about your recorded receipts, business deductions, pending reviews, or client invoices. I only answer using facts stored in your local database—never guessing or hallucinating.",
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedContext, setExpandedContext] = useState<Record<string, boolean>>({});

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error('Failed to query financial assistant.');
      }

      const data = await res.json();
      const botMsg: Message = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        groundedContext: data.groundedContext,
        supportingData: data.supportingData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an error retrieving data: ${msg}. Please ensure your local database is available.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleContext = (id: string) => {
    setExpandedContext((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BotMessageSquare className="w-6 h-6 text-emerald-600" />
            <span>AI Financial Assistant</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Natural-language financial Q&A grounded strictly in stored SQLite records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Grounded in Deterministic SQL Queries</span>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggestions:</span>
        {EXAMPLE_QUESTIONS.map((eq) => (
          <button
            key={eq}
            onClick={() => handleSend(eq)}
            className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            {eq}
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-end gap-2 max-w-2xl">
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`text-[10px] block mt-1.5 font-mono ${
                    m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>

            {/* Supporting Records Card (for assistant messages with facts) */}
            {m.supportingData &&
              (m.supportingData.expenses?.length ||
                m.supportingData.invoices?.length ||
                m.supportingData.documents?.length) && (
                <div className="mt-2 ml-10 max-w-xl w-full text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 shadow-xs space-y-2">
                    <div
                      onClick={() => toggleContext(m.id)}
                      className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supporting Verified Database Records</span>
                      </span>
                      {expandedContext[m.id] ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {/* Collapsible list */}
                    {expandedContext[m.id] && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {/* Expenses list */}
                        {m.supportingData.expenses?.map((e) => (
                          <div
                            key={e.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px]"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {e.merchant}
                              </span>{' '}
                              <span className="text-slate-500 font-mono">({e.date})</span>
                              <div className="text-[10px] text-slate-400">{e.categoryName}</div>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatCurrency(e.amountMinor, e.currency)}
                            </span>
                          </div>
                        ))}

                        {/* Invoices list */}
                        {m.supportingData.invoices?.map((i) => (
                          <div
                            key={i.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px]"
                          >
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                #{i.invoiceNumber} — {i.clientName}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                Due {i.dueDate} • Status: {i.status.toUpperCase()}
                              </div>
                            </div>
                            <span className="font-bold text-emerald-600">
                              {formatCurrency(i.amountMinor, i.currency)}
                            </span>
                          </div>
                        ))}

                        {/* Documents list */}
                        {m.supportingData.documents?.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900 text-[11px]"
                          >
                            <span className="truncate max-w-xs font-semibold">{d.fileName}</span>
                            <span className="text-amber-600 font-semibold">{d.reviewStatus}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse ml-10">
            <Cpu className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Querying local database & synthesizing grounded answer...</span>
          </div>
        )}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your expenses, overdue invoices, or pending reviews..."
          id="assistant-query-input"
          className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          id="assistant-send-btn"
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
