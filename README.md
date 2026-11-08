# Affan Accounting OS — Personal Accounting & Wealth System

A modern, full-stack personal accounting and wealth management system built with **Node.js**, **Express**, **SQLite (native DatabaseSync)**, and **React 19 + TypeScript + Vite + Tailwind CSS**.

---

## 🌟 Key Features

1. **Dashboard & Financial Ledger**:
   - Real-time **Net Worth** tracking (Total Assets vs. Total Liabilities).
   - Bangladeshi Taka (`৳ BDT`) currency support.
   - Monthly cash flow metrics: Total Income, Total Expenses, Net Savings, and Savings Rate (%).
   - Interactive 6-month & 12-month Income vs. Expense charts.
   - Category expense distribution breakdown.

2. **Accounts & Mobile Wallets**:
   - Manage Cash Wallet, Main Bank Account, bKash, and Nagad.
   - Automatic balance reconciliation based on income, expenses, and inter-account transfers.

3. **Transaction Tracking**:
   - Taka Out (Expense), Taka In (Income), Transfer, Receivable, and Payable.
   - Fast filtering by account, category, type, and live search.
   - **CSV Export & Import**: Seamlessly export records or upload CSV bank statements.

4. **Debts & Receivables Tracker**:
   - Track receivables (money others owe you, e.g. Pulsecode, Rifat) and payables (money you owe).
   - Real-time balance settlements and status tracking.

5. **Daily 10:00 PM Notifications**:
   - Automated daily notification reminder with mobile audio and browser alerts.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
npm --prefix frontend install
```

### 2. Run Locally (Backend + Frontend)
```bash
npm run dev
```

- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://127.0.0.1:8000/api`

### 3. Build for Production / Vercel
```bash
npm run build
```

---

## 📁 Project Architecture

```
personal accounting soft/
├── api/                    # Vercel serverless entry point
│   └── index.js
├── backend/                # Pure Node.js Express & SQLite Backend
│   ├── db.js               # Database schema & balance recalculation
│   ├── seed.js             # Seeding initial wallets, categories & transactions
│   ├── analytics.js        # Cashflow, trends, summaries
│   ├── routes.js           # REST API endpoints
│   └── server.js           # Express app entry point
├── frontend/               # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # UI Views & Modals
│   │   ├── context/        # Currency context (BDT / USD)
│   │   ├── services/       # Notification & API services
│   │   └── App.tsx
│   └── package.json
├── package.json            # Unified scripts & backend dependencies
├── vercel.json             # Vercel serverless + SPA rewrites
└── README.md               # Project documentation
```

