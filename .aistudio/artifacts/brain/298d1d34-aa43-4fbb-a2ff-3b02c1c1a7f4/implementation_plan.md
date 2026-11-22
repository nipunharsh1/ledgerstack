# LedgerStack — Software Company Financial Management

A clean, uncluttered financial management dashboard tailored for a software solutions company, tracking project revenue, operational costs, and net profitability in Sri Lankan Rupees (LKR / Rs.) with zero accounting jargon.

## User Review & Critical Decisions

> [!IMPORTANT]
> The decisions below reflect your preferences from our kickoff questions and establish the baseline for implementation. Let me know if you want to adjust any detail before we build.

- **Currency Standard (Confirmed)**: **LKR (`Rs.`) only**, formatted with standard thousand separators (e.g., `Rs. 1,450,000`) and tabular numerals so every column and KPI aligns cleanly.
- **Included Utilities (Confirmed)**:
  - **Export to CSV** directly above the transactions table (exports the active filtered dataset for Excel/Sheets).
  - **Period & Date Range Filter** driving the KPI summary cards, category breakdown, and transactions view (`All Time`, individual months, or custom `From / To` dates).
  - **Inline Row Editing** allowing direct in-place updates to any transaction's date, description, category, type, or amount without deleting and re-entering.
- **Layout Direction (Confirmed)**: Crisp light-mode workspace with navy/blue primary accents, flat white surfaces on a soft cool-gray canvas, and a clean single-row top navigation bar.
- **Sample Dataset Scope (Recommended Default)**: Pre-load 8 realistic software agency transactions across the last 3 months (with realistic LKR project retainers, app milestones, cloud hosting, and engineering payroll) so the Monthly Growth chart displays meaningful multi-month trends immediately on first load.

---

## 1. Overview & Core Concept

- **What It Does**: Gives founders and operations leads an immediate view of company cash flow—total revenue, total operational expenses, and net balance—paired with frictionless transaction entry, visual growth trends, inline record editing, and one-click CSV export.
- **Target Audience / Persona**: Founders, studio directors, and operations managers at a software solutions company who want clarity on project profitability and burn rate without configuring a full double-entry accounting suite.
- **Key Value**: Replaces scattered spreadsheets with a fast, self-contained financial ledger that loads instantly, persists locally in the browser, and turns raw entries into live monthly growth and category insights.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Immediate Financial Snapshot**: Upon opening the app, the user sees the three top KPI cards (**Total Income**, **Total Expenses**, and **Net Profit / Balance**) pre-populated with realistic LKR software company figures, accompanied by a clean period selector (`All Time`, specific months, or `Custom Range`).
2. **Quick Transaction Entry**: Right below or alongside the overview, a streamlined **Add Transaction** panel lets the user toggle between `Income` and `Expense`, pick from tailored software-company categories (which automatically switch based on the selected type), enter a description, LKR amount, and date (defaulting to today), and submit. Submitting updates all KPI cards, charts, and the ledger immediately with subtle confirmation feedback.
3. **Growth & Breakdown Analysis**: The **Financial Overview** chart defaults to a grouped **Monthly View** (Income vs. Expenses bars across months) to visualize growth over time. A segmented switcher flips to **Category Breakdown** (Donut chart with an Expense/Income toggle and clear ranked breakdown values).
4. **Search, Filter, Inline Edit & Export**: In the **Recent Transactions** table, users can search by description or category, filter by `All` / `Income` / `Expense`, click **Edit** on any row to modify fields inline (`Save` / `Cancel`), click **Delete** with a lightweight non-blocking undo toast, or click **Export CSV** to download an Excel-ready file. A **Reset Sample Data** control in the workspace toolbar restores the starter dataset with an inline confirmation popover (no browser popups).

### Visual Identity & Theme

