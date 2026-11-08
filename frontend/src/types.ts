export interface Account {
  id: number;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card' | 'investment' | 'loan';
  initial_balance: number;
  current_balance: number;
  currency: string;
  icon: string;
  color: string;
  is_liability: boolean;
  notes?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id?: number | null;
  to_account_id?: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  payee?: string;
  notes?: string;
  created_at: string;
  account_name?: string;
  category_name?: string;
  to_account_name?: string;
}

export interface Budget {
  id: number;
  category_id: number;
  category?: Category;
  amount: number;
  period: string;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface DebtGoal {
  id: number;
  title: string;
  type: 'i_owe' | 'they_owe_me';
  counterparty?: string;
  total_amount: number;
  paid_amount: number;
  due_date?: string;
  interest_rate: number;
  notes?: string;
  status: 'active' | 'completed';
  created_at: string;
}

export interface FinancialSummary {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  total_receivable: number;
  total_payable: number;
  total_income_this_month: number;
  total_expense_this_month: number;
  net_savings_this_month: number;
  savings_rate_pct: number;
}

export interface MonthlyTrend {
  month: string;
  raw_month?: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category_name: string;
  category_color: string;
  amount: number;
  percentage: number;
}
