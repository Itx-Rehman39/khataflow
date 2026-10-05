import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  HandCoins,
  Lock,
  Plus,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { TransactionType } from '../types';

interface DailyHisaabPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const DailyHisaabPage: React.FC<DailyHisaabPageProps> = ({ onOpenQuickAdd }) => {
  const {
    transactions,
    friendTransactions,
    friends,
    vaultTransactions,
    vaultPeople,
    currentAppDate,
    setCurrentAppDate,
  } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [activeDate, setActiveDate] = useState<string>(currentAppDate);

  // Navigate day by day
  const handleShiftDay = (delta: number) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + delta);
    const newStr = d.toISOString().split('T')[0];
    setActiveDate(newStr);
    setCurrentAppDate(newStr);
  };

  // Day's transactions filtered cleanly
  const dayPersonalTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.date === activeDate &&
        (t.type === 'expense' || t.type === 'income')
    );
  }, [transactions, activeDate]);

  const dayFriendTransactions = useMemo(() => {
    return friendTransactions.filter((t) => t.date === activeDate);
  }, [friendTransactions, activeDate]);

  const dayVaultTransactions = useMemo(() => {
    return vaultTransactions.filter((t) => t.date === activeDate);
  }, [vaultTransactions, activeDate]);

  // Daily totals
  const dayIncome = useMemo(
    () => dayPersonalTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    [dayPersonalTransactions]
  );
  const dayExpense = useMemo(
    () => dayPersonalTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    [dayPersonalTransactions]
  );
  const dayNet = dayIncome - dayExpense;

  const formatDateTitle = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Daily Hisaab</h1>
          <div className="tagline-banner">One day at a time, one rupee at a time. Your day in numbers.</div>
        </div>

        <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>+ Add Entry</span>
        </button>
      </div>

      {/* Date Navigation Bar */}
      <div
        className="kf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => handleShiftDay(-1)} className="btn btn-secondary btn-sm" title="Previous Day">
            <ChevronLeft size={16} />
            <span>Prev Day</span>
          </button>
          <button onClick={() => handleShiftDay(1)} className="btn btn-secondary btn-sm" title="Next Day">
            <span>Next Day</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {formatDateTitle(activeDate)}
          </span>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => {
              if (e.target.value) {
                setActiveDate(e.target.value);
                setCurrentAppDate(e.target.value);
              }
            }}
            className="form-input"
            style={{ width: '150px', padding: '6px 10px', fontSize: '0.84rem' }}
          />
        </div>

        <button
          onClick={() => {
            const today = '2026-10-05';
            setActiveDate(today);
            setCurrentAppDate(today);
          }}
          className="btn btn-secondary btn-sm"
        >
          Reset to Today
        </button>
      </div>

      {/* Day's 3 Financial Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Personal Day Summary */}
        <div className="kf-card" style={{ borderLeft: '4px solid var(--personal-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-personal">🟢 PERSONAL MONEY</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Day Impact</span>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: dayNet >= 0 ? 'var(--personal-primary)' : 'var(--expense-primary)' }}>
            {dayNet >= 0 ? '+' : ''}{currency} {dayNet.toLocaleString()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Income: <strong style={{ color: 'var(--personal-primary)' }}>+{currency} {dayIncome.toLocaleString()}</strong></span>
            <span>Spent: <strong style={{ color: 'var(--expense-primary)' }}>-{currency} {dayExpense.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Friends Day Activity */}
        <div className="kf-card" style={{ borderLeft: '4px solid var(--friends-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-friends">🟠 FRIENDS & UDHAAR</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayFriendTransactions.length} records</span>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--friends-text)' }}>
            {dayFriendTransactions.length > 0 ? `${dayFriendTransactions.length} Activities` : 'No Udhaar Today'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '10px' }}>
            Independent from personal balance
          </div>
        </div>

        {/* Vault Day Activity */}
        <div className="kf-card" style={{ borderLeft: '4px solid var(--vault-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-vault">🔵 MONEY VAULT</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--vault-text)' }}>{dayVaultTransactions.length} records</span>
          </div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--vault-primary)' }}>
            {dayVaultTransactions.length > 0 ? `${dayVaultTransactions.length} Vault Actions` : 'Zero Custody Changes'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '10px' }}>
            Third-party custody money (Amanat)
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Personal Transactions */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingDown size={18} color="var(--personal-primary)" />
              Personal Spending & Income
            </h3>
            <span className="badge badge-personal">{dayPersonalTransactions.length} items</span>
          </div>

          {dayPersonalTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No personal expenses or income recorded on this date.
            </div>
          ) : (
            <div className="table-container">
              <table className="kf-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dayPersonalTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        <span className={`badge ${tx.type === 'income' ? 'badge-personal' : 'badge-expense'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td>{tx.category}</td>
                      <td style={{ fontWeight: 600 }}>{tx.description}</td>
                      <td
                        className="mono"
                        style={{
                          textAlign: 'right',
                          fontWeight: 700,
                          color: tx.type === 'income' ? 'var(--personal-primary)' : 'var(--expense-primary)',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 2. Friends & Udhaar Activity */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HandCoins size={18} color="var(--friends-primary)" />
              Friends & Udhaar Movements
            </h3>
            <span className="badge badge-friends">{dayFriendTransactions.length} items</span>
          </div>

          {dayFriendTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No friend or udhaar activity on this date.
            </div>
          ) : (
            <div className="table-container">
              <table className="kf-table">
                <thead>
                  <tr>
                    <th>Friend</th>
                    <th>Action</th>
                    <th>Note</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dayFriendTransactions.map((ft) => {
                    const friend = friends.find((f) => f.id === ft.friendId);
                    return (
                      <tr key={ft.id}>
                        <td style={{ fontWeight: 700 }}>{friend?.name || 'Friend'}</td>
                        <td>
                          <span className="badge badge-friends">
                            {ft.type === 'give' ? 'Udhaar Given' : ft.type === 'take' ? 'Borrowed' : 'Settled'}
                          </span>
                        </td>
                        <td>{ft.description}</td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--friends-primary)' }}>
                          {currency} {ft.amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Money Vault Activity */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--vault-primary)" />
              Money Vault Safekeeping Activity
            </h3>
            <span className="badge badge-vault">{dayVaultTransactions.length} items</span>
          </div>

          {dayVaultTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No deposits or returns on this date.
            </div>
          ) : (
            <div className="table-container">
              <table className="kf-table">
                <thead>
                  <tr>
                    <th>Owner / Person</th>
                    <th>Operation</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dayVaultTransactions.map((vt) => {
                    const person = vaultPeople.find((p) => p.id === vt.vaultPersonId);
                    return (
                      <tr key={vt.id}>
                        <td style={{ fontWeight: 700 }}>{person?.name || 'Vault Owner'}</td>
                        <td>
                          <span className="badge badge-vault">
                            {vt.type === 'deposit' ? '🔐 Deposit Received' : '↩️ Returned to Owner'}
                          </span>
                        </td>
                        <td>{vt.description}</td>
                        <td className="mono" style={{ textAlign: 'right', fontWeight: 700, color: 'var(--vault-primary)' }}>
                          {currency} {vt.amount.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
