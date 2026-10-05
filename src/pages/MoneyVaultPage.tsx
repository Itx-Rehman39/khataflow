import React, { useState } from 'react';
import {
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Download,
  AlertTriangle,
  History,
  UserCheck,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { VaultPerson, TransactionType } from '../types';
import { generateMoneyCustodyPDF } from '../utils/pdfGenerator';

interface MoneyVaultPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const MoneyVaultPage: React.FC<MoneyVaultPageProps> = ({ onOpenQuickAdd }) => {
  const {
    vaultPeople,
    vaultTransactions,
    getVaultPersonBalance,
    addVaultPerson,
    addVaultDeposit,
    addVaultReturn,
    summary,
    currentAppDate,
  } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [selectedPerson, setSelectedPerson] = useState<VaultPerson | null>(null);

  // Return modal state
  const [returnModalPerson, setReturnModalPerson] = useState<VaultPerson | null>(null);
  const [returnAmount, setReturnAmount] = useState<string>('');
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [returnError, setReturnError] = useState<string | null>(null);

  // Deposit modal state
  const [depositModalPerson, setDepositModalPerson] = useState<VaultPerson | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositNotes, setDepositNotes] = useState<string>('');

  // Add person modal
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newPersonNotes, setNewPersonNotes] = useState('');

  const handleDownloadCustodyReport = () => {
    generateMoneyCustodyPDF({
      currency,
      userName: user?.name || 'Abulrehman',
      people: vaultPeople,
      transactions: vaultTransactions,
      getPersonBalance: getVaultPersonBalance,
      totalHeld: summary.vaultTotalHeld,
    });
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    addVaultPerson(newPersonName, newPersonPhone, newPersonNotes);
    setNewPersonName('');
    setNewPersonPhone('');
    setNewPersonNotes('');
    setShowAddPerson(false);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError(null);
    if (!returnModalPerson) return;

    const amt = parseFloat(returnAmount);
    if (isNaN(amt) || amt <= 0) {
      setReturnError('Please enter a valid amount');
      return;
    }

    const bal = getVaultPersonBalance(returnModalPerson.id);
    if (amt > bal.holding) {
      setReturnError(`Cannot return more than current holding (${currency} ${bal.holding.toLocaleString()})`);
      return;
    }

    const res = addVaultReturn(returnModalPerson.id, amt, currentAppDate, returnNotes);
    if (!res.success) {
      setReturnError(res.error || 'Failed to record return');
      return;
    }

    setReturnModalPerson(null);
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalPerson) return;

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = addVaultDeposit(depositModalPerson.id, amt, currentAppDate, depositNotes);
    if (res.success) {
      setDepositModalPerson(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--vault-light)',
                color: 'var(--vault-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Money Vault</h1>
          </div>
          <div className="tagline-banner">Not yours, but still your responsibility. Their money, your record.</div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadCustodyReport} className="btn btn-secondary btn-sm">
            <Download size={15} />
            <span>Download Custody PDF</span>
          </button>

          <button onClick={() => setShowAddPerson(true)} className="btn btn-secondary btn-sm">
            <UserCheck size={15} />
            <span>+ New Vault Person</span>
          </button>

          <button onClick={() => onOpenQuickAdd('vault_deposit')} className="btn btn-vault btn-sm">
            <Plus size={15} />
            <span>Receive Money</span>
          </button>
        </div>
      </div>

      {/* Prominent Highlighting & Rule Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1.5px solid var(--vault-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vault-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} />
            <span>AMANAT SAFEKEEPING LEDGER</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
            Total Money Held For Others
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
            This money does NOT belong to you. It is strictly excluded from personal income, personal expenses, and personal savings calculations.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently Custodied</div>
          <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--vault-primary)' }}>
            {currency} {summary.vaultTotalHeld.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across {summary.vaultPeopleCount} individuals
          </div>
        </div>
      </div>

      {/* Individual Vault Accounts Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Person-Specific Accounts</h3>

        {vaultPeople.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Lock size={24} />
            </div>
            <div className="empty-state-title">Nothing is being held right now.</div>
            <div className="empty-state-desc">When friends or family ask you to keep money safe for them, record it here.</div>
            <button onClick={() => setShowAddPerson(true)} className="btn btn-vault btn-sm">
              + Add Vault Person
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {vaultPeople.map((person) => {
              const bal = getVaultPersonBalance(person.id);
              const isHolding = bal.holding > 0;

              return (
                <div
                  key={person.id}
                  className="kf-card"
                  style={{
                    borderTop: '3px solid var(--vault-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{person.name}</h4>
                        {person.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{person.phone}</div>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: isHolding ? 'var(--vault-light)' : 'var(--bg-card-subtle)',
                          color: isHolding ? 'var(--vault-text)' : 'var(--text-subtle)',
                        }}
                      >
                        {isHolding ? '🟢 Holding' : '⚪ Returned'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div
                      style={{
                        margin: '16px 0 12px',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card-subtle)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deposited</div>
                        <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {currency} {bal.deposited.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Returned</div>
                        <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {currency} {bal.returned.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently Holding</div>
                      <div className="mono" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--vault-primary)' }}>
                        {currency} {bal.holding.toLocaleString()}
                      </div>
                    </div>

                    {person.notes && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '6px' }}>
                        Note: {person.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setSelectedPerson(person)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <History size={14} />
                      <span>Ledger</span>
                    </button>

                    <button
                      onClick={() => {
                        setDepositModalPerson(person);
                        setDepositAmount('');
                        setDepositNotes('');
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Add more deposit"
                    >
                      + Deposit
                    </button>

                    {isHolding && (
                      <button
                        onClick={() => {
                          setReturnModalPerson(person);
                          setReturnAmount(bal.holding.toString());
                          setReturnNotes(`Return to ${person.name}`);
                          setReturnError(null);
                        }}
                        className="btn btn-vault btn-sm"
                        style={{ flex: 1 }}
                      >
                        <RotateCcw size={14} />
                        <span>Return</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custody Overview Table */}
      <div className="kf-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Money Custody Report</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Their money. Your record.</div>
          </div>
          <button onClick={handleDownloadCustodyReport} className="btn btn-primary btn-sm">
            <Download size={14} />
            <span>Export PDF</span>
          </button>
        </div>

        <div className="table-container">
          <table className="kf-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Phone / Contact</th>
                <th style={{ textAlign: 'right' }}>Total Received</th>
                <th style={{ textAlign: 'right' }}>Total Returned</th>
                <th style={{ textAlign: 'right' }}>Current Balance</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {vaultPeople.map((person) => {
                const bal = getVaultPersonBalance(person.id);
                return (
                  <tr key={person.id}>
                    <td style={{ fontWeight: 700 }}>{person.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{person.phone || '—'}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      {currency} {bal.deposited.toLocaleString()}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {currency} {bal.returned.toLocaleString()}
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--vault-primary)' }}>
                      {currency} {bal.holding.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${bal.holding > 0 ? 'badge-vault' : ''}`}>
                        {bal.holding > 0 ? '🟢 Holding' : '⚪ Returned'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vault Person Detailed Ledger Modal */}
      {selectedPerson && (
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedPerson.name} — Vault History</h3>
                <div className="tagline-banner">Every person. Every rupee. Every record.</div>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>

            {/* Balances */}
            {(() => {
              const bal = getVaultPersonBalance(selectedPerson.id);
              return (
                <div
                  style={{
                    backgroundColor: 'var(--vault-light)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--vault-text)' }}>Currently Holding</div>
                    <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--vault-primary)' }}>
                      {currency} {bal.holding.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--vault-text)' }}>
                    Deposited: {currency} {bal.deposited.toLocaleString()} <br />
                    Returned: {currency} {bal.returned.toLocaleString()}
                  </div>
                </div>
              );
            })()}

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {vaultTransactions.filter((t) => t.vaultPersonId === selectedPerson.id).map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.84rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.description}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {t.date} • {t.type === 'deposit' ? 'Deposit received' : 'Returned to owner'}
                    </div>
                  </div>

                  <div
                    className="mono"
                    style={{
                      fontWeight: 700,
                      color: t.type === 'deposit' ? 'var(--vault-primary)' : 'var(--expense-primary)',
                    }}
                  >
                    {t.type === 'deposit' ? '+' : '-'} {currency} {t.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button onClick={() => setSelectedPerson(null)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Money Modal with Strict Balance Validation */}
      {returnModalPerson && (
        <div className="modal-overlay" onClick={() => setReturnModalPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Return Money to {returnModalPerson.name}
            </h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Prevent the user from returning more than current holding balance.
            </div>

            {returnError && (
              <div
                style={{
                  backgroundColor: 'var(--expense-light)',
                  border: '1px solid var(--expense-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '16px',
                  color: 'var(--expense-text)',
                  fontSize: '0.84rem',
                }}
              >
                <AlertTriangle size={16} />
                <span>{returnError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReturn}>
              <div className="form-group">
                <label className="form-label">
                  Return Amount ({currency}) *
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    (Max: {currency} {getVaultPersonBalance(returnModalPerson.id).holding.toLocaleString()})
                  </span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={getVaultPersonBalance(returnModalPerson.id).holding}
                  value={returnAmount}
                  onChange={(e) => setReturnAmount(e.target.value)}
                  className="form-input mono"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Handed back in cash"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setReturnModalPerson(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-vault">
                  Confirm Return ↩️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deposit Modal */}
      {depositModalPerson && (
        <div className="modal-overlay" onClick={() => setDepositModalPerson(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Add Deposit for {depositModalPerson.name}
            </h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Safekeeping money received into vault.
            </div>

            <form onSubmit={handleConfirmDeposit}>
              <div className="form-group">
                <label className="form-label">Amount ({currency}) *</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="form-input mono"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Additional savings to keep"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setDepositModalPerson(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-vault">
                  Save Deposit 🔐
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Vault Person Modal */}
      {showAddPerson && (
        <div className="modal-overlay" onClick={() => setShowAddPerson(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Add New Money Vault Owner
            </h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Create an individual custody ledger for this person.
            </div>

            <form onSubmit={handleCreatePerson}>
              <div className="form-group">
                <label className="form-label">Person's Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed, Tariq, Zainab"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +92 300 0000000"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Safekeeping for wedding / travel"
                  value={newPersonNotes}
                  onChange={(e) => setNewPersonNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddPerson(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-vault">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
