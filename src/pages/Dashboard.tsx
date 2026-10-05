import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  Download,
  Calendar,
  Sparkles,
  Users,
  Target,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { ViewType, TransactionType } from '../types';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { generateMonthlyReportPDF } from '../utils/pdfGenerator';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
  onOpenQuickAdd: (initialType?: TransactionType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    summary,
    transactions,
    friends,
    getFriendBalance,
    vaultPeople,
    getVaultPersonBalance,
    currentAppDate,
  } = useKhata();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const currency = user?.currency || 'Rs.';

  const [friendsTab, setFriendsTab] = useState<'receive' | 'pay'>('receive');
  const [midCardTab, setMidCardTab] = useState<'trend' | 'recent'>('trend');
  const [reportTab, setReportTab] = useState<'overview' | 'expenses' | 'income' | 'friends' | 'vault'>('overview');

  const currentMonthPrefix = currentAppDate.slice(0, 7);
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));

  // Compute category breakdown from real transactions only
  const expenseByCategory: { [cat: string]: number } = {};
  let currentMonthExpenses = 0;

  for (const t of currentMonthTransactions) {
    if (t.type === 'expense') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
      currentMonthExpenses += t.amount;
    }
  }

  const categoryColors: Record<string, string> = {
    'Food & Dining': '#f43f5e',
    'Transport & Fuel': '#38bdf8',
    'Bills & Utilities': '#8b5cf6',
    'Shopping & Clothes': '#ec4899',
    'Education & Books': '#f59e0b',
    'Health & Medical': '#10b981',
    'Home & Grocery': '#64748b',
    'Other Expenses': '#94a3b8',
  };

  const categoryBreakdown = Object.entries(expenseByCategory).map(([cat, amt]) => ({
    category: cat,
    amount: amt,
    percentage: currentMonthExpenses > 0 ? Math.round((amt / currentMonthExpenses) * 100) : 0,
    color: categoryColors[cat] || '#10b981',
  }));

  const handleDownloadPDF = () => {
    generateMonthlyReportPDF({
      monthName: 'Monthly Report',
      year: parseInt(currentAppDate.split('-')[0], 10) || 2026,
      month: parseInt(currentAppDate.split('-')[1], 10) || 10,
      currency,
      userName: user?.name || 'Abulrehman',
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      savings: summary.savings,
      friendsReceivable: summary.friendsReceivable,
      friendsPayable: summary.friendsPayable,
      vaultTotalHeld: summary.vaultTotalHeld,
      categoryBreakdown,
      transactions: currentMonthTransactions,
    });
  };

  const displayName = user?.name || 'Abulrehman';

  // Format date display
  const formatDateDisplay = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filtered friends for current tab
  const activeFriends = friends.filter((f) => {
    const bal = getFriendBalance(f.id);
    return friendsTab === 'receive' ? bal.receivable > 0 : bal.payable > 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ========================================================
          HERO BANNER: Scenic art inspired by user's screenshot
      ======================================================== */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--hero-banner-bg)',
          border: '1px solid var(--hero-banner-border)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Subtle decorative background SVG landscape */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '340px',
            height: '100%',
            opacity: theme === 'dark' ? 0.35 : 0.45,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <svg viewBox="0 0 340 120" fill="none" style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <path
              d="M0 120 L80 50 L140 85 L220 30 L290 75 L340 40 L340 120 Z"
              fill={theme === 'dark' ? '#38bdf8' : '#10b981'}
              fillOpacity="0.25"
            />
            <path
              d="M40 120 L120 70 L180 95 L260 50 L340 85 L340 120 Z"
              fill={theme === 'dark' ? '#818cf8' : '#059669'}
              fillOpacity="0.35"
            />
            <circle cx="220" cy="30" r="16" fill="#fbbf24" fillOpacity="0.4" />
          </svg>
        </div>

        {/* Banner Content */}
        <div style={{ zIndex: 1, maxWidth: '600px' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {theme === 'dark' ? 'Welcome Back,' : 'Good Morning,'} {displayName}!{' '}
            <span style={{ fontSize: '1.7rem' }}>👋</span>
          </h1>
          <div className="tagline-banner" style={{ fontSize: '0.92rem', marginTop: '4px' }}>
            {theme === 'dark' ? 'See where your money stands.' : 'Your money, at a glance.'}
          </div>
        </div>

        {/* Right Date & Quote */}
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Calendar size={15} color="var(--personal-primary)" />
            <span>{formatDateDisplay(currentAppDate)}</span>
          </div>

          <div
            style={{
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              display: 'none',
              maxWidth: '240px',
              textAlign: 'right',
            }}
            className="header-quote"
          >
            “ Discipline today, freedom tomorrow. ”
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 1: Primary 3 Financial Stat Cards
      ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Available Balance */}
        <div
          className="kf-card"
          style={{
            position: 'relative',
            background:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, #0e1524 100%)'
                : '#ffffff',
            borderLeft: '4px solid var(--personal-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Total Balance
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                {currency} {summary.availableBalance.toLocaleString()}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--personal-primary)',
                }}
              >
                <TrendingUp size={14} />
                <span>
                  {summary.totalIncome > 0
                    ? `Retained: ${currency} ${summary.savings.toLocaleString()}`
                    : 'Personal Income - Expenses'}
                </span>
              </div>
            </div>

            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'var(--personal-light)',
                color: 'var(--personal-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={22} />
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div
          className="kf-card"
          style={{
            position: 'relative',
            background:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, #0e1524 100%)'
                : '#ffffff',
            borderLeft: '4px solid #10b981',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('income')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Total Income
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                {currency} {summary.totalIncome.toLocaleString()}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#10b981',
                }}
              >
                <ArrowUpRight size={14} />
                <span>{summary.totalIncome > 0 ? 'Active income recorded' : '+ Add your first income'}</span>
              </div>
            </div>

            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.14)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div
          className="kf-card"
          style={{
            position: 'relative',
            background:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.16) 0%, #0e1524 100%)'
                : '#ffffff',
            borderLeft: '4px solid var(--expense-primary)',
            cursor: 'pointer',
          }}
          onClick={() => onNavigate('expenses')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Total Expenses
              </div>
              <div
                className="mono"
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginTop: '4px',
                }}
              >
                {currency} {summary.totalExpenses.toLocaleString()}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--expense-primary)',
                }}
              >
                <ArrowDownLeft size={14} />
                <span>{summary.totalExpenses > 0 ? 'Recorded spending' : 'Zero expenses recorded'}</span>
              </div>
            </div>

            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'var(--expense-light)',
                color: 'var(--expense-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: Secondary 3 Cards (Friends & Vault)
      ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* You Will Receive */}
        <div
          className="kf-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('friends')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              You will Receive
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--friends-light)',
                color: 'var(--friends-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={16} />
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--friends-text)',
              marginTop: '4px',
            }}
          >
            {currency} {summary.friendsReceivable.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.friendsCountReceive} Friends owe you
          </div>
        </div>

        {/* You Will Pay */}
        <div
          className="kf-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('friends')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              You will Pay
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(234, 88, 12, 0.12)',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={16} />
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: '#ea580c',
              marginTop: '4px',
            }}
          >
            {currency} {summary.friendsPayable.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.friendsCountPay} Friends you owe
          </div>
        </div>

        {/* Money Held for Others */}
        <div
          className="kf-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('vault')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Money Held for Others
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--vault-light)',
                color: 'var(--vault-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={16} />
            </div>
          </div>
          <div
            className="mono"
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--vault-primary)',
              marginTop: '4px',
            }}
          >
            {currency} {summary.vaultTotalHeld.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary.vaultPeopleCount} People (Amanat custody)
          </div>
        </div>
      </div>

      {/* ========================================================
          MIDDLE ROW: Donut Breakdown + Trend Curve / Transactions
      ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(310px, 1fr) minmax(340px, 1.4fr)',
          gap: '20px',
        }}
      >
        {/* Left: Expense Breakdown Donut */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Expense Breakdown</h3>
            <span className="badge badge-personal">This Month</span>
          </div>

          {currentMonthExpenses === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: 'var(--text-subtle)',
                }}
              >
                <TrendingDown size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                No Expenses Recorded Yet
              </div>
              <p style={{ fontSize: '0.82rem', maxWidth: '320px', lineHeight: 1.4, marginBottom: '16px' }}>
                As you add your daily expenses, your category allocation donut and percentages will automatically appear here.
              </p>
              <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-secondary btn-sm">
                + Record First Expense
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '10px 0',
              }}
            >
              <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="62" fill="none" stroke="var(--border-color)" strokeWidth="20" />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="20"
                    strokeDasharray="152 390"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="66 390"
                    strokeDashoffset="-152"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="20"
                    strokeDasharray="51 390"
                    strokeDashoffset="-218"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <span className="mono" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    {currency} {currentMonthExpenses.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Spent</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryBreakdown.map((c) => (
                  <div key={c.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                      <span style={{ fontWeight: 500 }}>{c.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.percentage}%</span>
                      <span className="mono" style={{ fontWeight: 700 }}>
                        {c.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Spending Trend Curve / Recent Transactions Toggle */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setMidCardTab('trend')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: midCardTab === 'trend' ? 800 : 500,
                  color: midCardTab === 'trend' ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  borderBottom: midCardTab === 'trend' ? '2px solid var(--personal-primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                Spending Trend
              </button>
              <button
                onClick={() => setMidCardTab('recent')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.05rem',
                  fontWeight: midCardTab === 'recent' ? 800 : 500,
                  color: midCardTab === 'recent' ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  borderBottom: midCardTab === 'recent' ? '2px solid var(--personal-primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                Recent Transactions ({transactions.length})
              </button>
            </div>

            <span className="badge badge-personal">This Month</span>
          </div>

          {transactions.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  color: 'var(--text-subtle)',
                }}
              >
                <Sparkles size={28} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                Your Ledger is Clean & Ready
              </div>
              <p style={{ fontSize: '0.82rem', maxWidth: '340px', lineHeight: 1.4, marginBottom: '16px' }}>
                You have not recorded any transactions in this account yet. Click below to add an expense or income.
              </p>
              <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-primary btn-sm">
                + Add Transaction
              </button>
            </div>
          ) : midCardTab === 'trend' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', fontSize: '0.75rem', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Income
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                  Expense
                </span>
              </div>

              <div style={{ width: '100%', height: '170px' }}>
                <svg viewBox="0 0 400 160" width="100%" height="100%">
                  <line x1="20" y1="30" x2="390" y2="30" stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="20" y1="70" x2="390" y2="70" stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="20" y1="110" x2="390" y2="110" stroke="var(--border-color)" strokeDasharray="3 3" opacity="0.6" />

                  <path d="M 20 120 Q 80 50, 140 70 T 260 50 T 380 40" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <path d="M 20 140 Q 80 110, 140 100 T 260 115 T 380 90" fill="none" stroke="#a855f7" strokeWidth="2.5" />
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', padding: '0 8px' }}>
                <span>1 Oct</span>
                <span>5 Oct</span>
                <span>10 Oct</span>
                <span>15 Oct</span>
                <span>20 Oct</span>
                <span>25 Oct</span>
                <span>30 Oct</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.slice(0, 5).map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{tx.description}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tx.date} • {tx.category}</div>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontWeight: 700,
                        color: isIncome ? 'var(--personal-primary)' : 'var(--expense-primary)',
                      }}
                    >
                      {isIncome ? '+' : '-'} {currency} {tx.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          QUICK ADD SHORTCUTS BAR
      ======================================================== */}
      <div
        className="kf-card"
        style={{
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--personal-primary)" />
            Quick Add
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Fast, simple, hassle-free. Just a click, and you're done!
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button onClick={() => onOpenQuickAdd('expense')} className="btn btn-secondary btn-sm" title="Record expense">
            💸 Expense
          </button>
          <button onClick={() => onOpenQuickAdd('income')} className="btn btn-secondary btn-sm" title="Record income">
            💰 Income
          </button>
          <button onClick={() => onOpenQuickAdd('udhaar')} className="btn btn-secondary btn-sm" title="Money lent to someone">
            📤 Lent
          </button>
          <button onClick={() => onOpenQuickAdd('udhaar_taken')} className="btn btn-secondary btn-sm" style={{ borderColor: '#ea580c', color: '#ea580c' }} title="Money borrowed from someone">
            📥 Borrow
          </button>
          <button onClick={() => onOpenQuickAdd('friend_payment')} className="btn btn-secondary btn-sm" title="Settle debt balance">
            🤝 Settle Up
          </button>
          <button onClick={() => onOpenQuickAdd('vault_deposit')} className="btn btn-secondary btn-sm" title="Third-party custody safekeeping">
            🔐 Vault Deposit
          </button>
          <button onClick={() => onOpenQuickAdd('vault_return')} className="btn btn-secondary btn-sm" title="Return custody money to owner">
            ↩️ Vault Return
          </button>
        </div>
      </div>

      {/* ========================================================
          BOTTOM 3 CARDS: Monthly Report, Friends & Vault
      ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '18px',
        }}
      >
        {/* Card 1: Monthly Report */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Monthly Report</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>A month of money, in one view.</div>
            </div>
            <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '4px',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px',
              fontSize: '0.76rem',
            }}
          >
            {(['overview', 'expenses', 'income', 'friends', 'vault'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportTab(t)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: reportTab === t ? 'var(--bg-card)' : 'transparent',
                  color: reportTab === t ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: reportTab === t ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Income</div>
              <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981' }}>
                {currency} {summary.totalIncome.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Expenses</div>
              <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--expense-primary)' }}>
                {currency} {summary.totalExpenses.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-subtle)' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Remaining</div>
              <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--personal-primary)' }}>
                {currency} {summary.savings.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {transactions.length > 0
              ? `💡 Hisaab updated! You have saved ${currency} ${summary.savings.toLocaleString()} across your entries.`
              : '💡 No transactions recorded yet. Add your income and expenses to generate a live statement.'}
          </div>
        </div>

        {/* Card 2: Friends & Udhaar */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem' }}>Friends & Udhaar</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Friends stay friends. Hisaab stays clear.</div>
            </div>
            <button onClick={() => onNavigate('friends')} className="btn btn-secondary btn-sm">
              Manage
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              className={`btn btn-sm ${friendsTab === 'receive' ? 'btn-friends' : 'btn-secondary'}`}
              onClick={() => setFriendsTab('receive')}
              style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
            >
              You Will Receive
            </button>
            <button
              className={`btn btn-sm ${friendsTab === 'pay' ? 'btn-friends' : 'btn-secondary'}`}
              onClick={() => setFriendsTab('pay')}
              style={{ flex: 1, padding: '4px 8px', fontSize: '0.75rem' }}
            >
              You Will Pay
            </button>
          </div>

          {activeFriends.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No pending udhaar. You're all clear!
              <div style={{ marginTop: '8px' }}>
                <button onClick={() => onNavigate('friends')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  + Add Friend Account
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeFriends.map((friend) => {
                const bal = getFriendBalance(friend.id);
                const displayAmt = friendsTab === 'receive' ? bal.receivable : bal.payable;

                return (
                  <div
                    key={friend.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--friends-light)',
                          color: 'var(--friends-text)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      >
                        {friend.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{friend.name}</span>
                    </div>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--friends-primary)' }}>
                      {currency} {displayAmt.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {friendsTab === 'receive' ? 'Total to Receive:' : 'Total to Pay:'}
            </span>
            <span
              className="mono"
              style={{
                fontWeight: 800,
                color: friendsTab === 'receive' ? 'var(--friends-primary)' : '#ea580c',
              }}
            >
              {currency} {friendsTab === 'receive' ? summary.friendsReceivable.toLocaleString() : summary.friendsPayable.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 3: Money Vault */}
        <div className="kf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={15} color="var(--vault-primary)" />
                Money Vault
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Not yours, but still your responsibility.</div>
            </div>
            <button onClick={() => onNavigate('vault')} className="btn btn-secondary btn-sm">
              Custody
            </button>
          </div>

          {vaultPeople.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Nothing is being held right now.
              <div style={{ marginTop: '8px' }}>
                <button onClick={() => onNavigate('vault')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.74rem', padding: '4px 10px' }}>
                  + Record Custody Deposit
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vaultPeople.map((person) => {
                const bal = getVaultPersonBalance(person.id);
                return (
                  <div
                    key={person.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-subtle)',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{person.name}</span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        (Deposited: {bal.deposited.toLocaleString()} | Returned: {bal.returned.toLocaleString()})
                      </div>
                    </div>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--vault-primary)' }}>
                      {currency} {bal.holding.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Held By You:</span>
            <span className="mono" style={{ fontWeight: 800, color: 'var(--vault-primary)' }}>
              {currency} {summary.vaultTotalHeld.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          BOTTOM DESIGN PALETTE SWITCHER BAR
      ======================================================== */}
      <div
        style={{
          marginTop: '10px',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setTheme('light')}
            className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Design 1 (Light)
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            Design 2 (Dark)
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {theme === 'light'
            ? 'Clean • Calm • Productive — Simple design. Powerful management.'
            : 'Modern • Stylish • Professional — Smart looks. Smarter finance.'}
        </div>
      </div>
    </div>
  );
};
