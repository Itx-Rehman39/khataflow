import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingDown,
  TrendingUp,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface TransactionsPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
  globalSearchQuery?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenQuickAdd,
  globalSearchQuery = '',
}) => {
  const { transactions, deleteTransaction, categories } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [search, setSearch] = useState(globalSearchQuery);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.description.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.personName && tx.personName.toLowerCase().includes(q)) ||
        tx.amount.toString().includes(q);

      if (!matchesSearch) return false;

      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'expense' && tx.type !== 'expense') return false;
        if (selectedType === 'income' && tx.type !== 'income') return false;
        if (selectedType === 'udhaar' && tx.type !== 'udhaar' && tx.type !== 'udhaar_taken' && tx.type !== 'friend_payment') return false;
        if (selectedType === 'vault' && !tx.type.includes('vault')) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Date / Year / Month
      if (selectedYear !== 'all') {
        if (!tx.date.startsWith(selectedYear)) return false;
      }
      if (selectedMonth !== 'all') {
        const monthPad = selectedMonth.padStart(2, '0');
        if (!tx.date.includes(`-${monthPad}-`)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, search, selectedType, selectedCategory, selectedYear, selectedMonth, sortOrder]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transactions</h1>
          <div className="tagline-banner">Record it once. Track it forever.</div>
        </div>

        <button onClick={() => onOpenQuickAdd()} className="btn btn-primary">
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="kf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
              }}
            />
            <input
              type="text"
              placeholder="Search description, category, person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select"
            style={{ flex: '1 1 140px' }}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses 💸</option>
            <option value="income">Income 💰</option>
            <option value="udhaar">Friends & Udhaar (Diya / Liya) 🤝</option>
            <option value="vault">Money Vault 🔐</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
            style={{ flex: '1 1 140px' }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select"
            style={{ flex: '0 1 110px' }}
          >
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Month */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="form-select"
            style={{ flex: '0 1 110px' }}
          >
            <option value="all">All Months</option>
            <option value="10">October</option>
            <option value="9">September</option>
            <option value="8">August</option>
            <option value="7">July</option>
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="form-select"
            style={{ flex: '1 1 130px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Results summary count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>
            Showing <strong>{filteredTransactions.length}</strong> transactions
          </div>
          {(search || selectedType !== 'all' || selectedCategory !== 'all' || selectedMonth !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedType('all');
                setSelectedCategory('all');
                setSelectedMonth('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--personal-primary)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="table-container">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Filter size={24} />
            </div>
            <div className="empty-state-title">No transactions match your search</div>
            <div className="empty-state-desc">
              Try adjusting your date range, type, or search keywords to view transactions.
            </div>
            <button onClick={() => onOpenQuickAdd()} className="btn btn-primary btn-sm">
              + Add New Transaction
            </button>
          </div>
        ) : (
          <table className="kf-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isExpense = tx.type === 'expense';
                const isVault = tx.type.includes('vault');
                const isFriend = tx.type === 'udhaar' || tx.type === 'udhaar_taken' || tx.type === 'friend_payment';
                const isUdhaarTaken = tx.type === 'udhaar_taken';

                return (
                  <tr key={tx.id}>
                    <td className="mono" style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                      {tx.date}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.description}</div>
                      {tx.personName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Person: {tx.personName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-card-subtle)',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          isIncome
                            ? 'badge-personal'
                            : isExpense
                            ? 'badge-expense'
                            : isVault
                            ? 'badge-vault'
                            : isUdhaarTaken
                            ? 'badge-expense'
                            : 'badge-friends'
                        }`}
                        style={isUdhaarTaken ? { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' } : undefined}
                      >
                        {isIncome && <TrendingUp size={12} />}
                        {isExpense && <TrendingDown size={12} />}
                        {isVault && <Lock size={12} />}
                        {isFriend && (isUdhaarTaken ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />)}
                        <span>
                          {tx.type === 'vault_deposit'
                            ? 'Vault Deposit'
                            : tx.type === 'vault_return'
                            ? 'Vault Return'
                            : tx.type === 'udhaar_taken'
                            ? 'Udhaar Liya'
                            : tx.type === 'udhaar'
                            ? 'Udhaar Diya'
                            : tx.type === 'friend_payment'
                            ? 'Hisaab Settle'
                            : tx.type.replace('_', ' ')}
                        </span>
                      </span>
                    </td>
                    <td
                      className="mono"
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontSize: '0.94rem',
                        color: isIncome
                          ? 'var(--personal-primary)'
                          : isExpense
                          ? 'var(--expense-primary)'
                          : isVault
                          ? 'var(--vault-primary)'
                          : isUdhaarTaken
                          ? '#ea580c'
                          : 'var(--friends-primary)',
                      }}
                    >
                      {isIncome ? '+' : isExpense ? '-' : isUdhaarTaken ? '📥 ' : '📤 '}
                      {currency} {tx.amount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor:
                            tx.status === 'settled'
                              ? 'var(--personal-light)'
                              : 'var(--bg-card-subtle)',
                          color:
                            tx.status === 'settled'
                              ? 'var(--personal-text)'
                              : 'var(--text-muted)',
                        }}
                      >
                        {tx.status || 'completed'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setViewTx(tx)}
                          title="View Details"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(tx.id)}
                          title="Delete Transaction"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-subtle)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--expense-primary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* View Detail Modal */}
      {viewTx && (
        <div className="modal-overlay" onClick={() => setViewTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '14px' }}>Transaction Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Description:</span>
                <span style={{ fontWeight: 600 }}>{viewTx.description}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                <span className="mono" style={{ fontWeight: 800 }}>{currency} {viewTx.amount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                <span>{viewTx.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <span>{viewTx.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                <span>{viewTx.type}</span>
              </div>
              {viewTx.personName && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Associated Person:</span>
                  <span style={{ fontWeight: 600 }}>{viewTx.personName}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setViewTx(null)} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteTransaction(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction record? This action will permanently remove it from your balance and report calculations."
        confirmText="Delete Record"
        isDangerous={true}
      />
    </div>
  );
};
