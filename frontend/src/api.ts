import { Account, Category, Transaction, Budget, DebtGoal, FinancialSummary, MonthlyTrend, CategoryBreakdown } from './types';

const BASE_URL = '/api';

export async function fetchSummary(): Promise<FinancialSummary> {
  const res = await fetch(`${BASE_URL}/summary`);
  return res.json();
}

export async function fetchMonthlyTrends(months = 6): Promise<MonthlyTrend[]> {
  const res = await fetch(`${BASE_URL}/analytics/monthly?months=${months}`);
  return res.json();
}

export async function fetchCategoryBreakdown(month?: string): Promise<CategoryBreakdown[]> {
  const url = month ? `${BASE_URL}/analytics/category-breakdown?month=${month}` : `${BASE_URL}/analytics/category-breakdown`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchCashflow(days = 30): Promise<{ date: string; income: number; expense: number }[]> {
  const res = await fetch(`${BASE_URL}/analytics/cashflow?days=${days}`);
  return res.json();
}

export async function fetchAccounts(): Promise<Account[]> {
  const res = await fetch(`${BASE_URL}/accounts`);
  return res.json();
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
  const url = type ? `${BASE_URL}/categories?type=${type}` : `${BASE_URL}/categories`;
  const res = await fetch(url);
  return res.json();
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
  return res.json();
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
  const url = month ? `${BASE_URL}/budgets?month=${month}` : `${BASE_URL}/budgets`;
  const res = await fetch(url);
  return res.json();
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
  const res = await fetch(`${BASE_URL}/debts`);
  return res.json();
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

