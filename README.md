# Trackr - Advanced Habit Tracker

A modern, feature-rich habit tracking application built with Next.js 16. Track habits, plan tasks, visualize progress, and achieve your goals with a sophisticated priority-based scoring system.

## Features

### Core Functionality
- **Habit Management**: Create, edit, archive, and delete habits with customizable colors and descriptions
- **Priority System**: Four-tier priority system (Low, Medium, High, Critical) for habits and tasks
- **Daily Tracking**: Interactive habit checklist with one-click completion
- **Task-Based Planning**: Break down habits into actionable daily tasks
- **Local Storage**: All data persists locally in your browser - no account required

### Task Planning System
- **Daily Task Planner**: Plan tomorrow's work today with the dedicated planning interface
- **Habit Linking**: Associate tasks with specific habits or create standalone tasks
- **Task Priorities**: Assign individual priorities to tasks for weighted scoring
- **Recurring Tasks**: Automatically propagate tasks to the next day
- **Weighted Scoring**: Task completion contributes proportionally to habit scores based on task priority
- **Permission Controls**: Future dates are read-only for completion but allow task deletion
- **Smart Completion**: Habits with tasks auto-complete when all tasks are done

### Priority-Based Scoring
- **Low Priority**: 1 point
- **Medium Priority**: 2 points
- **High Priority**: 3 points
- **Critical Priority**: 5 points

**Scoring Algorithm:**
- Habits without tasks: Full points when completed
- Habits with tasks: Weighted score based on task priority completion
  - Example: Medium habit (3 pts) with 2 medium tasks
    - Completing 1 task: 50% completion = 1.5 pts
    - Completing both: 100% completion = 3 pts
  - Task weights are calculated using: (Task Priority × Habit Priority) / Total Task Priority Weight

### Analytics & Visualizations
- **Stats Overview**: Real-time daily score, completion rate, total habits, and all-time completions
- **Weekly Progress Chart**: Line chart showing score trends over 8 weeks
- **Weekly Scores Bar Chart**: Bar chart displaying weekly performance comparison
- **Activity Heatmap**: 12-Month color-coded visualization of daily activity intensity
- **Habit Statistics**: Current streak, longest streak, total completions, and completion rate per habit
- **Task Metrics**: Task completion tracking with weighted score contributions

### Notes System
- **Daily Notes**: Capture thoughts, reflections, or important events for each day
- **Habit Notes**: Add context-specific notes to individual habit completions
- **Notes Archive**: Browse all daily notes organized chronologically
- **Detailed View**: Click any date to see daily note plus all habit-specific notes
- **Read-Only Protection**: Past entries are locked to prevent accidental modifications
- **Markdown Support**: Rich text formatting in note fields

### User Experience
- **One-Click Interaction**: Click anywhere on habit cards to toggle completion (habits without tasks) or expand task lists
- **Task Row Clicking**: Click anywhere on a task to toggle completion - no need to hunt for checkboxes
- **Color Coding**: Visual habit identification with customizable color palette
- **Archive System**: Hide completed habits without losing historical data
- **Data Portability**: Export and import data as JSON for backups or migration
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Eye-friendly dark theme throughout the application
- **Drag & Drop**: Reorder habits in the manage view (coming soon)
- **Automatic Year Archiving**: Year-end data archiving for clean yearly tracking

## Technology Stack

- **Framework**: Next.js 16.1.1 with App Router and Turbopack
- **Runtime**: React 19.2.3
- **Language**: TypeScript 5
- **UI Components**: Radix UI (Dialog, Select, Checkbox) + Custom ShadCN Components
- **Charts & Visualizations**: Recharts
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React
- **Date Management**: date-fns
- **State Management**: React Context API (HabitProvider)
- **Data Persistence**: Browser localStorage

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm star Guide

### Adding Habits
1. Navigate to "Manage" page
2. Click "Add Habit" button
3. Enter habit name and optional description
4. Select priority level (Low/Medium/High/Critical)
5. Choose a custom color for visual identification
6. Click "Add Habit" to save

### Planning Daily Tasks
1. Go to "Plan" page to access the task planner
2. Use date navigation to plan for today or future dates
3. Click "Add Task" button
4. Fill in task details:
   - Task title (required)
   - Description (optional)
   - Link to a habit (optional) or leave as standalone task
   - Set task priority
   - Enable "Recurring" to auto-copy task to next day
5. View estimated score based on planned task completion
6. Tasks automatically propagate from previous day if marked recurring

