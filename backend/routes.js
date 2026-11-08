const express = require('express');
const multer = require('multer');
const { exec } = require('node:child_process');
const { db, updateAccountBalance } = require('./db');
const { seedDatabase } = require('./seed');
const {
  getFinancialSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getRecentCashflow,
} = require('./analytics');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Health ---
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Affan Accounting Engine (Node.js)' });
});

// --- Summary & Analytics ---
router.get('/summary', (req, res) => {
  try {
    const summary = getFinancialSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/monthly', (req, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months, 10) : 6;
    res.json(getMonthlyTrends(months));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/category-breakdown', (req, res) => {
  try {
    res.json(getCategoryBreakdown(req.query.month));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/cashflow', (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days, 10) : 30;
    res.json(getRecentCashflow(days));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Accounts ---
router.get('/accounts', (req, res) => {
  try {
    const accounts = db.prepare('SELECT * FROM accounts ORDER BY id ASC').all();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accounts', (req, res) => {
  try {
    const {
      name,
      type = 'checking',
      initial_balance = 0.0,
      currency = 'BDT',
      icon = 'wallet',
      color = '#3b82f6',
      is_liability = false,
      notes = '',
    } = req.body;

    const liabilityVal = (is_liability || type === 'credit_card' || type === 'loan') ? 1 : 0;
    const insert = db.prepare(`
      INSERT INTO accounts (name, type, initial_balance, current_balance, currency, icon, color, is_liability, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      type,
      Number(initial_balance) || 0.0,
      Number(initial_balance) || 0.0,
      currency,
      icon,
      color,
      liabilityVal,
      notes
    );

    const created = db.prepare('SELECT * FROM accounts WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/accounts/:id', (req, res) => {
  try {
    const accId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accId);
    if (!existing) {
      return res.status(404).json({ detail: 'Account not found' });
    }

    const {
      name = existing.name,
      type = existing.type,
      initial_balance = existing.initial_balance,
      currency = existing.currency,
      icon = existing.icon,
      color = existing.color,
      is_liability = existing.is_liability,
      notes = existing.notes,
    } = req.body;

    db.prepare(`
      UPDATE accounts 
      SET name = ?, type = ?, initial_balance = ?, currency = ?, icon = ?, color = ?, is_liability = ?, notes = ?
      WHERE id = ?
    `).run(
      name,
      type,
      Number(initial_balance),
      currency,
      icon,
      color,
      is_liability ? 1 : 0,
      notes,
      accId
    );

    updateAccountBalance(accId);
    const updated = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/accounts/:id', (req, res) => {
  try {
    const accId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accId);
    if (!existing) {
      return res.status(404).json({ detail: 'Account not found' });
    }

    db.prepare('DELETE FROM accounts WHERE id = ?').run(accId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Categories ---
router.get('/categories', (req, res) => {
  try {
    const { type } = req.query;
    let categories;
    if (type) {
      categories = db.prepare('SELECT * FROM categories WHERE type = ? ORDER BY id ASC').all(type);
    } else {
      categories = db.prepare('SELECT * FROM categories ORDER BY id ASC').all();
    }
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', (req, res) => {
  try {
    const { name, type, icon = 'tag', color = '#10b981' } = req.body;
    const result = db.prepare(`
      INSERT INTO categories (name, type, icon, color)
      VALUES (?, ?, ?, ?)
    `).run(name, type, icon, color);

    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', (req, res) => {
  try {
    const catId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(catId);
    if (!existing) {
      return res.status(404).json({ detail: 'Category not found' });
    }
    db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Transactions ---
router.get('/transactions', (req, res) => {
  try {
    const {
      account_id,
      category_id,
      type,
      start_date,
      end_date,
      search,
      limit = 100,
      offset = 0,
    } = req.query;

    let whereClauses = [];
    let params = [];

    if (account_id) {
      whereClauses.push('(t.account_id = ? OR t.to_account_id = ?)');
      params.push(account_id, account_id);
    }
    if (category_id) {
      whereClauses.push('t.category_id = ?');
      params.push(category_id);
    }
    if (type) {
      whereClauses.push('t.type = ?');
      params.push(type);
    }
    if (start_date) {
      whereClauses.push('t.date >= ?');
      params.push(start_date);
    }
    if (end_date) {
      whereClauses.push('t.date <= ?');
      params.push(end_date);
    }
    if (search) {
      whereClauses.push('(t.payee LIKE ? OR t.notes LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = db.prepare(`SELECT count(*) as count FROM transactions t ${whereSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    const limitVal = parseInt(limit, 10) || 100;
    const offsetVal = parseInt(offset, 10) || 0;

    const querySql = `
      SELECT 
        t.*,
        a.name as account_name,
        c.name as category_name,
        toa.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN accounts toa ON toa.id = t.to_account_id
      ${whereSql}
      ORDER BY t.date DESC, t.id DESC
      LIMIT ? OFFSET ?
    `;

    const items = db.prepare(querySql).all(...params, limitVal, offsetVal);

    // Format category_name for transfers
    const formattedItems = items.map((t) => ({
      ...t,
      category_name: t.category_name || (t.type === 'transfer' ? 'Transfer' : null),
    }));

    res.json({ items: formattedItems, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transactions', (req, res) => {
  try {
    const {
      account_id,
      category_id = null,
      to_account_id = null,
      type,
      amount,
      date,
      payee = '',
      notes = '',
    } = req.body;

    const result = db.prepare(`
      INSERT INTO transactions (account_id, category_id, to_account_id, type, amount, date, payee, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      account_id,
      category_id || null,
      to_account_id || null,
      type,
      Number(amount),
      date,
      payee,
      notes
    );

    const txId = Number(result.lastInsertRowid);
    updateAccountBalance(account_id);
    if (to_account_id) {
      updateAccountBalance(to_account_id);
    }

    const created = db.prepare(`
      SELECT t.*, a.name as account_name, c.name as category_name, toa.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN accounts toa ON toa.id = t.to_account_id
      WHERE t.id = ?
    `).get(txId);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/transactions/:id', (req, res) => {
  try {
    const txId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    if (!existing) {
      return res.status(404).json({ detail: 'Transaction not found' });
    }

    const oldAccountId = existing.account_id;
    const oldToAccountId = existing.to_account_id;

    const {
      account_id = existing.account_id,
      category_id = existing.category_id,
      to_account_id = existing.to_account_id,
      type = existing.type,
      amount = existing.amount,
      date = existing.date,
      payee = existing.payee,
      notes = existing.notes,
    } = req.body;

    db.prepare(`
      UPDATE transactions
      SET account_id = ?, category_id = ?, to_account_id = ?, type = ?, amount = ?, date = ?, payee = ?, notes = ?
      WHERE id = ?
    `).run(
      account_id,
      category_id || null,
      to_account_id || null,
      type,
      Number(amount),
      date,
      payee,
      notes,
      txId
    );

    updateAccountBalance(oldAccountId);
    if (oldToAccountId) updateAccountBalance(oldToAccountId);
    if (account_id !== oldAccountId) updateAccountBalance(account_id);
    if (to_account_id && to_account_id !== oldToAccountId) updateAccountBalance(to_account_id);

    const updated = db.prepare(`
      SELECT t.*, a.name as account_name, c.name as category_name, toa.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN accounts toa ON toa.id = t.to_account_id
      WHERE t.id = ?
    `).get(txId);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/transactions/:id', (req, res) => {
  try {
    const txId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(txId);
    if (!existing) {
      return res.status(404).json({ detail: 'Transaction not found' });
    }

    const { account_id, to_account_id } = existing;
    db.prepare('DELETE FROM transactions WHERE id = ?').run(txId);

    updateAccountBalance(account_id);
    if (to_account_id) updateAccountBalance(to_account_id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Budgets ---
router.get('/budgets', (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budgets = db.prepare(`
      SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
    `).all();

    const result = budgets.map((b) => {
      const spentRow = db.prepare(`
        SELECT COALESCE(SUM(amount), 0.0) as spent
        FROM transactions
        WHERE category_id = ? AND type = 'expense' AND date LIKE ?
      `).get(b.category_id, `${month}%`);

      const spent = spentRow ? spentRow.spent : 0.0;
      const remaining = b.amount - spent;
      const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0.0;

      return {
        id: b.id,
        category_id: b.category_id,
        category: {
          id: b.category_id,
          name: b.category_name,
          color: b.category_color,
          icon: b.category_icon,
        },
        amount: b.amount,
        period: b.period,
        spent: Number(spent.toFixed(2)),
        remaining: Number(remaining.toFixed(2)),
        percentage: Number(pct.toFixed(1)),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/budgets', (req, res) => {
  try {
    const { category_id, amount, period = 'monthly' } = req.body;
    const existing = db.prepare('SELECT * FROM budgets WHERE category_id = ?').get(category_id);

    if (existing) {
      db.prepare('UPDATE budgets SET amount = ?, period = ? WHERE id = ?').run(
        Number(amount),
        period,
        existing.id
      );
      const updated = db.prepare('SELECT * FROM budgets WHERE id = ?').get(existing.id);
      return res.json(updated);
    }

    const result = db.prepare('INSERT INTO budgets (category_id, amount, period) VALUES (?, ?, ?)').run(
      category_id,
      Number(amount),
      period
    );
    const created = db.prepare('SELECT * FROM budgets WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/budgets/:id', (req, res) => {
  try {
    const budgetId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM budgets WHERE id = ?').get(budgetId);
    if (!existing) {
      return res.status(404).json({ detail: 'Budget not found' });
    }
    db.prepare('DELETE FROM budgets WHERE id = ?').run(budgetId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Debts / Loans ---
router.get('/debts', (req, res) => {
  try {
    const debts = db.prepare('SELECT * FROM debt_goals ORDER BY id ASC').all();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/debts', (req, res) => {
  try {
    const {
      title,
      type,
      counterparty = '',
      total_amount,
      paid_amount = 0.0,
      due_date = null,
      interest_rate = 0.0,
      notes = '',
      status = 'active',
    } = req.body;

    const result = db.prepare(`
      INSERT INTO debt_goals (title, type, counterparty, total_amount, paid_amount, due_date, interest_rate, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      type,
      counterparty,
      Number(total_amount),
      Number(paid_amount) || 0.0,
      due_date,
      Number(interest_rate) || 0.0,
      notes,
      status
    );

    const created = db.prepare('SELECT * FROM debt_goals WHERE id = ?').get(Number(result.lastInsertRowid));
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/debts/:id', (req, res) => {
  try {
    const debtId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM debt_goals WHERE id = ?').get(debtId);
    if (!existing) {
      return res.status(404).json({ detail: 'Debt not found' });
    }

    const {
      title = existing.title,
      type = existing.type,
      counterparty = existing.counterparty,
      total_amount = existing.total_amount,
      paid_amount = existing.paid_amount,
      due_date = existing.due_date,
      interest_rate = existing.interest_rate,
      notes = existing.notes,
      status = existing.status,
    } = req.body;

    const newPaid = Number(paid_amount);
    const newTotal = Number(total_amount);
    const finalStatus = newPaid >= newTotal ? 'completed' : status;

    db.prepare(`
      UPDATE debt_goals
      SET title = ?, type = ?, counterparty = ?, total_amount = ?, paid_amount = ?, due_date = ?, interest_rate = ?, notes = ?, status = ?
      WHERE id = ?
    `).run(
      title,
      type,
      counterparty,
      newTotal,
      newPaid,
      due_date,
      Number(interest_rate),
      notes,
      finalStatus,
      debtId
    );

    const updated = db.prepare('SELECT * FROM debt_goals WHERE id = ?').get(debtId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/debts/:id', (req, res) => {
  try {
    const debtId = parseInt(req.params.id, 10);
    const existing = db.prepare('SELECT * FROM debt_goals WHERE id = ?').get(debtId);
    if (!existing) {
      return res.status(404).json({ detail: 'Debt not found' });
    }
    db.prepare('DELETE FROM debt_goals WHERE id = ?').run(debtId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CSV Export & Import ---
router.get('/export/csv', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT 
        t.id, t.date, t.type, t.amount, t.payee, t.notes,
        a.name as account_name,
        c.name as category_name,
        toa.name as to_account_name
      FROM transactions t
      LEFT JOIN accounts a ON a.id = t.account_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN accounts toa ON toa.id = t.to_account_id
      ORDER BY t.date DESC, t.id DESC
    `).all();

    let csvContent = 'ID,Date,Type,Amount,Payee,Category,Account,To Account,Notes\n';
    for (const t of transactions) {
      const row = [
        t.id,
        t.date,
        t.type,
        t.amount,
        `"${(t.payee || '').replace(/"/g, '""')}"`,
        `"${(t.category_name || (t.type === 'transfer' ? 'Transfer' : '')).replace(/"/g, '""')}"`,
        `"${(t.account_name || '').replace(/"/g, '""')}"`,
        `"${(t.to_account_name || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ];
      csvContent += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import/csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No CSV file uploaded' });
    }

    const content = req.file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return res.json({ imported: 0 });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    const accounts = db.prepare('SELECT id, name FROM accounts').all();
    const categories = db.prepare('SELECT id, name FROM categories').all();

    const accMap = {};
    for (const a of accounts) accMap[a.name.toLowerCase()] = a.id;
    const catMap = {};
    for (const c of categories) catMap[c.name.toLowerCase()] = c.id;

    const defaultAccId = accounts.length > 0 ? accounts[0].id : null;
    if (!defaultAccId) {
      return res.status(400).json({ detail: 'Please create an account first' });
    }

    let count = 0;
    const insertTx = db.prepare(`
      INSERT INTO transactions (account_id, category_id, type, amount, date, payee, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length < 3) continue;

      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });

      const date = row.date || new Date().toISOString().split('T')[0];
      const amtStr = (row.amount || '0').replace(/[^0-9.-]/g, '');
      const amount = Math.abs(parseFloat(amtStr)) || 0;
      if (amount <= 0) continue;

      let type = (row.type || 'expense').toLowerCase();
      if (!['income', 'expense', 'transfer'].includes(type)) type = 'expense';

      const payee = row.payee || row.description || 'Imported Entry';
      const catId = catMap[(row.category || '').toLowerCase()] || null;
      const accId = accMap[(row.account || '').toLowerCase()] || defaultAccId;
      const notes = row.notes || '';

      insertTx.run(accId, catId, type, amount, date, payee, notes);
      updateAccountBalance(accId);
      count++;
    }

    res.json({ imported: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Seed Reset ---
router.post('/seed/reset', (req, res) => {
  try {
    seedDatabase(true);
    res.json({ message: 'Database reset to sample demo data' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Windows Native Toast Notification ---
router.post('/notifications/test', (req, res) => {
  const psScript = `
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    $xml = @"
    <toast>
      <visual>
        <binding template="ToastGeneric">
          <text>Affan Accounting OS</text>
          <text>Daily Reminder: Time to record today's transactions and keep your accounts balanced.</text>
        </binding>
      </visual>
      <audio src="ms-winsoundevent:Notification.Default" />
    </toast>
"@
    $toastXml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $toastXml.LoadXml($xml)
    $toast = [Windows.UI.Notifications.ToastNotification]::new($toastXml)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Affan Accounting OS").Show($toast)
  `;

  exec(`powershell -NoProfile -Command "${psScript.replace(/\r?\n/g, ' ')}"`, (err) => {
    if (err) {
      console.warn('PowerShell toast notification fallback error:', err.message);
    }
  });

  res.json({ status: 'ok', sent: true });
});

module.exports = router;

