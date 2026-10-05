import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Lock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { generateMonthlyReportPDF } from '../utils/pdfGenerator';
import { ViewType } from '../types';

interface MonthlyReportPageProps {
  onNavigate?: (view: ViewType) => void;
}

export const MonthlyReportPage: React.FC<MonthlyReportPageProps> = ({ onNavigate }) => {
  const {
    transactions,
    monthlySnapshots,
    closeMonth,
    summary,
  } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // October

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // Check if month is already closed
  const existingSnapshot = monthlySnapshots.find(
    (s) => s.year === selectedYear && s.month === selectedMonth
  );

  // Month's personal transactions (Vault strictly excluded)
  const monthTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.date.startsWith(currentMonthKey) && (t.type === 'income' || t.type === 'expense')
    );
  }, [transactions, currentMonthKey]);

  // Calculations
  const monthIncome = useMemo(() => {
    if (existingSnapshot && existingSnapshot.isClosed) {
      return existingSnapshot.income;
    }
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
  }, [monthTransactions, existingSnapshot]);

  const monthExpenses = useMemo(() => {
    if (existingSnapshot && existingSnapshot.isClosed) {
      return existingSnapshot.expenses;
    }
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
  }, [monthTransactions, existingSnapshot]);

  const monthRemaining = monthIncome - monthExpenses;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: { [c: string]: number } = {};
    for (const t of monthTransactions) {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: monthExpenses > 0 ? Math.round((amount / monthExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, monthExpenses]);

  // Handle PDF Export
  const handleDownloadPDF = () => {
    generateMonthlyReportPDF({
      monthName: `${monthNames[selectedMonth - 1]} ${selectedYear}`,
      year: selectedYear,
      month: selectedMonth,
      currency,
      userName: user?.name || 'Abulrehman',
      totalIncome: monthIncome,
      totalExpenses: monthExpenses,
      savings: monthRemaining,
      friendsReceivable: summary.friendsReceivable,
      friendsPayable: summary.friendsPayable,
      vaultTotalHeld: summary.vaultTotalHeld,
      categoryBreakdown,
      transactions: monthTransactions,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Monthly Report</h1>
          <div className="tagline-banner">
            A month of money, in one view. From the first rupee to the last.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!existingSnapshot?.isClosed && (
            <button
              onClick={() => closeMonth(selectedYear, selectedMonth)}
              className="btn btn-secondary btn-sm"
              title="Close month & save snapshot"
            >
              <CheckCircle2 size={16} />
              <span>Close & Lock Month</span>
            </button>
          )}

          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Month Selector Grid (Section 18) */}
      <div className="kf-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Select Accounting Period — Year {selectedYear}
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="form-select"
            style={{ width: '100px', padding: '4px 8px', fontSize: '0.84rem' }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            gap: '8px',
          }}
        >
          {monthNames.map((name, idx) => {
            const mNum = idx + 1;
            const isSelected = selectedMonth === mNum;
            const isCurrent = selectedYear === 2026 && mNum === 10;
            const isPastClosed = monthlySnapshots.some((s) => s.year === selectedYear && s.month === mNum);
            const isFuture = selectedYear === 2026 && mNum > 10;

            return (
              <button
                key={name}
                onClick={() => setSelectedMonth(mNum)}
                style={{
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--personal-primary)' : '1px solid var(--border-color)',
                  backgroundColor: isSelected
                    ? 'var(--personal-light)'
                    : 'var(--bg-card)',
                  color: isSelected ? 'var(--personal-primary)' : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                  {name.slice(0, 3)}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {isCurrent ? '● Current' : isPastClosed ? '✓ Closed' : isFuture ? '— Future' : 'Active'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot status notice */}
      {existingSnapshot?.isClosed && (
        <div
          style={{
            backgroundColor: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
          }}
        >
          <Lock size={16} color="var(--personal-primary)" />
          <span>
            <strong>{monthNames[selectedMonth - 1]} {selectedYear}</strong> was closed on{' '}
            {existingSnapshot.closedAt ? new Date(existingSnapshot.closedAt).toLocaleDateString() : 'End of Month'}. Historical data is safely archived.
          </span>
        </div>
      )}

      {/* 1. PERSONAL FINANCE PILLAR */}
      <div className="kf-card" style={{ borderLeft: '4px solid var(--personal-primary)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>1. Personal Finance Statement</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Personal income minus expenses for {monthNames[selectedMonth - 1]} {selectedYear}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Money Received (Income)</div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--personal-primary)', marginTop: '4px' }}>
              {currency} {monthIncome.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Expenses</div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--expense-primary)', marginTop: '4px' }}>
              {currency} {monthExpenses.toLocaleString()}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--personal-light)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--personal-text)' }}>Net Remaining / Savings</div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--personal-text)', marginTop: '4px' }}>
              {currency} {monthRemaining.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPENSE BREAKDOWN */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>2. Expense Breakdown</h3>

        {categoryBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            No expenses recorded for this month.
          </div>
        ) : (
          <div className="table-container">
            <table className="kf-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((item) => (
                  <tr key={item.category}>
                    <td style={{ fontWeight: 600 }}>{item.category}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {currency} {item.amount.toLocaleString()}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. FRIENDS & MONEY VAULT STATUSES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Friends Status */}
        <div className="kf-card" style={{ borderLeft: '4px solid var(--friends-primary)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>3. Friend Settlements</h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Current outstanding receivables and payables
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>You will receive:</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--friends-primary)' }}>
                {currency} {summary.friendsReceivable.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>You will pay:</span>
              <span className="mono" style={{ fontWeight: 700, color: '#ea580c' }}>
                {currency} {summary.friendsPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Amanat Link Card */}
        <div className="kf-card" style={{ borderLeft: '4px solid var(--vault-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} color="var(--vault-primary)" />
              Amanat / Safekeeping Audit
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Money held for others is completely separated from your personal monthly finances.
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
              Currently holding <strong>{currency} {summary.vaultTotalHeld.toLocaleString()}</strong> in trust across {summary.vaultPeopleCount} custodians.
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            {onNavigate && (
              <button
                onClick={() => onNavigate('custody-report')}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderColor: 'var(--vault-primary)', color: 'var(--vault-primary)' }}
              >
                View Dedicated Amanat Report →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Month Transactions List */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Month Transactions</h3>
        <div className="table-container">
          <table className="kf-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No transactions recorded for this month.
                  </td>
                </tr>
              ) : (
                monthTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.description}</td>
                    <td>{tx.category}</td>
                    <td
                      className="mono"
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.type === 'income' ? 'var(--personal-primary)' : 'var(--expense-primary)',
                      }}
                    >
                      {tx.type === 'expense' ? '-' : '+'}{currency} {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
