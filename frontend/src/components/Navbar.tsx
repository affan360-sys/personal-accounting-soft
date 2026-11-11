import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  Scale, 
  TrendingUp, 
  PlusCircle, 
  RotateCcw,
  ShieldCheck,
  Bell,
  Cloud
} from 'lucide-react';
import { FinancialSummary } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { isSupabaseConfigured } from '../supabase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewTransaction: () => void;
  onOpenNotificationSettings: () => void;
  onOpenCloudSync: () => void;
  onResetData: () => void;
  summary: FinancialSummary | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenNotificationSettings,
  onOpenCloudSync,
  onResetData,
  summary,
}) => {
  const { currency, setCurrency, formatAmount } = useCurrency();
  const isCloudSynced = isSupabaseConfigured();

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'debts', label: 'Payable & Receivable', icon: Scale },
    { id: 'analytics', label: 'Reports', icon: TrendingUp },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Affan
              </span>
              <span className="hidden sm:inline-block text-[11px] ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100 whitespace-nowrap">
                Accounting OS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (xl+) */}
          <nav className="hidden xl:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons, Currency Switcher & Net Worth */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Currency toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold shrink-0">
              <button
                onClick={() => setCurrency('৳')}
                className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                  currency === '৳' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="sm:hidden">৳</span>
                <span className="hidden sm:inline">৳ BDT</span>
              </button>
              <button
                onClick={() => setCurrency('$')}
                className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                  currency === '$' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className="sm:hidden">$</span>
                <span className="hidden sm:inline">$ USD</span>
              </button>
            </div>

            {summary && (
              <div className="hidden 2xl:flex flex-col items-end mr-1 text-right shrink-0 whitespace-nowrap">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Worth</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatAmount(summary.net_worth)}
                </span>
              </div>
            )}

            <button
              onClick={onOpenCloudSync}
              title={isCloudSynced ? "Supabase Cloud Connected (Live Sync)" : "Cloud Sync (Offline / Local Storage)"}
              className="relative p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
            >
              <Cloud className="w-4 h-4" />
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
            </button>

            <button
              onClick={onOpenNotificationSettings}
              title="Daily 10:00 PM Reminder Settings"
              className="relative p-1.5 sm:p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            <button
              onClick={onResetData}
              title="Reset Database to 0 and Initial Records"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewTransaction}
              className="flex items-center space-x-1 sm:space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow-md whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Entry</span>
            </button>
          </div>
        </div>

        {/* Tablet & Mobile Navigation Scrollbar (< xl) */}
        <div className="xl:hidden flex items-center space-x-1.5 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
