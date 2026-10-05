# KhataFlow — Hisaab rakho. Sukoon rakho.

> **Your money. Your record. Your control.**

KhataFlow is a modern, production-grade personal finance and khata ledger web application designed to bridge sleek modern FinTech dashboards with student/personal cash tracking and ethical custody accounting.

---

## 🌟 The Three Core Financial Pillars

KhataFlow strictly enforces separation between three distinct financial systems:

1. 🟢 **PERSONAL MONEY**
   - Personal Income, Expenses, and Savings.
   - Available Balance = Total Personal Income - Total Personal Expenses.

2. 🟠 **FRIENDS & UDHAAR**
   - **You Will Receive**: Money lent out to friends that they owe back to you.
   - **You Will Pay**: Money borrowed from friends that you owe.
   - Individual ledgers, partial settlements, full settlements, and balance updates.

3. 🔵 **MONEY VAULT (AMANAT SAFEKEEPING)**
   - Money belonging to other people that is temporarily placed in your trust.
   - **Strict Accounting Rule**: This money is **NEVER** personal income, **NEVER** an expense, and **NEVER** personal savings.
   - Tracked per individual: Deposited, Returned, and Remaining Balance.
   - Over-return protection: The system strictly prevents returning more than the currently held balance.
   - Dedicated **Money Custody Report (PDF)**.

---

## 🚀 Key Features

- **Dashboard**:
  - Live Available Balance (`Rs. 18,450`), Income (`Rs. 30,000`), Expenses (`Rs. 11,550`), Friends Receivable (`Rs. 2,300`), Friends Payable (`Rs. 1,200`), and Money Vault (`Rs. 7,500 / 18,000`).
  - Donut expense breakdown by category with percentage shares.
  - Recent transactions timeline with semantic colored tags.
  - Quick action shortcuts.

- **Quick Add System (+ Add Button)**:
  - 💸 **Expense**: Fast personal expense logging.
  - 💰 **Income**: Personal earnings credit.
  - 🤝 **Udhaar**: Lending money to a friend.
  - 👥 **Friend Payment**: Debt payments & settlements.
  - 🔐 **Money Received**: Custody deposit into Money Vault.
  - ↩️ **Money Returned**: Returning safekeeping money to its owner.

- **Transactions History**:
  - Multi-criteria filtering by Type, Category, Month, Year, and Search query.
  - Sort by Newest, Oldest, Highest, and Lowest amount.
  - View details modal and safe delete with confirmation modal.

- **Friends & Udhaar Ledger**:
  - "You Will Receive" vs "You Will Pay" accounts.
  - One-click "Mark as Settled ✓" with celebratory confetti.
  - Support for partial debt payments.

- **Money Vault & Custody**:
  - Person-specific custody ledgers (e.g. Ahmed, Ali, Usman).
  - One-click downloadable **Money Custody PDF Report** with legal custody disclaimers.

- **Daily Hisaab**:
  - Day-by-day calendar navigation.
  - Separate categorization for Personal Money, Friends & Udhaar, and Vault activity.

- **Monthly & Yearly Reports**:
  - 12-month period selector (closed, active, current).
  - Snapshot closing (locks monthly accounts).
  - Annual summary, highest spending month, lowest spending month, and 12-month progression chart.
  - One-click **Download Monthly PDF** and **Download Yearly PDF**.

- **Theme & Design**:
  - **Design 1 (Light)**: Clean, calm, emerald and productive.
  - **Design 2 (Dark)**: Modern, stylish cyber FinTech with vibrant semantic neon indicators.
  - Switch anytime via the sun/moon button in the top header or Settings.

- **Backup & Portability**:
  - Export offline JSON backup of all ledgers.
  - Restore backup JSON.
  - Reset to original demo data.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Pure modern CSS with custom design tokens & CSS variables
- **Icons**: Lucide React
- **Reports**: jsPDF & jsPDF-AutoTable
- **Celebrations**: Canvas-Confetti

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
