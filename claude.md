# Trackr — Project Context

## Identity

Trackr is a **local-first, client-side** habit tracking and daily planning app. All data lives in browser `localStorage`; there is no backend, database, or authentication. It is built by **Naman Saini** and deployed on Vercel.

## Technology Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router) | 16.2.3 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 (via `@tailwindcss/postcss`) |
| Component Primitives | Radix UI (`dialog`, `popover`, `select`, `checkbox`, `tabs`, `label`, `slot`) | latest |
| Icons | Lucide React | latest |
| Charts | Recharts | 3.x |
| Animations | Framer Motion | 12.x |
| Date Utilities | date-fns | 4.x |
| Drag & Drop | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) | latest |
| Notifications | Sonner | 2.x |
| Analytics | Vercel Analytics | 1.x |
| CSS Tooling | tw-animate-css, class-variance-authority, clsx, tailwind-merge | — |

## Architecture Overview

```
app/                        Next.js App Router pages (all 'use client')
  layout.tsx                Root layout — Geist fonts, dark mode, HabitProvider wrapper
  page.tsx                  Landing page with Framer Motion animations
  track/page.tsx            Daily habit tracking view
  plan/page.tsx             Task planner with date navigation
  dashboard/page.tsx        Analytics: stats, charts, year heatmap
  manage/page.tsx           Habit CRUD, settings, data import/export
  notes/page.tsx            Notes archive (chronological list)
  notes/[date]/page.tsx     Date-specific notes detail view

components/
  habit-provider.tsx        React Context provider — single source of truth for habits/entries
  app-layout.tsx            Shared shell: header + Navigation + AddHabitDialog
  navigation.tsx            Tab bar with streak badges (All Killed 🔥, At Least One ⚡)
  habit-checklist.tsx       Track page checklist (habit cards, inline tasks, daily notes)
  planner-view.tsx          Plan page UI (date nav, stats cards, AddTaskDialog, TaskList)
  task-list.tsx             Task rendering with edit/delete popovers, recurring task handling
  dashboard-charts.tsx      Recharts line + bar charts (daily/weekly/monthly toggle)
  year-heatmap.tsx          GitHub-style year heatmap with month-by-month horizontal layout
  stats-overview.tsx        Summary stat cards
  habits-manager.tsx        Manage page habit list wrapper
  draggable-habits-list.tsx dnd-kit powered reorder list
  habit-card.tsx            Individual habit card in manage view
  streak-card.tsx           Streak display card
  add-habit-dialog.tsx      Dialog for creating a habit
  edit-habit-dialog.tsx     Dialog for editing a habit
  add-task-dialog.tsx       Dialog for creating a task (link to habit, recurring toggle)
  edit-task-dialog.tsx      Dialog for editing a task
  archived-habits-dialog.tsx Dialog to restore/delete archived habits
  data-management.tsx       Export/import JSON, archived habits access
  start-page-settings.tsx   Choose landing page (home vs track)
  chart-format-settings.tsx Choose default chart format (daily/weekly/monthly)
  day-note-card.tsx         Note card used in notes views
  heatmap.tsx               Legacy heatmap component (kept for reference)
  yearly-overview.tsx       Legacy yearly overview (kept for reference)
  ui/                       shadcn/ui primitives (button, card, dialog, input, label, select,
                            textarea, checkbox, tabs, badge, popover, confirmation-popover, sonner)

lib/
  types.ts                  Core TypeScript interfaces and constants
  storage.ts                localStorage abstraction — all read/write operations
  utils-habit.ts            Scoring, streak, heatmap, date helpers
  utils.ts                  cn() utility (clsx + tailwind-merge)
```

## Data Model

### Core Types (lib/types.ts)

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
// Weight map: low=1, medium=2, high=3, critical=5

interface Habit {
  id: string;           // timestamp + random string
  name: string;
  description: string;
  priority: Priority;
  color: string;        // hex color
  createdAt: string;    // ISO timestamp
  archived: boolean;
  order: number;
  activeDays?: number[];         // 0=Sun, 1=Mon … 6=Sat. undefined = every day
  rotationGroupId?: string;      // shared ID among habits in the same rotation group
  rotationGroupOrder?: number;   // 0-indexed position within the rotation group
  rotationGroupName?: string;    // optional display name for the rotation group
}

interface HabitEntry {
  habitId: string;
  date: string;                 // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;         // ISO timestamp
  note?: string;
  tasks?: string[];             // PlannedTask IDs linked to this habit
  completionPercentage?: number; // 0–100, from weighted task completion
}

