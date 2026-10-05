import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Download,
  Lock,
  ArrowDownLeft,
  RotateCcw,
  Search,
  Users,
  Calendar,
  Plus,
  FileText,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { generateMoneyCustodyPDF } from '../utils/pdfGenerator';
import { TransactionType } from '../types';

interface CustodyReportPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const CustodyReportPage: React.FC<CustodyReportPageProps> = ({ onOpenQuickAdd }) => {
  const {
    vaultPeople,
    vaultTransactions,
    getVaultPersonBalance,
    summary,
  } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Overall totals across vault
  const allTimeStats = useMemo(() => {
    let totalDeposited = 0;
    let totalReturned = 0;

    for (const vt of vaultTransactions) {
      if (vt.type === 'deposit') {
        totalDeposited += vt.amount;
      } else if (vt.type === 'return') {
        totalReturned += vt.amount;
      }
    }

    return {
      totalDeposited,
      totalReturned,
      currentHeld: summary.vaultTotalHeld,
    };
  }, [vaultTransactions, summary.vaultTotalHeld]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return vaultTransactions
      .filter((t) => {
        if (selectedPersonId !== 'all' && t.vaultPersonId !== selectedPersonId) {
          return false;
        }

        const person = vaultPeople.find((p) => p.id === t.vaultPersonId);
        const q = search.toLowerCase().trim();
        if (q) {
          const matchName = person?.name.toLowerCase().includes(q);
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchAmt = t.amount.toString().includes(q);
          const matchDate = t.date.includes(q);
          if (!matchName && !matchDesc && !matchAmt && !matchDate) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [vaultTransactions, vaultPeople, selectedPersonId, search]);

  const handleDownloadPDF = () => {
    generateMoneyCustodyPDF({
      currency,
      userName: user?.name || 'Abulrehman',
      people: vaultPeople,
      transactions: vaultTransactions,
      getPersonBalance: getVaultPersonBalance,
      totalHeld: summary.vaultTotalHeld,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Amanat Vault Report</h1>
          <div className="tagline-banner">
            Their money. Your record. Complete audit of every rupee deposited and returned.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => onOpenQuickAdd('vault_deposit')} className="btn btn-vault btn-sm">
            <Plus size={16} />
            <span>+ Deposit Amanat</span>
          </button>
          <button onClick={() => onOpenQuickAdd('vault_return')} className="btn btn-secondary btn-sm">
            <RotateCcw size={16} />
            <span>↩️ Return to Owner</span>
          </button>
          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
            <Download size={16} />
            <span>Download Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Accounting Notice */}
      <div
        style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--vault-light)',
          border: '1px solid var(--vault-border)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <ShieldCheck size={24} color="var(--vault-primary)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--vault-text)', lineHeight: 1.45 }}>
          <strong>Strictly Third-Party Safekeeping:</strong> This report is completely separate from your personal
          monthly income and expenses. It tracks money entrusted to you by others, recording exactly how much they
          deposited (<em>kitna jama karwaya</em>), on what date, and how much has been returned (<em>kitna wapis liya</em>).
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div className="kf-card" style={{ borderLeft: '4px solid var(--vault-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CURRENTLY HOLDING (IN TRUST)</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--vault-primary)', marginTop: '6px' }}>
            {currency} {allTimeStats.currentHeld.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Across {summary.vaultPeopleCount} custodians
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid var(--personal-primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL DEPOSITED (JAMA KARWAYA)</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--personal-primary)', marginTop: '6px' }}>
            {currency} {allTimeStats.totalDeposited.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            All-time safekeeping deposits
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid #ea580c)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL RETURNED (WAPIS DIYA)</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
            {currency} {allTimeStats.totalReturned.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Returned to owners upon request
          </div>
        </div>

        <div className="kf-card" style={{ borderLeft: '4px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>TOTAL OWNERS RECORDED</div>
          <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
            {vaultPeople.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Individual custody ledgers
          </div>
        </div>
      </div>

      {/* Custodian Summary Cards Table */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Custodian Balances Summary</h3>
        <div className="tagline-banner" style={{ marginBottom: '14px' }}>
          Current standing for each person who has entrusted money to your vault.
        </div>

        {vaultPeople.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No safekeeping records yet. Use <strong>+ Deposit Amanat</strong> to record custody money.
          </div>
        ) : (
          <div className="table-container">
            <table className="kf-table">
              <thead>
                <tr>
                  <th>Person / Owner</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Total Deposited (Jma)</th>
                  <th style={{ textAlign: 'right' }}>Total Returned (Wapis)</th>
                  <th style={{ textAlign: 'right' }}>Current Balance Held</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {vaultPeople.map((person) => {
                  const bal = getVaultPersonBalance(person.id);
                  const isHolding = bal.holding > 0;

                  return (
                    <tr
                      key={person.id}
                      onClick={() => setSelectedPersonId(person.id)}
                      style={{ cursor: 'pointer' }}
                      className={selectedPersonId === person.id ? 'row-selected' : ''}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{person.name}</div>
                        {person.notes && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{person.notes}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.84rem' }}>{person.phone || '—'}</td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--personal-primary)' }}>
                        {currency} {bal.deposited.toLocaleString()}
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 600, color: '#ea580c' }}>
                        {currency} {bal.returned.toLocaleString()}
                      </td>
                      <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--vault-primary)' }}>
                        {currency} {bal.holding.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`badge ${isHolding ? 'badge-vault' : 'badge-personal'}`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {isHolding ? 'Holding' : 'Fully Returned ✓'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Itemized Audit Log (Deposits & Returns with Dates) */}
      <div className="kf-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Detailed Deposit & Return Movements (Audit Trail)</h3>
            <div className="tagline-banner">
              Itemized history showing every deposit and return date, amount, and reason.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter by Person */}
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="form-select"
              style={{ width: '180px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="all">All People ({vaultPeople.length})</option>
              {vaultPeople.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search movements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', paddingBlock: '6px', fontSize: '0.82rem' }}
              />
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No deposit or return records match your filters.
          </div>
        ) : (
          <div className="table-container">
            <table className="kf-table">
              <thead>
                <tr>
                  <th>Date (Kis Date Ko)</th>
                  <th>Person / Owner</th>
                  <th>Action Type</th>
                  <th>Reason / Notes (Wajah)</th>
                  <th style={{ textAlign: 'right' }}>Amount (Raqam)</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const person = vaultPeople.find((p) => p.id === tx.vaultPersonId);
                  const isDeposit = tx.type === 'deposit';

                  return (
                    <tr key={tx.id}>
                      <td className="mono" style={{ fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        {tx.date}
                      </td>
                      <td style={{ fontWeight: 700 }}>{person?.name || 'Vault Custodian'}</td>
                      <td>
                        <span
                          className={`badge ${isDeposit ? 'badge-personal' : 'badge-expense'}`}
                          style={
                            isDeposit
                              ? { backgroundColor: 'var(--vault-light)', color: 'var(--vault-primary)', borderColor: 'var(--vault-border)' }
                              : { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }
                          }
                        >
                          {isDeposit ? '📥 Jamah (Deposit)' : '📤 Wapis (Returned)'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{tx.description}</td>
                      <td
                        className="mono"
                        style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: isDeposit ? 'var(--vault-primary)' : '#ea580c',
                        }}
                      >
                        {isDeposit ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
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
  );
};
