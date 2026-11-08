const { db } = require('./db');

function getFinancialSummary() {
  const accounts = db.prepare('SELECT * FROM accounts').all();
  let total_assets = 0;
  let total_liabilities = 0;

  for (const a of accounts) {
    if (a.is_liability) {
      total_liabilities += a.current_balance;
    } else {
      total_assets += a.current_balance;
    }
  }

  const net_worth = total_assets - total_liabilities;

  // Active debts
  const debts = db.prepare("SELECT * FROM debt_goals WHERE status = 'active'").all();
  let total_receivable = 0;
  let total_payable = 0;

  for (const d of debts) {
    const remaining = Math.max(0, d.total_amount - (d.paid_amount || 0));
    if (d.type === 'they_owe_me') {
      total_receivable += remaining;
    } else if (d.type === 'i_owe') {
      total_payable += remaining;
    }
  }

  // Current month income & expense
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const incObj = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum
    FROM transactions
    WHERE type = 'income' AND date LIKE ?
  `).get(`${currentMonth}%`);
  const total_income = incObj.sum || 0;

  const expObj = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum
    FROM transactions
    WHERE type = 'expense' AND date LIKE ?
  `).get(`${currentMonth}%`);
  const total_expense = expObj.sum || 0;

  const net_savings = total_income - total_expense;
  const savings_rate_pct = total_income > 0 ? (net_savings / total_income) * 100 : 0;

  return {
    net_worth: Number(net_worth.toFixed(2)),
    total_assets: Number(total_assets.toFixed(2)),
    total_liabilities: Number(total_liabilities.toFixed(2)),
    total_receivable: Number(total_receivable.toFixed(2)),
    total_payable: Number(total_payable.toFixed(2)),
    total_income_this_month: Number(total_income.toFixed(2)),
    total_expense_this_month: Number(total_expense.toFixed(2)),
    net_savings_this_month: Number(net_savings.toFixed(2)),
    savings_rate_pct: Number(savings_rate_pct.toFixed(1)),
  };
}

function getMonthlyTrends(monthsCount = 6) {
  const count = Math.min(Math.max(Number(monthsCount) || 6, 1), 24);
  const today = new Date();
  const months = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendData = [];

  for (const m of months) {
    const incObj = db.prepare(`
      SELECT COALESCE(SUM(amount), 0.0) as sum
      FROM transactions
      WHERE type = 'income' AND date LIKE ?
    `).get(`${m}%`);

    const expObj = db.prepare(`
      SELECT COALESCE(SUM(amount), 0.0) as sum
      FROM transactions
      WHERE type = 'expense' AND date LIKE ?
    `).get(`${m}%`);

    const inc = incObj.sum || 0;
    const exp = expObj.sum || 0;

    const [yr, mo] = m.split('-');
    const prettyMonth = `${monthNames[parseInt(mo, 10) - 1]} ${yr.slice(-2)}`;

    trendData.push({
      month: prettyMonth,
      raw_month: m,
      income: Number(inc.toFixed(2)),
      expense: Number(exp.toFixed(2)),
      net: Number((inc - exp).toFixed(2)),
    });
  }

  return trendData;
}

function getCategoryBreakdown(monthParam) {
  const now = new Date();
  const currentMonth = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const rows = db.prepare(`
    SELECT c.name, c.color, COALESCE(SUM(t.amount), 0.0) as total
    FROM categories c
    JOIN transactions t ON t.category_id = c.id
    WHERE t.type = 'expense' AND t.date LIKE ?
    GROUP BY c.id
    ORDER BY total DESC
  `).all(`${currentMonth}%`);

  const totalSpent = rows.reduce((sum, r) => sum + r.total, 0) || 1.0;

  return rows.map((r) => ({
    category_name: r.name,
    category_color: r.color || '#3b82f6',
    amount: Number(r.total.toFixed(2)),
    percentage: Number(((r.total / totalSpent) * 100).toFixed(1)),
  }));
}

function getRecentCashflow(daysCount = 30) {
  const days = Math.min(Math.max(Number(daysCount) || 30, 7), 90);
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const rows = db.prepare(`
    SELECT date, type, SUM(amount) as amount
    FROM transactions
    WHERE date >= ? AND type IN ('income', 'expense')
    GROUP BY date, type
  `).all(startDate);

  const dailyMap = {};
  for (const r of rows) {
    if (!dailyMap[r.date]) {
      dailyMap[r.date] = { date: r.date, income: 0.0, expense: 0.0 };
    }
    if (r.type === 'income') {
      dailyMap[r.date].income += r.amount;
    } else {
      dailyMap[r.date].expense += r.amount;
    }
  }

  return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
}

module.exports = {
  getFinancialSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getRecentCashflow,
};