### Daily Tracking
1. Navigate to "Track" page
2. Add a daily note to capture the day's highlights (optional)
3. For habits without tasks:
   - Click anywhere on the habit card to toggle completion
   - Instant full score credit on completion
4. For habits with tasks:
   - Click anywhere on the habit card to expand/collapse task list
   - Click anywhere on a task row to toggle completion
   - Completion percentage shown as badge
   - Score increases proportionally with task completion
5. Click note icon to add habit-specific notes
6. Daily score updates automatically with weighted calculations

### Viewing Analytics
1. Navigate to "Dashboard" page
2. Review stats cards at the top:
   - Today's Score (weighted by completion percentage)
   Project Structure

```
trackr/
├── app/
│   ├── dashboard/        # Analytics and visualizations
│   ├── manage/          # Habit management interface
│   ├── notes/           # Daily notes archive
│   │   └── [date]/      # Detailed note view for specific date
│   ├── plan/            # Task planning interface
│   └── track/           # Daily habit tracking
├── components/
│   ├── ui/              # Reusable UI components (buttons, cards, dialogs, etc.)
│   ├── add-habit-dialog.tsx
│   ├── add-task-dialog.tsx
│   ├── app-layout.tsx
│   ├── dashboard-charts.tsx
│   ├── habit-checklist.tsx
│   ├── habit-provider.tsx
│   ├── planner-view.tsx
│   ├── stats-overview.tsx
│   └── task-list.tsx
└── lib/
    ├── storage.ts       # localStorage abstraction layer
    ├── types.ts         # TypeScript interfaces and types
    ├── utils-habit.ts   # Habit calculation utilities
    └── utils.ts         # General utility functions
```

## Key Concepts

### Weighted Task Scoring
Tasks contribute to habit scores based on their priority weight:
- Each task has its own priority (1/2/3/5 points)
- Task completion percentage = (Completed Task Priority Sum) / (Total Task Priority Sum)
- Habit score = Habit Priority × Task Completion Percentage

### Recurring Tasks
- Enable "Recurring" when creating a task
- Task automatically copies to the next day when loading that date
- Useful for daily routines and consistent work items

### Completion States
- **Habits without tasks**: Binary completed/incomplete (0% or 100%)
- **Habits with tasks**: Granular completion based on task priority weights
- **Auto-completion**: Habits with tasks auto-mark complete when all tasks are done

### Permission Model
- **Current and past dates**: Can complete/uncomplete tasks and habits
- **Future dates**: Read-only for completion, but can add/delete tasks for planning

## Data Storage

All data is stored in browser localStorage with these keys:
- `habit-tracker-habits`: Habit definitions
- `habit-tracker-entries`: Daily completion records
- `habit-tracker-day-notes`: Daily note entries
- `habit-tracker-planned-tasks`: Task planning data
- `habit-tracker-archived-years`: Historical year data
- `habit-tracker-year-{year}`: Archived data for specific year

## Development Notes

### Running the App
The application uses Turbopack for fast development compilation. Hot module replacement (HMR) enables instant updates during development.

### State Management
- Global habit state managed via React Context (HabitProvider)
- Local component state for UI interactions
- localStorage sync happens on all mutations

### Adding New Features
1. Define types in `lib/types.ts`
2. Add storage operations in `lib/storage.ts`
3. Create UI components in `components/`
4. Wire up in appropriate page under `app/`

## License

MIT

## Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Deploy with default Next.js settings
4. Application runs entirely client-side with localStorage

### Other Platforms
Compatible with any static hosting platform:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages (with proper configuration)

No server-side requirements - pure static export possible with `next export`
3. Click "Edit" to modify habit details
4. Click "Archive" to hide habit while preserving history
5. Click "Delete" to permanently remove habit and all data
6. Click "Archived Habits" to view/restore archived habits
7. Use "Data Management" button for:
   - Export all data as JSON backup
   - Import data from backup file
   - View archived years

### Browsing Notes
1. Navigate to "Notes" page to see all daily notes
2. Browse chronologically organized note cards
3. Each card shows date and note preview
4. Click on any date card to view detailed breakdown:
   - Full daily note
   - All habit-specific notes for that date
5. Past dates are read-only to prevent accidental edit
3. Click on any date card to view detailed notes for that day
4. In detailed view, see your daily note plus all habit-specific notes
5. Notes from past days are read-only to prevent accidental changes

## License

MIT


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
