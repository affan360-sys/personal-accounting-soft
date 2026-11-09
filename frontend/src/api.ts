import { Account, Category, Transaction, Budget, DebtGoal, FinancialSummary, MonthlyTrend, CategoryBreakdown } from './types';
import { getSupabase } from './supabase';

const BASE_URL = '/api';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 1,
    name: 'Cash Wallet',
    type: 'cash',
    initial_balance: 0,
    current_balance: -12840,
    currency: 'BDT',
    icon: 'banknote',
    color: '#f59e0b',
    is_liability: false,
    notes: 'Primary cash account',
    created_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Main Bank Account',
    type: 'checking',
    initial_balance: 0,
    current_balance: 0,
    currency: 'BDT',
    icon: 'landmark',
    color: '#2563eb',
    is_liability: false,
    notes: 'Bank account for online & card transactions',
    created_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: 'bKash',
    type: 'cash',
    initial_balance: 0,
    current_balance: 0,
    currency: 'BDT',
    icon: 'wallet',
    color: '#ec4899',
    is_liability: false,
    notes: 'bKash mobile financial service account',
    created_at: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 4,
    name: 'Nagad',
    type: 'cash',
    initial_balance: 0,
    current_balance: 0,
    currency: 'BDT',
    icon: 'wallet',
    color: '#ea580c',
    is_liability: false,
    notes: 'Nagad mobile financial service account',
    created_at: '2026-09-01T00:00:00.000Z',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Transportation & Bike Oil', type: 'expense', icon: 'car', color: '#6366f1' },
  { id: 2, name: 'Company Registration', type: 'expense', icon: 'briefcase', color: '#06b6d4' },
  { id: 3, name: 'Seal & Brochure (Marketing)', type: 'expense', icon: 'file-text', color: '#8b5cf6' },
  { id: 4, name: 'Food & Lunch', type: 'expense', icon: 'coffee', color: '#f59e0b' },
  { id: 5, name: 'Course & Education', type: 'expense', icon: 'book-open', color: '#10b981' },
  { id: 6, name: 'Loan Given (Receivable)', type: 'expense', icon: 'scale', color: '#ec4899' },
  { id: 7, name: 'Investments & Capital', type: 'expense', icon: 'trending-up', color: '#9333ea' },
  { id: 8, name: 'General Expenses', type: 'expense', icon: 'tag', color: '#64748b' },
  { id: 9, name: 'Salary & Client Revenue', type: 'income', icon: 'dollar-sign', color: '#10b981' },
  { id: 10, name: 'Loan Repayment (Taka In)', type: 'income', icon: 'arrow-down-left', color: '#3b82f6' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, account_id: 1, category_id: 6, to_account_id: null, type: 'expense', amount: 1500, date: '2026-09-15', payee: '[Pulsecode] Give loan', notes: 'Loan given to Pulsecode', account_name: 'Cash Wallet', category_name: 'Loan Given (Receivable)', created_at: '2026-09-15T00:00:00.000Z' },
  { id: 2, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 150, date: '2026-09-17', payee: '[Pulsecode] Bike oil', notes: 'SHQ', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-09-17T00:00:00.000Z' },
  { id: 3, account_id: 1, category_id: 4, to_account_id: null, type: 'expense', amount: 380, date: '2026-09-18', payee: '[Pulsecode] Lunch', notes: 'Total bill 480 / Taka out 380', account_name: 'Cash Wallet', category_name: 'Food & Lunch', created_at: '2026-09-18T00:00:00.000Z' },
  { id: 4, account_id: 1, category_id: 3, to_account_id: null, type: 'expense', amount: 1500, date: '2026-09-20', payee: '[Pulsecode] Sil + brocheare', notes: 'Seal and brochure printing', account_name: 'Cash Wallet', category_name: 'Seal & Brochure (Marketing)', created_at: '2026-09-20T00:00:00.000Z' },
  { id: 5, account_id: 1, category_id: 2, to_account_id: null, type: 'expense', amount: 5000, date: '2026-09-22', payee: '[Pulsecode] Company reg', notes: 'sole proprietorship', account_name: 'Cash Wallet', category_name: 'Company Registration', created_at: '2026-09-22T00:00:00.000Z' },
  { id: 6, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 150, date: '2026-09-25', payee: '[Pulsecode] sil', notes: 'bike oil', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-09-25T00:00:00.000Z' },
  { id: 7, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 150, date: '2026-09-30', payee: '[Pulsecode] bike oil', notes: '29-30 trik', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-09-30T00:00:00.000Z' },
  { id: 8, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 170, date: '2026-10-05', payee: '[Pulsecode] bike oil', notes: 'SHQ', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-10-05T00:00:00.000Z' },
  { id: 9, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 170, date: '2026-10-12', payee: '[Pulsecode] bike oil', notes: 'SHQ', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-10-12T00:00:00.000Z' },
  { id: 10, account_id: 1, category_id: 1, to_account_id: null, type: 'expense', amount: 170, date: '2026-10-19', payee: '[Pulsecode] bike oil', notes: 'SHQ', account_name: 'Cash Wallet', category_name: 'Transportation & Bike Oil', created_at: '2026-10-19T00:00:00.000Z' },
  { id: 11, account_id: 1, category_id: 5, to_account_id: null, type: 'expense', amount: 1000, date: '2026-11-05', payee: '[Pulsecode] for Course', notes: '2000 TK course payment', account_name: 'Cash Wallet', category_name: 'Course & Education', created_at: '2026-11-05T00:00:00.000Z' },
  { id: 12, account_id: 1, category_id: 6, to_account_id: null, type: 'expense', amount: 2000, date: '2026-10-20', payee: '[Rifat] Taka out (Loan)', notes: 'Loan to Rifat', account_name: 'Cash Wallet', category_name: 'Loan Given (Receivable)', created_at: '2026-10-20T00:00:00.000Z' },
  { id: 13, account_id: 1, category_id: 6, to_account_id: null, type: 'expense', amount: 500, date: '2026-10-26', payee: '[Rifat] Taka out (Loan)', notes: 'Additional payment to Rifat', account_name: 'Cash Wallet', category_name: 'Loan Given (Receivable)', created_at: '2026-10-26T00:00:00.000Z' },
];

export const INITIAL_DEBTS: DebtGoal[] = [
  { id: 1, title: 'Loan to Pulsecode', type: 'they_owe_me', counterparty: 'Pulsecode', total_amount: 1500, paid_amount: 0, loan_date: '2026-09-15', due_date: '2026-12-31', interest_rate: 0, notes: 'Give loan (Initial 1500 TK)', status: 'active', created_at: '2026-09-15T00:00:00.000Z' },
  { id: 2, title: 'Loan to Rifat', type: 'they_owe_me', counterparty: 'Rifat', total_amount: 2500, paid_amount: 0, loan_date: '2026-10-20', due_date: '2026-12-31', interest_rate: 0, notes: 'Taka out (2000 + 500 TK on 26/10/26)', status: 'active', created_at: '2026-10-20T00:00:00.000Z' },
];

// --- Local Storage Helpers ---
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

function recalculateLocalAccountBalances() {
  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);

  for (const acc of accounts) {
    const inc = txs.filter((t) => t.account_id === acc.id && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const transIn = txs.filter((t) => t.to_account_id === acc.id && t.type === 'transfer').reduce((s, t) => s + t.amount, 0);
    const exp = txs.filter((t) => t.account_id === acc.id && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const transOut = txs.filter((t) => t.account_id === acc.id && t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

    if (acc.is_liability) {
      acc.current_balance = (acc.initial_balance || 0) + exp + transOut - inc - transIn;
    } else {
      acc.current_balance = (acc.initial_balance || 0) + inc + transIn - exp - transOut;
    }
  }

  setLocal('affan_accounts', accounts);
}

async function syncSupabaseBalances() {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
    for (const a of accounts) {
      await sb.from('accounts').update({ current_balance: a.current_balance }).eq('id', a.id);
    }
  } catch {}
}

function computeLocalSummary(): FinancialSummary {
  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);

  const total_assets = accounts.filter((a) => !a.is_liability).reduce((sum, a) => sum + a.current_balance, 0);
  const total_liabilities = accounts.filter((a) => a.is_liability).reduce((sum, a) => sum + a.current_balance, 0);
  const net_worth = total_assets - total_liabilities;

  const total_receivable = debts
    .filter((d) => d.type === 'they_owe_me' && d.status === 'active')
    .reduce((sum, d) => sum + Math.max(0, d.total_amount - (d.paid_amount || 0)), 0);

  const total_payable = debts
    .filter((d) => d.type === 'i_owe' && d.status === 'active')
    .reduce((sum, d) => sum + Math.max(0, d.total_amount - (d.paid_amount || 0)), 0);

  const now = new Date();
  const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthTxs = txs.filter((t) => t.date && t.date.startsWith(curMonth));

  const total_income = thisMonthTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const total_expense = thisMonthTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const net_savings = total_income - total_expense;
  const savings_rate_pct = total_income > 0 ? (net_savings / total_income) * 100 : 0;

  return {
    net_worth: Number(net_worth.toFixed(2)),
    total_assets: Number(total_assets.toFixed(2)),
    total_liabilities: Number(total_liabilities.toFixed(2)),
    total_receivable: Number(total_receivable.toFixed(2)),
    total_payable: Number(total_payable.toFixed(2)),
    total_income_this_month: Number(total_income.toFixed(2)),
    total_expense_this_month: Number(total_expense.toFixed(2)),
    net_savings_this_month: Number(net_savings.toFixed(2)),
    savings_rate_pct: Number(savings_rate_pct.toFixed(1)),
  };
}

// --- Summary & Analytics ---
export async function fetchSummary(): Promise<FinancialSummary> {
  try {
    const res = await fetch(`${BASE_URL}/summary`);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.net_worth === 'number') return data;
    }
  } catch {}
  return computeLocalSummary();
}

export async function fetchMonthlyTrends(months = 6): Promise<MonthlyTrend[]> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/monthly?months=${months}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  const today = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData: MonthlyTrend[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const inc = txs.filter((t) => t.date && t.date.startsWith(m) && t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = txs.filter((t) => t.date && t.date.startsWith(m) && t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const prettyMonth = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;

    trendData.push({
      month: prettyMonth,
      raw_month: m,
      income: Number(inc.toFixed(2)),
      expense: Number(exp.toFixed(2)),
      net: Number((inc - exp).toFixed(2)),
    });
  }

  return trendData;
}

export async function fetchCategoryBreakdown(month?: string): Promise<CategoryBreakdown[]> {
  try {
    const url = month ? `${BASE_URL}/analytics/category-breakdown?month=${month}` : `${BASE_URL}/analytics/category-breakdown`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
  const now = new Date();
  const curMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthTxs = txs.filter((t) => t.type === 'expense' && t.date && t.date.startsWith(curMonth));
  const catSums: Record<number, number> = {};
  for (const t of monthTxs) {
    if (t.category_id) {
      catSums[t.category_id] = (catSums[t.category_id] || 0) + t.amount;
    }
  }

  const totalSpent = Object.values(catSums).reduce((s, v) => s + v, 0) || 1.0;
  return Object.entries(catSums).map(([catId, amount]) => {
    const cat = categories.find((c) => c.id === parseInt(catId, 10));
    return {
      category_name: cat ? cat.name : 'Other',
      category_color: cat?.color || '#3b82f6',
      amount: Number(amount.toFixed(2)),
      percentage: Number(((amount / totalSpent) * 100).toFixed(1)),
    };
  });
}

export async function fetchCashflow(days = 30): Promise<{ date: string; income: number; expense: number }[]> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/cashflow?days=${days}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const map: Record<string, { date: string; income: number; expense: number }> = {};
  for (const t of txs) {
    if (t.date >= startDate && (t.type === 'income' || t.type === 'expense')) {
      if (!map[t.date]) map[t.date] = { date: t.date, income: 0, expense: 0 };
      if (t.type === 'income') map[t.date].income += t.amount;
      else map[t.date].expense += t.amount;
    }
  }

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

// --- Accounts ---
export async function fetchAccounts(): Promise<Account[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('accounts').select('*').order('id');
      if (!error && Array.isArray(data) && data.length > 0) {
        setLocal('affan_accounts', data);
        return data as Account[];
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/accounts`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocal('affan_accounts', data);
        return data;
      }
    }
  } catch {}
  return getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const newAccount: Account = {
    id: Date.now(),
    name: data.name || 'New Account',
    type: (data.type as any) || 'cash',
    initial_balance: Number(data.initial_balance) || 0,
    current_balance: Number(data.initial_balance) || 0,
    currency: data.currency || 'BDT',
    icon: data.icon || 'wallet',
    color: data.color || '#3b82f6',
    is_liability: Boolean(data.is_liability),
    notes: data.notes || '',
    created_at: new Date().toISOString(),
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: created, error } = await sb.from('accounts').insert(newAccount).select().single();
      if (!error && created) {
        const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
        accounts.push(created as Account);
        setLocal('affan_accounts', accounts);
        return created as Account;
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
  accounts.push(newAccount);
  setLocal('affan_accounts', accounts);
  return newAccount;
}

export async function updateAccount(id: number, data: Partial<Account>): Promise<Account> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('accounts').update(data).eq('id', id);
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...data };
    setLocal('affan_accounts', accounts);
    recalculateLocalAccountBalances();
    return accounts[idx];
  }
  return data as Account;
}

export async function deleteAccount(id: number): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('accounts').delete().eq('id', id);
    } catch {}
  }

  try {
    await fetch(`${BASE_URL}/accounts/${id}`, { method: 'DELETE' });
  } catch {}

  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS).filter((a) => a.id !== id);
  setLocal('affan_accounts', accounts);
}

// --- Categories ---
export async function fetchCategories(type?: string): Promise<Category[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from('categories').select('*').order('id');
      if (type) q = q.eq('type', type);
      const { data, error } = await q;
      if (!error && Array.isArray(data) && data.length > 0) {
        setLocal('affan_categories', data);
        return data as Category[];
      }
    } catch {}
  }

  try {
    const url = type ? `${BASE_URL}/categories?type=${type}` : `${BASE_URL}/categories`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocal('affan_categories', data);
        return data;
      }
    }
  } catch {}

  const all = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
  return type ? all.filter((c) => c.type === type) : all;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: Date.now(),
    name: data.name || 'New Category',
    type: (data.type as any) || 'expense',
    icon: data.icon || 'tag',
    color: data.color || '#10b981',
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: created, error } = await sb.from('categories').insert(newCat).select().single();
      if (!error && created) {
        const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
        categories.push(created as Category);
        setLocal('affan_categories', categories);
        return created as Category;
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
  categories.push(newCat);
  setLocal('affan_categories', categories);
  return newCat;
}

export async function deleteCategory(id: number): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('categories').delete().eq('id', id);
    } catch {}
  }

  try {
    await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
  } catch {}

  const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES).filter((c) => c.id !== id);
  setLocal('affan_categories', categories);
}

// --- Transactions ---
export async function fetchTransactions(params: {
  account_id?: number;
  category_id?: number;
  type?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ items: Transaction[]; total: number }> {
  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from('transactions').select('*', { count: 'exact' });
      if (params.account_id) q = q.or(`account_id.eq.${params.account_id},to_account_id.eq.${params.account_id}`);
      if (params.category_id) q = q.eq('category_id', params.category_id);
      if (params.type) q = q.eq('type', params.type);
      if (params.start_date) q = q.gte('date', params.start_date);
      if (params.end_date) q = q.lte('date', params.end_date);
      if (params.search) q = q.or(`payee.ilike.%${params.search}%,notes.ilike.%${params.search}%`);

      const offset = params.offset || 0;
      const limit = params.limit || 100;
      q = q.order('date', { ascending: false }).order('id', { ascending: false }).range(offset, offset + limit - 1);

      const { data, count, error } = await q;
      if (!error && Array.isArray(data)) {
        if (offset === 0 && !params.search && !params.account_id && !params.category_id && !params.type) {
          setLocal('affan_transactions', data);
        }
        return { items: data as Transaction[], total: count ?? data.length };
      }
    } catch {}
  }

  try {
    const query = new URLSearchParams();
    if (params.account_id) query.append('account_id', params.account_id.toString());
    if (params.category_id) query.append('category_id', params.category_id.toString());
    if (params.type) query.append('type', params.type);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());

    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        return data;
      }
    }
  } catch {}

  let txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  if (params.account_id) txs = txs.filter((t) => t.account_id === params.account_id || t.to_account_id === params.account_id);
  if (params.category_id) txs = txs.filter((t) => t.category_id === params.category_id);
  if (params.type) txs = txs.filter((t) => t.type === params.type);
  if (params.start_date) txs = txs.filter((t) => t.date >= params.start_date!);
  if (params.end_date) txs = txs.filter((t) => t.date <= params.end_date!);
  if (params.search) {
    const s = params.search.toLowerCase();
    txs = txs.filter((t) => (t.payee && t.payee.toLowerCase().includes(s)) || (t.notes && t.notes.toLowerCase().includes(s)));
  }

  const sorted = [...txs].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const offset = params.offset || 0;
  const limit = params.limit || 100;
  return { items: sorted.slice(offset, offset + limit), total: sorted.length };
}

export async function createTransaction(data: Partial<Transaction>): Promise<Transaction> {
  const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
  const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);

  const acc = accounts.find((a) => a.id === data.account_id);
  const toAcc = accounts.find((a) => a.id === data.to_account_id);
  const cat = categories.find((c) => c.id === data.category_id);

  const newTx: Transaction = {
    id: Date.now(),
    account_id: data.account_id || 1,
    category_id: data.category_id || null,
    to_account_id: data.to_account_id || null,
    type: data.type || 'expense',
    amount: Number(data.amount) || 0,
    date: data.date || new Date().toISOString().split('T')[0],
    payee: data.payee || '',
    notes: data.notes || '',
    created_at: new Date().toISOString(),
    account_name: acc?.name,
    category_name: cat?.name || (data.type === 'transfer' ? 'Transfer' : undefined),
    to_account_name: toAcc?.name,
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: created, error } = await sb.from('transactions').insert(newTx).select().single();
      if (!error && created) {
        const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
        txs.unshift(created as Transaction);
        setLocal('affan_transactions', txs);
        recalculateLocalAccountBalances();
        syncSupabaseBalances();
        return created as Transaction;
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const tx = await res.json();
      if (tx && tx.id) return tx;
    }
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  txs.unshift(newTx);
  setLocal('affan_transactions', txs);
  recalculateLocalAccountBalances();

  return newTx;
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('transactions').update(data).eq('id', id);
      syncSupabaseBalances();
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
  const idx = txs.findIndex((t) => t.id === id);
  if (idx !== -1) {
    txs[idx] = { ...txs[idx], ...data };
    setLocal('affan_transactions', txs);
    recalculateLocalAccountBalances();
    return txs[idx];
  }
  return data as Transaction;
}

export async function deleteTransaction(id: number): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('transactions').delete().eq('id', id);
      syncSupabaseBalances();
    } catch {}
  }

  try {
    await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
  } catch {}

  const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS).filter((t) => t.id !== id);
  setLocal('affan_transactions', txs);
  recalculateLocalAccountBalances();
}

// --- Budgets ---
export async function fetchBudgets(month?: string): Promise<Budget[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('budgets').select('*');
      if (!error && Array.isArray(data)) {
        const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
        const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
        const now = new Date();
        const curMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const enriched: Budget[] = data.map((b) => {
          const spent = txs
            .filter((t) => t.category_id === b.category_id && t.type === 'expense' && t.date && t.date.startsWith(curMonth))
            .reduce((s, t) => s + t.amount, 0);
          return {
            id: b.id,
            category_id: b.category_id,
            amount: Number(b.amount),
            period: b.period || 'monthly',
            spent,
            remaining: Math.max(0, Number(b.amount) - spent),
            percentage: Number(b.amount) > 0 ? (spent / Number(b.amount)) * 100 : 0,
            category: categories.find((c) => c.id === b.category_id),
          };
        });
        setLocal('affan_budgets', enriched);
        return enriched;
      }
    } catch {}
  }

  try {
    const url = month ? `${BASE_URL}/budgets?month=${month}` : `${BASE_URL}/budgets`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return getLocal<Budget[]>('affan_budgets', []);
}

export async function saveBudget(data: { category_id: number; amount: number; period?: string }): Promise<Budget> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('budgets').upsert({
        id: Date.now(),
        category_id: data.category_id,
        amount: Number(data.amount),
        period: data.period || 'monthly',
      }, { onConflict: 'category_id' });
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const budgets = getLocal<Budget[]>('affan_budgets', []);
  const idx = budgets.findIndex((b) => b.category_id === data.category_id);
  const newBudget: Budget = {
    id: idx !== -1 ? budgets[idx].id : Date.now(),
    category_id: data.category_id,
    amount: Number(data.amount),
    period: data.period || 'monthly',
    spent: 0,
    remaining: Number(data.amount),
    percentage: 0,
  };

  if (idx !== -1) budgets[idx] = newBudget;
  else budgets.push(newBudget);
  setLocal('affan_budgets', budgets);
  return newBudget;
}

export async function deleteBudget(id: number): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('budgets').delete().eq('id', id);
    } catch {}
  }

  try {
    await fetch(`${BASE_URL}/budgets/${id}`, { method: 'DELETE' });
  } catch {}

  const budgets = getLocal<Budget[]>('affan_budgets', []).filter((b) => b.id !== id);
  setLocal('affan_budgets', budgets);
}

// --- Debts / Loans ---
export async function fetchDebts(): Promise<DebtGoal[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('debt_goals').select('*').order('id');
      if (!error && Array.isArray(data)) {
        setLocal('affan_debts', data);
        return data as DebtGoal[];
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/debts`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setLocal('affan_debts', data);
        return data;
      }
    }
  } catch {}
  return getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);
}

export async function createDebt(data: Partial<DebtGoal>): Promise<DebtGoal> {
  const newDebt: DebtGoal = {
    id: Date.now(),
    title: data.title || 'Loan / Debt',
    type: data.type || 'they_owe_me',
    counterparty: data.counterparty || '',
    total_amount: Number(data.total_amount) || 0,
    paid_amount: Number(data.paid_amount) || 0,
    loan_date: data.loan_date || new Date().toISOString().split('T')[0],
    due_date: data.due_date,
    interest_rate: Number(data.interest_rate) || 0,
    notes: data.notes || '',
    status: (data.status as any) || 'active',
    created_at: new Date().toISOString(),
  };

  const sb = getSupabase();
  if (sb) {
    try {
      const { data: created, error } = await sb.from('debt_goals').insert(newDebt).select().single();
      if (!error && created) {
        const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);
        debts.push(created as DebtGoal);
        setLocal('affan_debts', debts);
        return created as DebtGoal;
      }
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const debt = await res.json();
      if (debt && debt.id) return debt;
    }
  } catch {}

  const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);
  debts.push(newDebt);
  setLocal('affan_debts', debts);
  return newDebt;
}

