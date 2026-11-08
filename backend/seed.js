const { db, updateAccountBalance } = require('./db');

const DEFAULT_CATEGORIES = [
  { name: 'Transportation & Bike Oil', type: 'expense', icon: 'car', color: '#6366f1' },
  { name: 'Company Registration', type: 'expense', icon: 'briefcase', color: '#06b6d4' },
  { name: 'Seal & Brochure (Marketing)', type: 'expense', icon: 'file-text', color: '#8b5cf6' },
  { name: 'Food & Lunch', type: 'expense', icon: 'coffee', color: '#f59e0b' },
  { name: 'Course & Education', type: 'expense', icon: 'book-open', color: '#10b981' },
  { name: 'Loan Given (Receivable)', type: 'expense', icon: 'scale', color: '#ec4899' },
  { name: 'Investments & Capital', type: 'expense', icon: 'trending-up', color: '#9333ea' },
  { name: 'General Expenses', type: 'expense', icon: 'tag', color: '#64748b' },
  { name: 'Salary & Client Revenue', type: 'income', icon: 'dollar-sign', color: '#10b981' },
  { name: 'Loan Repayment (Taka In)', type: 'income', icon: 'arrow-down-left', color: '#3b82f6' },
];

const RAW_RECORDS = [
  {
    tag: 'Pulsecode',
    date: '2026-09-15',
    details: 'Give loan',
    comments: 'Loan given to Pulsecode',
    amount: 1500.0,
    category: 'Loan Given (Receivable)',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-17',
    details: 'Bike oil',
    comments: 'SHQ',
    amount: 150.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-18',
    details: 'Lunch',
    comments: 'Total bill 480 / Taka out 380',
    amount: 380.0,
    category: 'Food & Lunch',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-20',
    details: 'Sil + brocheare',
    comments: 'Seal and brochure printing',
    amount: 1500.0,
    category: 'Seal & Brochure (Marketing)',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-22',
    details: 'Company reg',
    comments: 'sole proprietorship',
    amount: 5000.0,
    category: 'Company Registration',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-25',
    details: 'sil',
    comments: 'bike oil',
    amount: 150.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-09-30',
    details: 'bike oil',
    comments: '29-30 trik',
    amount: 150.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-10-05',
    details: 'bike oil',
    comments: 'SHQ',
    amount: 170.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-10-12',
    details: 'bike oil',
    comments: 'SHQ',
    amount: 170.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-10-19',
    details: 'bike oil',
    comments: 'SHQ',
    amount: 170.0,
    category: 'Transportation & Bike Oil',
  },
  {
    tag: 'Pulsecode',
    date: '2026-11-05',
    details: 'for Course',
    comments: '2000 TK course payment',
    amount: 1000.0,
    category: 'Course & Education',
  },
  {
    tag: 'Rifat',
    date: '2026-10-20',
    details: 'Taka out (Loan)',
    comments: 'Loan to Rifat',
    amount: 2000.0,
    category: 'Loan Given (Receivable)',
  },
  {
    tag: 'Rifat',
    date: '2026-10-26',
    details: 'Taka out (Loan)',
    comments: 'Additional payment to Rifat',
    amount: 500.0,
    category: 'Loan Given (Receivable)',
  },
];

function seedDatabase(force = false) {
  const countObj = db.prepare('SELECT count(*) as count FROM accounts').get();
  const txCountObj = db.prepare('SELECT count(*) as count FROM transactions').get();

  // If already seeded and not force, only check if transactions are missing
  if (countObj.count > 0 && txCountObj.count > 0 && !force) {
    return;
  }

  // Clear existing
  db.exec('DELETE FROM transactions;');
  db.exec('DELETE FROM budgets;');
  db.exec('DELETE FROM debt_goals;');
  db.exec('DELETE FROM accounts;');
  db.exec('DELETE FROM categories;');

  // 1. Insert Categories
  const catMap = {};
  const insertCat = db.prepare('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)');
  for (const c of DEFAULT_CATEGORIES) {
    const res = insertCat.run(c.name, c.type, c.icon, c.color);
    catMap[c.name] = Number(res.lastInsertRowid);
  }

  // 2. Insert Accounts
  const insertAcc = db.prepare(`
    INSERT INTO accounts (name, type, initial_balance, current_balance, currency, icon, color, is_liability, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const accCash = insertAcc.run(
    'Cash Wallet', 'cash', 0.0, 0.0, 'BDT', 'banknote', '#f59e0b', 0, 'Primary cash account'
  );
  const cashWalletId = Number(accCash.lastInsertRowid);

  insertAcc.run(
    'Main Bank Account', 'checking', 0.0, 0.0, 'BDT', 'landmark', '#2563eb', 0, 'Bank account for online & card transactions'
  );
  insertAcc.run(
    'bKash', 'cash', 0.0, 0.0, 'BDT', 'wallet', '#ec4899', 0, 'bKash mobile financial service account'
  );
  insertAcc.run(
    'Nagad', 'cash', 0.0, 0.0, 'BDT', 'wallet', '#ea580c', 0, 'Nagad mobile financial service account'
  );

  // 3. Insert 13 records from user ledger
  const insertTx = db.prepare(`
    INSERT INTO transactions (account_id, category_id, type, amount, date, payee, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of RAW_RECORDS) {
    const payeeLabel = `[${item.tag}] ${item.details}`;
    const catId = catMap[item.category] || null;
    insertTx.run(
      cashWalletId,
      catId,
      'expense',
      item.amount,
      item.date,
      payeeLabel,
      item.comments
    );
  }

  // Recalculate balances
  updateAccountBalance(cashWalletId);

  // 4. Insert Debt & Receivable Goals for Pulsecode & Rifat
  const insertDebt = db.prepare(`
    INSERT INTO debt_goals (title, type, counterparty, total_amount, paid_amount, due_date, interest_rate, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDebt.run(
    'Loan to Pulsecode',
    'they_owe_me',
    'Pulsecode',
    1500.0,
    0.0,
    '2026-12-31',
    0.0,
    'Give loan (Initial 1500 TK)',
    'active'
  );

  insertDebt.run(
    'Loan to Rifat',
    'they_owe_me',
    'Rifat',
    2500.0,
    0.0,
    '2026-12-31',
    0.0,
    'Taka out (2000 + 500 TK on 26/10/26)',
    'active'
  );

  console.log('✓ Seeding complete: Accounts, categories, transactions, and receivables created.');
}

module.exports = { seedDatabase };

