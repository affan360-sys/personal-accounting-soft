import React, { useState } from 'react';
import { Plus, AlertCircle, CheckCircle2, Trash2, X } from 'lucide-react';
import { Budget, Category } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  onSaveBudget: (data: { category_id: number; amount: number; period?: string }) => Promise<void>;
  onDeleteBudget: (id: number) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const { currency, formatAmount } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleOpenAdd = () => {
    setCategoryId(expenseCategories[0]?.id.toString() || '');
    setAmount('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || parseFloat(amount) <= 0) return;

    await onSaveBudget({
      category_id: parseInt(categoryId),
      amount: parseFloat(amount),
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets &amp; Spending Caps</h1>
          <p className="text-sm text-slate-500">
            Set monthly category spending caps to monitor pace and prevent overspending.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Budget</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Budget</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatAmount(totalBudgeted)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{budgets.length} budgeted categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Spent So Far</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatAmount(totalSpent)}
          </p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overallPct > 100 ? 'bg-rose-500' : overallPct > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Remaining</p>
          <p className={`text-2xl font-black mt-1 ${totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatAmount(totalRemaining)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {overallPct.toFixed(1)}% of total budget consumed
          </p>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const isOver = b.spent > b.amount;
          const isNear = b.percentage >= 80 && !isOver;

          return (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: b.category?.color || '#3b82f6' }}
                    />
                    <h3 className="font-bold text-slate-900 text-base">{b.category?.name || 'Category'}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isOver ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Over Budget</span>
                      </span>
                    ) : isNear ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        Near Limit
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>On Track</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Remove budget for ${b.category?.name}?`)) {
                          onDeleteBudget(b.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium text-slate-500">
                    <span>
                      Spent: <strong className="text-slate-800">{formatAmount(b.spent)}</strong>
                    </span>
                    <span>
                      Budget: <strong className="text-slate-800">{formatAmount(b.amount)}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {b.remaining >= 0 ? 'Remaining to spend:' : 'Exceeded by:'}
                </span>
                <span className={`font-bold text-sm ${b.remaining >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatAmount(Math.abs(b.remaining))} ({b.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Set Monthly Budget</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Expense Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Budget Target ({currency})
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
