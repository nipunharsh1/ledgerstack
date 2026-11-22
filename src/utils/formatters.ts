import { Transaction } from '../types/finance';

const lkrWholeFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const lkrDecimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a numeric LKR amount as `Rs. 1,450,000` or `Rs. 84,500.50`
 * (shows two decimals only when cents exist, or always if forceDecimals is true).
 */
export function formatLKR(amount: number, options?: { showSign?: boolean; forceDecimals?: boolean }): string {
  const abs = Math.abs(amount);
  const hasDecimals = Math.round(abs * 100) % 100 !== 0;
  const formattedNumber =
    options?.forceDecimals || hasDecimals
      ? lkrDecimalFormatter.format(abs)
      : lkrWholeFormatter.format(abs);

  const prefix = amount < 0 ? '-Rs. ' : options?.showSign && amount > 0 ? '+Rs. ' : 'Rs. ';
  return `${prefix}${formattedNumber}`;
}

/**
 * Compact LKR format for chart axes (e.g., Rs. 1.5M, Rs. 680k).
 */
export function formatLKRCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000;
    return `${sign}Rs. ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    const val = abs / 1_000;
    return `${sign}Rs. ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(0)}k`;
  }
  return `${sign}Rs. ${abs}`;
}

/**
 * Returns local today's date as YYYY-MM-DD.
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD as `Nov 18, 2026`.
 */
export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats YYYY-MM as `Nov 2026` or `November 2026`.
 */
export function formatMonthLabel(yearMonth: string, long = false): string {
  const parts = yearMonth.split('-');
  if (parts.length !== 2) return yearMonth;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return date.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    year: 'numeric',
  });
}

/**
 * Escapes and downloads transactions as a clean UTF-8 CSV file for Excel / Google Sheets.
 */
export function exportTransactionsToCSV(transactions: Transaction[], periodLabel: string): void {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount (LKR)'];

  const escapeCell = (value: string | number): string => {
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = transactions.map((tx) => [
    escapeCell(tx.date),
    escapeCell(tx.title),
    escapeCell(tx.category),
    escapeCell(tx.type === 'income' ? 'Income' : 'Expense'),
    escapeCell(tx.type === 'expense' ? -tx.amount : tx.amount),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeSlug = periodLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const link = document.createElement('a');
  link.href = url;
  link.download = `ledgerstack-${safeSlug || 'transactions'}-${getTodayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