export async function updateDebt(id: number, data: Partial<DebtGoal>): Promise<DebtGoal> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('debt_goals').update(data).eq('id', id);
    } catch {}
  }

  try {
    const res = await fetch(`${BASE_URL}/debts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {}

  const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);
  const idx = debts.findIndex((d) => d.id === id);
  if (idx !== -1) {
    debts[idx] = { ...debts[idx], ...data };
    if (debts[idx].paid_amount >= debts[idx].total_amount) {
      debts[idx].status = 'completed';
    }
    setLocal('affan_debts', debts);
    return debts[idx];
  }
  return data as DebtGoal;
}

export async function deleteDebt(id: number): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('debt_goals').delete().eq('id', id);
    } catch {}
  }

  try {
    await fetch(`${BASE_URL}/debts/${id}`, { method: 'DELETE' });
  } catch {}

  const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS).filter((d) => d.id !== id);
  setLocal('affan_debts', debts);
}

// Push current local device storage to Supabase
export async function pushLocalDataToSupabase(): Promise<{ ok: boolean; message: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, message: 'Supabase is not connected. Enter your URL and Key.' };
  }

  try {
    const accounts = getLocal<Account[]>('affan_accounts', INITIAL_ACCOUNTS);
    const categories = getLocal<Category[]>('affan_categories', INITIAL_CATEGORIES);
    const txs = getLocal<Transaction[]>('affan_transactions', INITIAL_TRANSACTIONS);
    const budgets = getLocal<Budget[]>('affan_budgets', []);
    const debts = getLocal<DebtGoal[]>('affan_debts', INITIAL_DEBTS);

    if (categories.length > 0) {
      const { error } = await sb.from('categories').upsert(
        categories.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon,
          color: c.color,
        })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    if (accounts.length > 0) {
      const { error } = await sb.from('accounts').upsert(
        accounts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          initial_balance: a.initial_balance,
          current_balance: a.current_balance,
          currency: a.currency,
          icon: a.icon,
          color: a.color,
          is_liability: a.is_liability,
          notes: a.notes,
          created_at: a.created_at,
        })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    if (txs.length > 0) {
      const { error } = await sb.from('transactions').upsert(
        txs.map((t) => ({
          id: t.id,
          account_id: t.account_id,
          category_id: t.category_id || null,
          to_account_id: t.to_account_id || null,
          type: t.type,
          amount: t.amount,
          date: t.date,
          payee: t.payee,
          notes: t.notes,
          account_name: t.account_name,
          category_name: t.category_name,
          to_account_name: t.to_account_name,
          created_at: t.created_at,
        })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    if (budgets.length > 0) {
      const { error } = await sb.from('budgets').upsert(
        budgets.map((b) => ({
          id: b.id,
          category_id: b.category_id,
          amount: b.amount,
          period: b.period || 'monthly',
        })),
        { onConflict: 'category_id' }
      );
      if (error) throw error;
    }

    if (debts.length > 0) {
      const { error } = await sb.from('debt_goals').upsert(
        debts.map((d) => ({
          id: d.id,
          title: d.title,
          type: d.type,
          counterparty: d.counterparty,
          total_amount: d.total_amount,
          paid_amount: d.paid_amount,
          loan_date: d.loan_date,
          due_date: d.due_date,
          interest_rate: d.interest_rate,
          notes: d.notes,
          status: d.status,
          created_at: d.created_at,
        })),
        { onConflict: 'id' }
      );
      if (error) throw error;
    }

    return {
      ok: true,
      message: `Synced ${accounts.length} accounts, ${txs.length} transactions, ${budgets.length} budgets, and ${debts.length} debt goals!`,
    };
  } catch (err: any) {
    console.error('Supabase sync error:', err);
    return { ok: false, message: err.message || 'Failed to sync to Supabase' };
  }
}

export async function resetSeedData(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/seed/reset`, { method: 'POST' });
  } catch {}

  setLocal('affan_accounts', INITIAL_ACCOUNTS);
  setLocal('affan_categories', INITIAL_CATEGORIES);
  setLocal('affan_transactions', INITIAL_TRANSACTIONS);
  setLocal('affan_debts', INITIAL_DEBTS);
  setLocal('affan_budgets', []);
}

export async function importCSV(file: File): Promise<{ imported: number }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/import/csv`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) return await res.json();
  } catch {}
  return { imported: 0 };
}
