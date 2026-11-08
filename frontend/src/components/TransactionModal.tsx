import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { Account, Category } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  accounts: Account[];
  categories: Category[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
}) => {
  const { currency } = useCurrency();
  const [type, setType] = useState<'expense' | 'income' | 'transfer' | 'receivable' | 'payable' | 'invest'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState<number>(accounts[0]?.id || 1);
  const [toAccountId, setToAccountId] = useState<number>(accounts[1]?.id || accounts[0]?.id || 1);
  const [categoryId, setCategoryId] = useState<string>('');
  const [payee, setPayee] = useState<string>('');
  const [counterparty, setCounterparty] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [assetType, setAssetType] = useState<string>('Stocks / Shares');
  const [affectAccount, setAffectAccount] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if ((type === 'receivable' || type === 'payable') && !counterparty.trim()) {
      alert(`Please specify the ${type === 'receivable' ? 'Debtor / Person who owes you' : 'Lender / Creditor who you owe'}.`);
      return;
    }

    if (type === 'invest' && !assetName.trim()) {
      alert('Please specify the Investment Asset Name (e.g. Stocks, DPS, Business Share).');
      return;
    }

    setLoading(true);
    try {
      if (type === 'receivable' || type === 'payable') {
        await onSave({
          type,
          amount: parseFloat(amount),
          date,
          account_id: accountId,
          counterparty: counterparty.trim(),
          title: title.trim() || undefined,
          due_date: dueDate || undefined,
          affect_account: affectAccount,
          notes: notes.trim() || undefined,
        });
      } else if (type === 'invest') {
        await onSave({
          type,
          amount: parseFloat(amount),
          date,
          account_id: accountId,
          asset_name: assetName.trim(),
          asset_type: assetType,
          affect_account: affectAccount,
          notes: notes.trim() || undefined,
        });
      } else {
        await onSave({
          type,
          amount: parseFloat(amount),
          date,
          account_id: accountId,
          to_account_id: type === 'transfer' ? toAccountId : null,
          category_id: type !== 'transfer' && categoryId ? parseInt(categoryId) : null,
          payee: payee.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }
      
      // reset & close
      setAmount('');
      setPayee('');
      setCounterparty('');
      setTitle('');
      setDueDate('');
      setAssetName('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Record New Transaction</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Type Segment Control: Taka Out | Taka In | Transfer | Receivable | Payable | Invest */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
              <span>Taka Out</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>Taka In</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('transfer'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'transfer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span>Transfer</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('receivable'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'receivable' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span>Receivable</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('payable'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'payable' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Payable</span>
            </button>

            <button
              type="button"
              onClick={() => { setType('invest'); setCategoryId(''); }}
              className={`flex items-center justify-center space-x-1 py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                type === 'invest' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span>Invest</span>
            </button>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-slate-900 placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Standard Expense / Income Fields */}
          {(type === 'expense' || type === 'income') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({currency}{acc.current_balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                  >
                    <option value="">Select Category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tag / Details (e.g. [Pulsecode] Bike oil)
                </label>
                <input
                  type="text"
                  placeholder="e.g. [Pulsecode] Bike oil, [Rifat] Loan"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
                />
              </div>
            </>
          )}

          {/* Transfer Fields */}
          {type === 'transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  From Account
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({currency}{acc.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  To Account
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({currency}{acc.current_balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Receivable & Payable Fields */}
          {(type === 'receivable' || type === 'payable') && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {type === 'receivable' ? 'Paid from Account' : 'Deposit in Account'}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({currency}{acc.current_balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    {type === 'receivable' ? 'Debtor (Owed by)' : 'Creditor (Owed to)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={type === 'receivable' ? 'e.g. Pulsecode, Rifat, Client' : 'e.g. Bank, Supplier, Friend'}
                    value={counterparty}
                    onChange={(e) => setCounterparty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Purpose / Title
                  </label>
                  <input
                    type="text"
                    placeholder={type === 'receivable' ? 'e.g. Give loan, Project invoice' : 'e.g. Borrowed for supplies'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="affectAccount"
                  checked={affectAccount}
                  onChange={(e) => setAffectAccount(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="affectAccount" className="text-xs font-medium text-slate-700 cursor-pointer">
                  {type === 'receivable'
                    ? 'Deduct from cash account balance (Money was paid out)'
                    : 'Deposit into cash account balance (Money was received)'}
                </label>
              </div>
            </div>
          )}

          {/* Invest Fields */}
          {type === 'invest' && (
            <div className="space-y-4 bg-purple-50/40 p-4 rounded-xl border border-purple-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-900 uppercase tracking-wider mb-1">
                    Funded from Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-800 bg-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({currency}{acc.current_balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-900 uppercase tracking-wider mb-1">
                    Asset Class / Type
                  </label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-slate-800 bg-white"
                  >
                    <option value="Stocks / Equities">Stocks / Equities</option>
                    <option value="DPS / Fixed Deposit">DPS / Fixed Deposit</option>
                    <option value="Business Capital / Equity">Business Capital / Equity</option>
                    <option value="Mutual Funds / Unit Fund">Mutual Funds / Unit Fund</option>
                    <option value="Gold / Precious Metals">Gold / Precious Metals</option>
                    <option value="Real Estate / Land">Real Estate / Land</option>
                    <option value="Crypto">Crypto Asset</option>
                    <option value="Other Investment">Other Investment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-900 uppercase tracking-wider mb-1">
                  Investment Name / Asset
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beximco Shares, BRAC Bank DPS, Startup Equity, Gold Sovereign"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="affectAccountInvest"
                  checked={affectAccount}
                  onChange={(e) => setAffectAccount(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="affectAccountInvest" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Deduct investment capital from funding account balance
                </label>
              </div>
            </div>
          )}

          {/* Comments / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Comments / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. SHQ, 29-30 trik, sole, expected ROI..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 ${
                type === 'receivable'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : type === 'payable'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : type === 'invest'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Saving...' : type === 'receivable' ? 'Record Receivable' : type === 'payable' ? 'Record Payable' : type === 'invest' ? 'Record Investment' : 'Record Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