- **Aesthetic Direction**: Crisp, editorial fintech minimalism—calm, authoritative, and scannable with generous breathing room and zero visual clutter.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - *Canvas (60%)*: `--background: #F8FAFC` (cool soft gray workspace backdrop).
  - *Structural Surfaces (30%)*: `--surface: #FFFFFF` cards and table surfaces bounded by crisp hairline borders (`--border: #E2E8F0`), slate body text (`#0F172A` primary, `#475569` secondary, `#64748B` muted).
  - *Accents & Semantic States (10%)*: Deep navy (`--primary: #0F294A`) and cobalt blue (`--accent: #1D4ED8`) strictly for primary actions, active tabs, and focus rings; emerald (`#15803D` / soft `#F0FDF4` tint) for positive income & profit paired with explicit `+` / `Profit` text labels; crimson (`#DC2626` / soft `#FEF2F2` tint) for expenses & deficit paired with `-` / `Deficit` text labels.
- **Typography & Hierarchy**:
  - *Display & Headings*: `Plus Jakarta Sans` (SemiBold 600 / Bold 700) for wordmark, section headers, and KPI titles.
  - *Body & Table Copy*: `DM Sans` (Regular 400 / Medium 500) for crisp scannability across forms and ledger rows.
  - *Financial Figures & Dates*: `JetBrains Mono` with `tabular-nums` on every LKR currency figure, percentage, axis tick, and date column so numbers align vertically without jitter.
- **Component Styling & Layout**:
  - *Top Navigation Bar*: Single-row, 3-zone contract (`LedgerStack` wordmark — concise single-line section links `Overview`, `Analytics`, `Transactions` — single `New Entry` primary button that focuses the transaction form).
  - *Workspace Toolbar*: Sits cleanly below the header with the page title, Period Filter (`All Time` / Month selector / `Custom Range`), and `Reset Sample Data` utility.
  - *Spatial Structure*: Full desktop width (`max-w-7xl` centered container with balanced 24px gutters), flat single-elevation cards (never nesting bordered cards inside cards, no thick left accent stripes), compact 44px table rows, and restrained unboxed metadata for dates and categories.

### Interactive Feedback & Motion

- Smooth 150ms transitions on tab toggles, row hover states, and inline edit transitions.
- Lightweight non-blocking toast notifications for key actions (e.g., transaction added, transaction deleted with a one-click **Undo** button, CSV exported, sample data reset).
- Clean empty states when search/date filters yield zero matches (with a one-click `Clear Filters` action) or when all entries are deleted (with `Add First Transaction` and `Load Sample Data` buttons).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side `localStorage` Persistence with Schema Versioning**
  - *Chosen Approach*: Store all transactions in browser `localStorage` under a versioned key, initialized with 8 curated LKR sample entries on first visit.
  - *Why*: Matches the requirement for a zero-friction, single-workspace tool without login walls or backend overhead while keeping data intact across refreshes.
  - *Alternatives Considered*: Cloud database (unnecessary complexity given no multi-user requirement).
- **Decision 2: Recharts for Responsive Financial Visualizations**
  - *Chosen Approach*: Use Recharts for the Monthly Income vs. Expenses Bar Chart and the Category Breakdown Donut Chart with custom LKR tooltips.
  - *Why*: Integrates cleanly with React state, responds smoothly to container resizing, and gives full styling control for navy/emerald/crimson palettes and tabular LKR tooltips.
  - *Alternatives Considered*: Hand-rolled SVG charts (harder to maintain responsive hover states and axis formatting).
- **Decision 3: Period Filter Scope Separation (KPIs & Ledger vs. Monthly Growth Chart)**
  - *Chosen Approach*: The active Period Filter (`All Time`, specific month, or custom range) filters the KPI cards, Category Breakdown chart, Transactions Table, and CSV export. In Monthly View, the growth chart always shows the multi-month trajectory (highlighting the active filtered month if a single month is selected) so the trend line never collapses into a lonely single bar.
  - *Why*: Preserves growth context when inspecting a single month's KPIs and records.
- **Decision 4: Inline Table Editing Over Modal Popups**
  - *Chosen Approach*: Clicking **Edit** turns that specific table row into editable inputs (`Date`, `Description`, `Category`, `Type`, `Amount`) with inline `Save` and `Cancel` controls.
  - *Why*: Faster for correcting typos or recategorizing entries in a spreadsheet-like ledger without losing visual context.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          Browser localStorage                          │
│                  (Persisted Transactions + Seed Reset)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ hydrate / sync
┌───────────────────────────────────▼────────────────────────────────────┐
│                       Application State Controller                     │
│  transactions[] · periodFilter · searchQuery · typeFilter · undoToast  │
└───┬──────────────────┬───────────────────────┬─────────────────────┬───┘
    │                  │                       │                     │
    ▼                  ▼                       ▼                     ▼
