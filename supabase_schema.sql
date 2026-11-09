-- =========================================================================
-- Affan Personal Accounting OS - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (SQL Editor -> New Query -> Run)
-- =========================================================================

-- 1. Accounts Table
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

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#10b981'
);

-- 3. Transactions Table
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

-- 4. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id BIGINT PRIMARY KEY,
  category_id BIGINT UNIQUE REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  period TEXT DEFAULT 'monthly'
);

-- 5. Debt Goals / Receivables & Payables Table
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

-- 6. Disable Row Level Security (RLS) or grant open access for Personal OS
ALTER TABLE public.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_goals DISABLE ROW LEVEL SECURITY;

-- Done! Your Supabase database is ready to sync live with Phone & Windows.
