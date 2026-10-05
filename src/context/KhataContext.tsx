import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type {
  Category,
  FinancialSummary,
  Friend,
  FriendTransaction,
  MonthlyClosingSnapshot,
  Transaction,
  TransactionType,
  VaultPerson,
  VaultTransaction,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  INITIAL_FRIENDS,
  INITIAL_FRIEND_TRANSACTIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_VAULT_PEOPLE,
  INITIAL_VAULT_TRANSACTIONS,
} from '../data/initialData';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface KhataContextType {
  // Data lists
  transactions: Transaction[];
  categories: Category[];
  friends: Friend[];
  friendTransactions: FriendTransaction[];
  vaultPeople: VaultPerson[];
  vaultTransactions: VaultTransaction[];
  monthlySnapshots: MonthlyClosingSnapshot[];

  // Selected date simulation / tracker
  currentAppDate: string; // YYYY-MM-DD
  setCurrentAppDate: (date: string) => void;

  // Financial summary
  summary: FinancialSummary;

  // Actions for Transactions
  addTransaction: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    personId?: string;
    personName?: string;
  }) => { success: boolean; error?: string };
  updateTransaction: (id: string, updates: Partial<Transaction>) => { success: boolean; error?: string };
  deleteTransaction: (id: string) => void;

  // Actions for Friends
  addFriend: (name: string, phone?: string, notes?: string) => Friend;
  deleteFriend: (friendId: string) => void;
  addFriendTransaction: (
    friendId: string,
    type: 'give' | 'take' | 'settlement',
    amount: number,
    date: string,
    description: string
  ) => { success: boolean; error?: string };
  updateFriendTransaction: (
    id: string,
    updates: {
      type?: 'give' | 'take' | 'settlement';
      amount?: number;
      date?: string;
      description?: string;
    }
  ) => { success: boolean; error?: string };
  deleteFriendTransaction: (id: string) => { success: boolean };
  settleFriendDebt: (
    friendId: string,
    amount?: number,
    date?: string,
    notes?: string
  ) => { success: boolean; error?: string };
  getFriendBalance: (friendId: string) => { receivable: number; payable: number; net: number };

  // Actions for Money Vault
  addVaultPerson: (name: string, phone?: string, notes?: string) => VaultPerson;
  addVaultDeposit: (
    vaultPersonId: string,
    amount: number,
    date: string,
    description: string
  ) => { success: boolean; error?: string };
  addVaultReturn: (
    vaultPersonId: string,
    amount: number,
    date: string,
    description: string
  ) => { success: boolean; error?: string };
  getVaultPersonBalance: (vaultPersonId: string) => { deposited: number; returned: number; holding: number };

  // Categories
  addCategory: (name: string, type: 'expense' | 'income', icon?: string, color?: string) => void;
  deleteCategory: (id: string) => void;

  // Snapshots & Monthly closing
  closeMonth: (year: number, month: number) => void;

  // Data management
  resetToSampleData: () => void;
  clearUserData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; error?: string };

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const KhataContext = createContext<KhataContextType | undefined>(undefined);