┌──────────┐    ┌─────────────┐        ┌───────────────┐     ┌──────────────┐
│ Top Bar  │    │ KPI Summary │        │   Analytics   │     │   Ledger &   │
│ (3-Zone) │    │  (3 Cards)  │        │  & Quick Add  │     │  Inline Edit │
├──────────┤    ├─────────────┤        ├───────────────┤     ├──────────────┤
│ Brand    │    │ Total Income│        │ Quick-Add Form│     │ Search Bar   │
│ Nav Links│    │ Total Costs │        │ (LKR + Auto   │     │ All/Inc/Exp  │
│ New Entry│    │ Net Balance │        │  Categories)  │     │ Export CSV   │
└──────────┘    └─────────────┘        ├───────────────┤     │ Table Rows   │
                                       │ Monthly Bars  │     │  ↳ Edit Mode │
                                       │ Category Donut│     │  ↳ Delete    │
                                       └───────────────┘     └──────────────┘
```

### Data Model & State

- **Transaction Entity**:
  - `id`: Unique string identifier.
  - `type`: `'income' | 'expense'`.
  - `title`: Concise description (e.g., `"FinTech Mobile App — Phase 2 Milestone"`).
  - `category`: Strongly typed software-company category bound to `type`:
    - *Income*: `Custom Software Development`, `Web/Mobile App`, `Maintenance & Retainer`, `Consulting`.
    - *Expense*: `Cloud & Hosting`, `Salaries & Freelancers`, `Software Subscriptions`, `Office & Utilities`, `Marketing`.
  - `amount`: Positive numeric value in LKR (`number`).
  - `date`: ISO date string (`YYYY-MM-DD`).
- **Derived View State**:
  - `periodFilteredTransactions`: Filtered by `All Time`, chosen `YYYY-MM` month, or custom `[startDate, endDate]`.
  - `kpiTotals`: Computed `totalIncome`, `totalExpenses`, `netProfit`, and `profitMargin` from `periodFilteredTransactions`.
  - `tableTransactions`: `periodFilteredTransactions` further filtered by `typeFilter` (`all` / `income` / `expense`) and `searchQuery`, sorted newest-first by `date`.
  - `monthlySeries`: Aggregated income & expense totals grouped chronologically by `YYYY-MM` for the growth bar chart.
  - `categoryBreakdown`: Aggregated totals and share percentages per category for the donut chart.

### Interactive Component & State Mapping

- **Period Filter Control**: Switching between `All Time`, a dynamically discovered month (e.g., `Nov 2026`, `Oct 2026`, `Sep 2026`), or `Custom Range` immediately recalculates KPI totals, Category Breakdown, table rows, and CSV export payload.
- **Quick-Add Transaction Form**: Toggling `Income` / `Expense` automatically updates the Category dropdown to the matching category list and resets invalid selections. Submitting validates non-empty title, valid positive LKR amount, and date, appends the transaction, persists to `localStorage`, resets form fields (keeping today's date), and flashes confirmation feedback.
- **Chart View Switcher**: Toggles seamlessly between `Monthly View` (grouped Income vs. Expense bars with custom LKR hover tooltip) and `Category Breakdown` (Donut chart with an `Expenses` / `Income` breakdown switcher and itemized right-side legend).
- **Transactions Table & Inline Editing**:
  - Clicking **Edit** loads that row's values into row-scoped draft state; changing `Type` inline automatically adapts the row's `Category` selector so invalid type/category pairs are impossible.
  - Clicking **Save** validates and commits the updated record to state + `localStorage`.
  - Clicking **Delete** removes the record immediately and surfaces a 5-second **Undo** toast to recover from accidental clicks without intrusive dialogs.
  - Clicking **Export CSV** serializes the currently filtered table rows with proper CSV escaping and triggers a client-side download (`ledgerstack-transactions-YYYY-MM-DD.csv`).
- **Reset Sample Data**: Opens an inline confirmation control (`Confirm Reset` / `Cancel`) that restores the default 8 LKR software-company transactions and resets active filters.
