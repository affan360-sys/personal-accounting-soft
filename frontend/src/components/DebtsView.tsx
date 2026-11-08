import React, { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, CheckCircle2, Trash2, X, DollarSign, Pencil } from 'lucide-react';
import { DebtGoal } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface DebtsViewProps {
  debts: DebtGoal[];
  onCreateDebt: (data: Partial<DebtGoal>) => Promise<void>;
  onUpdateDebt: (id: number, data: Partial<DebtGoal>) => Promise<void>;
  onDeleteDebt: (id: number) => Promise<void>;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  onCreateDebt,
  onUpdateDebt,
  onDeleteDebt,
}) => {
  const { currency, formatAmount } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentModalDebt, setPaymentModalDebt] = useState<DebtGoal | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'i_owe' | 'they_owe_me'>('they_owe_me');
  const [counterparty, setCounterparty] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [loanDate, setLoanDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [notes, setNotes] = useState('');

  // Edit Debt State
  const [editingDebt, setEditingDebt] = useState<DebtGoal | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'i_owe' | 'they_owe_me'>('they_owe_me');
  const [editCounterparty, setEditCounterparty] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('0');
  const [editLoanDate, setEditLoanDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editInterestRate, setEditInterestRate] = useState('0');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'completed'>('active');

  const iOweDebts = debts.filter((d) => d.type === 'i_owe' && d.status === 'active');
  const theyOweDebts = debts.filter((d) => d.type === 'they_owe_me' && d.status === 'active');

  const totalIOweRemaining = iOweDebts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);
  const totalTheyOweRemaining = theyOweDebts.reduce((sum, d) => sum + (d.total_amount - d.paid_amount), 0);

  const handleOpenAdd = () => {
    setTitle('');
    setType('they_owe_me');
    setCounterparty('');
    setTotalAmount('');
    setPaidAmount('0');
    setLoanDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setInterestRate('0');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmount) return;

    await onCreateDebt({
      title: title.trim(),
      type,
      counterparty: counterparty.trim() || undefined,
      total_amount: parseFloat(totalAmount),
      paid_amount: parseFloat(paidAmount) || 0,
      loan_date: loanDate || undefined,
      due_date: dueDate || undefined,
      interest_rate: parseFloat(interestRate) || 0,
      notes: notes.trim() || undefined,
      status: 'active',
    });
    setIsModalOpen(false);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalDebt || !paymentAmount) return;
    const addedPayment = parseFloat(paymentAmount);
    const newPaid = paymentModalDebt.paid_amount + addedPayment;

    await onUpdateDebt(paymentModalDebt.id, {
      paid_amount: newPaid,
      status: newPaid >= paymentModalDebt.total_amount ? 'completed' : 'active',
    });
    setPaymentModalDebt(null);
    setPaymentAmount('');
  };

  const handleOpenEdit = (d: DebtGoal) => {
    setEditingDebt(d);
    setEditTitle(d.title || '');
    setEditType(d.type || 'they_owe_me');
    setEditCounterparty(d.counterparty || '');
    setEditTotalAmount(String(d.total_amount ?? ''));
    setEditPaidAmount(String(d.paid_amount ?? '0'));
    setEditLoanDate(d.loan_date || d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setEditDueDate(d.due_date || '');
    setEditInterestRate(String(d.interest_rate ?? '0'));
    setEditNotes(d.notes || '');
    setEditStatus(d.status || 'active');
  };

  const handleUpdateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDebt || !editTitle.trim() || !editTotalAmount) return;

    const total = parseFloat(editTotalAmount);
    const paid = parseFloat(editPaidAmount) || 0;
    const finalStatus = editStatus || (paid >= total ? 'completed' : 'active');

    await onUpdateDebt(editingDebt.id, {
      title: editTitle.trim(),
      type: editType,
      counterparty: editCounterparty.trim() || undefined,
      total_amount: total,
      paid_amount: paid,
      loan_date: editLoanDate || undefined,
      due_date: editDueDate || undefined,
      interest_rate: parseFloat(editInterestRate) || 0,
      notes: editNotes.trim() || undefined,
      status: finalStatus,
    });
    setEditingDebt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payables &amp; Receivables</h1>
          <p className="text-sm text-slate-500">
            Track Accounts Receivable (money owed to you by Pulsecode, Rifat, clients) and Accounts Payable (money you owe).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payable / Receivable</span>
        </button>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20 shadow-xs">
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>Total Accounts Receivable (Owed to You / Taka Pabo)</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {formatAmount(totalTheyOweRemaining)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{theyOweDebts.length} active receivables to collect</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/20 shadow-xs">
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowDownLeft className="w-4 h-4" />
            <span>Total Accounts Payable (You Owe / Dena)</span>
          </div>
          <p className="text-2xl font-black text-rose-600">
            {formatAmount(totalIOweRemaining)}
          </p>
          <p className="text-xs text-slate-500 mt-1">{iOweDebts.length} active payables to settle</p>
        </div>
      </div>

      {/* Debts List */}
      <div className="space-y-4">
        {debts.map((d) => {
          const isIOwe = d.type === 'i_owe';
          const remaining = Math.max(0, d.total_amount - d.paid_amount);
          const progress = d.total_amount > 0 ? (d.paid_amount / d.total_amount) * 100 : 0;
          const isFinished = d.status === 'completed' || remaining === 0;

          return (
            <div
              key={d.id}
              className={`bg-white p-5 rounded-2xl border transition-all ${
                isFinished ? 'border-emerald-200/60 bg-emerald-50/20' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isIOwe ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isIOwe ? 'Money I Owe' : 'Owed to Me (Receivable)'}
                    </span>
                    {isFinished && (
                      <span className="flex items-center space-x-1 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Fully Settled</span>
                      </span>
                    )}
                    {d.loan_date && (
                      <span className="text-xs text-slate-500 font-medium">Loan Date: {d.loan_date}</span>
                    )}
                    {d.due_date && (
                      <span className="text-xs text-slate-400">Due: {d.due_date}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{d.title}</h3>
                  <p className="text-xs text-slate-500">
                    {d.counterparty ? `Party: ${d.counterparty}` : ''}
                  </p>
                  {d.notes && <p className="text-xs text-slate-400 mt-1">{d.notes}</p>}
                </div>

                {/* Progress & Actions */}
                <div className="flex flex-col md:items-end gap-2">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400">Remaining Balance:</span>
                    <p className={`text-xl font-black ${isIOwe ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatAmount(remaining)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Paid {formatAmount(d.paid_amount)} of {formatAmount(d.total_amount)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isFinished && (
                      <button
                        onClick={() => {
                          setPaymentModalDebt(d);
                          setPaymentAmount('');
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Record Taka In / Repayment</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Entry"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete debt entry: ${d.title}?`)) {
                          onDeleteDebt(d.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFinished ? 'bg-emerald-500' : isIOwe ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {paymentModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
              <button
                onClick={() => setPaymentModalDebt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Applying payment to:</p>
                <p className="text-sm font-bold text-slate-900">{paymentModalDebt.title}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebt(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Loan / Receivable</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('they_owe_me')}
                  className={`py-2 rounded-lg text-xs font-semibold ${
                    type === 'they_owe_me' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Owed to Me (Receivable)
                </button>
                <button
                  type="button"
                  onClick={() => setType('i_owe')}
                  className={`py-2 rounded-lg text-xs font-semibold ${
                    type === 'i_owe' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  I Owe Money (Liability)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loan to Pulsecode, Loan to Rifat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Counterparty (Person or Business)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pulsecode, Rifat"
                  value={counterparty}
                  onChange={(e) => setCounterparty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Already Received ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Loan Date
                  </label>
                  <input
                    type="date"
                    required
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, dates, terms..."
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {editingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Edit Loan / Receivable</h2>
              <button
                onClick={() => setEditingDebt(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditType('they_owe_me')}
                  className={`py-2 rounded-lg text-xs font-semibold ${
                    editType === 'they_owe_me' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Owed to Me (Receivable)
                </button>
                <button
                  type="button"
                  onClick={() => setEditType('i_owe')}
                  className={`py-2 rounded-lg text-xs font-semibold ${
                    editType === 'i_owe' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  I Owe Money (Liability)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loan to Pulsecode, Loan to Rifat"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Counterparty (Person or Business)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pulsecode, Rifat"
                  value={editCounterparty}
                  onChange={(e) => setEditCounterparty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Total Amount ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={editTotalAmount}
                    onChange={(e) => setEditTotalAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Paid / Received ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Loan Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editLoanDate}
                    onChange={(e) => setEditLoanDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'active' | 'completed')}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed / Settled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Details, dates, terms..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDebt(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
