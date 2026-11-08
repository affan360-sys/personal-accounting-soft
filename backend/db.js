const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure database directory exists
const dbDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// On Vercel / serverless environments, writable path is /tmp
const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
const dbPath = isVercel 
  ? path.join('/tmp', 'accounting.db') 
  : path.resolve(__dirname, 'accounting.db');

const db = new DatabaseSync(dbPath);

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'checking',
      initial_balance REAL DEFAULT 0.0,
      current_balance REAL DEFAULT 0.0,
      currency TEXT DEFAULT 'BDT',
      icon TEXT DEFAULT 'wallet',
      color TEXT DEFAULT '#3b82f6',
      is_liability INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT DEFAULT 'tag',
      color TEXT DEFAULT '#10b981'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      category_id INTEGER,
      to_account_id INTEGER,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payee TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL UNIQUE,
      amount REAL NOT NULL,
      period TEXT DEFAULT 'monthly',
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS debt_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      counterparty TEXT,
      total_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0.0,
      due_date TEXT,
      interest_rate REAL DEFAULT 0.0,
      notes TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function updateAccountBalance(accountId) {
  if (!accountId) return;
  const acc = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);
  if (!acc) return;

  const inc = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum 
    FROM transactions 
    WHERE account_id = ? AND type = 'income'
  `).get(accountId).sum || 0;

  const transIn = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum 
    FROM transactions 
    WHERE to_account_id = ? AND type = 'transfer'
  `).get(accountId).sum || 0;

  const exp = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum 
    FROM transactions 
    WHERE account_id = ? AND type = 'expense'
  `).get(accountId).sum || 0;

  const transOut = db.prepare(`
    SELECT COALESCE(SUM(amount), 0.0) as sum 
    FROM transactions 
    WHERE account_id = ? AND type = 'transfer'
  `).get(accountId).sum || 0;

  let newBalance = 0;
  if (acc.is_liability) {
    newBalance = (acc.initial_balance || 0) + exp + transOut - inc - transIn;
  } else {
    newBalance = (acc.initial_balance || 0) + inc + transIn - exp - transOut;
  }

  db.prepare('UPDATE accounts SET current_balance = ? WHERE id = ?').run(newBalance, accountId);
}

module.exports = {
  db,
  initDatabase,
  updateAccountBalance,
};

