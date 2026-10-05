import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { DEFAULT_USER } from '../data/initialData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: () => void;
  updateProfile: (name: string, email: string, currency?: string) => void;
}

const ACCOUNTS_STORAGE_KEY = 'khataflow_accounts_store';

const getUserIdFromEmail = (email: string) => {
  return 'usr_' + email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered accounts lookup
  const getRegisteredAccounts = (): Record<string, User> => {
    try {
      const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveAccount = (account: User) => {
    try {
      const accounts = getRegisteredAccounts();
      accounts[account.email.toLowerCase().trim()] = account;
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // Storage full or restricted
    }
  };

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('khataflow_active_user');
    if (saved) {
      try {
        const parsed: User = JSON.parse(saved);
        if (parsed && parsed.email) {
          // Ensure correct ID mapping
          parsed.id = getUserIdFromEmail(parsed.email);
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    // Default to Abulrehman
    const defaultAcc: User = {
      ...DEFAULT_USER,
      id: getUserIdFromEmail(DEFAULT_USER.email),
    };
    saveAccount(defaultAcc);
    return defaultAcc;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('khataflow_active_user', JSON.stringify(user));
      saveAccount(user);
    } else {
      localStorage.removeItem('khataflow_active_user');
    }
  }, [user]);

  const login = async (email: string, _pass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const accounts = getRegisteredAccounts();
    const existing = accounts[cleanEmail];

    const loggedUser: User = existing || {
      id: getUserIdFromEmail(cleanEmail),
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      currency: 'Rs.',
    };

    saveAccount(loggedUser);
    setUser(loggedUser);
    return { success: true };
  };

  const register = async (name: string, email: string, _pass: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!name.trim()) {
      return { success: false, error: 'Full name is required' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    const newUser: User = {
      id: getUserIdFromEmail(cleanEmail),
      name: name.trim(),
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      currency: 'Rs.',
    };

    saveAccount(newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const quickDemoLogin = () => {
    const demoUser: User = {
      ...DEFAULT_USER,
      id: getUserIdFromEmail(DEFAULT_USER.email),
    };
    saveAccount(demoUser);
    setUser(demoUser);
  };

  const updateProfile = (name: string, email: string, currency?: string) => {
    if (!user) return;
    const cleanEmail = (email || user.email).toLowerCase().trim();
    const updated: User = {
      ...user,
      id: getUserIdFromEmail(cleanEmail),
      name: name.trim() || user.name,
      email: cleanEmail,
      currency: currency || user.currency || 'Rs.',
    };
    saveAccount(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        quickDemoLogin,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
