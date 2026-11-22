import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartViewMode, Transaction, TransactionType } from '../types/finance';
import {
  formatLKR,
  formatLKRCompact,
  formatMonthLabel,
} from '../utils/formatters';

interface FinancialChartProps {
  allTransactions: Transaction[];
  periodTransactions: Transaction[];
  activeMonth: string | null;
  periodLabel: string;
}

const EXPENSE_PALETTE = [
  '#0F294A',
  '#1D4ED8',
  '#475569',
  '#D97706',
  '#DC2626',
];

const INCOME_PALETTE = ['#0F294A', '#15803D', '#1D4ED8', '#0D9488'];

interface MonthlyPoint {
  monthKey: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

interface CategorySlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

function MonthlyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; payload: MonthlyPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  const net = point.income - point.expense;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3.5 py-2.5 text-xs min-w-[190px]">
      <p className="font-display font-semibold text-slate-900 mb-2">{label}</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-xs bg-[#15803D]" />
            Income
          </span>
          <span className="font-mono tabular-nums font-medium text-slate-900">
            {formatLKR(point.income)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-xs bg-[#DC2626]" />
            Expenses
          </span>
          <span className="font-mono tabular-nums font-medium text-slate-900">
            {formatLKR(point.expense)}
          </span>
        </div>
        <div className="pt-1.5 mt-1.5 border-t border-slate-100 flex items-center justify-between gap-4">
          <span className="text-slate-600 font-medium">Net Balance</span>
          <span
            className={`font-mono tabular-nums font-semibold ${
              net >= 0 ? 'text-emerald-700' : 'text-red-600'
            }`}
          >
            {formatLKR(net, { showSign: net !== 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategorySlice }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3.5 py-2.5 text-xs">
      <p className="font-medium text-slate-900">{item.name}</p>
      <div className="mt-1 flex items-center gap-2 font-mono tabular-nums text-slate-600">
        <span className="font-semibold text-slate-900">
          {formatLKR(item.value)}
        </span>
        <span aria-hidden="true">·</span>
        <span>{item.percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

export function FinancialChart({
  allTransactions,
  periodTransactions,
  activeMonth,
  periodLabel,
}: FinancialChartProps) {
  const [viewMode, setViewMode] = useState<ChartViewMode>('monthly');
  const [breakdownType, setBreakdownType] = useState<TransactionType>('expense');

  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    const grouped = new Map<string, { income: number; expense: number }>();

    for (const tx of allTransactions) {
      const monthKey = tx.date.slice(0, 7);
      if (!monthKey) continue;
      const entry = grouped.get(monthKey) ?? { income: 0, expense: 0 };
      if (tx.type === 'income') {
        entry.income += tx.amount;
      } else {
        entry.expense += tx.amount;
      }
      grouped.set(monthKey, entry);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, vals]) => ({
        monthKey,
        label: formatMonthLabel(monthKey),
        income: vals.income,
        expense: vals.expense,
        net: vals.income - vals.expense,
      }));
  }, [allTransactions]);

  const { categoryData, categoryTotal } = useMemo(() => {
    const filtered = periodTransactions.filter(
      (tx) => tx.type === breakdownType
    );
    const totals = new Map<string, number>();
    let sum = 0;

    for (const tx of filtered) {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
      sum += tx.amount;
    }

    const palette =
      breakdownType === 'expense' ? EXPENSE_PALETTE : INCOME_PALETTE;

    const slices: CategorySlice[] = Array.from(totals.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], idx) => ({
        name,
        value,
        percentage: sum > 0 ? (value / sum) * 100 : 0,
        color: palette[idx % palette.length],
      }));

    return { categoryData: slices, categoryTotal: sum };
  }, [periodTransactions, breakdownType]);

  return (
    <section
      id="analytics"
      aria-labelledby="analytics-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between scroll-mt-20 h-full"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2
            id="analytics-heading"
            className="text-base font-semibold text-slate-900"
          >
            {viewMode === 'monthly'
              ? 'Monthly Income vs. Expenses'
              : 'Category Breakdown'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {viewMode === 'monthly'
              ? activeMonth
                ? `Highlighting ${formatMonthLabel(activeMonth, true)} within overall growth`
                : 'Track monthly revenue growth against operational costs in LKR'
              : `${breakdownType === 'expense' ? 'Operational costs' : 'Revenue sources'} · ${periodLabel}`}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div
          role="group"
          aria-label="Chart view switcher"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0"
        >
          <button
            type="button"
            aria-pressed={viewMode === 'monthly'}
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
              viewMode === 'monthly'
                ? 'bg-white text-[#0F294A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly View
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'category'}
            onClick={() => setViewMode('category')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${
              viewMode === 'category'
                ? 'bg-white text-[#0F294A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Category Breakdown
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {viewMode === 'monthly' ? (
        <div className="pt-5 flex-1 flex flex-col justify-between">
          {monthlyData.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-slate-700">
                No monthly data yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Add income or expense entries to track monthly company growth.
              </p>
            </div>
          ) : (
            <>
              <div className="h-[296px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
                    barGap={6}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748B',
                        fontSize: 12,
                        fontFamily: 'DM Sans, sans-serif',
                      }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val: number) => formatLKRCompact(val)}
                      tick={{
                        fill: '#64748B',
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      width={76}
                    />
                    <Tooltip
                      content={<MonthlyTooltip />}
                      cursor={{ fill: '#F1F5F9', radius: 6 }}
                    />
                    <Bar
                      dataKey="income"
                      name="Income"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    >
                      {monthlyData.map((entry) => (
                        <Cell
                          key={`inc-${entry.monthKey}`}
                          fill="#15803D"
                          fillOpacity={
                            activeMonth && entry.monthKey !== activeMonth
                              ? 0.3
                              : 0.92
                          }
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="expense"
                      name="Expenses"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={38}
                    >
                      {monthlyData.map((entry) => (
                        <Cell
                          key={`exp-${entry.monthKey}`}
                          fill="#DC2626"
                          fillOpacity={
                            activeMonth && entry.monthKey !== activeMonth
                              ? 0.25
                              : 0.85
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-5">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#15803D]" />
                    <span>Income</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]" />
                    <span>Expenses</span>
                  </span>
                </div>
                <span className="font-mono tabular-nums text-slate-400">
                  {monthlyData.length}{' '}
                  {monthlyData.length === 1 ? 'month' : 'months'} tracked
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="pt-5 flex-1 flex flex-col">
          {/* Sub-toggle for Expenses vs Income breakdown */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div
              role="group"
              aria-label="Category breakdown type"
              className="inline-flex items-center gap-4 text-xs font-medium border-b border-slate-200 w-full"
            >
              <button
                type="button"
                onClick={() => setBreakdownType('expense')}
                className={`pb-2.5 -mb-px border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  breakdownType === 'expense'
                    ? 'border-[#0F294A] text-[#0F294A]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Expense Breakdown
              </button>
              <button
                type="button"
                onClick={() => setBreakdownType('income')}
                className={`pb-2.5 -mb-px border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  breakdownType === 'income'
                    ? 'border-[#0F294A] text-[#0F294A]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Income Breakdown
              </button>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-slate-700">
                No {breakdownType} entries in {periodLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Switch period or log a new {breakdownType} transaction to see category shares.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
              <div className="md:col-span-5 h-[240px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={94}
                      paddingAngle={2}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      {categoryData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CategoryTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Total Label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[11px] font-medium text-slate-500">
                    Total {breakdownType === 'expense' ? 'Costs' : 'Income'}
                  </span>
                  <span className="mt-0.5 font-mono tabular-nums text-xs sm:text-sm font-semibold text-slate-900">
                    {formatLKRCompact(categoryTotal)}
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 divide-y divide-slate-100">
                {categoryData.map((slice) => (
                  <div
                    key={slice.name}
                    className="py-2.5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-xs shrink-0"
                        style={{ backgroundColor: slice.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm text-slate-700 truncate">
                        {slice.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums text-xs sm:text-sm">
                      <span className="text-slate-400">
                        {slice.percentage.toFixed(1)}%
                      </span>
                      <span className="font-medium text-slate-900 min-w-[106px] text-right">
                        {formatLKR(slice.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
