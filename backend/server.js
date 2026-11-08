const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');
const { seedDatabase } = require('./seed');
const apiRoutes = require('./routes');

const app = express();

// Initialize DB schema & seed initial state if needed
initDatabase();
seedDatabase(false);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Root health ping
app.get('/', (req, res) => {
  res.json({
    name: 'Affan Accounting Engine (Node.js)',
    status: 'running',
    version: '1.0.0',
    endpoints: '/api/summary, /api/transactions, /api/accounts, /api/debts, /api/budgets',
  });
});

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`✓ Affan Accounting Node.js Backend is running!`);
    console.log(`✓ API URL: http://127.0.0.1:${PORT}/api`);
    console.log(`✓ Database: SQLite (Node.js native DatabaseSync)`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