interface PlannedTask {
  id: string;
  habitId?: string;       // optional link to a habit
  date: string;           // YYYY-MM-DD
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  order: number;
  recurring?: boolean;    // auto-copy to next day
}

interface DayNote {
  date: string;           // YYYY-MM-DD
  note: string;
  createdAt: string;
}

interface YearData {
  year: number;
  habits: Habit[];
  entries: HabitEntry[];
  archivedAt: string;
}

type ChartFormat = 'daily' | 'weekly' | 'monthly';
```

## localStorage Keys

| Key | Contents |
|-----|----------|
| `habit-tracker-habits` | `Habit[]` |
| `habit-tracker-entries` | `HabitEntry[]` |
| `habit-tracker-day-notes` | `DayNote[]` |
| `habit-tracker-planned-tasks` | `PlannedTask[]` |
| `habit-tracker-recurring-task-skips` | `RecurringTaskSkip[]` (identity + date pairs) |
| `habit-tracker-archived-years` | `number[]` (sorted desc) |
| `habit-tracker-year-{year}` | `YearData` |
| `habit-tracker-last-year-check` | year string for auto-archive detection |
| `trackr-start-page` | `'home' \| 'track'` |
| `trackr-chart-format` | `'daily' \| 'weekly' \| 'monthly'` |

## Scoring System

- **Habit priority weights**: `{ low: 1, medium: 2, high: 3, critical: 5 }`
- **Task priority weights**: same scale
- **Habit completion**:
  - Habits **without tasks**: binary complete/incomplete → 100% or 0%
  - Habits **with tasks**: weighted completion = `Σ(completed_task_priority) / Σ(all_task_priority) × 100`
  - Habit auto-completes when **all** linked tasks are done
- **Daily score**: `Σ(habit_priority × completion_percentage / 100)` for all active habits with entries that day
- **Streaks** (shown in navigation bar):
  - **All Killed** 🔥: consecutive days where every *scheduled* habit was completed (days with no scheduled habits are skipped)
  - **At Least One** ⚡: consecutive days where daily score > 0 (days with no scheduled habits are skipped)

## Habit Scheduling

### Day-of-Week Filtering
- Each habit can have `activeDays: number[]` specifying which days of the week it appears
- `undefined` or all 7 days selected = shows every day (backward compatible)
- The habit checklist, stats, and streak calculations all respect this filter
- Set via toggle buttons (Sun–Sat) in the add/edit habit dialogs

### Rotation Groups
- 2+ habits can be linked into a **rotation group** so only one shows per day, cycling through them
- Rotation is **deterministic** — based on calendar date, not user visits
- Algorithm: `countActiveDaysSinceEpoch(date, activeDays) % groupSize` determines which habit (by `rotationGroupOrder`) is shown
- The counter **skips non-active days** — if a group has `activeDays: [Mon, Wed, Fri]`, the rotation only advances on those days
- All habits in a group should share the same `activeDays`; editing one member's schedule syncs the others
- Groups can have an optional `rotationGroupName`; if absent, the UI shows member habit names (e.g., "Push ↔ Pull ↔ Legs")
- **Creating a group**: in the add/edit dialog, select "Pair with: Habit X" (creates a new group) or "Join: Group Name" (joins existing)
- **Leaving a group**: select "Leave current group" in the edit dialog; if only one member remains, the group is dissolved
- Helpers: `isHabitActiveOnDate()`, `getActiveHabitsForDate()`, `getRotationIndex()` in `lib/utils-habit.ts`

## Recurring Tasks

Recurring tasks propagate forward day-by-day:
1. When loading tasks for a date, the storage layer checks the **previous day** for recurring tasks
2. Any recurring task from yesterday that doesn't exist today (and isn't in the skip list) gets copied with a new ID, `completed: false`, and incremented order
3. **Delete day-only**: adds a skip record so it won't re-copy; doesn't affect other days
4. **Delete all-future**: removes all matching recurring tasks from that date onward
5. **Edit day-only**: converts the instance to non-recurring (one-off exception)
6. **Edit all-future**: applies updates to all matching recurring tasks from that date onward
7. Task identity for skip matching: `habitId::title::description` (lowercased)

## State Management

- **HabitProvider** (`components/habit-provider.tsx`): React Context wrapping the entire app
  - Holds `habits`, `entries`, `mounted` state
  - All mutations go through `storage.*` then call `loadData()` to re-read from localStorage
  - Exposes: `addHabit`, `updateHabit`, `deleteHabit`, `toggleEntry`, `updateEntryNote`, `reorderHabits`, `refreshData`
- **Planned tasks** are loaded locally per-page (plan page, habit-checklist) via `storage.getPlannedTasksForDate()`
- **Day notes** are loaded locally per-component

## Key Patterns & Conventions

### Component Patterns
- All pages and interactive components use `'use client'` directive
- Every page wraps content in `<AppLayout>` (header + nav + add habit dialog)
- Loading states check `mounted` flag from HabitProvider before rendering
- Past days are **read-only** — tracked via `date < today` comparison
- Dialogs use Radix `Dialog` (add/edit habit, add/edit task, archived habits)
- Destructive/recurring actions use Radix `Popover` for inline confirmation instead of `window.confirm`

### Styling Conventions
- Dark-mode-only app (`<html className="dark">`, `bg-black text-white`)
- Color system: oklch-based CSS custom properties in `globals.css` (shadcn/ui v4 pattern)
- Utility: `cn()` = `twMerge(clsx(...))` for conditional class merging
- Responsive: mobile-first, `sm:` breakpoint for larger screens, scrollbar-hide utility
- Custom animations defined in `globals.css`: fadeIn, slideDown, slideUp, float, gradient, pulse-slow
- Card borders: `border-zinc-800` consistently
- Accent color: blue-400/500/600 throughout

### ID Generation
```typescript
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### Date Handling
- Dates are stored as `YYYY-MM-DD` strings
- All date math uses `date-fns` (parseISO, format, addDays, subDays, etc.)
- Week starts on **Monday** (`weekStartsOn: 1`)
- Year archive: on Jan 1 (detected via `checkAndArchiveIfNewYear`), previous year data is snapshot into `habit-tracker-year-{year}`, and current entries are cleared

