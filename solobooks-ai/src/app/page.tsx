'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Lock,
  Sparkles,
  Receipt,
  FileCheck,
  BarChart3,
  Database,
  Terminal,
  HelpCircle,
  Laptop,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 bg-radial-[at_top] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-6 shadow-xs animate-fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Local Inference & Offline Document Persistence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Your business finances.{' '}
            <span className="text-emerald-600 dark:text-emerald-400 bg-clip-text">
              Organized privately.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Turn receipts and invoices into organized financial records with local AI.
            Keep your documents on your computer and stay in control of your data.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              id="hero-open-workspace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Open My Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              id="hero-see-how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Guarantee banner */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No Cloud API Key Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Bank Document Uploads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Embedded SQLite Storage</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
            {/* Window chrome header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">solobooks.local/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                <span>Ollama Inference Active</span>
              </div>
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Income</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹45,000.00</p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Realized from paid invoices
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recorded Expenses</span>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹33,040.00</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">7 receipts processed & confirmed</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net Balance</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹11,960.00</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Deterministic arithmetic</span>
              </div>
            </div>

            {/* Mini Activity Bar */}
            <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Latest AI Document Extraction: AWS_Cloud_Invoice_Oct.pdf
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Extracted ₹3,450.00 total • Categorized as Software & Subscriptions • Reviewed by user
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                Explore Live App
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              From loose documents to verified financial books
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
              SoloBooks AI replaces manual spreadsheet entry with local open-weight intelligence while keeping you in total control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-5">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Import Documents</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Drop your PDF invoices, JPEG coffee receipts, or PNG subscription slips. Local Tesseract OCR and PDF parsers extract raw text on your device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-5">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Review & Edit Extraction</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Your local Ollama model extracts candidate fields (merchant, date, subtotal, tax, category). You review, correct, and confirm before saving.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg mb-5">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Organize & Export</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track overdue invoices, review category spending charts, and ask questions to the grounded AI assistant. Export clean RFC 4180 CSVs anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Architecture Comparison */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Privacy Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                Why SoloBooks AI keeps everything on your computer
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Most cloud accounting tools and AI wrappers transmit your sensitive financial documents—vendor names, bank invoices, client fees, and tax receipts—to third-party remote servers and API providers.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Local Ollama Inference</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Model inference executes via http://127.0.0.1:11434. No tokens leave your machine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Local SQLite Persistence</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Structured tables and minor-unit amounts stored in ./data/solobooks.db.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Zero Third-Party Trackers</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No telemetry, advertising pixels, or analytics trackers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Box */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">Architecture Comparison</h3>
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <p className="font-semibold text-rose-800 dark:text-rose-300">Traditional Cloud Accounting & AI Wrappers</p>
                  <ul className="mt-2 space-y-1 text-rose-700 dark:text-rose-400 list-disc list-inside">
                    <li>Requires creating remote user accounts and cloud storage</li>
                    <li>Transmits private tax receipts to commercial AI APIs</li>
                    <li>Recurring monthly bills ($20-$60/mo) for solo creators</li>
                    <li>Vendor lock-in: difficult to extract unformatted data</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">SoloBooks AI Local Architecture</p>
                  <ul className="mt-2 space-y-1 text-emerald-700 dark:text-emerald-400 list-disc list-inside">
                    <li>100% open-source local application & SQLite engine</li>
                    <li>Private inference with verified open weights (Qwen 2.5, Llama 3)</li>
                    <li>Zero API cost: process thousands of receipts for free</li>
                    <li>One-click RFC 4180 CSV & JSON export anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience: Who It Helps */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Tailored For Solopreneurs
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Who SoloBooks AI is designed for
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
              Engineered specifically for solo operators who need fast, organized financial records without the overhead of enterprise ERPs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Freelancers & Contractors</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep client invoices, track overdue receivables, and categorize deductible software and travel expenses without cloud subscription fees.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Independent Developers</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tame cloud bills (AWS, Vercel, Supabase, domain renewals) with automated receipt parsing and category attribution.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Designers & Creative Studios</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Organize client deliverables, invoice payment milestones, and track equipment and asset purchases cleanly.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Tutors & Online Educators</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Issue simple payment requests, monitor student tuition receipts, and keep income records neatly organized for tax preparation.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Consultants & Strategists</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Log advisory retainers, track client dining and travel outlays, and export organized summaries for accounting audits.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-2">Microbusiness Owners</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get clarity on monthly cash flow and net margins without giving away commercial privacy to ad-supported platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware & Setup Transparency */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                  Transparent Hardware & Local AI Prerequisites
                </h3>
                <p className="leading-relaxed">
                  SoloBooks AI is designed for ordinary laptops. For fast extraction, we recommend running{' '}
                  <strong className="text-slate-900 dark:text-white">Qwen 2.5 3B Instruct</strong> or{' '}
                  <strong className="text-slate-900 dark:text-white">Llama 3 8B</strong> via Ollama on a machine with at least 8 GB of RAM.
                  If Ollama is not running, the application gracefully provides non-AI deterministic organization and heuristic parsing without blocking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Side Hustle Business Model & Pricing Concept */}
      <section className="py-20 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Side Hustle Commercialization
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Sustainable Business Model Proposal
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
              SoloBooks AI starts with an open-source, fully functional local foundation. Here is our proposed product roadmap for sustainable indie monetization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Community Open-Source</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Free Forever</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Complete local autonomy on your personal computer.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Unlimited receipt OCR & PDF text extraction</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Local Ollama AI model integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Full Expense & Invoice management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>RFC 4180 CSV & JSON data export</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                >
                  Use Free Version
                </Link>
              </div>
            </div>

            {/* Planned Pro Tier */}
            <div className="p-8 rounded-2xl border-2 border-emerald-600 dark:border-emerald-500 bg-white dark:bg-slate-900 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                Planned Future Tier
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pro Side Hustle</span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹499 / mo (Target Concept)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Advanced workflow automation for growing solo businesses.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>All Free Tier features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automated bank statement CSV mapping</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Batch 50-document queue processing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Encrypted local backup snapshots</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-not-allowed opacity-80"
                >
                  Roadmap Proposal (Billing Not Implemented)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800 bg-gradient-to-b from-transparent to-emerald-500/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Ready to organize your business finances privately?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
            Open your local workspace right now. Try the sample dataset or drag in your first receipt.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
