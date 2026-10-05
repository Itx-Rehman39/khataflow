import type { Category, Friend, FriendTransaction, Transaction, User, VaultPerson, VaultTransaction } from '../types';

export const DEFAULT_USER: User = {
  id: 'usr_abulrehman',
  name: 'Abulrehman',
  email: 'abulrehman@khataflow.com',
  createdAt: '2026-10-01T00:00:00.000Z',
  currency: 'Rs.',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Standard Expense Categories
  { id: 'cat_food', userId: 'global', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f43f5e', isDefault: true },
  { id: 'cat_transport', userId: 'global', name: 'Transport & Fuel', type: 'expense', icon: 'Car', color: '#38bdf8', isDefault: true },
  { id: 'cat_bills', userId: 'global', name: 'Bills & Utilities', type: 'expense', icon: 'Receipt', color: '#8b5cf6', isDefault: true },
  { id: 'cat_shopping', userId: 'global', name: 'Shopping & Clothes', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', isDefault: true },
  { id: 'cat_education', userId: 'global', name: 'Education & Books', type: 'expense', icon: 'GraduationCap', color: '#f59e0b', isDefault: true },
  { id: 'cat_health', userId: 'global', name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#10b981', isDefault: true },
  { id: 'cat_home', userId: 'global', name: 'Home & Grocery', type: 'expense', icon: 'Home', color: '#64748b', isDefault: true },
  { id: 'cat_other', userId: 'global', name: 'Other Expenses', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8', isDefault: true },

  // Standard Income Categories
  { id: 'cat_salary', userId: 'global', name: 'Monthly Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isDefault: true },
  { id: 'cat_family', userId: 'global', name: 'Pocket Money / Family', type: 'income', icon: 'Users', color: '#059669', isDefault: true },
  { id: 'cat_freelance', userId: 'global', name: 'Freelance & Projects', type: 'income', icon: 'Laptop', color: '#0ea5e9', isDefault: true },
  { id: 'cat_business', userId: 'global', name: 'Business / Profits', type: 'income', icon: 'TrendingUp', color: '#6366f1', isDefault: true },
  { id: 'cat_other_inc', userId: 'global', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748b', isDefault: true },
];

// Completely clean slate: zero fake or auto-added data
export const INITIAL_FRIENDS: Friend[] = [];

export const INITIAL_FRIEND_TRANSACTIONS: FriendTransaction[] = [];

export const INITIAL_VAULT_PEOPLE: VaultPerson[] = [];

export const INITIAL_VAULT_TRANSACTIONS: VaultTransaction[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