### Import/Export
- **Export**: `{ habits, entries, exportedAt }` as JSON blob download
- **Import**: validates `habits` + `entries` fields exist, calls `storage.importData()`, detects years prior to current and auto-archives them, then reloads the page

## Routes & Their Components

| Route | Page Component | Key Child Components |
|-------|---------------|---------------------|
| `/` | `Home` (landing) | Framer Motion hero, feature cards, CTA; redirects to `/track` if start-page preference is set |
| `/track` | `TrackPage` | `StatsOverview`, `HabitChecklist` |
| `/plan` | `PlanPage` | `PlannerView` → `AddTaskDialog`, `TaskList` → `TaskItem` → `EditTaskDialog` |
| `/dashboard` | `DashboardPage` | `StatsOverview`, `DashboardCharts` (Recharts), `YearHeatmap` |
| `/manage` | `ManagePage` | `HabitsManager` → `DraggableHabitsList` → `HabitCard` → `EditHabitDialog`; `StartPageSettings`, `ChartFormatSettings`, `DataManagement` → `ArchivedHabitsDialog` |
| `/notes` | `NotesPage` | `DayNoteCard` list |
| `/notes/[date]` | `NoteDatePage` | Date-specific note detail view |

## Year Heatmap Behavior

- Horizontal month-by-month calendar grid (Sun–Sat columns)
- Shows one year at a time with year selector dropdown
- Current year: only renders days up to today
- Past years: loads from archived `YearData`
- Auto-scrolls to current month on load (Jan–Jun → scroll to start, Jul–Dec → scroll to end)
- Color intensity scale: `bg-zinc-800` (no activity) → `bg-green-900/800/700/600/500`

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Important Notes for AI Assistants

1. **No backend**: all data is in `localStorage`. Never suggest adding API routes, databases, or server-side data fetching.
2. **All pages are client components**: the app uses `'use client'` everywhere. The only server component is `layout.tsx` (for metadata).
3. **Dark mode only**: the app is hardcoded dark (`className="dark"` on `<html>`). Don't add light-mode styles.
4. **Tailwind CSS v4**: uses the new `@import "tailwindcss"` syntax, `@theme inline`, and `@custom-variant`. Not v3 config-file style.
5. **shadcn/ui components** are in `components/ui/` — don't duplicate or conflict with them.
6. **Radix UI popovers** are used for confirmation dialogs (not `window.confirm`/`window.alert`). Maintain this pattern.
7. **Recurring task logic** is non-trivial — identity-based skip tracking, day-only vs all-future edit/delete modes. Read `storage.ts` carefully before modifying.
8. **Priority weights** (1/2/3/5) are used for scoring. Don't change these without understanding the cascading impact on daily scores, charts, and heatmaps.
9. **Import preserves year archives**: `storage.importData()` auto-detects past-year entries and creates archived year snapshots. Keep this behavior.
10. **The `order` field** on Habits and PlannedTasks controls display order. New items get `max(existing_orders) + 1`.
