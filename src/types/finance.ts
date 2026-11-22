export type TransactionType = 'income' | 'expense';

export const INCOME_CATEGORIES = [
  'Custom Software Development',
  'Web/Mobile App',
  'Maintenance & Retainer',
  'Consulting',
] as const;

export const EXPENSE_CATEGORIES = [
  'Cloud & Hosting',
  'Salaries & Freelancers',
  'Software Subscriptions',
  'Office & Utilities',
  'Marketing',
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  category: TransactionCategory;
  amount: number;
  date: string; // YYYY-MM-DD
}

export type PeriodMode = 'all' | 'month' | 'custom';

export interface PeriodFilter {
  mode: PeriodMode;
  month: string; // YYYY-MM when mode === 'month'
  startDate: string; // YYYY-MM-DD when mode === 'custom'
  endDate: string; // YYYY-MM-DD when mode === 'custom'
}

export type TypeFilter = 'all' | TransactionType;
export type ChartViewMode = 'monthly' | 'category';
