import React, { useState } from 'react';
import {
  Menu,
  Search,
  Calendar,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useKhata } from '../../context/KhataContext';

interface HeaderProps {
  onToggleMobile: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobile,
  searchQuery,
  onSearchChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { currentAppDate, setCurrentAppDate, summary } = useKhata();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Format display date
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${y}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        gap: '20px',
      }}
    >
      {/* Left: Mobile hamburger & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '520px' }}>
        <button
          onClick={onToggleMobile}
          className="mobile-toggle-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Input */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '380px',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search transactions, notes, people..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              fontSize: '0.88rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right: Date Picker, Theme Toggle, Notifications, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Date Selector Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: 'var(--radius-full)',
              padding: '7px 14px',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
          >
            <Calendar size={15} color="var(--personal-primary)" />
            <span>{formatDateDisplay(currentAppDate)}</span>
          </button>

          {showDatePicker && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '14px',
                zIndex: 60,
                minWidth: '220px',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Select Active App Date
              </div>
              <input
                type="date"
                className="form-input"
                value={currentAppDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentAppDate(e.target.value);
                    setShowDatePicker(false);
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setCurrentAppDate(new Date().toISOString().split('T')[0]);
                    setShowDatePicker(false);
                  }}
                >
                  Set to Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Design 1 vs Design 2) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode (Design 1)' : 'Switch to Dark Mode (Design 2)'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)')}
        >
          {theme === 'dark' ? (
            <Sun size={18} color="#fbbf24" />
          ) : (
            <Moon size={18} color="var(--text-muted)" />
          )}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card-subtle)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={18} color="var(--text-muted)" />
            {summary.friendsCountReceive > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: 'var(--friends-primary)',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                width: '320px',
                padding: '16px',
                zIndex: 60,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--personal-primary)', fontWeight: 600 }}>Clear all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--friends-light)',
                  }}
                >
                  <AlertCircle size={18} color="var(--friends-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--friends-text)' }}>
                      Pending Udhaar
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      You have {user?.currency || 'Rs.'} {summary.friendsReceivable.toLocaleString()} to receive from friends.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--vault-light)',
                  }}
                >
                  <CheckCircle2 size={18} color="var(--vault-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--vault-text)' }}>
                      Money Vault Custody
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Holding {user?.currency || 'Rs.'} {summary.vaultTotalHeld.toLocaleString()} for {summary.vaultPeopleCount} people. Amanat safe.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Circle */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--personal-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            cursor: 'pointer',
          }}
          title={user?.name}
        >
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
};
