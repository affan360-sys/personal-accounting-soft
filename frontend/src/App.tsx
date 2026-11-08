import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { DebtsView } from './components/DebtsView';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionModal } from './components/TransactionModal';
import { NotificationBanner } from './components/NotificationBanner';
import { NotificationModal } from './components/NotificationModal';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  playMobileNotificationSound, 
  triggerSystemNotification 
} from './services/notificationService';
import { 
  FinancialSummary, 
  MonthlyTrend, 
  CategoryBreakdown, 
  Transaction, 
  Account, 
  Category, 
  Budget, 
  DebtGoal 
} from './types';
import {
  fetchSummary,
  fetchMonthlyTrends,
  fetchCategoryBreakdown,
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  fetchCategories,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  fetchBudgets,
  saveBudget,
  deleteBudget,
  fetchDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  resetSeedData
} from './api';

import { CurrencyProvider } from './context/CurrencyContext';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<DebtGoal[]>([]);
  
  // Transactions tab state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [txSearch, setTxSearch] = useState<string>('');
  const [txAccount, setTxAccount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('');
  const [txType, setTxType] = useState<string>('');

  // Modals & Notifications
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Daily 10:00 PM Scheduler
  useEffect(() => {
    const checkReminder = () => {
      const settings = getNotificationSettings();
      if (!settings.enabled) return;

      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = now.toISOString().split('T')[0];

      if (currentTimeStr === settings.time && settings.lastTriggeredDate !== todayStr) {
        settings.lastTriggeredDate = todayStr;
        saveNotificationSettings(settings);

        playMobileNotificationSound();
        triggerSystemNotification(
          'Affan Accounting OS',
          "It's 10:00 PM! Time to add all today's transactions and keep your accounts balanced."
        );
        setShowNotificationBanner(true);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 25000);
    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered transactions effect
  useEffect(() => {
    loadTransactions();
  }, [txSearch, txAccount, txCategory, txType]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        sumData,
        trendData,
        catData,
        accData,
        allCats,
        bData,
        dData
      ] = await Promise.all([
        fetchSummary(),
        fetchMonthlyTrends(6),
        fetchCategoryBreakdown(),
        fetchAccounts(),
        fetchCategories(),
        fetchBudgets(),
        fetchDebts(),
      ]);

      setSummary(sumData);
      setTrends(trendData);
      setCategoryBreakdown(catData);
      setAccounts(accData);
      setCategories(allCats);
      setBudgets(bData);
      setDebts(dData);

      await loadTransactions();
    } catch (err) {
      console.error('Error loading accounting data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await fetchTransactions({
        search: txSearch || undefined,
        account_id: txAccount ? parseInt(txAccount) : undefined,
        category_id: txCategory ? parseInt(txCategory) : undefined,
        type: txType || undefined,
        limit: 100,
      });
      setTransactions(res.items);
      setTotalTransactions(res.total);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Transaction Actions
  const handleSaveTransaction = async (data: any) => {
    if (data.type === 'receivable') {
      // 1. Create debt receivable goal
      const debtTitle = data.title 
        ? `${data.counterparty}: ${data.title}` 
        : `Receivable from ${data.counterparty}`;
      await createDebt({
        title: debtTitle,
        type: 'they_owe_me',
        counterparty: data.counterparty,
        total_amount: data.amount,
        paid_amount: 0,
        due_date: data.due_date || undefined,
        notes: data.notes || undefined,
        status: 'active',
      });

      // 2. If affect_account is true, record cash outflow transaction
      if (data.affect_account) {
        const cat = categories.find(c => c.name.toLowerCase().includes('receivable') || c.name.toLowerCase().includes('loan'));
        await createTransaction({
          account_id: data.account_id,
          type: 'expense',
          amount: data.amount,
          date: data.date,
          category_id: cat?.id || null,
          payee: `[Receivable: ${data.counterparty}] ${data.title || 'Loan/Receivable'}`,
          notes: data.notes || undefined,
        });
      }
    } else if (data.type === 'payable') {
      // 1. Create debt payable goal
      const debtTitle = data.title 
        ? `${data.counterparty}: ${data.title}` 
        : `Payable to ${data.counterparty}`;
      await createDebt({
        title: debtTitle,
        type: 'i_owe',
        counterparty: data.counterparty,
        total_amount: data.amount,
        paid_amount: 0,
        due_date: data.due_date || undefined,
        notes: data.notes || undefined,
        status: 'active',
      });

      // 2. If affect_account is true, record cash inflow transaction
      if (data.affect_account) {
        const cat = categories.find(c => c.type === 'income');
        await createTransaction({
          account_id: data.account_id,
          type: 'income',
          amount: data.amount,
          date: data.date,
          category_id: cat?.id || null,
          payee: `[Payable: ${data.counterparty}] ${data.title || 'Borrowed/Payable'}`,
          notes: data.notes || undefined,
        });
      }
    } else if (data.type === 'invest') {
      if (data.affect_account) {
        const cat = categories.find(c => c.name.toLowerCase().includes('invest') || c.name.toLowerCase().includes('capital'));
        await createTransaction({
          account_id: data.account_id,
          type: 'expense',
          amount: data.amount,
          date: data.date,
          category_id: cat?.id || null,
          payee: `[Invest: ${data.asset_type || 'Asset'}] ${data.asset_name || 'Investment'}`,
          notes: data.notes || undefined,
        });
      }
    } else {
      await createTransaction(data);
    }
    await loadAllData();
  };

  const handleDeleteTransaction = async (id: number) => {
    await deleteTransaction(id);
    await loadAllData();
  };

  // Account Actions
  const handleCreateAccount = async (data: Partial<Account>) => {
    await createAccount(data);
    await loadAllData();
  };

  const handleUpdateAccount = async (id: number, data: Partial<Account>) => {
    await updateAccount(id, data);
    await loadAllData();
  };

  const handleDeleteAccount = async (id: number) => {
    await deleteAccount(id);
    await loadAllData();
  };

  // Budget Actions
  const handleSaveBudget = async (data: { category_id: number; amount: number; period?: string }) => {
    await saveBudget(data);
    const bData = await fetchBudgets();
    setBudgets(bData);
  };

  const handleDeleteBudget = async (id: number) => {
    await deleteBudget(id);
    const bData = await fetchBudgets();
    setBudgets(bData);
  };

  // Debt Actions
  const handleCreateDebt = async (data: Partial<DebtGoal>) => {
    await createDebt(data);
    const dData = await fetchDebts();
    setDebts(dData);
  };

  const handleUpdateDebt = async (id: number, data: Partial<DebtGoal>) => {
    await updateDebt(id, data);
    const dData = await fetchDebts();
    setDebts(dData);
  };

  const handleDeleteDebt = async (id: number) => {
    await deleteDebt(id);
    const dData = await fetchDebts();
    setDebts(dData);
  };

  // Reset demo
  const handleResetData = async () => {
    if (confirm('Reset accounting database to demo initial balances and transactions?')) {
      await resetSeedData();
      await loadAllData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenNotificationSettings={() => setIsNotificationModalOpen(true)}
        onResetData={handleResetData}
        summary={summary}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <Overview
            summary={summary}
            trends={trends}
            categoryBreakdown={categoryBreakdown}
            recentTransactions={transactions}
            accounts={accounts}
            onNavigateTab={setActiveTab}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            accounts={accounts}
            onCreateAccount={handleCreateAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            totalCount={totalTransactions}
            accounts={accounts}
            categories={categories}
            search={txSearch}
            setSearch={setTxSearch}
            selectedAccount={txAccount}
            setSelectedAccount={setTxAccount}
            selectedCategory={txCategory}
            setSelectedCategory={setTxCategory}
            selectedType={txType}
            setSelectedType={setTxType}
            onRefresh={loadTransactions}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsView
            budgets={budgets}
            categories={categories}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            debts={debts}
            onCreateDebt={handleCreateDebt}
            onUpdateDebt={handleUpdateDebt}
            onDeleteDebt={handleDeleteDebt}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Quick Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        accounts={accounts}
        categories={categories}
      />

      {/* Mobile-Style 10:00 PM Push Notification Banner */}
      <NotificationBanner
        isOpen={showNotificationBanner}
        onClose={() => setShowNotificationBanner(false)}
        onAddTransaction={() => setIsTxModalOpen(true)}
      />

      {/* 10:00 PM Notification Settings & Audio Tester */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onTestNotification={() => setShowNotificationBanner(true)}
      />
    </div>
  );
}

export function App() {
  return (
    <CurrencyProvider>
      <MainApp />
    </CurrencyProvider>
  );
}

export default App;
