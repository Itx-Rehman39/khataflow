import React, { useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  HandCoins,
  History,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { Friend, FriendTransaction, TransactionType } from '../types';

interface FriendsPageProps {
  onOpenQuickAdd: (type?: TransactionType) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onOpenQuickAdd }) => {
  const {
    friends,
    friendTransactions,
    getFriendBalance,
    addFriend,
    deleteFriend,
    addFriendTransaction,
    updateFriendTransaction,
    deleteFriendTransaction,
    settleFriendDebt,
    summary,
  } = useKhata();
  const { user } = useAuth();
  const currency = user?.currency || 'Rs.';

  const [activeTab, setActiveTab] = useState<'all' | 'receive' | 'pay'>('all');
  const [search, setSearch] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  // Settlement modal state
  const [settleFriendModal, setSettleFriendModal] = useState<Friend | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleNotes, setSettleNotes] = useState<string>('');

  // Direct Udhaar (Diya / Liya) modal state
  const [directUdhaarModal, setDirectUdhaarModal] = useState<{
    friend: Friend;
    type: 'give' | 'take';
  } | null>(null);
  const [udhaarAmount, setUdhaarAmount] = useState<string>('');
  const [udhaarDate, setUdhaarDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [udhaarReason, setUdhaarReason] = useState<string>('');

  // Edit Friend Transaction Modal state
  const [editingTx, setEditingTx] = useState<FriendTransaction | null>(null);
  const [editTxAmount, setEditTxAmount] = useState<string>('');
  const [editTxDate, setEditTxDate] = useState<string>('');
  const [editTxDescription, setEditTxDescription] = useState<string>('');
  const [editTxType, setEditTxType] = useState<'give' | 'take' | 'settlement'>('give');

  // Delete confirmation modal states
  const [deletingTx, setDeletingTx] = useState<FriendTransaction | null>(null);
  const [deletingFriend, setDeletingFriend] = useState<Friend | null>(null);

  const handleOpenEditTx = (tx: FriendTransaction) => {
    setEditingTx(tx);
    setEditTxAmount(tx.amount.toString());
    setEditTxDate(tx.date);
    setEditTxDescription(tx.description);
    setEditTxType(tx.type);
  };

  const handleSaveEditTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const amt = parseFloat(editTxAmount);
    if (isNaN(amt) || amt <= 0) return;

    updateFriendTransaction(editingTx.id, {
      amount: amt,
      date: editTxDate,
      description: editTxDescription.trim(),
      type: editTxType,
    });

    setEditingTx(null);
  };

  const handleConfirmDeleteTx = () => {
    if (!deletingTx) return;
    deleteFriendTransaction(deletingTx.id);
    setDeletingTx(null);
  };

  const handleConfirmDeleteFriend = () => {
    if (!deletingFriend) return;
    deleteFriend(deletingFriend.id);
    if (selectedFriend?.id === deletingFriend.id) {
      setSelectedFriend(null);
    }
    setDeletingFriend(null);
  };

  const handleOpenDirectUdhaar = (friend: Friend, type: 'give' | 'take') => {
    setDirectUdhaarModal({ friend, type });
    setUdhaarAmount('');
    setUdhaarDate(new Date().toISOString().split('T')[0]);
    setUdhaarReason('');
  };

  const handleConfirmDirectUdhaar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUdhaarModal) return;

    const amt = parseFloat(udhaarAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = addFriendTransaction(
      directUdhaarModal.friend.id,
      directUdhaarModal.type,
      amt,
      udhaarDate,
      udhaarReason.trim() || (directUdhaarModal.type === 'give' ? 'Udhaar diya' : 'Udhaar liya')
    );

    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setDirectUdhaarModal(null);
    }
  };

  // Add friend modal state
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [newFriendNotes, setNewFriendNotes] = useState('');

  // Filtered friends list
  const filteredFriends = friends.filter((f) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || f.name.toLowerCase().includes(q) || (f.phone && f.phone.includes(q));
    if (!matchesSearch) return false;

    const bal = getFriendBalance(f.id);
    if (activeTab === 'receive') return bal.receivable > 0;
    if (activeTab === 'pay') return bal.payable > 0;
    return true;
  });

  const handleCreateFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    addFriend(newFriendName, newFriendPhone, newFriendNotes);
    setNewFriendName('');
    setNewFriendPhone('');
    setNewFriendNotes('');
    setShowAddFriend(false);
  };

  const handleOpenSettle = (friend: Friend) => {
    const bal = getFriendBalance(friend.id);
    const outstanding = Math.max(bal.receivable, bal.payable);
    setSettleFriendModal(friend);
    setSettleAmount(outstanding.toString());
    setSettleNotes(`Settlement with ${friend.name}`);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleFriendModal) return;

    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;

    const res = settleFriendDebt(settleFriendModal.id, amt, undefined, settleNotes);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
      setSettleFriendModal(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Friends & Udhaar</h1>
          <div className="tagline-banner">Friends stay friends. Hisaab stays clear.</div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowAddFriend(true)} className="btn btn-secondary btn-sm" title="Add new friend account">
            <Users size={15} />
            <span>+ New Friend</span>
          </button>
          <button onClick={() => onOpenQuickAdd('udhaar')} className="btn btn-friends btn-sm" title="Record money lent to someone">
            <Plus size={15} />
            <span>+ Lent Money</span>
          </button>
          <button onClick={() => onOpenQuickAdd('udhaar_taken')} className="btn btn-secondary btn-sm" style={{ borderColor: '#ea580c', color: '#ea580c' }} title="Record money borrowed from someone">
            <Plus size={15} />
            <span>+ Borrow Money</span>
          </button>
        </div>
      </div>

      {/* Summary Cards: You Will Receive vs You Will Pay */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Receivable */}
        <div
          className="kf-card"
          style={{
            borderLeft: '4px solid var(--friends-primary)',
            backgroundColor: activeTab === 'receive' ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('receive')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-friends">YOU WILL RECEIVE</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{summary.friendsCountReceive} Friends</span>
          </div>
          <div className="tagline-banner" style={{ marginTop: '6px' }}>Money that's coming back to you.</div>
          <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--friends-text)', marginTop: '6px' }}>
            {currency} {summary.friendsReceivable.toLocaleString()}
          </div>
        </div>

        {/* Payable */}
        <div
          className="kf-card"
          style={{
            borderLeft: '4px solid #ea580c',
            backgroundColor: activeTab === 'pay' ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
            cursor: 'pointer',
          }}
          onClick={() => setActiveTab('pay')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-friends" style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }}>
              YOU WILL PAY
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{summary.friendsCountPay} Friends</span>
          </div>
          <div className="tagline-banner" style={{ marginTop: '6px' }}>Clear what you owe.</div>
          <div className="mono" style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
            {currency} {summary.friendsPayable.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-friends' : 'btn-secondary'}`}
          >
            All Accounts ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('receive')}
            className={`btn btn-sm ${activeTab === 'receive' ? 'btn-friends' : 'btn-secondary'}`}
          >
            To Receive ({summary.friendsCountReceive})
          </button>
          <button
            onClick={() => setActiveTab('pay')}
            className={`btn btn-sm ${activeTab === 'pay' ? 'btn-friends' : 'btn-secondary'}`}
          >
            To Pay ({summary.friendsCountPay})
          </button>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder="Search friend..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', paddingBlock: '6px', fontSize: '0.84rem' }}
          />
        </div>
      </div>

      {/* Friends Cards Grid */}
      {filteredFriends.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={24} />
          </div>
          <div className="empty-state-title">No pending udhaar. You're all clear!</div>
          <div className="empty-state-desc">All friend accounts are settled or no records match your search.</div>
          <button onClick={() => setShowAddFriend(true)} className="btn btn-friends btn-sm">
            + Add New Friend
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredFriends.map((friend) => {
            const bal = getFriendBalance(friend.id);
            const isReceivable = bal.receivable > 0;
            const isPayable = bal.payable > 0;
            const isSettled = !isReceivable && !isPayable;

            return (
              <div
                key={friend.id}
                className="kf-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isReceivable
                    ? '3px solid var(--friends-primary)'
                    : isPayable
                    ? '3px solid #ea580c'
                    : '1px solid var(--border-color)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{friend.name}</h3>
                      {friend.phone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{friend.phone}</div>
                      )}
                    </div>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: isReceivable
                          ? 'var(--friends-light)'
                          : isPayable
                          ? '#fff7ed'
                          : 'var(--bg-card-subtle)',
                        color: isReceivable
                          ? 'var(--friends-text)'
                          : isPayable
                          ? '#ea580c'
                          : 'var(--text-subtle)',
                      }}
                    >
                      {isReceivable ? 'You Will Receive' : isPayable ? 'You Will Pay' : 'Settled ✓'}
                    </span>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Balance</div>
                    <div
                      className="mono"
                      style={{
                        fontSize: '1.65rem',
                        fontWeight: 800,
                        color: isReceivable
                          ? 'var(--friends-primary)'
                          : isPayable
                          ? '#ea580c'
                          : 'var(--text-muted)',
                      }}
                    >
                      {currency} {(isReceivable ? bal.receivable : bal.payable).toLocaleString()}
                    </div>
                  </div>

                  {friend.notes && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '6px' }}>
                      Note: {friend.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '6px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setSelectedFriend(friend)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '5px 6px' }}
                    title="View Ledger & History"
                  >
                    <History size={13} />
                    <span>History</span>
                  </button>

                  <button
                    onClick={() => handleOpenDirectUdhaar(friend, 'give')}
                    className="btn btn-friends btn-sm"
                    style={{ fontSize: '0.74rem', padding: '5px 6px' }}
                    title="Money Lent (You gave)"
                  >
                    <Plus size={13} />
                    <span>Lent</span>
                  </button>

                  <button
                    onClick={() => handleOpenDirectUdhaar(friend, 'take')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '5px 6px', borderColor: '#ea580c', color: '#ea580c' }}
                    title="Money Borrowed (You took)"
                  >
                    <Plus size={13} />
                    <span>Borrow</span>
                  </button>

                  {!isSettled && (
                    <button
                      onClick={() => handleOpenSettle(friend)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '5px 6px', borderColor: 'var(--personal-primary)', color: 'var(--personal-primary)' }}
                      title="Settle up debt balance"
                    >
                      <Check size={13} />
                      <span>Settle</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingFriend(friend)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '5px 6px', color: '#ef4444' }}
                    title="Delete Friend Account"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Friend Account History Drawer/Modal */}
      {selectedFriend && (
        <div className="modal-overlay" onClick={() => setSelectedFriend(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedFriend.name} — Ledger</h3>
                <div className="tagline-banner">Every person. Every rupee. Every record.</div>
              </div>
              <button onClick={() => setSelectedFriend(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>

            {/* Friend balance summary */}
            {(() => {
              const bal = getFriendBalance(selectedFriend.id);
              return (
                <div
                  style={{
                    backgroundColor: 'var(--bg-card-subtle)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Standing:</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: bal.receivable > 0 ? 'var(--friends-primary)' : bal.payable > 0 ? '#ea580c' : 'var(--text-muted)',
                    }}
                  >
                    {bal.receivable > 0
                      ? `Receivable: ${currency} ${bal.receivable.toLocaleString()}`
                      : bal.payable > 0
                      ? `Payable: ${currency} ${bal.payable.toLocaleString()}`
                      : 'All Settled (Rs. 0)'}
                  </span>
                </div>
              );
            })()}

            {/* Transaction Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {friendTransactions.filter((t) => t.friendId === selectedFriend.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No transaction history recorded yet for {selectedFriend.name}.
                </div>
              ) : (
                friendTransactions
                  .filter((t) => t.friendId === selectedFriend.id)
                  .map((t) => {
                    const isGive = t.type === 'give';
                    const isTake = t.type === 'take';
                    const isSettle = t.type === 'settlement';

                    return (
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
                            {t.date} • {isGive ? 'Udhaar given' : isTake ? 'Udhaar taken' : 'Settlement'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            className="mono"
                            style={{
                              fontWeight: 700,
                              color: isGive
                                ? 'var(--friends-primary)'
                                : isTake
                                ? '#ea580c'
                                : 'var(--personal-primary)',
                            }}
                          >
                            {isGive ? '+' : isTake ? '-' : '✓ '}
                            {currency} {t.amount.toLocaleString()}
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditTx(t);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px', fontSize: '0.72rem' }}
                              title="Edit this udhaar record"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingTx(t);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '3px 6px', fontSize: '0.72rem', color: '#ef4444' }}
                              title="Delete this udhaar record"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  handleOpenDirectUdhaar(selectedFriend, 'give');
                }}
                className="btn btn-friends btn-sm"
              >
                + Lent Money
              </button>
              <button
                onClick={() => {
                  handleOpenDirectUdhaar(selectedFriend, 'take');
                }}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#ea580c', color: '#ea580c' }}
              >
                + Borrow Money
              </button>
              <button
                onClick={() => {
                  setSelectedFriend(null);
                  handleOpenSettle(selectedFriend);
                }}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'var(--personal-primary)', color: 'var(--personal-primary)' }}
              >
                Settle Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Debt Modal (supports partial & complete payments) */}
      {settleFriendModal && (
        <div className="modal-overlay" onClick={() => setSettleFriendModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
              Settle with {settleFriendModal.name}
            </h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Support partial or full settlement. Balance updates automatically.
            </div>

            <form onSubmit={handleConfirmSettle}>
              <div className="form-group">
                <label className="form-label">Settlement Amount ({currency}) *</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="form-input mono"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Wajah / Kis tehat adaigi hui? (Reason / Notes)</label>
                <input
                  type="text"
                  placeholder="e.g. Cash wapis diye / JazzCash transfer / Khana khila kar hisaab barabar kiya"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setSettleFriendModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-friends">
                  Confirm Settlement ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Friend Modal */}
      {showAddFriend && (
        <div className="modal-overlay" onClick={() => setShowAddFriend(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Add New Friend Account</h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Create an individual ledger to track udhaar and settlements.
            </div>

            <form onSubmit={handleCreateFriend}>
              <div className="form-group">
                <label className="form-label">Friend's Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Ali Raza"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="form-input"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. +92 300 1234567"
                  value={newFriendPhone}
                  onChange={(e) => setNewFriendPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Relationship (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Flatmate, College friend"
                  value={newFriendNotes}
                  onChange={(e) => setNewFriendNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddFriend(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-friends">
                  Save Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Udhaar Modal (Diya / Liya with Custom Reason) */}
      {directUdhaarModal && (
        <div className="modal-overlay" onClick={() => setDirectUdhaarModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {directUdhaarModal.type === 'give' ? '📤 Udhaar Diya' : '📥 Udhaar Liya'}
              </h3>
              <span
                className="badge badge-friends"
                style={
                  directUdhaarModal.type === 'take'
                    ? { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#ffedd5' }
                    : undefined
                }
              >
                {directUdhaarModal.friend.name}
              </span>
            </div>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              {directUdhaarModal.type === 'give'
                ? `Record money you gave to ${directUdhaarModal.friend.name}. They will owe you.`
                : `Record money you borrowed from ${directUdhaarModal.friend.name}. You will owe them.`}
            </div>

            <form onSubmit={handleConfirmDirectUdhaar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Raqam / Amount ({currency}) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    placeholder="e.g. 2000"
                    value={udhaarAmount}
                    onChange={(e) => setUdhaarAmount(e.target.value)}
                    className="form-input mono"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tareekh / Date *</label>
                  <input
                    type="date"
                    value={udhaarDate}
                    onChange={(e) => setUdhaarDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Custom Reason Field */}
              <div className="form-group">
                <label className="form-label">Wajah / Reason (Apni marzi ki waja likhein) *</label>
                <input
                  type="text"
                  placeholder={
                    directUdhaarModal.type === 'give'
                      ? 'e.g. Bike petrol, dukan ka saaman, emergency zaroorat, lunch bill'
                      : 'e.g. University fees, shopping ke liye liye, emergency loan'
                  }
                  value={udhaarReason}
                  onChange={(e) => setUdhaarReason(e.target.value)}
                  className="form-input"
                  required
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  💡 Yeh wja dost ke ledger aur aapke hisaab mein record ho jayegi.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setDirectUdhaarModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${directUdhaarModal.type === 'give' ? 'btn-friends' : 'btn-secondary'}`}
                  style={
                    directUdhaarModal.type === 'take'
                      ? { backgroundColor: '#ea580c', borderColor: '#ea580c', color: '#fff' }
                      : undefined
                  }
                >
                  {directUdhaarModal.type === 'give' ? 'Save (Udhaar Diya) ✓' : 'Save (Udhaar Liya) ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Friend Transaction Modal */}
      {editingTx && (
        <div className="modal-overlay" onClick={() => setEditingTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Edit Udhaar Record</h3>
            <div className="tagline-banner" style={{ marginBottom: '16px' }}>
              Fix mistake, update amount, change date, or update reason.
            </div>

            <form onSubmit={handleSaveEditTx}>
              {/* Type Switcher */}
              <div className="form-group">
                <label className="form-label">Transaction Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEditTxType('give')}
                    className={`btn btn-sm ${editTxType === 'give' ? 'btn-friends' : 'btn-secondary'}`}
                  >
                    📤 Lent
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxType('take')}
                    className="btn btn-sm"
                    style={
                      editTxType === 'take'
                        ? { backgroundColor: '#ea580c', color: '#fff', borderColor: '#ea580c' }
                        : { borderColor: 'var(--border-color)', color: 'var(--text-muted)' }
                    }
                  >
                    📥 Borrowed
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxType('settlement')}
                    className={`btn btn-sm ${editTxType === 'settlement' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    🤝 Settlement
                  </button>
                </div>
              </div>

              {/* Amount and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Amount ({currency}) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={editTxAmount}
                    onChange={(e) => setEditTxAmount(e.target.value)}
                    className="form-input mono"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={editTxDate}
                    onChange={(e) => setEditTxDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Description / Custom Reason */}
              <div className="form-group">
                <label className="form-label">Reason / Notes *</label>
                <input
                  type="text"
                  value={editTxDescription}
                  onChange={(e) => setEditTxDescription(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingTx(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {deletingTx && (
        <div className="modal-overlay" onClick={() => setDeletingTx(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ef4444' }}>
              <AlertCircle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Delete Udhaar Record?</h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to remove this record of{' '}
              <strong style={{ color: 'var(--text-main)' }}>
                {currency} {deletingTx.amount.toLocaleString()} ({deletingTx.description})
              </strong>
              ? This transaction will be permanently removed and your friend's balance will be recalculated immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingTx(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTx}
                className="btn btn-secondary"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
              >
                Delete Record 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Friend Ledger Confirmation Modal */}
      {deletingFriend && (
        <div className="modal-overlay" onClick={() => setDeletingFriend(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#ef4444' }}>
              <AlertCircle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Delete Friend Account?</h3>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to delete the account for{' '}
              <strong style={{ color: 'var(--text-main)' }}>{deletingFriend.name}</strong>? All associated udhaar
              transactions and history with this friend will be deleted.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeletingFriend(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteFriend}
                className="btn btn-secondary"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', borderColor: '#ef4444' }}
              >
                Delete Friend 🗑️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
