import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Pencil,
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight
} from 'lucide-react';
import { Transaction, Account, Category } from '../types';
import { importCSV } from '../api';
import { useCurrency } from '../context/CurrencyContext';
import { EditTransactionModal } from './EditTransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  totalCount: number;
  accounts: Account[];
  categories: Category[];
  search: string;
  setSearch: (s: string) => void;
  selectedAccount: string;
  setSelectedAccount: (a: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedType: string;
  setSelectedType: (t: string) => void;
  onRefresh: () => void;
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: number) => Promise<void>;
  onUpdateTransaction: (id: number, data: Partial<Transaction>) => Promise<void>;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  totalCount,
  accounts,
  categories,
  search,
  setSearch,
  selectedAccount,
  setSelectedAccount,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  onRefresh,
  onOpenNewTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
}) => {
  const { currency, formatAmount } = useCurrency();
  const [isUploading, setIsUploading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleExportCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await importCSV(file);
      alert(`Successfully imported ${res.imported} transactions.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to import CSV. Please ensure valid format (Date, Amount, Type, Payee, Category, Account).');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalReceived = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Ledger</h1>
          <p className="text-sm text-slate-500">
            Recorded expenditures, loan receivables, and cash transactions.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isUploading ? 'Importing...' : 'Import CSV'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-rose-600">Total Taka Out (Expenditures)</span>
            <p className="text-xl font-black text-rose-700 mt-0.5">-{formatAmount(totalSpent)}</p>
          </div>
          <span className="text-xs bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full">
            {transactions.filter(t => t.type === 'expense').length} records
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-emerald-600">Total Taka In (Received)</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">+{formatAmount(totalReceived)}</p>
          </div>
          <span className="text-xs bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {transactions.filter(t => t.type === 'income').length} records
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search Tag, details, comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 bg-white"
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 bg-white"
          >
            <option value="">All Types (Income / Expense / Transfer)</option>
            <option value="expense">Expenses / Taka Out</option>
            <option value="income">Income / Taka In</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>

        {/* Status line */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing <strong>{transactions.length}</strong> of <strong>{totalCount}</strong> transactions</span>
          {(search || selectedAccount || selectedCategory || selectedType) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedAccount('');
                setSelectedCategory('');
                setSelectedType('');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Tag / Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-right">Taka Out / In</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.length > 0 ? (
                transactions.map((t) => {
                  const isExpense = t.type === 'expense';
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap text-xs">
                        {t.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isIncome ? 'bg-emerald-50 text-emerald-600' : isExpense ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : isExpense ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowLeftRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {t.payee || 'Unnamed'}
                            </p>
                            {t.notes && <p className="text-[11px] text-slate-400 mt-0.5">{t.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {t.category_name || (t.type === 'transfer' ? 'Transfer' : 'Uncategorized')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {t.account_name} {t.to_account_name ? `→ ${t.to_account_name}` : ''}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                        isIncome ? 'text-emerald-600' : isExpense ? 'text-rose-600' : 'text-blue-600'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{formatAmount(t.amount)}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setEditingTransaction(t)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this transaction?')) {
                                onDeleteTransaction(t.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No transactions match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        onSave={onUpdateTransaction}
      />
    </div>
  );
};
