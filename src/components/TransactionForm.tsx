import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionCategory,
  TransactionType,
} from '../types/finance';
import { getTodayISO } from '../utils/formatters';

interface TransactionFormProps {
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
}

export function TransactionForm({
  onAddTransaction,
  titleInputRef,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(
    INCOME_CATEGORIES[0]
  );
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    const nextCategories =
      nextType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setCategory(nextCategories[0]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle) {
      setError('Enter a short description for this transaction.');
      titleInputRef.current?.focus();
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      setError('Select a transaction date.');
      return;
    }

    onAddTransaction({
      type,
      title: trimmedTitle,
      category,
      amount: Math.round(numericAmount * 100) / 100,
      date,
    });

    setTitle('');
    setAmount('');
    setDate(getTodayISO());
    setError(null);
  };

  return (
    <section
      id="add-transaction"
      aria-labelledby="add-transaction-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 scroll-mt-20 h-full flex flex-col justify-between"
    >
      <div className="mb-5">
        <h2
          id="add-transaction-heading"
          className="text-base font-semibold text-slate-900"
        >
          Add Transaction
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Record client revenue or operational costs in LKR.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Type Segmented Toggle */}
        <div>
          <span className="block text-xs font-medium text-slate-700 mb-1.5">
            Transaction Type
          </span>
          <div
            role="group"
            aria-label="Transaction type"
            className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg"
          >
            <button
              type="button"
              aria-pressed={type === 'income'}
              onClick={() => handleTypeChange('income')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                type === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              aria-pressed={type === 'expense'}
              onClick={() => handleTypeChange('expense')}
              className={`py-2 px-3 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="tx-title"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Title / Description
          </label>
          <input
            ref={titleInputRef}
            id="tx-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder={
              type === 'income'
                ? 'e.g., Client Web App Project'
                : 'e.g., Cloud Server Hosting'
            }
            maxLength={120}
            className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-colors"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="tx-category"
            className="block text-xs font-medium text-slate-700 mb-1.5"
          >
            Category
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="w-full h-10 px-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="tx-amount"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Amount (LKR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-mono font-medium text-slate-500">
                Rs.
              </span>
              <input
                id="tx-amount"
                type="number"
                min="0.01"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="250000"
                className="w-full h-10 pl-10 pr-3 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="tx-date"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (error) setError(null);
              }}
              className="w-full h-10 px-3 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-[#0F294A] hover:bg-[#163761] active:bg-[#0B1F38] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1D4ED8]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{type === 'income' ? 'Add Income' : 'Add Expense'}</span>
        </button>
      </form>
    </section>
  );
}
