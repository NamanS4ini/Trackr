# 📊 Trackr

Trackr is a client-side habit tracking and task planning app built with Next.js 16. It combines daily habit completion, weighted task planning, recurring task management, notes, and analytics in one local-first dashboard.

## 🔎 Overview

Trackr is designed for people who want one place to manage habits, plan the day, record notes, and review progress over time. Everything runs in the browser with `localStorage`, so no backend or account is required.

## 🧩 What’s In The App

- Habit management with create, edit, archive, delete, reorder, and restore flows
- Daily tracking with habit cards, task breakdowns, and completion scoring
- Task planning with future-date support and recurring task propagation
- Recurring task editing and deletion choices for day-only or all-future changes
- Dashboard analytics with charts, stats, and a year heatmap calendar
- Daily notes and habit-specific notes
- Export/import data management for backups and migration
- Year archive support for historical data snapshots

## 🗺️ Routes

- `/` - landing page
- `/dashboard` - stats, charts, and yearly heatmap visualization
- `/manage` - habit management and data controls
- `/track` - daily habit tracking view
- `/plan` - task planner
- `/notes` - notes archive
- `/notes/[date]` - detailed notes view for a specific day

## ⭐ Core Features

### ❤️ Habit Management

- Create habits with a title, optional description, color, and priority
- Edit habit details later
- Archive habits instead of deleting them immediately
- Restore archived habits when needed
- Permanently delete habits and their related data
- Reorder habits in the manage view with drag and drop

### ✅ Daily Tracking

- Mark habits complete from the track page
- View expanded task lists for habits with subtasks
- Track weighted completion rather than simple binary progress
- Add daily notes for context, reflections, or reminders
- Lock past entries for read-only safety where appropriate

### 🗓️ Task Planning

- Plan tasks for today or any future date
- Attach a task to a habit or keep it standalone
- Assign task priority levels for weighted scoring
- Enable recurring tasks that propagate to the next day
- Edit a task for just one day or for all future occurrences
- Delete a task for just one day or for all future occurrences
- Use popover confirmations instead of native browser alerts

### 📈 Analytics And Visualizations

- Stats cards for daily score, completion rate, total habits, and all-time completions
- Weekly score trend chart
- Weekly comparison bar chart
- Year heatmap calendar with score-based coloring
- Month-by-month horizontal calendar layout
- Year switching based on tracked data
- Color intensity from inactive days to highly productive days

### 📝 Notes

- Add notes for a specific date
- Add habit-specific notes alongside daily notes
- Browse all notes chronologically
- Open a date-specific detail view for deeper context

### 💾 Data Management

- Export all app data as JSON
- Import a backup JSON file
- Review archived years
- Keep all user data local to the browser

## ⚖️ Scoring Model

Trackr uses weighted scoring so that task completion affects habit completion more realistically.

- Habit priority levels: Low, Medium, High, Critical
- Task priority levels: Low, Medium, High, Critical
- Completion is calculated from the sum of task weights completed versus total task weight
- Habits without tasks behave like simple completed/incomplete items
- Habits with tasks auto-complete once all tasks are done

## 🗓️ Calendar Heatmap Behavior

- The heatmap shows one year at a time
- It starts on the current year after refresh
- The current month is scrolled into view on load
- January through June open from the start of the horizontal month list
- July through December open from the end
- The current year only shows days up to today; future days render as empty boxes
- Earlier years render the full year

## 🧰 Technology Stack

- Next.js 16.2.3
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Radix UI primitives
- Recharts
- date-fns
- dnd-kit
- Lucide React
- Framer Motion
- Vercel Analytics
- Browser `localStorage` for persistence

## 📦 Key Libraries And UI Pieces

- `@radix-ui/react-dialog`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-tabs`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
- `recharts`
- `cal-heatmap`
- `react-calendar-heatmap`

## 🏗️ Project Structure

```text
app/
  layout.tsx                Root app layout
  globals.css               Global styles
  page.tsx                  Landing page
  dashboard/page.tsx        Analytics dashboard
  manage/page.tsx           Habit management page
  notes/page.tsx            Notes archive
  notes/[date]/page.tsx     Notes detail view
  plan/page.tsx             Task planner page
  track/page.tsx            Habit tracking page

components/
  app-layout.tsx            Shared app shell
  navigation.tsx            Main navigation
  habit-provider.tsx        Global habit state/context
  habits-manager.tsx        Manage view logic
  habit-card.tsx            Habit card UI
  habit-checklist.tsx       Track view checklist UI
  task-list.tsx             Planner task list and edit/delete actions
  planner-view.tsx          Planner page UI
  add-habit-dialog.tsx      Habit creation dialog
  edit-habit-dialog.tsx     Habit edit dialog
  add-task-dialog.tsx       Task creation dialog
  edit-task-dialog.tsx      Task edit dialog
  archived-habits-dialog.tsx Archived habit restore/delete dialog
  confirmation-popover.tsx  Reusable confirmation popover
  data-management.tsx       Import/export controls
  dashboard-charts.tsx      Dashboard charts container
  stats-overview.tsx        Summary cards
  streak-card.tsx           Habit streak display
  heatmap.tsx               Legacy heatmap component
  yearly-overview.tsx       Legacy yearly overview view
  year-heatmap.tsx          Current year heatmap calendar
  start-page-settings.tsx   Landing page settings UI
  chart-format-settings.tsx Chart display controls
  day-note-card.tsx         Notes card UI
  draggable-habits-list.tsx Drag-and-drop habit list
  ui/                       Shared shadcn-style UI components
    button.tsx
    card.tsx
    dialog.tsx
    input.tsx
    label.tsx
    select.tsx
    textarea.tsx
    checkbox.tsx
    tabs.tsx
    badge.tsx
    popover.tsx

lib/
  storage.ts                localStorage abstraction and app data logic
  types.ts                  Shared TypeScript types
  utils.ts                  General utilities
  utils-habit.ts            Habit scoring helpers

public/
  sitemap.xml
```

## 🗄️ Data Storage

Trackr stores its data in browser `localStorage` using these keys:

- `habit-tracker-habits`
- `habit-tracker-entries`
- `habit-tracker-day-notes`
- `habit-tracker-planned-tasks`
- `habit-tracker-recurring-task-skips`
- `habit-tracker-archived-years`
- `habit-tracker-year-{year}`

## 🛠️ Development And Build

### 🧩 Install

```bash
npm install
```

### ▶️ Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 🔍 Lint

```bash
npm run lint
```

### 📦 Production Build

```bash
npm run build
```

### 🚀 Start Production Server

```bash
npm run start
```

## ℹ️ Notes

- The app is intentionally local-first.
- Data stays in the browser unless you export it.
- The dashboard, planner, and notes views are all built around the same shared storage layer.
- The year heatmap and planner flows were recently updated to better handle recurring task edits and calendar navigation.

## 📜 License

MIT
