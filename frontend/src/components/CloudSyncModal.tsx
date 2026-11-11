import React, { useState, useEffect } from 'react';
import { X, Cloud, CloudCheck, Check, Copy, UploadCloud, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, isSupabaseConfigured } from '../supabase';
import { pushLocalDataToSupabase } from '../api';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: () => void;
}

const SQL_SCHEMA = `-- Affan Personal Accounting OS - Supabase Database Schema
CREATE TABLE IF NOT EXISTS public.accounts (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking',
  initial_balance NUMERIC DEFAULT 0.0,
  current_balance NUMERIC DEFAULT 0.0,
  currency TEXT DEFAULT 'BDT',
  icon TEXT DEFAULT 'wallet',
  color TEXT DEFAULT '#3b82f6',
  is_liability BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#10b981'
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGINT PRIMARY KEY,
  account_id BIGINT REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  to_account_id BIGINT REFERENCES public.accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  payee TEXT,
  notes TEXT,
  account_name TEXT,
  category_name TEXT,
  to_account_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id BIGINT PRIMARY KEY,
  category_id BIGINT UNIQUE REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  period TEXT DEFAULT 'monthly'
);

CREATE TABLE IF NOT EXISTS public.debt_goals (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  counterparty TEXT,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0.0,
  loan_date TEXT,
  due_date TEXT,
  interest_rate NUMERIC DEFAULT 0.0,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_goals DISABLE ROW LEVEL SECURITY;`;

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setKey(cfg.key);
      setConfigured(isSupabaseConfigured());
      setStatus('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !key.trim()) {
      setStatus('Please enter both Supabase Project URL and Anon Key.');
      return;
    }

    saveSupabaseConfig(url.trim(), key.trim());
    setConfigured(isSupabaseConfigured());
    setStatus('✓ Supabase credentials saved! Connecting...');
    setTimeout(() => {
      onSyncComplete?.();
      setStatus('✓ Connected! Your data will now sync across all devices.');
    }, 600);
  };

  const handleDisconnect = () => {
    if (confirm('Disconnect from Supabase and use local browser storage?')) {
      saveSupabaseConfig('', '');
      setUrl('');
      setKey('');
      setConfigured(false);
      setStatus('Switched back to local storage.');
      onSyncComplete?.();
    }
  };

  const handleUploadLocalData = async () => {
    setUploading(true);
    setStatus('Uploading current device data to Supabase...');
    try {
      const res = await pushLocalDataToSupabase();
      if (res.ok) {
        setStatus(`✓ Upload successful! ${res.message}`);
        onSyncComplete?.();
      } else {
        setStatus(`❌ Upload failed: ${res.message}`);
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message || 'Failed to upload'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Cloud Sync (Supabase)</h2>
              <p className="text-xs text-slate-500">Live multi-device sync between Phone & Windows PC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            configured 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-amber-50/80 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center space-x-2">
              {configured ? <CloudCheck className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>{configured ? 'Connected to Supabase Cloud' : 'Using Local Browser Storage (Not synced between devices)'}</span>
            </div>
            {configured && (
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider">
                Live Sync
              </span>
            )}
          </div>

          {/* Quick Setup Guide */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-900">How to connect in 2 minutes:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Log in to free <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Supabase.com</a> &amp; create a project.</li>
              <li>Go to <b>SQL Editor</b>, paste the schema script, and click <b>Run</b>.</li>
              <li>Go to <b>Project Settings → API</b> and paste your Project URL &amp; anon key below.</li>
            </ol>
            <button
              type="button"
              onClick={handleCopySQL}
              className="mt-2 flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'SQL Schema Copied to Clipboard!' : 'Copy SQL Schema Script'}</span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          {status && (
            <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              {status}
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Save &amp; Connect
              </button>
              {configured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>

            {configured && (
              <button
                type="button"
                disabled={uploading}
                onClick={handleUploadLocalData}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Syncing data...' : 'Upload PC / Local Data to Supabase (Sync Now)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

