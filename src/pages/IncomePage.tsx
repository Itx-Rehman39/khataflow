import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Briefcase,
  Users,
  Laptop,
  TrendingUp as TrendingUpIcon,
  ShieldAlert,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { TransactionType } from '../types';

interface IncomePageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const IncomePage: React.FC<IncomePageProps> = ({ onOpenQuickAdd }) => {
  const { transactions } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('10'); // October

  const monthKey = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;

  const monthIncome = useMemo(() => {
    return transactions.filter(
      (tx) => tx.type === 'income' && tx.date.startsWith(monthKey)
    );
  }, [transactions, monthKey]);

  const totalAllTimeIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthTotal = useMemo(() => {
    return monthIncome.reduce((sum, t) => sum + t.amount, 0);
  }, [monthIncome]);

  // Income sources breakdown
  const sourceStats = useMemo(() => {
    const map: { [src: string]: number } = {};
    for (const tx of monthIncome) {
      map[tx.category] = (map[tx.category] || 0) + tx.amount;
    }

    return Object.entries(map).map(([name, amt]) => ({
      name,
      amount: amt,
      percentage: monthTotal > 0 ? Math.round((amt / monthTotal) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [monthIncome, monthTotal]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Income</h1>
          <div className="tagline-banner">Know what comes in. Every incoming rupee counts.</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select"
            style={{ width: '100px', padding: '7px 10px', fontSize: '0.85rem' }}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

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

          <button onClick={() => onOpenQuickAdd('income')} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Strict Separation Notice */}
      <div
        style={{
          backgroundColor: 'var(--personal-light)',
          border: '1px solid var(--personal-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <ShieldAlert size={20} color="var(--personal-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: 'var(--personal-text)' }}>
          <strong>Core Financial Rule Enforced:</strong> This section displays personal earned income only.
          Money received from others for safekeeping (Money Vault) is strictly excluded and does not inflate your income.
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="kf-card" style={{ borderLeft: '4px solid var(--personal-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear} Income
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--personal-primary)', marginTop: '4px' }}>
            {currency} {monthTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            {monthIncome.length} incoming credits recorded
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid #059669' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Recorded Income
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {currency} {totalAllTimeIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Personal lifetime earnings tracked
          </div>
        </div>
      </div>

      {/* Income Sources Grid */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Income Sources</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Breakdown of income channels for {monthNames[parseInt(selectedMonth, 10) - 1]} {selectedYear}
        </div>

        {sourceStats.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <div className="empty-state-title">No income recorded for this period</div>
            <div className="empty-state-desc">Add your salary, freelance earnings, or family allowances.</div>
            <button onClick={() => onOpenQuickAdd('income')} className="btn btn-primary btn-sm">
              Record Income
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {sourceStats.map((src) => (
              <div
                key={src.name}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{src.name}</span>
                  <span className="badge badge-personal">{src.percentage}%</span>
                </div>
                <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--personal-primary)', marginTop: '8px' }}>
                  {currency} {src.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income Transactions Table */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Income Log</h3>
        <div className="table-container">
          <table className="kf-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Source / Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {monthIncome.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No income transactions found for this month.
                  </td>
                </tr>
              ) : (
                monthIncome.map((tx) => (
                  <tr key={tx.id}>
                    <td className="mono" style={{ fontSize: '0.84rem' }}>{tx.date}</td>
                    <td style={{ fontWeight: 600 }}>{tx.description}</td>
                    <td>
                      <span className="badge badge-personal">{tx.category}</span>
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--personal-primary)' }}>
                      +{currency} {tx.amount.toLocaleString()}
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
