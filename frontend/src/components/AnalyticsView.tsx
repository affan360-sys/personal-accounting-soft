import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MonthlyTrend, CategoryBreakdown } from '../types';
import { fetchMonthlyTrends, fetchCategoryBreakdown, fetchCashflow } from '../api';
import { useCurrency } from '../context/CurrencyContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

export const AnalyticsView: React.FC = () => {
  const { currency, formatAmount } = useCurrency();
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, [monthsCount]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [tData, cData] = await Promise.all([
        fetchMonthlyTrends(monthsCount),
        fetchCategoryBreakdown(),
      ]);
      setTrends(tData);
      setCategoryBreakdown(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const avgIncome = trends.length > 0 ? trends.reduce((s, t) => s + t.income, 0) / trends.length : 0;
  const avgExpense = trends.length > 0 ? trends.reduce((s, t) => s + t.expense, 0) / trends.length : 0;
  const avgNet = avgIncome - avgExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports &amp; Analytics</h1>
          <p className="text-sm text-slate-500">
            Multi-month trends, net cash flow patterns, and category spending distributions.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
          {[
            { label: 'Past 3 Months', val: 3 },
            { label: 'Past 6 Months', val: 6 },
            { label: 'Past 12 Months', val: 12 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setMonthsCount(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                monthsCount === item.val
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI averages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Monthly Inflow</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {formatAmount(avgIncome)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Past {monthsCount} recorded periods</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Monthly Outflow</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {formatAmount(avgExpense)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Past {monthsCount} recorded periods</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Net Velocity</p>
          <p className={`text-2xl font-black mt-1 ${avgNet >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatAmount(avgNet)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Net surplus generated per month</p>
        </div>
      </div>

      {/* Monthly Inflow vs Outflow Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Taka In vs. Taka Out Trend</h2>
            <p className="text-xs text-slate-500">Visualizing cash growth and expenditure trajectory</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${currency}${v}`} />
              <Tooltip 
                formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Legend iconType="circle" />
              <Area type="monotone" dataKey="income" name="Inflow (Taka In)" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="expense" name="Outflow (Taka Out)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Expense Distribution</h2>
            <p className="text-xs text-slate-500 mb-4">Proportion of spend across all categories</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category_color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${currency}${Number(val).toLocaleString()}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Category Spending Ranking</h2>
          <p className="text-xs text-slate-500 mb-4">Ranked from highest to lowest expenditure</p>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {categoryBreakdown.map((c, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.category_color || COLORS[i % COLORS.length] }}
                  />
                  <span className="font-semibold text-slate-800">{c.category_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatAmount(c.amount)}</span>
                  <span className="text-xs text-slate-400 ml-2">({c.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
