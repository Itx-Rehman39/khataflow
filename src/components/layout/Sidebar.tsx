import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  TrendingDown,
  TrendingUp,
  Users,
  Lock,
  CalendarCheck,
  FileBarChart2,
  CalendarRange,
  ShieldCheck,
  Settings,
  Plus,
  Zap,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import type { ViewType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useKhata } from '../../context/KhataContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenQuickAdd: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenQuickAdd,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { summary } = useKhata();
  const { theme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'income', label: 'Income', icon: TrendingUp },
    {
      id: 'friends',
      label: 'Friends & Udhaar',
      icon: Users,
      badge: summary.friendsCountReceive + summary.friendsCountPay > 0
        ? `${summary.friendsCountReceive + summary.friendsCountPay}`
        : undefined,
      badgeColor: 'var(--friends-primary)',
    },
    {
      id: 'vault',
      label: 'Money Vault',
      icon: Lock,
      badge: summary.vaultTotalHeld > 0 ? `${user?.currency || 'Rs.'}${Math.round(summary.vaultTotalHeld / 1000)}k` : undefined,
      badgeColor: 'var(--vault-primary)',
    },
    { id: 'daily-hisaab', label: 'Daily Hisaab', icon: CalendarCheck },
    { id: 'monthly-report', label: 'Monthly Reports', icon: FileBarChart2 },
    { id: 'yearly-report', label: 'Yearly Reports', icon: CalendarRange },
    {
      id: 'custody-report',
      label: 'Amanat Vault Report',
      icon: ShieldCheck,
      badge: summary.vaultTotalHeld > 0 ? `${user?.currency || 'Rs.'}${Math.round(summary.vaultTotalHeld / 1000)}k` : undefined,
      badgeColor: 'var(--vault-primary)',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayName = user?.name || 'Abulrehman';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <aside
        style={{
          width: '270px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          ...(isOpenMobile
            ? { position: 'fixed', left: 0, transform: 'translateX(0)' }
            : {}),
        }}
        className={`sidebar ${isOpenMobile ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Zap size={22} fill="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                KhataFlow
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Hisaab rakho. Sukoon rakho.
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="mobile-close-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Prominent + Add Button */}
        <div style={{ padding: '6px 16px 14px' }}>
          <button
            onClick={onOpenQuickAdd}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Plus size={18} strokeWidth={2.6} />
            <span>+ Add Transaction</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id as ViewType);
                  onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--personal-light)' : 'transparent',
                  color: isActive ? 'var(--personal-primary)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.9} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      backgroundColor: item.badgeColor || 'var(--personal-primary)',
                      color: '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Motivational Banner card as shown in Mockup */}
        <div style={{ padding: '10px 14px 12px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background:
                theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--personal-primary)', fontWeight: 700 }}>
              <Compass size={14} />
              <span>{theme === 'dark' ? 'FINANCIAL CLARITY' : 'ROZMARRA HISAAB'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px', fontWeight: 500, lineHeight: 1.4 }}>
              {theme === 'dark'
                ? 'Better Records, Bigger Dreams.'
                : 'Chhoti chhoti cheezein bhi badi kahaniyaan banati hain.'}
            </div>
          </div>
        </div>

        {/* User Profile Footer */}
        <div
          style={{
            padding: '14px 16px',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-card-subtle)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--personal-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'abulrehman@khataflow.com'}
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--expense-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
