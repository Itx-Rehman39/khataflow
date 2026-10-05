import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { generateYearlyReportPDF } from '../utils/pdfGenerator';

export const YearlyReportPage: React.FC = () => {
  const { transactions } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year's transactions
  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(`${selectedYear}-`));
  }, [transactions, selectedYear]);

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    return monthNames.map((name, idx) => {
      const pad = String(idx + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${pad}`;
      const monthTxs = yearTransactions.filter((t) => t.date.startsWith(prefix));

      let inc = 0;
      let exp = 0;

      for (const t of monthTxs) {
        if (t.type === 'income') inc += t.amount;
        if (t.type === 'expense') exp += t.amount;
      }

      return {
        monthName: name,
        monthIndex: idx,
        income: inc,
        expenses: exp,
        net: inc - exp,
      };
    });
  }, [yearTransactions, selectedYear]);

  // Annual Totals
  const totalIncome = useMemo(
    () => monthlyData.reduce((s, m) => s + m.income, 0),
    [monthlyData]
  );
  const totalExpenses = useMemo(
    () => monthlyData.reduce((s, m) => s + m.expenses, 0),
    [monthlyData]
  );
  const totalSaved = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0;

  // Highest and Lowest Spending Months
  const activeExpenseMonths = monthlyData.filter((m) => m.expenses > 0);
  const highestMonth = activeExpenseMonths.length > 0
    ? activeExpenseMonths.reduce((max, m) => (m.expenses > max.expenses ? m : max), activeExpenseMonths[0])
    : { monthName: 'N/A', expenses: 0 };
  const lowestMonth = activeExpenseMonths.length > 0
    ? activeExpenseMonths.reduce((min, m) => (m.expenses < min.expenses ? m : min), activeExpenseMonths[0])
    : { monthName: 'N/A', expenses: 0 };

  // Category breakdown for whole year
  const categoryBreakdown = useMemo(() => {
    const map: { [c: string]: number } = {};
    for (const t of yearTransactions) {
      if (t.type === 'expense') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    }
    return Object.entries(map).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [yearTransactions, totalExpenses]);

  const handleDownloadPDF = () => {
    generateYearlyReportPDF({
      year: selectedYear,
      currency,
      userName: user?.name || 'Ahmed Khan',
      totalIncome,
      totalExpenses,
      totalSaved,
      highestMonth: { name: highestMonth.monthName, amount: highestMonth.expenses },
      lowestMonth: { name: lowestMonth.monthName, amount: lowestMonth.expenses === Infinity ? 0 : lowestMonth.expenses },
      categoryBreakdown,
      monthlyBreakdown: monthlyData,
    });
  };

  const maxMonthlyExpense = Math.max(...monthlyData.map((m) => m.expenses), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Yearly Report</h1>
          <div className="tagline-banner">
            One year. Every rupee. One clear picture. Look back. Learn. Plan ahead.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="form-select"
            style={{ width: '110px', padding: '6px 10px', fontSize: '0.86rem' }}
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>

          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
            <Download size={15} />
            <span>Download Yearly PDF</span>
          </button>
        </div>
      </div>

      {/* Annual Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="kf-card" style={{ borderLeft: '4px solid var(--personal-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Annual Income ({selectedYear})
          </div>
          <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--personal-primary)', marginTop: '4px' }}>
            {currency} {totalIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Earned personal cash inflow
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid var(--expense-primary)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Annual Expenses ({selectedYear})
          </div>
          <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--expense-primary)', marginTop: '4px' }}>
            {currency} {totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Personal spending recorded
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Saved & Retained
          </div>
          <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
            {currency} {totalSaved.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
            Savings Rate: <strong>{savingsRate}%</strong> of income
          </div>
        </div>
      </div>

      {/* Highs & Lows Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div className="kf-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--expense-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--expense-primary)',
            }}
          >
            <TrendingDown size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Highest Spending Month</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {highestMonth.monthName}
            </div>
            <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--expense-primary)' }}>
              {currency} {highestMonth.expenses.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="kf-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--personal-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--personal-primary)',
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lowest Spending Month</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {lowestMonth.monthName}
            </div>
            <div className="mono" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--personal-primary)' }}>
              {currency} {lowestMonth.expenses.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Progression Visual Bar Chart */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>12-Month Expense Trend</h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Relative spending volume across each month in {selectedYear}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '8px',
            height: '180px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {monthlyData.map((m) => {
            const heightPercent = maxMonthlyExpense > 0 ? Math.max((m.expenses / maxMonthlyExpense) * 100, 6) : 6;
            const hasData = m.expenses > 0;

            return (
              <div
                key={m.monthName}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative',
                }}
              >
                {/* Tooltip on hover */}
                {hasData && (
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(m.expenses / 1000)}k
                  </div>
                )}

                <div
                  style={{
                    width: '70%',
                    maxWidth: '36px',
                    height: `${hasData ? heightPercent : 4}%`,
                    borderRadius: '6px 6px 0 0',
                    backgroundColor: hasData
                      ? m.expenses === highestMonth.expenses
                        ? 'var(--expense-primary)'
                        : 'var(--personal-primary)'
                      : 'var(--bg-card-subtle)',
                    transition: 'height 0.4s ease',
                  }}
                  title={`${m.monthName}: ${currency} ${m.expenses.toLocaleString()}`}
                />

                <span
                  style={{
                    position: 'absolute',
                    bottom: '-22px',
                    fontSize: '0.72rem',
                    color: hasData ? 'var(--text-main)' : 'var(--text-subtle)',
                    fontWeight: hasData ? 600 : 400,
                  }}
                >
                  {m.monthName.slice(0, 3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category-wise Yearly Analysis */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Category-Wise Yearly Analysis</h3>

        {categoryBreakdown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
            No expenses recorded for year {selectedYear}.
          </div>
        ) : (
          <div className="table-container">
            <table className="kf-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Annual Total</th>
                  <th style={{ textAlign: 'right' }}>Share of Budget</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((c) => (
                  <tr key={c.category}>
                    <td style={{ fontWeight: 600 }}>{c.category}</td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {currency} {c.amount.toLocaleString()}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {c.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
