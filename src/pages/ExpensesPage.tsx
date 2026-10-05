import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Calendar,
  Plus,
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  Receipt,
  MoreHorizontal,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { TransactionType } from '../types';

interface ExpensesPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenQuickAdd }) => {
  const { transactions, currentAppDate } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('10'); // October

  // Filter expenses by selected month & year
  const monthKey = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

  const monthExpenses = useMemo(() => {
    return transactions.filter(
      (tx) => tx.type === 'expense' && tx.date.startsWith(monthKey)
    );
  }, [transactions, monthKey]);

  // Overall & Week calculations
  const totalAllTimeExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthTotal = useMemo(() => {
    return monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [monthExpenses]);

  // Current week expenses (last 7 days of active date)
  const weekTotal = useMemo(() => {
    const activeTime = new Date(currentAppDate).getTime();
    const sevenDaysAgo = activeTime - 7 * 24 * 60 * 60 * 1000;
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const txTime = new Date(t.date).getTime();
        return txTime >= sevenDaysAgo && txTime <= activeTime;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentAppDate]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: { [cat: string]: number } = {};
    for (const tx of monthExpenses) {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    }

    const icons: { [key: string]: any } = {
      Food: Utensils,
      Transport: Car,
      Education: GraduationCap,
      Shopping: ShoppingBag,
      Bills: Receipt,
      Other: MoreHorizontal,
    };

    const colors: { [key: string]: string } = {
      Food: '#ef4444',
      Transport: '#f59e0b',
      Education: '#3b82f6',
      Shopping: '#ec4899',
      Bills: '#8b5cf6',
      Other: '#64748b',
    };

    return Object.entries(map).map(([name, amt]) => ({
      name,
      amount: amt,
      percentage: monthTotal > 0 ? Math.round((amt / monthTotal) * 100) : 0,
      icon: icons[name] || MoreHorizontal,
      color: colors[name] || '#10b981',
    })).sort((a, b) => b.amount - a.amount);
  }, [monthExpenses, monthTotal]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Expenses</h1>
          <div className="tagline-banner">Know where your money goes.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select"
            style={{ width: '100px', padding: '7px 10px', fontSize: '0.85rem' }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select"
            style={{ width: '130px', padding: '7px 10px', fontSize: '0.85rem' }}
          >
            {monthNames.map((m, idx) => (
              <option key={m} value={String(idx + 1)}>
                {m}
              </option>
            ))}
          </select>

          <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-danger btn-sm">
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="kf-card" style={{ borderLeft: '4px solid var(--expense-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear} Expenses
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--expense-primary)', marginTop: '4px' }}>
            {currency} {monthTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            {monthExpenses.length} expense transactions in this period
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Current Week Expenses
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {currency} {weekTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Last 7 days spending
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Recorded Expenses
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {currency} {totalAllTimeExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Across all months and years
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Category Breakdown</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Distribution of expenses for {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear}
        </div>

        {categoryStats.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-title">No expenses recorded for this month</div>
            <div className="empty-state-desc">Nothing spent yet. Your first record starts here.</div>
            <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-danger btn-sm">
              Record Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: `${item.color}18`,
                          color: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.percentage}%</span>
                      <span className="mono" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {currency} {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress bar */}
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--bg-card-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                        borderRadius: '999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Month's Expense Transactions */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Expenses Log</h3>
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
              {monthExpenses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No expenses recorded in this month.
                  </td>
                </tr>
              ) : (
                monthExpenses.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.description}</td>
                    <td>
                      <span className="badge badge-expense">{tx.category}</span>
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--expense-primary)' }}>
                      -{currency} {tx.amount.toLocaleString()}
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
