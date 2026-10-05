export type TransactionType =
  | 'expense'
  | 'income'
  | 'udhaar'         // Udhaar Diya (You gave / Friend owes you)
  | 'udhaar_taken'   // Udhaar Liya (You borrowed / You owe friend)
  | 'friend_payment'
  | 'vault_deposit'
  | 'vault_return';

export type FriendTransactionType = 'give' | 'take' | 'settlement';

export type VaultTransactionType = 'deposit' | 'return';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
  currency: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  personId?: string; // Friend ID or Vault Person ID
  personName?: string;
  status?: 'completed' | 'pending' | 'settled';
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface FriendTransaction {
  id: string;
  friendId: string;
  type: FriendTransactionType; // 'give' (user gave money, friend owes user) | 'take' (user received money/borrowed, user owes friend) | 'settlement'
  amount: number;
  date: string;
  description: string;
  status: 'pending' | 'settled' | 'partial';
  createdAt: string;
}

export interface VaultPerson {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

export interface VaultTransaction {
  id: string;
  vaultPersonId: string;
  type: VaultTransactionType; // 'deposit' (received for keeping) | 'return' (returned to owner)
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

export interface MonthlyClosingSnapshot {
  id: string;
  userId: string;
  year: number;
  month: number; // 1 - 12
  monthName: string;
  income: number;
  expenses: number;
  savings: number;
  friendReceive: number;
  friendPay: number;
  vaultHeld: number;
  isClosed: boolean;
  closedAt?: string;
}

export interface FinancialSummary {
  availableBalance: number; // Personal Income - Personal Expenses (Vault NOT included)
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  friendsReceivable: number; // money others owe user
  friendsPayable: number;    // money user owes others
  friendsCountReceive: number;
  friendsCountPay: number;
  vaultTotalHeld: number;    // Money belonging to others currently held
  vaultPeopleCount: number;
}

export type ViewType =
  | 'dashboard'
  | 'transactions'
  | 'expenses'
  | 'income'
  | 'friends'
  | 'vault'
  | 'daily-hisaab'
  | 'monthly-report'
  | 'yearly-report'
  | 'custody-report'
  | 'settings';
