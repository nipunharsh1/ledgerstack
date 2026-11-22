import { ArrowDownLeft, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { formatLKR } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
  periodLabel: string;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  incomeCount,
  expenseCount,
  periodLabel,
}: SummaryCardsProps) {
  const netProfit = totalIncome - totalExpenses;
  const isPositive = netProfit >= 0;
  const profitMargin =
    totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : null;
  const expenseRatio =
    totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : null;

  return (
    <section
      id="overview"
      aria-label="Financial summary metrics"
      className="grid grid-cols-1 md:grid-cols-3 gap-5 scroll-mt-20"
    >
      {/* Total Income */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-slate-600">Total Income</h2>
          <ArrowDownLeft
            className="w-4 h-4 text-emerald-700 shrink-0"
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 font-mono tabular-nums text-2xl sm:text-[26px] font-semibold tracking-tight text-slate-900">
          {formatLKR(totalIncome)}
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <span>
            {incomeCount} {incomeCount === 1 ? 'entry' : 'entries'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{periodLabel}</span>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-slate-600">Total Expenses</h2>
          <ArrowUpRight
            className="w-4 h-4 text-red-600 shrink-0"
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 font-mono tabular-nums text-2xl sm:text-[26px] font-semibold tracking-tight text-slate-900">
          {formatLKR(totalExpenses)}
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <span>
            {expenseCount} {expenseCount === 1 ? 'entry' : 'entries'}
          </span>
          {expenseRatio !== null && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{expenseRatio}% of revenue</span>
            </>
          )}
        </div>
      </div>

      {/* Net Profit / Balance */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-slate-600">Net Profit / Balance</h2>
          {isPositive ? (
            <TrendingUp
              className="w-4 h-4 text-emerald-700 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <TrendingDown
              className="w-4 h-4 text-red-600 shrink-0"
              aria-hidden="true"
            />
          )}
        </div>
        <p
          className={`mt-3 font-mono tabular-nums text-2xl sm:text-[26px] font-semibold tracking-tight ${
            isPositive ? 'text-emerald-700' : 'text-red-600'
          }`}
        >
          {formatLKR(netProfit, { showSign: netProfit !== 0 })}
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
          <span
            className={`font-medium ${
              isPositive ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {netProfit > 0 ? 'Profit' : netProfit < 0 ? 'Deficit' : 'Break-even'}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-500 font-mono tabular-nums">
            {profitMargin !== null
              ? `${profitMargin}% net margin`
              : totalExpenses > 0
                ? 'No revenue logged'
                : 'No entries in period'}
          </span>
        </div>
      </div>
    </section>
  );
}
