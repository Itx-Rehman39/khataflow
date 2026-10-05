import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  PenTool,
  Tag,
} from 'lucide-react';
import type { TransactionType } from '../../types';
import { useKhata } from '../../context/KhataContext';
import { useAuth } from '../../context/AuthContext';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
}) => {
  const {
    currentAppDate,
    categories,
    friends,
    vaultPeople,
    getVaultPersonBalance,
    addTransaction,
  } = useKhata();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(currentAppDate);

  // Category & Custom Reason mode
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Food & Dining');
  const [customReason, setCustomReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Person selection
  const [personId, setPersonId] = useState<string>('');
  const [newPersonName, setNewPersonName] = useState<string>('');
  const [isAddingNewPerson, setIsAddingNewPerson] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      setDate(currentAppDate);
      setAmount('');
      setDescription('');
      setCustomReason('');
      setIsCustomCategory(false);
      setFormError(null);
      setIsAddingNewPerson(false);
      setNewPersonName('');

      if (initialType === 'expense') {
        const firstExp = categories.find((c) => c.type === 'expense');
        setCategory(firstExp ? firstExp.name : 'Food & Dining');
      } else if (initialType === 'income') {
        const firstInc = categories.find((c) => c.type === 'income');
        setCategory(firstInc ? firstInc.name : 'Monthly Salary');
      }

      if (initialType === 'udhaar' || initialType === 'udhaar_taken' || initialType === 'friend_payment') {
        if (friends.length > 0) {
          setPersonId(friends[0].id);
          setIsAddingNewPerson(false);
        } else {
          setIsAddingNewPerson(true);
        }
      } else if (initialType === 'vault_deposit' || initialType === 'vault_return') {
        if (vaultPeople.length > 0) {
          setPersonId(vaultPeople[0].id);
          setIsAddingNewPerson(false);
        } else {
          setIsAddingNewPerson(true);
        }
      }
    }
  }, [isOpen, initialType, currentAppDate, categories, friends, vaultPeople]);

  if (!isOpen) return null;

  const quickTypes = [
    {
      id: 'expense',
      label: 'Expense',
      icon: TrendingDown,
      emoji: '💸',
      color: 'var(--expense-primary)',
      description: 'Record an expense (Food, groceries, bills, fuel, shopping, fees). Deducts from your personal available balance.',
    },
    {
      id: 'income',
      label: 'Income',
      icon: TrendingUp,
      emoji: '💰',
      color: 'var(--personal-primary)',
      description: 'Record income or earnings (Salary, business profit, freelance, gifts). Increases your personal available balance.',
    },
    {
      id: 'udhaar',
      label: 'Lent (Given)',
      icon: ArrowUpRight,
      emoji: '📤',
      color: 'var(--friends-primary)',
      description: 'Record money you gave/lent to a friend. The friend owes you, and this is tracked under "You Will Receive".',
    },
    {
      id: 'udhaar_taken',
      label: 'Borrowed (Taken)',
      icon: ArrowDownLeft,
      emoji: '📥',
      color: '#ea580c',
      description: 'Record money you took/borrowed from a friend or lender. You owe them this money, tracked under "You Will Pay".',
    },
    {
      id: 'friend_payment',
      label: 'Settle Up',
      icon: Users,
      emoji: '🤝',
      color: 'var(--friends-primary)',
      description: 'Record repayment or debt settlement with a friend to clear or reduce an outstanding balance.',
    },
    {
      id: 'vault_deposit',
      label: 'Vault Deposit',
      icon: ShieldCheck,
      emoji: '🔐',
      color: 'var(--vault-primary)',
      description: 'Record money given to you by someone purely for safekeeping (Amanat). Strictly isolated from your personal net worth.',
    },
    {
      id: 'vault_return',
      label: 'Vault Return',
      icon: RotateCcw,
      emoji: '↩️',
      color: 'var(--vault-primary)',
      description: 'Record money returned back to its original owner from your safekeeping vault.',
    },
  ];

  const handleTypeSelect = (type: TransactionType) => {
    setSelectedType(type);
    setFormError(null);
    setIsAddingNewPerson(false);
    setNewPersonName('');
    setIsCustomCategory(false);
    setCustomReason('');

    if (type === 'expense') {
      const exp = categories.find((c) => c.type === 'expense');
      setCategory(exp ? exp.name : 'Food & Dining');
    } else if (type === 'income') {
      const inc = categories.find((c) => c.type === 'income');
      setCategory(inc ? inc.name : 'Monthly Salary');
    } else if (type === 'udhaar' || type === 'udhaar_taken' || type === 'friend_payment') {
      if (friends.length > 0) {
        setPersonId(friends[0].id);
      } else {
        setIsAddingNewPerson(true);
      }
    } else if (type === 'vault_deposit' || type === 'vault_return') {
      if (vaultPeople.length > 0) {
        setPersonId(vaultPeople[0].id);
      } else {
        setIsAddingNewPerson(true);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0');
      return;
    }

    if (!date) {
      setFormError('Please select a valid date');
      return;
    }

    // Determine final category / custom reason
    let finalCategory = category;
    if (isCustomCategory && customReason.trim()) {
      finalCategory = customReason.trim();
    }

    // Vault return validation
    if (selectedType === 'vault_return') {
      const targetPersonId = isAddingNewPerson ? null : personId;
      if (!targetPersonId) {
        setFormError('Please select person whose money is being returned');
        return;
      }
      const bal = getVaultPersonBalance(targetPersonId);
      if (numAmount > bal.holding) {
        setFormError(
          `Cannot return ${user?.currency || 'Rs.'} ${numAmount.toLocaleString()}. You are only holding ${user?.currency || 'Rs.'} ${bal.holding.toLocaleString()} for this person.`
        );
        return;
      }
    }

    const finalDescription =
      description.trim() ||
      (isCustomCategory && customReason.trim() ? customReason.trim() : getDefaultDescription(selectedType));

    // Call addTransaction
    const result = addTransaction({
      type: selectedType,
      amount: numAmount,
      date,
      category:
        selectedType === 'expense' || selectedType === 'income'
          ? finalCategory
          : selectedType.includes('vault')
          ? 'Money Vault'
          : 'Friends & Udhaar',
      description: finalDescription,
      personId: isAddingNewPerson ? undefined : personId,
      personName: isAddingNewPerson ? newPersonName.trim() : undefined,
    });

    if (!result.success) {
      setFormError(result.error || 'Failed to record transaction');
      return;
    }

    onClose();
  };

  const getDefaultDescription = (type: TransactionType) => {
    switch (type) {
      case 'expense':
        return `${category} expense`;
      case 'income':
        return `${category} credit`;
      case 'udhaar':
        return 'Udhaar diya (You gave)';
      case 'udhaar_taken':
        return 'Udhaar liya (You borrowed)';
      case 'friend_payment':
        return 'Friend settlement payment';
      case 'vault_deposit':
        return 'Received for safekeeping (Amanat)';
      case 'vault_return':
        return 'Returned to owner';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Add Transaction</h2>
            <div className="tagline-banner">Every rupee deserves a record. Your money, your control.</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Action Selectors */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
            What do you want to record?
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '8px',
            }}
          >
            {quickTypes.map((t) => {
              const isSelected = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeSelect(t.id as TransactionType)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? `2px solid ${t.color}` : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                      lineHeight: 1.2,
                    }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Action Description Card: explains what the selected button does */}
        {(() => {
          const activeType = quickTypes.find((q) => q.id === selectedType);
          if (!activeType) return null;
          return (
            <div
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${activeType.color}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{activeType.emoji}</span>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{activeType.label}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>— Action Guide</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginTop: '2px' }}>
                  {activeType.description}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Error message */}
        {formError && (
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
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit}>
          {/* Amount & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Raqam / Amount ({user?.currency || 'Rs.'}) *</label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 1500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input mono"
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Tareekh / Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Conditional: Category + Custom Reason Mode for Expense & Income */}
          {(selectedType === 'expense' || selectedType === 'income') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label">
                  {selectedType === 'expense' ? 'Kharch ki Wajah / Category *' : 'Aamdani ka Zariya / Category *'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--personal-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {isCustomCategory ? (
                    <>
                      <Tag size={12} />
                      <span>← Select from List</span>
                    </>
                  ) : (
                    <>
                      <PenTool size={12} />
                      <span>+ Apni Wja Likhein (Custom Reason)</span>
                    </>
                  )}
                </button>
              </div>

              {isCustomCategory ? (
                <div>
                  <input
                    type="text"
                    placeholder="Apni wajah khud likhein (e.g. Dawaayi, Ration, Bijli Bill, Shaadi Gift, Fuel)"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="form-input"
                    required
                    autoFocus
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    💡 Yeh wajah aapke record aur reports mein category ke tore par save ho jayegi.
                  </div>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  required
                >
                  {categories
                    .filter((c) => c.type === selectedType)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              )}
            </div>
          )}

          {/* Conditional: Person for Friends / Vault */}
          {(selectedType === 'udhaar' ||
            selectedType === 'udhaar_taken' ||
            selectedType === 'friend_payment' ||
            selectedType === 'vault_deposit' ||
            selectedType === 'vault_return') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label">
                  {selectedType.includes('vault') ? 'Vault Amanatdar (Person) *' : 'Dost ka Naam (Friend Name) *'}
                </label>
                {selectedType !== 'vault_return' && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewPerson(!isAddingNewPerson)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--personal-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isAddingNewPerson ? '← Select existing' : '+ Naya Shakhs / Friend Likhein'}
                  </button>
                )}
              </div>

              {isAddingNewPerson ? (
                <input
                  type="text"
                  placeholder="Shakhs / Dost ka naam likhein (e.g. Bilal, Hamza, Tariq)"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              ) : (
                <select
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="form-select"
                  required
                >
                  {selectedType.includes('vault') ? (
                    vaultPeople.length > 0 ? (
                      vaultPeople.map((vp) => {
                        const bal = getVaultPersonBalance(vp.id);
                        return (
                          <option key={vp.id} value={vp.id}>
                            {vp.name} (Currently Holding: {user?.currency || 'Rs.'} {bal.holding.toLocaleString()})
                          </option>
                        );
                      })
                    ) : (
                      <option value="">Abhi koi person add nahi hai - naya naam likhein</option>
                    )
                  ) : friends.length > 0 ? (
                    friends.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Abhi koi friend add nahi hai - naya naam likhein</option>
                  )}
                </select>
              )}
            </div>
          )}

          {/* Dedicated Custom Reason / Description Field */}
          <div className="form-group">
            <label className="form-label">
              {selectedType.includes('udhaar')
                ? 'Wajah / Kis kaam ke liye diye ya liye? (Reason / Note)'
                : 'Tafseel / Wajah (Note / Reason)'}
            </label>
            <input
              type="text"
              placeholder={
                selectedType === 'udhaar'
                  ? 'e.g. Bike petrol ke liye, emergency zaroorat'
                  : selectedType === 'udhaar_taken'
                  ? 'e.g. Fee ada karni thi, aglay hafte wapis dene hain'
                  : selectedType.includes('vault')
                  ? 'e.g. Shaadi ki bachat, safar ke mehfooz paise'
                  : 'e.g. Chai paani, dinner, dukan ka saaman'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${
                selectedType === 'expense'
                  ? 'btn-danger'
                  : selectedType === 'income'
                  ? 'btn-primary'
                  : selectedType === 'udhaar_taken'
                  ? 'btn-friends'
                  : selectedType.includes('vault')
                  ? 'btn-vault'
                  : 'btn-friends'
              }`}
              style={{ minWidth: '140px' }}
            >
              Save Record ✓
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
