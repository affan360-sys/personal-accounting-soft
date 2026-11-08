import { Account, Category, Transaction, Budget, DebtGoal, FinancialSummary, MonthlyTrend, CategoryBreakdown } from './types';

const BASE_URL = '/api';

export const FALLBACK_ACCOUNTS: Account[] = [
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
  },
];

export const FALLBACK_CATEGORIES: Category[] = [
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

export async function fetchSummary(): Promise<FinancialSummary> {
  try {
    const res = await fetch(`${BASE_URL}/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.warn('Using fallback summary:', err);
    return {
      net_worth: -12840,
      total_assets: -12840,
      total_liabilities: 0,
      total_receivable: 4000,
      total_payable: 0,
      total_income_this_month: 0,
      total_expense_this_month: 1000,
      net_savings_this_month: -1000,
      savings_rate_pct: 0,
    };
  }
}

export async function fetchMonthlyTrends(months = 6): Promise<MonthlyTrend[]> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/monthly?months=${months}`);
    if (!res.ok) throw new Error('Failed to fetch trends');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCategoryBreakdown(month?: string): Promise<CategoryBreakdown[]> {
  try {
    const url = month ? `${BASE_URL}/analytics/category-breakdown?month=${month}` : `${BASE_URL}/analytics/category-breakdown`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch category breakdown');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCashflow(days = 30): Promise<{ date: string; income: number; expense: number }[]> {
  try {
    const res = await fetch(`${BASE_URL}/analytics/cashflow?days=${days}`);
    if (!res.ok) throw new Error('Failed to fetch cashflow');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchAccounts(): Promise<Account[]> {
  try {
    const res = await fetch(`${BASE_URL}/accounts`);
    if (!res.ok) throw new Error('Failed to fetch accounts');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      try {
        localStorage.setItem('affan_cached_accounts', JSON.stringify(data));
      } catch {}
      return data;
    }
    throw new Error('Empty accounts');
  } catch (err) {
    try {
      const cached = localStorage.getItem('affan_cached_accounts');
      if (cached) return JSON.parse(cached);
    } catch {}
    return FALLBACK_ACCOUNTS;
  }
}

export async function createAccount(data: Partial<Account>): Promise<Account> {
  const res = await fetch(`${BASE_URL}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateAccount(id: number, data: Partial<Account>): Promise<Account> {
  const res = await fetch(`${BASE_URL}/accounts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteAccount(id: number): Promise<void> {
  await fetch(`${BASE_URL}/accounts/${id}`, { method: 'DELETE' });
}

export async function fetchCategories(type?: string): Promise<Category[]> {
  try {
    const url = type ? `${BASE_URL}/categories?type=${type}` : `${BASE_URL}/categories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    throw new Error('Empty categories');
  } catch {
    return type ? FALLBACK_CATEGORIES.filter((c) => c.type === type) : FALLBACK_CATEGORIES;
  }
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const res = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  await fetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE' });
}

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
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return await res.json();
  } catch {
    return { items: [], total: 0 };
  }
}

export async function createTransaction(data: Partial<Transaction>): Promise<Transaction> {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
}

export async function fetchBudgets(month?: string): Promise<Budget[]> {
  try {
    const url = month ? `${BASE_URL}/budgets?month=${month}` : `${BASE_URL}/budgets`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return await res.json();
  } catch {
    return [];
  }
}

export async function saveBudget(data: { category_id: number; amount: number; period?: string }): Promise<Budget> {
  const res = await fetch(`${BASE_URL}/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteBudget(id: number): Promise<void> {
  await fetch(`${BASE_URL}/budgets/${id}`, { method: 'DELETE' });
}

export async function fetchDebts(): Promise<DebtGoal[]> {
  try {
    const res = await fetch(`${BASE_URL}/debts`);
    if (!res.ok) throw new Error('Failed to fetch debts');
    return await res.json();
  } catch {
    return [];
  }
}

export async function createDebt(data: Partial<DebtGoal>): Promise<DebtGoal> {
  const res = await fetch(`${BASE_URL}/debts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDebt(id: number, data: Partial<DebtGoal>): Promise<DebtGoal> {
  const res = await fetch(`${BASE_URL}/debts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteDebt(id: number): Promise<void> {
  await fetch(`${BASE_URL}/debts/${id}`, { method: 'DELETE' });
}

export async function resetSeedData(): Promise<void> {
  await fetch(`${BASE_URL}/seed/reset`, { method: 'POST' });
}

export async function importCSV(file: File): Promise<{ imported: number }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/import/csv`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}
