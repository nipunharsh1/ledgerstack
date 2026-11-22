import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, RotateCcw, Trash2, Undo2, X } from 'lucide-react';
import { FinancialChart } from './components/FinancialChart';
import { SummaryCards } from './components/SummaryCards';
import { TopBar } from './components/TopBar';
import { TransactionForm } from './components/TransactionForm';
import { TransactionsTable } from './components/TransactionsTable';
import { SAMPLE_TRANSACTIONS, STORAGE_KEY } from './data/sampleTransactions';
import { PeriodFilter, Transaction, TypeFilter } from './types/finance';
import {
  exportTransactionsToCSV,
  formatDisplayDate,
  formatMonthLabel,
  getTodayISO,
} from './utils/formatters';

interface ToastState {
  message: string;
  undoTransactions?: Transaction[];
}

function loadInitialTransactions(): Transaction[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return SAMPLE_TRANSACTIONS;
    return parsed.filter(
      (item): item is Transaction =>
        item &&
        typeof item.id === 'string' &&
        (item.type === 'income' || item.type === 'expense') &&
        typeof item.title === 'string' &&
        typeof item.category === 'string' &&
        typeof item.amount === 'number' &&
        Number.isFinite(item.amount) &&
        typeof item.date === 'string'
    );
  } catch {
    return SAMPLE_TRANSACTIONS;
  }
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(
    loadInitialTransactions
  );
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    mode: 'all',
    month: '',
    startDate: '',
    endDate: getTodayISO(),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(
    null
  );
  const [resetCounter, setResetCounter] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [transactions]);

  const showToast = (nextToast: ToastState) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(nextToast);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const tx of transactions) {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.slice(0, 7));
      }
    }
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const periodLabel = useMemo(() => {
    if (periodFilter.mode === 'month' && periodFilter.month) {
      return formatMonthLabel(periodFilter.month, true);
    }
    if (periodFilter.mode === 'custom') {
      if (periodFilter.startDate && periodFilter.endDate) {
        return `${formatDisplayDate(periodFilter.startDate)} – ${formatDisplayDate(
          periodFilter.endDate
        )}`;
      }
      if (periodFilter.startDate) {
        return `From ${formatDisplayDate(periodFilter.startDate)}`;
      }
      if (periodFilter.endDate) {
        return `Through ${formatDisplayDate(periodFilter.endDate)}`;
      }
      return 'Custom Range';
    }
    return 'All Time';
  }, [periodFilter]);

  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (periodFilter.mode === 'month' && periodFilter.month) {
        return tx.date.startsWith(periodFilter.month);
      }
      if (periodFilter.mode === 'custom') {
        if (periodFilter.startDate && tx.date < periodFilter.startDate) {
          return false;
        }
        if (periodFilter.endDate && tx.date > periodFilter.endDate) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, periodFilter]);

  const kpiMetrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const tx of periodTransactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        incomeCount += 1;
      } else {
        totalExpenses += tx.amount;
        expenseCount += 1;
      }
    }

    return { totalIncome, totalExpenses, incomeCount, expenseCount };
  }, [periodTransactions]);

  const filteredTableTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...periodTransactions]
      .filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (!query) return true;
        return (
          tx.title.toLowerCase().includes(query) ||
          tx.category.toLowerCase().includes(query) ||
          tx.date.includes(query)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [periodTransactions, typeFilter, searchQuery]);

  const handlePeriodSelectChange = (value: string) => {
    if (value === 'all') {
      setPeriodFilter((prev) => ({ ...prev, mode: 'all', month: '' }));
    } else if (value === 'custom') {
      const oldestDate =
        transactions.length > 0
          ? transactions.reduce(
              (min, tx) => (tx.date < min ? tx.date : min),
              transactions[0].date
            )
          : getTodayISO();
      setPeriodFilter({
        mode: 'custom',
        month: '',
        startDate: periodFilter.startDate || oldestDate,
        endDate: periodFilter.endDate || getTodayISO(),
      });
    } else {
      setPeriodFilter((prev) => ({ ...prev, mode: 'month', month: value }));
    }
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `tx-${crypto.randomUUID()}`
        : `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const created: Transaction = { ...newTx, id };
    setTransactions((prev) => [created, ...prev]);

    // If active month filter doesn't match the newly added transaction's month, inform user clearly
    const matchesCurrentPeriod =
      periodFilter.mode === 'all' ||
      (periodFilter.mode === 'month' &&
        created.date.startsWith(periodFilter.month)) ||
      (periodFilter.mode === 'custom' &&
        (!periodFilter.startDate || created.date >= periodFilter.startDate) &&
        (!periodFilter.endDate || created.date <= periodFilter.endDate));

    showToast({
      message: matchesCurrentPeriod
        ? `${created.type === 'income' ? 'Income' : 'Expense'} added to ledger.`
        : `Saved (${formatMonthLabel(created.date.slice(0, 7))}). Switch period to view it.`,
    });
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === updated.id ? updated : tx))
    );
    showToast({ message: 'Transaction updated.' });
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((tx) => tx.id === id);
    if (!target) return;
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast({
      message: `Deleted "${target.title}".`,
      undoTransactions: [target],
    });
  };

  const handleUndo = () => {
    if (!toast?.undoTransactions || toast.undoTransactions.length === 0) return;
    const restored = toast.undoTransactions;
    setTransactions((prev) => [...restored, ...prev]);
    setToast(null);
  };

  const handleResetSampleData = () => {
    const freshSamples = SAMPLE_TRANSACTIONS.map((tx) => ({ ...tx }));
    setTransactions(freshSamples);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(freshSamples));
    } catch {
      // Ignore storage quota errors cleanly
    }
    setPeriodFilter({
      mode: 'all',
      month: '',
      startDate: '',
      endDate: getTodayISO(),
    });
    setSearchQuery('');
    setTypeFilter('all');
    setConfirmAction(null);
    setResetCounter((c) => c + 1);
    showToast({ message: 'Sample software company data restored.' });
  };

  const handleClearAllData = () => {
    const previous = [...transactions];
    setTransactions([]);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore storage quota errors cleanly
    }
    setPeriodFilter({
      mode: 'all',
      month: '',
      startDate: '',
      endDate: getTodayISO(),
    });
    setSearchQuery('');
    setTypeFilter('all');
    setConfirmAction(null);
    setResetCounter((c) => c + 1);
    showToast({
      message: 'All transactions cleared.',
      undoTransactions: previous.length > 0 ? previous : undefined,
    });
  };

  const handleExportCSV = () => {
    if (filteredTableTransactions.length === 0) return;
    exportTransactionsToCSV(filteredTableTransactions, periodLabel);
    showToast({
      message: `Exported ${filteredTableTransactions.length} ${
        filteredTableTransactions.length === 1 ? 'record' : 'records'
      } to CSV.`,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setPeriodFilter((prev) => ({ ...prev, mode: 'all', month: '' }));
  };

  const handleFocusNewEntry = () => {
    const formEl = document.getElementById('add-transaction');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 200);
  };

  const periodSelectValue =
    periodFilter.mode === 'month'
      ? periodFilter.month
      : periodFilter.mode === 'custom'
        ? 'custom'
        : 'all';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <TopBar onNewEntryClick={handleFocusNewEntry} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Workspace Title & Period / Reset Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Overview
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span>Currency: LKR (Rs.)</span>
              <span aria-hidden="true">·</span>
              <span>{periodLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {periodTransactions.length}{' '}
                {periodTransactions.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Filter Selector */}
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 h-9">
              <Calendar
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                aria-hidden="true"
              />
              <label htmlFor="period-select" className="sr-only">
                Filter period
              </label>
              <select
                id="period-select"
                value={periodSelectValue}
                onChange={(e) => handlePeriodSelectChange(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent focus:outline-none pr-1 cursor-pointer"
              >
                <option value="all">All Time</option>
                {availableMonths.map((monthKey) => (
                  <option key={monthKey} value={monthKey}>
                    {formatMonthLabel(monthKey, true)}
                  </option>
                ))}
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {/* Custom Date Range Pickers */}
            {periodFilter.mode === 'custom' && (
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 h-9 text-xs">
                <input
                  type="date"
                  aria-label="Start date"
                  value={periodFilter.startDate}
                  onChange={(e) =>
                    setPeriodFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="font-mono tabular-nums text-slate-700 focus:outline-none"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  aria-label="End date"
                  value={periodFilter.endDate}
                  onChange={(e) =>
                    setPeriodFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="font-mono tabular-nums text-slate-700 focus:outline-none"
                />
              </div>
            )}

            {/* Inline Reset Sample Data & Clear All Data Utilities */}
            {confirmAction === null && (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmAction('reset')}
                  className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8]"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Sample Data</span>
                </button>
                <button
                  type="button"
                  disabled={transactions.length === 0}
                  onClick={() => setConfirmAction('clear')}
                  className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 bg-white border border-slate-200 hover:border-red-200 disabled:opacity-45 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Clear All Data</span>
                </button>
              </>
            )}

            {confirmAction === 'reset' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 h-9 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                <span className="font-medium text-amber-900 whitespace-nowrap">
                  Restore sample data?
                </span>
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-2 py-1 font-medium text-white bg-[#0F294A] hover:bg-[#163761] rounded-sm cursor-pointer whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-1.5 py-1 font-medium text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}

            {confirmAction === 'clear' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 h-9 bg-red-50 border border-red-200 rounded-lg text-xs">
                <span className="font-medium text-red-900 whitespace-nowrap">
                  Clear all records?
                </span>
                <button
                  type="button"
                  onClick={handleClearAllData}
                  className="px-2 py-1 font-medium text-white bg-red-600 hover:bg-red-700 rounded-sm cursor-pointer whitespace-nowrap"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-1.5 py-1 font-medium text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top KPI Summary Cards */}
        <SummaryCards
          totalIncome={kpiMetrics.totalIncome}
          totalExpenses={kpiMetrics.totalExpenses}
          incomeCount={kpiMetrics.incomeCount}
          expenseCount={kpiMetrics.expenseCount}
          periodLabel={periodLabel}
        />

        {/* Quick Add Form + Growth / Breakdown Analytics Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4">
            <TransactionForm
              onAddTransaction={handleAddTransaction}
              titleInputRef={titleInputRef}
            />
          </div>
          <div className="lg:col-span-8">
            <FinancialChart
              allTransactions={transactions}
              periodTransactions={periodTransactions}
              activeMonth={
                periodFilter.mode === 'month' ? periodFilter.month : null
              }
              periodLabel={periodLabel}
            />
          </div>
        </div>

        {/* Recent Transactions Ledger Table */}
        <TransactionsTable
          key={resetCounter}
          transactions={filteredTableTransactions}
          totalCountInPeriod={periodTransactions.length}
          totalOverallCount={transactions.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onExportCSV={handleExportCSV}
          onClearFilters={handleClearFilters}
          onNewEntryClick={handleFocusNewEntry}
          onRestoreSampleData={handleResetSampleData}
        />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>LedgerStack · Financial Management for Software Teams</span>
          <span>Data saved locally in browser · LKR (Rs.)</span>
        </div>
      </footer>

      {/* Non-blocking Feedback & Undo Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[#0F294A] text-white text-xs sm:text-sm rounded-lg shadow-lg border border-white/10 max-w-md"
        >
          <span>{toast.message}</span>
          {toast.undoTransactions && toast.undoTransactions.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <Undo2 className="w-3 h-3" aria-hidden="true" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-slate-300 hover:text-white cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
