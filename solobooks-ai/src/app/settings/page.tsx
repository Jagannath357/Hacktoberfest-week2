'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Cpu,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Lock,
  Terminal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Settings } from '@/lib/types';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

interface HealthData {
  status: string;
  ai?: {
    online: boolean;
    endpoint: string;
    availableModels: string[];
    selectedModel: string;
    recommendedModel: string | null;
    error?: string | null;
  };
  settings?: {
    defaultCurrency: string;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    defaultCurrency: 'INR',
    ollamaEndpoint: 'http://127.0.0.1:11434',
    selectedModel: 'llama3:latest',
    theme: 'system',
  });
  const [health, setHealth] = useState<HealthData | null>(null);
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Workspace actions
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkHealth = async () => {
    try {
      setChecking(true);
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    checkHealth();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        checkHealth();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/sample-data', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setNotice(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        'WARNING: This will permanently delete ALL expenses, invoices, and uploaded documents in your local database. Proceed?'
      )
    ) {
      return;
    }
    try {
      setResetting(true);
      const res = await fetch('/api/sample-data', { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setNotice(data.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Privacy Audit
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure local open-weight inference, default business currency, and verify local filesystem storage.
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="font-semibold text-xs cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 font-medium">
          Settings saved successfully!
        </div>
      )}

      {/* 1. Local AI & Ollama Configuration */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-600" />
              <span>Local AI Engine (Ollama)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect to your local Ollama daemon for private document interpretation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                health?.ai?.online
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  health?.ai?.online ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {health?.ai?.online ? 'Ollama Online' : 'Ollama Offline'}
            </span>

            <button
              onClick={checkHealth}
              disabled={checking}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Test Connection"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Form settings */}
        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ollama Endpoint
              </label>
              <input
                type="text"
                value={settings.ollamaEndpoint}
                onChange={(e) => setSettings({ ...settings, ollamaEndpoint: e.target.value })}
                placeholder="http://127.0.0.1:11434"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Local loopback only. Never exposed to public internet.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selected Model
              </label>
              <select
                value={settings.selectedModel}
                onChange={(e) => setSettings({ ...settings, selectedModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
              >
                {health?.ai?.availableModels && health.ai.availableModels.length > 0 ? (
                  health.ai.availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="llama3:latest">llama3:latest (8B)</option>
                    <option value="qwen2.5:3b">qwen2.5:3b (Recommended 3B)</option>
                    <option value="llama3.2:3b">llama3.2:3b (3B)</option>
                  </>
                )}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Auto-discovered from Ollama installed tags.
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save AI Configuration'}
            </button>
          </div>
        </form>

        {/* Ollama Terminal Setup Instructions */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>Ollama Setup & Model Commands</span>
          </p>
          <div className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto space-y-1">
            <p># 1. Start Ollama service:</p>
            <p className="text-white">ollama serve</p>
            <p className="pt-1"># 2. Pull lightweight model (Apache 2.0 license, ~1.9 GB):</p>
            <p className="text-white">ollama pull qwen2.5:3b</p>
            <p className="pt-1"># Or pull Llama 3 (Meta Open Weight, ~4.7 GB):</p>
            <p className="text-white">ollama pull llama3:latest</p>
          </div>
        </div>
      </div>

      {/* 2. Business Preferences */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-600" />
          <span>Business & Ledger Preferences</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Currency
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => {
                const newCurr = e.target.value;
                setSettings({ ...settings, defaultCurrency: newCurr });
                fetch('/api/settings', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ defaultCurrency: newCurr }),
                });
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) — {c.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default currency for all newly created expenses and invoices.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Privacy & Local Storage Audit */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Privacy & Filesystem Audit</span>
        </h2>
        <p className="text-xs text-slate-500">
          SoloBooks AI operates with absolute offline persistence. Below is the active storage ledger.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Database</span>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              ./data/solobooks.db
            </p>
            <span className="text-[10px] text-slate-400">Embedded SQLite database</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Document Binaries</span>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              ./data/documents/
            </p>
            <span className="text-[10px] text-slate-400">Quarantined receipt & invoice storage</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Network Isolation</span>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              0 Outbound Cloud APIs
            </p>
            <span className="text-[10px] text-slate-400">No trackers or commercial AI keys</span>
          </div>
        </div>
      </div>

      {/* 4. Workspace Management (Seed & Reset) */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>Workspace Data Management</span>
        </h2>
        <p className="text-xs text-slate-500">
          Manage sample freelance data for demonstration or start fresh with a clean slate.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            id="settings-seed-sample-btn"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {seeding ? 'Seeding...' : 'Load Sample Freelance Records'}
          </button>

          <button
            onClick={handleReset}
            disabled={resetting}
            id="settings-reset-workspace-btn"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
          >
            {resetting ? 'Resetting...' : 'Reset Entire Workspace (Clear Data)'}
          </button>
        </div>
      </div>
    </div>
  );
}
