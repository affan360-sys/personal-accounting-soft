import React, { useState } from 'react';
import { Plus, Wallet, CreditCard, Landmark, LineChart, Banknote, Trash2, Edit3, X } from 'lucide-react';
import { Account } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface AccountsViewProps {
  accounts: Account[];
  onCreateAccount: (data: Partial<Account>) => Promise<void>;
  onUpdateAccount: (id: number, data: Partial<Account>) => Promise<void>;
  onDeleteAccount: (id: number) => Promise<void>;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
}) => {
  const { currency, formatAmount } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [initialBalance, setInitialBalance] = useState('0');
  const [color, setColor] = useState('#2563eb');
  const [notes, setNotes] = useState('');

  const assets = accounts.filter((a) => !a.is_liability);
  const liabilities = accounts.filter((a) => a.is_liability);

  const totalAssets = assets.reduce((sum, a) => sum + a.current_balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.current_balance, 0);
  const netTotal = totalAssets - totalLiabilities;

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('cash');
    setInitialBalance('0');
    setColor('#2563eb');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(acc.initial_balance.toString());
    setColor(acc.color);
    setNotes(acc.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isLiability = type === 'credit_card' || type === 'loan';
    const payload: Partial<Account> = {
      name: name.trim(),
      type,
      initial_balance: parseFloat(initialBalance) || 0,
      color,
      is_liability: isLiability,
      notes: notes.trim() || undefined,
    };

    if (editingAccount) {
      await onUpdateAccount(editingAccount.id, payload);
    } else {
      await onCreateAccount(payload);
    }
    setIsModalOpen(false);
  };

  const getAccountIcon = (accType: string) => {
    switch (accType) {
      case 'checking':
        return <Landmark className="w-5 h-5" />;
      case 'savings':
        return <Wallet className="w-5 h-5" />;
      case 'cash':
        return <Banknote className="w-5 h-5" />;
      case 'investment':
        return <LineChart className="w-5 h-5" />;
      case 'credit_card':
      case 'loan':
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts & Wallets</h1>
          <p className="text-sm text-slate-500">
            Track and reconcile balances across Cash, Bank, and Mobile Banking wallets.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assets</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatAmount(totalAssets)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{assets.length} active asset accounts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Liabilities</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {formatAmount(totalLiabilities)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{liabilities.length} debt accounts</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Equity</p>
          <p className={`text-2xl font-black mt-1 ${netTotal < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
            {formatAmount(netTotal)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Liquid balance</p>
        </div>
      </div>

      {/* Asset Accounts Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <span>Active Wallets & Accounts</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            {assets.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((acc) => (
            <div
              key={acc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountIcon(acc.type)}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${acc.name}?`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-lg">{acc.name}</h3>
                <p className="text-xs text-slate-500 capitalize">{acc.type.replace('_', ' ')}</p>
                {acc.notes && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{acc.notes}</p>}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Balance</span>
                <span className={`text-xl font-black ${acc.current_balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatAmount(acc.current_balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>
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
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cash Wallet, City Bank, bKash, Nagad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Account Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Account['type'])}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="cash">Cash Wallet</option>
                    <option value="checking">Bank Checking</option>
                    <option value="savings">Savings Account</option>
                    <option value="credit_card">Credit Card (Liability)</option>
                    <option value="loan">Loan (Liability)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Initial Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {['#ea580c', '#ec4899', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details, bank name..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  {editingAccount ? 'Update Account' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