export const KhataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'usr_guest';

  // Per-user storage key builder
  const storageKey = useCallback((key: string) => `khataflow_acc_${userId}_${key}`, [userId]);

  // Clean legacy dummy keys on initial load
  useEffect(() => {
    try {
      const keysToRemove = [
        'khataflow_usr_001_transactions',
        'khataflow_usr_001_friends',
        'khataflow_usr_001_friend_transactions',
        'khataflow_usr_001_vault_people',
        'khataflow_usr_001_vault_transactions',
        'khataflow_usr_001_snapshots',
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  const [currentAppDate, setCurrentAppDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Safe helper to read from localStorage immediately on initial mount
  const readInitial = useCallback(
    <T,>(key: string, fallback: T): T => {
      try {
        const saved = localStorage.getItem(`khataflow_acc_${userId}_${key}`);
        return saved ? JSON.parse(saved) : fallback;
      } catch {
        return fallback;
      }
    },
    [userId]
  );

  // Lazy state initialization ensures data is already loaded on the very first render!
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readInitial('transactions', INITIAL_TRANSACTIONS)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    readInitial('categories', DEFAULT_CATEGORIES)
  );
  const [friends, setFriends] = useState<Friend[]>(() =>
    readInitial('friends', INITIAL_FRIENDS)
  );
  const [friendTransactions, setFriendTransactions] = useState<FriendTransaction[]>(() =>
    readInitial('friend_transactions', INITIAL_FRIEND_TRANSACTIONS)
  );
  const [vaultPeople, setVaultPeople] = useState<VaultPerson[]>(() =>
    readInitial('vault_people', INITIAL_VAULT_PEOPLE)
  );
  const [vaultTransactions, setVaultTransactions] = useState<VaultTransaction[]>(() =>
    readInitial('vault_transactions', INITIAL_VAULT_TRANSACTIONS)
  );
  const [monthlySnapshots, setMonthlySnapshots] = useState<MonthlyClosingSnapshot[]>(() =>
    readInitial('snapshots', [])
  );

  const activeUserIdRef = useRef(userId);

  // When account/userId changes (e.g. login/logout), reload data for the new account
  useEffect(() => {
    if (activeUserIdRef.current !== userId) {
      activeUserIdRef.current = userId;
      setTransactions(readInitial('transactions', INITIAL_TRANSACTIONS));
      setCategories(readInitial('categories', DEFAULT_CATEGORIES));
      setFriends(readInitial('friends', INITIAL_FRIENDS));
      setFriendTransactions(readInitial('friend_transactions', INITIAL_FRIEND_TRANSACTIONS));
      setVaultPeople(readInitial('vault_people', INITIAL_VAULT_PEOPLE));
      setVaultTransactions(readInitial('vault_transactions', INITIAL_VAULT_TRANSACTIONS));
      setMonthlySnapshots(readInitial('snapshots', []));
    }
  }, [userId, readInitial]);

  // Persist per-user changes to localStorage safely
  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('transactions'), JSON.stringify(transactions));
    }
  }, [transactions, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('categories'), JSON.stringify(categories));
    }
  }, [categories, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('friends'), JSON.stringify(friends));
    }
  }, [friends, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('friend_transactions'), JSON.stringify(friendTransactions));
    }
  }, [friendTransactions, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('vault_people'), JSON.stringify(vaultPeople));
    }
  }, [vaultPeople, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('vault_transactions'), JSON.stringify(vaultTransactions));
    }
  }, [vaultTransactions, storageKey, user, userId]);

  useEffect(() => {
    if (user && activeUserIdRef.current === userId) {
      localStorage.setItem(storageKey('snapshots'), JSON.stringify(monthlySnapshots));
    }
  }, [monthlySnapshots, storageKey, user, userId]);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Friend balance
  const getFriendBalance = useCallback(
    (friendId: string) => {
      const txs = friendTransactions.filter((t) => t.friendId === friendId);
      let receivable = 0;
      let payable = 0;

      for (const t of txs) {
        if (t.type === 'give') {
          receivable += t.amount;
        } else if (t.type === 'take') {
          payable += t.amount;
        } else if (t.type === 'settlement') {
          if (receivable > 0) {
            const deduction = Math.min(receivable, t.amount);
            receivable -= deduction;
            const remainder = t.amount - deduction;
            if (remainder > 0 && payable > 0) {
              payable = Math.max(0, payable - remainder);
            }
          } else if (payable > 0) {
            payable = Math.max(0, payable - t.amount);
          }
        }
      }

      return {
        receivable,
        payable,
        net: receivable - payable,
      };
    },
    [friendTransactions]
  );

  // Helper: Vault person balance
  const getVaultPersonBalance = useCallback(
    (vaultPersonId: string) => {
      const txs = vaultTransactions.filter((t) => t.vaultPersonId === vaultPersonId);
      let deposited = 0;
      let returned = 0;

      for (const t of txs) {
        if (t.type === 'deposit') {
          deposited += t.amount;
        } else if (t.type === 'return') {
          returned += t.amount;
        }
      }

      return {
        deposited,
        returned,
        holding: Math.max(0, deposited - returned),
      };
    },
    [vaultTransactions]
  );

  // Financial summary (Personal, Friends, Vault)
  const summary: FinancialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount;
      }
    }

    const availableBalance = totalIncome - totalExpenses;
    const savings = availableBalance;

    let friendsReceivable = 0;
    let friendsPayable = 0;
    let friendsCountReceive = 0;
    let friendsCountPay = 0;

    for (const friend of friends) {
      const bal = getFriendBalance(friend.id);
      if (bal.receivable > 0) {
        friendsReceivable += bal.receivable;
        friendsCountReceive++;
      }
      if (bal.payable > 0) {
        friendsPayable += bal.payable;
        friendsCountPay++;
      }
    }

    let vaultTotalHeld = 0;
    let vaultPeopleCount = 0;

    for (const person of vaultPeople) {
      const bal = getVaultPersonBalance(person.id);
      if (bal.holding > 0) {
        vaultTotalHeld += bal.holding;
        vaultPeopleCount++;
      }
    }

    return {
      availableBalance,
      totalIncome,
      totalExpenses,
      savings,
      friendsReceivable,
      friendsPayable,
      friendsCountReceive,
      friendsCountPay,
      vaultTotalHeld,
      vaultPeopleCount,
    };
  }, [transactions, friends, vaultPeople, getFriendBalance, getVaultPersonBalance]);

  // Actions for Transactions
  const addTransaction = (data: {
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
    date: string;
    personId?: string;
    personName?: string;
  }): { success: boolean; error?: string } => {
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' };
    }
    if (!data.date) {
      return { success: false, error: 'Date is required' };
    }

    if (data.type === 'expense' || data.type === 'income') {
      const finalCategory = data.category.trim() || (data.type === 'expense' ? 'Other Expenses' : 'Other Income');

      // Auto-save custom category if user entered a new reason/category
      const exists = categories.some((c) => c.name.toLowerCase() === finalCategory.toLowerCase() && c.type === data.type);
      if (!exists && finalCategory) {
        const newCat: Category = {
          id: 'cat_' + Date.now(),
          userId,
          name: finalCategory,
          type: data.type,
          icon: 'Tag',
          color: data.type === 'expense' ? '#f43f5e' : '#10b981',
          isDefault: false,
        };
        setCategories((prev) => [...prev, newCat]);
      }

      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        userId,
        date: data.date,
        type: data.type,
        amount: Number(data.amount),
        category: finalCategory,
        description: data.description.trim() || `${finalCategory}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(
        `${data.type === 'expense' ? 'Expense' : 'Income'} of ${user?.currency || 'Rs.'} ${data.amount.toLocaleString()} recorded (${finalCategory})!`
      );
      return { success: true };
    }

    if (data.type === 'udhaar') {
      let targetFriendId = data.personId;
      if (!targetFriendId && data.personName?.trim()) {
        const newFriend = addFriend(data.personName.trim());
        targetFriendId = newFriend.id;
      }
      if (!targetFriendId) {
        return { success: false, error: 'Please select or enter friend name' };
      }

      return addFriendTransaction(
        targetFriendId,
        'give',
        data.amount,
        data.date,
        data.description || 'Udhaar diya'
      );
    }

    if (data.type === 'udhaar_taken') {
      let targetFriendId = data.personId;
      if (!targetFriendId && data.personName?.trim()) {
        const newFriend = addFriend(data.personName.trim());
        targetFriendId = newFriend.id;
      }
      if (!targetFriendId) {
        return { success: false, error: 'Please select or enter friend name' };
      }

      return addFriendTransaction(
        targetFriendId,
        'take',
        data.amount,
        data.date,
        data.description || 'Udhaar liya'
      );
    }

    if (data.type === 'friend_payment') {
      let targetFriendId = data.personId;
      if (!targetFriendId && data.personName?.trim()) {
        const newFriend = addFriend(data.personName.trim());
        targetFriendId = newFriend.id;
      }
      if (!targetFriendId) {
        return { success: false, error: 'Please select or enter friend name' };
      }

      const bal = getFriendBalance(targetFriendId);
      if (bal.receivable > 0) {
        return settleFriendDebt(targetFriendId, data.amount, data.date, data.description);
      } else {
        return addFriendTransaction(
          targetFriendId,
          'take',
          data.amount,
          data.date,
          data.description || 'Friend payment / Udhaar taken'
        );
      }
    }

    if (data.type === 'vault_deposit') {
      let targetVaultId = data.personId;
      if (!targetVaultId && data.personName?.trim()) {
        const newPerson = addVaultPerson(data.personName.trim());
        targetVaultId = newPerson.id;
      }
      if (!targetVaultId) {
        return { success: false, error: 'Please select or enter person name' };
      }

      return addVaultDeposit(
        targetVaultId,
        data.amount,
        data.date,
        data.description || 'Received for keeping'
      );
    }

    if (data.type === 'vault_return') {
      let targetVaultId = data.personId;
      if (!targetVaultId && data.personName?.trim()) {
        const newPerson = addVaultPerson(data.personName.trim());
        targetVaultId = newPerson.id;
      }
      if (!targetVaultId) {
        return { success: false, error: 'Please select person whose money is being returned' };
      }

      return addVaultReturn(
        targetVaultId,
        data.amount,
        data.date,
        data.description || 'Returned to owner'
      );
    }

    return { success: false, error: 'Unknown transaction type' };
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>): { success: boolean; error?: string } => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
    showToast('Transaction updated successfully');
    return { success: true };
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (target && target.personId) {
      // Sync friendTransactions if this was a friend record
      setFriendTransactions((prev) =>
        prev.filter((ft) => !(ft.friendId === target.personId && ft.date === target.date && ft.amount === target.amount))
      );
      // Sync vaultTransactions if this was a vault record
      setVaultTransactions((prev) =>
        prev.filter((vt) => !(vt.vaultPersonId === target.personId && vt.date === target.date && vt.amount === target.amount))
      );
    }
    showToast('Transaction deleted', 'info');
  };

  const deleteFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    setFriendTransactions((prev) => prev.filter((t) => t.friendId !== friendId));
    setTransactions((prev) => prev.filter((t) => t.personId !== friendId));
    showToast('Friend ledger deleted successfully', 'info');
  };

  const deleteFriendTransaction = (id: string): { success: boolean } => {
    const target = friendTransactions.find((t) => t.id === id);
    setFriendTransactions((prev) => prev.filter((t) => t.id !== id));

    if (target) {
      const relatedTxId = 'tx_' + id;
      setTransactions((prev) =>
        prev.filter(
          (t) =>
            t.id !== relatedTxId &&
            !(t.personId === target.friendId && t.date === target.date && t.amount === target.amount)
        )
      );
    }

    showToast('Udhaar record deleted successfully', 'info');
    return { success: true };
  };

  const updateFriendTransaction = (
    id: string,
    updates: {
      type?: 'give' | 'take' | 'settlement';
      amount?: number;
      date?: string;
      description?: string;
    }
  ): { success: boolean; error?: string } => {
    const existing = friendTransactions.find((t) => t.id === id);
    if (!existing) return { success: false, error: 'Record not found' };

    setFriendTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    const relatedTxId = 'tx_' + id;
    setTransactions((prev) =>
      prev.map((t) => {
        if (
          t.id === relatedTxId ||
          (t.personId === existing.friendId && t.date === existing.date && t.amount === existing.amount)
        ) {
          const newType = updates.type
            ? updates.type === 'give'
              ? 'udhaar'
              : updates.type === 'take'
              ? 'udhaar_taken'
              : 'friend_payment'
            : t.type;
          return {
            ...t,
            amount: updates.amount !== undefined ? updates.amount : t.amount,
            date: updates.date !== undefined ? updates.date : t.date,
            description: updates.description !== undefined ? updates.description : t.description,
            type: newType,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    showToast('Udhaar record updated successfully');
    return { success: true };
  };

  // Friends Actions
  const addFriend = (name: string, phone?: string, notes?: string): Friend => {
    const newFriend: Friend = {
      id: 'fr_' + Date.now(),
      userId,
      name: name.trim(),
      phone: phone?.trim(),
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    setFriends((prev) => [...prev, newFriend]);
    showToast(`Friend "${name.trim()}" added to your khata!`);
    return newFriend;
  };

  const addFriendTransaction = (
    friendId: string,
    type: 'give' | 'take' | 'settlement',
    amount: number,
    date: string,
    description: string
  ): { success: boolean; error?: string } => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than 0' };
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return { success: false, error: 'Friend not found' };

    const newTx: FriendTransaction = {
      id: 'ft_' + Date.now(),
      friendId,
      type,
      amount: Number(amount),
      date: date || currentAppDate,
      description: description.trim() || (type === 'give' ? 'Udhaar given' : type === 'take' ? 'Borrowed' : 'Settlement'),
      status: type === 'settlement' ? 'settled' : 'pending',
      createdAt: new Date().toISOString(),
    };

    setFriendTransactions((prev) => [newTx, ...prev]);

    const globalTx: Transaction = {
      id: 'tx_fr_' + Date.now(),
      userId,
      date: date || currentAppDate,
      type: type === 'give' ? 'udhaar' : type === 'take' ? 'udhaar_taken' : 'friend_payment',
      amount: Number(amount),
      category: 'Friends & Udhaar',
      description: `${type === 'give' ? 'Udhaar to' : type === 'take' ? 'Borrowed from' : 'Settlement with'} ${friend.name}: ${description}`,
      personId: friendId,
      personName: friend.name,
      status: type === 'settlement' ? 'settled' : 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [globalTx, ...prev]);

    showToast(`Udhaar record for ${friend.name} recorded!`);
    return { success: true };
  };

  const settleFriendDebt = (
    friendId: string,
    amount?: number,
    date?: string,
    notes?: string
  ): { success: boolean; error?: string } => {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return { success: false, error: 'Friend not found' };

    const bal = getFriendBalance(friendId);
    const outstanding = Math.max(bal.receivable, bal.payable);

    if (outstanding <= 0) {
      return { success: false, error: 'No outstanding balance for this friend' };
    }

    const settleAmount = amount && amount > 0 ? Math.min(amount, outstanding) : outstanding;

    const newTx: FriendTransaction = {
      id: 'ft_set_' + Date.now(),
      friendId,
      type: 'settlement',
      amount: settleAmount,
      date: date || currentAppDate,
      description: notes?.trim() || `Settled amount (${user?.currency || 'Rs.'} ${settleAmount.toLocaleString()})`,
      status: 'settled',
      createdAt: new Date().toISOString(),
    };

    setFriendTransactions((prev) => [newTx, ...prev]);

    const globalTx: Transaction = {
      id: 'tx_fr_set_' + Date.now(),
      userId,
      date: date || currentAppDate,
      type: 'friend_payment',
      amount: settleAmount,
      category: 'Friends & Udhaar',
      description: `Settlement with ${friend.name}: ${user?.currency || 'Rs.'} ${settleAmount.toLocaleString()}`,
      personId: friendId,
      personName: friend.name,
      status: 'settled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [globalTx, ...prev]);

    showToast(`Settlement of ${user?.currency || 'Rs.'} ${settleAmount.toLocaleString()} recorded for ${friend.name}! 🎉`);
    return { success: true };
  };

  // Money Vault Actions
  const addVaultPerson = (name: string, phone?: string, notes?: string): VaultPerson => {
    const newPerson: VaultPerson = {
      id: 'vp_' + Date.now(),
      userId,
      name: name.trim(),
      phone: phone?.trim(),
      notes: notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    setVaultPeople((prev) => [...prev, newPerson]);
    showToast(`Vault record for "${name.trim()}" created!`);
    return newPerson;
  };

  const addVaultDeposit = (
    vaultPersonId: string,
    amount: number,
    date: string,
    description: string
  ): { success: boolean; error?: string } => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than 0' };
    const person = vaultPeople.find((p) => p.id === vaultPersonId);
    if (!person) return { success: false, error: 'Vault person not found' };

    const newTx: VaultTransaction = {
      id: 'vt_' + Date.now(),
      vaultPersonId,
      type: 'deposit',
      amount: Number(amount),
      date: date || currentAppDate,
      description: description.trim() || 'Received for keeping (Amanat)',
      createdAt: new Date().toISOString(),
    };

    setVaultTransactions((prev) => [newTx, ...prev]);

    const globalTx: Transaction = {
      id: 'tx_vt_' + Date.now(),
      userId,
      date: date || currentAppDate,
      type: 'vault_deposit',
      amount: Number(amount),
      category: 'Money Vault',
      description: `Received from ${person.name} for safekeeping: ${description || 'Deposit'}`,
      personId: vaultPersonId,
      personName: person.name,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [globalTx, ...prev]);

    showToast(`🔐 ${user?.currency || 'Rs.'} ${amount.toLocaleString()} safely deposited in Money Vault for ${person.name}`);
    return { success: true };
  };

  const addVaultReturn = (
    vaultPersonId: string,
    amount: number,
    date: string,
    description: string
  ): { success: boolean; error?: string } => {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than 0' };
    const person = vaultPeople.find((p) => p.id === vaultPersonId);
    if (!person) return { success: false, error: 'Vault person not found' };

    const bal = getVaultPersonBalance(vaultPersonId);
    if (amount > bal.holding) {
      return {
        success: false,
        error: `Cannot return ${user?.currency || 'Rs.'} ${amount.toLocaleString()}. You are only holding ${user?.currency || 'Rs.'} ${bal.holding.toLocaleString()} for ${person.name}.`,
      };
    }

    const newTx: VaultTransaction = {
      id: 'vt_' + Date.now(),
      vaultPersonId,
      type: 'return',
      amount: Number(amount),
      date: date || currentAppDate,
      description: description.trim() || 'Money returned to owner',
      createdAt: new Date().toISOString(),
    };

    setVaultTransactions((prev) => [newTx, ...prev]);

    const globalTx: Transaction = {
      id: 'tx_vt_' + Date.now(),
      userId,
      date: date || currentAppDate,
      type: 'vault_return',
      amount: Number(amount),
      category: 'Money Vault',
      description: `Returned to ${person.name}: ${description || 'Returned to owner'}`,
      personId: vaultPersonId,
      personName: person.name,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTransactions((prev) => [globalTx, ...prev]);

    showToast(`↩️ Returned ${user?.currency || 'Rs.'} ${amount.toLocaleString()} to ${person.name}.`);
    return { success: true };
  };

  // Categories
  const addCategory = (name: string, type: 'expense' | 'income', icon = 'Tag', color = '#6366f1') => {
    const newCat: Category = {
      id: 'cat_' + Date.now(),
      userId,
      name: name.trim(),
      type,
      icon,
      color,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${name}" created!`);
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted', 'info');
  };

  // Monthly snapshot closing
  const closeMonth = (year: number, month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = `${monthNames[month - 1]} ${year}`;

    const padMonth = String(month).padStart(2, '0');
    const monthPrefix = `${year}-${padMonth}`;

    const monthTxs = transactions.filter((t) => t.date.startsWith(monthPrefix));
    let inc = 0;
    let exp = 0;

    for (const t of monthTxs) {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    }

    const snap: MonthlyClosingSnapshot = {
      id: `snap_${year}_${month}`,
      userId,
      year,
      month,
      monthName,
      income: inc,
      expenses: exp,
      savings: inc - exp,
      friendReceive: summary.friendsReceivable,
      friendPay: summary.friendsPayable,
      vaultHeld: summary.vaultTotalHeld,
      isClosed: true,
      closedAt: new Date().toISOString(),
    };

    setMonthlySnapshots((prev) => {
      const filtered = prev.filter((s) => !(s.year === year && s.month === month));
      return [...filtered, snap];
    });

    showToast(`Snapshot for ${monthName} successfully closed and locked! 🔒`);
  };

  // Clear data for this specific user
  const clearUserData = () => {
    setTransactions([]);
    setFriends([]);
    setFriendTransactions([]);
    setVaultPeople([]);
    setVaultTransactions([]);
    setMonthlySnapshots([]);
    localStorage.removeItem(storageKey('transactions'));
    localStorage.removeItem(storageKey('friends'));
    localStorage.removeItem(storageKey('friend_transactions'));
    localStorage.removeItem(storageKey('vault_people'));
    localStorage.removeItem(storageKey('vault_transactions'));
    localStorage.removeItem(storageKey('snapshots'));
    showToast('All your ledger data has been reset to clean state.');
  };

  const resetToSampleData = () => {
    clearUserData();
  };

  const exportDataJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      transactions,
      categories,
      friends,
      friendTransactions,
      vaultPeople,
      vaultTransactions,
      monthlySnapshots,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.transactions)) {
        return { success: false, error: 'Invalid KhataFlow backup format' };
      }
      if (data.transactions) setTransactions(data.transactions);
      if (data.categories) setCategories(data.categories);
      if (data.friends) setFriends(data.friends);
      if (data.friendTransactions) setFriendTransactions(data.friendTransactions);
      if (data.vaultPeople) setVaultPeople(data.vaultPeople);
      if (data.vaultTransactions) setVaultTransactions(data.vaultTransactions);
      if (data.monthlySnapshots) setMonthlySnapshots(data.monthlySnapshots);
      showToast('Data imported successfully!');
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse backup JSON file' };
    }
  };

  return (
    <KhataContext.Provider
      value={{
        transactions,
        categories,
        friends,
        friendTransactions,
        vaultPeople,
        vaultTransactions,
        monthlySnapshots,
        currentAppDate,
        setCurrentAppDate,
        summary,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addFriend,
        deleteFriend,
        addFriendTransaction,
        updateFriendTransaction,
        deleteFriendTransaction,
        settleFriendDebt,
        getFriendBalance,
        addVaultPerson,
        addVaultDeposit,
        addVaultReturn,
        getVaultPersonBalance,
        addCategory,
        deleteCategory,
        closeMonth,
        resetToSampleData,
        clearUserData,
        exportDataJSON,
        importDataJSON,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => {
  const ctx = useContext(KhataContext);
  if (!ctx) throw new Error('useKhata must be used within KhataProvider');
  return ctx;
};
