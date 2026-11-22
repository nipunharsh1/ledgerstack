import React, { useState } from 'react';
import {
  Check,
  Download,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Transaction,
  TransactionCategory,
  TransactionType,
  TypeFilter,
} from '../types/finance';
import { formatDisplayDate, formatLKR } from '../utils/formatters';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalCountInPeriod: number;
  totalOverallCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (filter: TypeFilter) => void;
  onUpdateTransaction: (updated: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onExportCSV: () => void;
  onClearFilters: () => void;
  onNewEntryClick: () => void;
  onRestoreSampleData: () => void;
}

interface EditDraft {
  date: string;
  title: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: string;
}

export function TransactionsTable({
  transactions,
  totalCountInPeriod,
  totalOverallCount,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onUpdateTransaction,
  onDeleteTransaction,
  onExportCSV,
  onClearFilters,
  onNewEntryClick,
  onRestoreSampleData,
}: TransactionsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const startEditing = (tx: Transaction) => {
    setEditingId(tx.id);
    setDraft({
      date: tx.date,
      title: tx.title,
      type: tx.type,
      category: tx.category,
      amount: String(tx.amount),
    });
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(null);
    setEditError(null);
  };

  const handleDraftTypeChange = (nextType: TransactionType) => {
    if (!draft) return;
    const validCategories =
      nextType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const nextCategory = (validCategories as readonly string[]).includes(
      draft.category
    )
      ? draft.category
      : validCategories[0];
    setDraft({
      ...draft,
      type: nextType,
      category: nextCategory,
    });
  };

  const saveEdit = (id: string) => {
    if (!draft) return;
    const trimmedTitle = draft.title.trim();
    const numericAmount = Number(draft.amount);

    if (!trimmedTitle) {
      setEditError('Description cannot be empty.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setEditError('Enter a valid LKR amount greater than 0.');
      return;
    }
    if (!draft.date) {
      setEditError('Select a valid date.');
      return;
    }

    onUpdateTransaction({
      id,
      date: draft.date,
      title: trimmedTitle,
      type: draft.type,
      category: draft.category,
      amount: Math.round(numericAmount * 100) / 100,
    });

    cancelEditing();
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    typeFilter !== 'all' ||
    totalCountInPeriod !== totalOverallCount;

  return (
    <section
      id="transactions"
      aria-labelledby="transactions-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden scroll-mt-20"
    >
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            id="transactions-heading"
            className="text-base font-semibold text-slate-900"
          >
            Recent Transactions
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
            Showing {transactions.length} of {totalCountInPeriod}{' '}
            {totalCountInPeriod === 1 ? 'record' : 'records'}
          </p>
        </div>

        <button
          type="button"
          onClick={onExportCSV}
          disabled={transactions.length === 0}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#0F294A] hover:border-slate-300 disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Type Filter Bar */}
      <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search description or category..."
            aria-label="Search transactions"
            className="w-full h-9 pl-9 pr-8 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter by transaction type"
          className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto shrink-0"
        >
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={typeFilter === option.value}
              onClick={() => onTypeFilterChange(option.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
                typeFilter === option.value
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Edit Error Banner */}
      {editError && (
        <div
          role="alert"
          className="px-6 py-2.5 bg-red-50 border-b border-red-100 text-xs font-medium text-red-700 flex items-center justify-between"
        >
          <span>{editError}</span>
          <button
            type="button"
            onClick={() => setEditError(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table or Empty State */}
      {transactions.length === 0 ? (
        <div className="px-6 py-14 text-center">
          {totalOverallCount === 0 ? (
            <>
              <p className="text-sm font-semibold text-slate-900">
                Your financial ledger is empty
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Add your first client invoice or operational expense, or load the starter software company dataset.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onNewEntryClick}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#0F294A] hover:bg-[#163761] rounded-lg transition-colors cursor-pointer"
                >
                  Add First Transaction
                </button>
                <button
                  type="button"
                  onClick={onRestoreSampleData}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Load Sample Data
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">
                No matching transactions
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try adjusting your search query, type filter, or selected period.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-4 px-3.5 py-2 text-xs font-medium text-[#0F294A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 bg-white">
                <th className="py-3 pl-6 pr-3 whitespace-nowrap">Date</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 whitespace-nowrap">Category</th>
                <th className="py-3 px-3 whitespace-nowrap">Type</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  Amount (LKR)
                </th>
                <th className="py-3 pl-3 pr-6 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.map((tx) => {
                const isEditing = editingId === tx.id && draft !== null;

                if (isEditing && draft) {
                  const rowCategories =
                    draft.type === 'income'
                      ? INCOME_CATEGORIES
                      : EXPENSE_CATEGORIES;

                  return (
                    <tr
                      key={tx.id}
                      onKeyDown={(e) => handleRowKeyDown(e, tx.id)}
                      className="bg-blue-50/40"
                    >
                      <td className="py-2.5 pl-6 pr-2 align-middle">
                        <input
                          type="date"
                          aria-label="Edit date"
                          value={draft.date}
                          onChange={(e) =>
                            setDraft({ ...draft, date: e.target.value })
                          }
                          className="h-8 px-2 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-middle min-w-[200px]">
                        <input
                          type="text"
                          aria-label="Edit description"
                          value={draft.title}
                          onChange={(e) =>
                            setDraft({ ...draft, title: e.target.value })
                          }
                          maxLength={120}
                          className="w-full h-8 px-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]"
                        />
                      </td>
                      <td className="py-2.5 px-2 align-middle">
                        <select
                          aria-label="Edit category"
                          value={draft.category}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              category: e.target.value as TransactionCategory,
                            })
                          }
                          className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]"
                        >
                          {rowCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-2 align-middle">
                        <select
                          aria-label="Edit type"
                          value={draft.type}
                          onChange={(e) =>
                            handleDraftTypeChange(
                              e.target.value as TransactionType
                            )
                          }
                          className="h-8 px-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]"
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-2 align-middle">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          aria-label="Edit amount in LKR"
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft({ ...draft, amount: e.target.value })
                          }
                          className="w-32 ml-auto block h-8 px-2 text-right text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#1D4ED8]"
                        />
                      </td>
                      <td className="py-2.5 pl-2 pr-6 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveEdit(tx.id)}
                            aria-label="Save changes"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#0F294A] hover:bg-[#163761] rounded-md transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            aria-label="Cancel editing"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 rounded-md transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 pl-6 pr-3 font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(tx.date)}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900">
                      {tx.title}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {formatLKR(tx.type === 'expense' ? -tx.amount : tx.amount, {
                        showSign: true,
                      })}
                    </td>
                    <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditing(tx)}
                          aria-label={`Edit ${tx.title}`}
                          title="Edit transaction"
                          className="p-1.5 text-slate-400 hover:text-[#0F294A] hover:bg-slate-100 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
                        >
                          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          aria-label={`Delete ${tx.title}`}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
