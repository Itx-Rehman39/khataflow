import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Moon,
  Sun,
  ShieldCheck,
  User,
  Bell,
  Wallet,
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const SettingsPage: React.FC = () => {
  const {
    categories,
    addCategory,
    deleteCategory,
    resetToSampleData,
    exportDataJSON,
    importDataJSON,
    showToast,
  } = useKhata();
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile form state
  const [name, setName] = useState(user?.name || 'Abulrehman');
  const [email, setEmail] = useState(user?.email || 'abulrehman@khataflow.com');
  const [currency, setCurrency] = useState(user?.currency || 'Rs.');

  // New category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');

  // Confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, email, currency);
    showToast('Profile and currency preferences updated!');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatType);
    setNewCatName('');
  };

  const handleExportJSON = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KhataFlow-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Complete backup exported as JSON!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importDataJSON(content);
        if (!res.success) {
          showToast(res.error || 'Failed to import backup', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '860px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Settings</h1>
        <div className="tagline-banner">Make KhataFlow work your way. Your account, your preferences.</div>
      </div>

      {/* 1. Profile & Currency */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <User size={18} color="var(--personal-primary)" />
          Profile & Regional Preferences
        </h3>

        <form onSubmit={handleSaveProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-select"
              >
                <option value="Rs.">PKR (Rs.)</option>
                <option value="₹">INR (₹)</option>
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SAR">SAR (﷼)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* 2. Theme Selection (Design 1 vs Design 2) */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Sun size={18} color="var(--personal-primary)" />
          Theme & Appearance
        </h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Choose between Design 1 (Clean Emerald Light) or Design 2 (FinTech Cyber Dark)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {/* Light Theme Card */}
          <div
            onClick={() => setTheme('light')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: theme === 'light' ? '2px solid var(--personal-primary)' : '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Design 1 — Light</span>
              {theme === 'light' && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  Active
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Clean, calm, emerald and productive. Ideal for daylight and clear reading.
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme('dark')}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: theme === 'dark' ? '2px solid var(--personal-primary)' : '1px solid var(--border-color)',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Design 2 — Dark</span>
              {theme === 'dark' && (
                <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                  Active
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Sleek modern FinTech with vibrant neon semantic highlights.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Management */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Wallet size={18} color="var(--personal-primary)" />
          Category Management
        </h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Create custom tags for personal expenses and income
        </div>

        {/* Add custom category form */}
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="New category name (e.g. Gym, Books, Petrol)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="form-input"
            style={{ flex: '1 1 200px' }}
            required
          />

          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as any)}
            className="form-select"
            style={{ width: '130px' }}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <button type="submit" className="btn btn-secondary btn-sm">
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </form>

        {/* Categories list */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map((c) => (
            <div
              key={c.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
              }}
            >
              <span>{c.name}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>({c.type})</span>
              {!c.isDefault && (
                <button
                  type="button"
                  onClick={() => deleteCategory(c.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--expense-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Data Backup, Export & Reset */}
      <div className="kf-card">
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={18} color="var(--personal-primary)" />
          Data Backup & Safety
        </h3>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Download an offline JSON copy of all your financial ledgers or restore from a backup file.
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={handleExportJSON} className="btn btn-secondary btn-sm">
            <Download size={16} />
            <span>Export Backup JSON</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <Upload size={16} />
            <span>Restore Backup JSON</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="btn btn-danger btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            <RefreshCw size={16} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={resetToSampleData}
        title="Reset to Original Sample Data?"
        message="This will restore all records to the original demo values (October 2026 baseline with Ahmed, Ali, Usman, and original balance of Rs. 18,450). Any customized transactions will be refreshed."
        confirmText="Yes, Reset"
        isDangerous={true}
      />
    </div>
  );
};
