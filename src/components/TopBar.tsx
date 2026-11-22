import { Plus } from 'lucide-react';

interface TopBarProps {
  onNewEntryClick: () => void;
}

export function TopBar({ onNewEntryClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-[#0F294A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-sm"
        >
          LedgerStack
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="hover:text-[#0F294A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#0F294A]/30"
          >
            Overview
          </a>
          <a
            href="#analytics"
            className="hover:text-[#0F294A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#0F294A]/30"
          >
            Analytics
          </a>
          <a
            href="#transactions"
            className="hover:text-[#0F294A] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#0F294A]/30"
          >
            Transactions
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewEntryClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-[#0F294A] hover:bg-[#163761] active:bg-[#0B1F38] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1D4ED8]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
}
