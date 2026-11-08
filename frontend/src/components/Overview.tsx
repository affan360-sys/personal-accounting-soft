import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  ArrowDownLeft,
  ChevronRight,
  Wallet,
  Calendar,
  Scale
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FinancialSummary, MonthlyTrend, CategoryBreakdown, Transaction, Account } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface OverviewProps {
  summary: FinancialSummary | null;
  trends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: Transaction[];
  accounts: Account[];
  onNavigateTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export const Overview: React.FC<OverviewProps> = ({
  summary,
  trends,
  categoryBreakdown,
  recentTransactions,
  accounts,
  onNavigateTab,
  onOpenNewTransaction,
}) => {
  const { currency, formatAmount } = useCurrency();
  const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome & Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/10">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Financial Snapshot • {currentMonthName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Financial Ledger &amp; Cash Flow
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time tracking of accounts, expenditures, loan receivables, and cash outflow.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenNewTransaction}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center space-x-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Financial Position & Cash Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Net Balance / Net Worth */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Net Balance</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${summary && summary.net_worth < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {summary ? formatAmount(summary.net_worth) : formatAmount(0)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Cash: <strong className="text-slate-800">{formatAmount(summary?.total_assets || 0)}</strong>
            </span>
            <span className="text-slate-500">
              Liabilities: <strong className="text-rose-600">{formatAmount(summary?.total_liabilities || 0)}</strong>
            </span>
          </div>
        </div>

        {/* Accounts Receivable (Owed to You) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/20 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Receivable (Owed to You)</span>
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            +{summary ? formatAmount(summary.total_receivable || 0) : formatAmount(0)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-emerald-100/60 text-xs">
            <span className="text-slate-500">Money to collect (Taka pabo)</span>
            <button
              onClick={() => onNavigateTab('debts')}
              className="text-emerald-700 font-bold hover:underline flex items-center space-x-0.5"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Accounts Payable (You Owe) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100/80 bg-gradient-to-br from-white to-rose-50/20 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Payable (You Owe)</span>
            <div className="p-2 rounded-xl bg-rose-100/80 text-rose-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            {summary ? formatAmount(summary.total_payable || 0) : formatAmount(0)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-rose-100/60 text-xs">
            <span className="text-slate-500">Debts to settle (Dena)</span>
            <button
              onClick={() => onNavigateTab('debts')}
              className="text-rose-700 font-bold hover:underline flex items-center space-x-0.5"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Inflow This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Inflow This Month</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            +{summary ? formatAmount(summary.total_income_this_month) : formatAmount(0)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Taka In (Income &amp; Returns)</span>
            <span className="text-emerald-600 font-semibold">Active</span>
          </div>
        </div>

        {/* Expenses / Outflows This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Taka Out This Month</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">
            -{summary ? formatAmount(summary.total_expense_this_month) : formatAmount(0)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Current month expenditures</span>
            <button onClick={() => onNavigateTab('transactions')} className="text-blue-600 font-semibold hover:underline">
              Ledger
            </button>
          </div>
        </div>

        {/* Net Savings / Monthly Flow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Monthly Cash Flow</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black ${summary && summary.net_savings_this_month < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {summary ? formatAmount(summary.net_savings_this_month) : formatAmount(0)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
            <span className="text-slate-500">Savings Rate:</span>
            <span className="px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
              {summary ? summary.savings_rate_pct : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Cash Velocity</h2>
              <p className="text-xs text-slate-500">Inflows vs. Outflows comparison over time</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Detailed Reports</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${currency}${v}`} />
                <Tooltip 
                  formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Inflow (Taka In)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Outflow (Taka Out)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut Chart (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Spending Breakdown</h2>
                <p className="text-xs text-slate-500">Distribution by category</p>
              </div>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.category_color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No expenses recorded this period
              </div>
            )}
          </div>

          {/* Mini Category Legend List */}
          <div className="space-y-2 mt-2 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
            {categoryBreakdown.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.category_color || COLORS[i] }} />
                  <span className="font-medium text-slate-700 truncate">{c.category_name}</span>
                </div>
                <div className="font-semibold text-slate-900 shrink-0">
                  {formatAmount(c.amount)} ({c.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Accounts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Balances Summary (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-blue-600" />
              <span>Accounts</span>
            </h2>
            <button
              onClick={() => onNavigateTab('accounts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{acc.name}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{acc.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${acc.current_balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {formatAmount(acc.current_balance)}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    Initial: {formatAmount(acc.initial_balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions List (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recorded Transactions</h2>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>View All ({recentTransactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 7).map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : isExpense ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-4 h-4" /> : isExpense ? <ArrowDownRight className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {tx.payee || tx.category_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.date} • {tx.account_name} {tx.notes ? `• ${tx.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        isIncome ? 'text-emerald-600' : isExpense ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{formatAmount(tx.amount)}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400">
                        {tx.category_name}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
