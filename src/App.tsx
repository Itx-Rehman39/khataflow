import React, { useState } from 'react';
import { ViewType, TransactionType } from './types';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KhataProvider } from './context/KhataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickAddModal } from './components/common/QuickAddModal';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomePage } from './pages/IncomePage';
import { FriendsPage } from './pages/FriendsPage';
import { MoneyVaultPage } from './pages/MoneyVaultPage';
import { DailyHisaabPage } from './pages/DailyHisaabPage';
import { MonthlyReportPage } from './pages/MonthlyReportPage';
import { YearlyReportPage } from './pages/YearlyReportPage';
import { CustodyReportPage } from './pages/CustodyReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { Plus } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<TransactionType>('expense');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  };

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (query && currentView !== 'transactions') {
      setCurrentView('transactions');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          setGlobalSearch('');
        }}
        onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          onToggleMobile={() => setIsMobileNavOpen(!isMobileNavOpen)}
          searchQuery={globalSearch}
          onSearchChange={handleGlobalSearch}
        />

        <main className="main-content">
          {currentView === 'dashboard' && (
            <Dashboard
              onNavigate={(v) => setCurrentView(v)}
              onOpenQuickAdd={handleOpenQuickAdd}
            />
          )}

          {currentView === 'transactions' && (
            <TransactionsPage
              onOpenQuickAdd={handleOpenQuickAdd}
              globalSearchQuery={globalSearch}
            />
          )}

          {currentView === 'expenses' && (
            <ExpensesPage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'income' && (
            <IncomePage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'friends' && (
            <FriendsPage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'vault' && (
            <MoneyVaultPage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'daily-hisaab' && (
            <DailyHisaabPage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'monthly-report' && (
            <MonthlyReportPage onNavigate={(v) => setCurrentView(v)} />
          )}

          {currentView === 'yearly-report' && <YearlyReportPage />}

          {currentView === 'custody-report' && (
            <CustodyReportPage onOpenQuickAdd={handleOpenQuickAdd} />
          )}

          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={() => handleOpenQuickAdd('expense')}
        className="mobile-fab"
        title="Add Transaction"
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '999px',
          backgroundColor: 'var(--personal-primary)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90,
          cursor: 'pointer',
        }}
      >
        <Plus size={28} />
      </button>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddInitialType}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <KhataProvider>
          <MainApp />
        </KhataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
