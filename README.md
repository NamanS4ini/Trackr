# Habit Tracker

A modern, dark-mode habit tracking application built with Next.js, featuring priority-based scoring, comprehensive analytics, and data visualization.

## Features

### Core Functionality
- **Habit Management**: Create, edit, archive, and delete habits
- **Priority System**: Assign priority levels (Low, Medium, High, Critical) to habits
- **Daily Tracking**: Check off habits daily with optional notes
- **Local Storage**: All data stored locally in your browser

### Priority-Based Scoring
- Low Priority: 1 point
- Medium Priority: 2 points  
- High Priority: 3 points
- Critical Priority: 5 points

Daily scores are calculated based on completed habits and their priority levels.

### Analytics & Visualizations
- **Stats Overview**: Today's score, completion rate, total habits, and all-time completions
- **Weekly Progress Chart**: Line chart showing score trends over 8 weeks
- **Weekly Scores Bar Chart**: Bar chart displaying weekly performance
- **Activity Heatmap**: 12-week visualization of daily activity intensity
- **Habit Stats**: Track current streak, longest streak, total completions, and completion rate for each habit

### Notes System
- **Daily Notes**: Add a note for each day to capture thoughts, reflections, or important events
- **Habit Notes**: Add specific notes to individual habit completions
- **Notes Page**: View all daily notes organized by date
- **Detailed View**: Click on any date to see daily note + all habit-specific notes for that day
- **Read-Only Protection**: Past day notes are automatically locked to prevent accidental edits

### Additional Features
- **Color Coding**: Customize each habit with a color
- **Archive System**: Archive habits without losing historical data
- **Data Export/Import**: Backup and restore your data as JSON
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Automatic Year Archiving**: Habits are automatically archived at year-end for heatmap display

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Charts**: Recharts
- **Styling**: Tailwind CSS (Dark Mode)
- **Icons**: Lucide React
- **Date Handling**: date-fns

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
npm start
```

## Usage

### Adding a Habit
1. Click "Add Habit" button
2. Enter habit name and optional description
3. Select priority level
4. Choose a color
5. Click "Add Habit"

### Daily Tracking
1. Go to "Track" tab
2. Add a daily note to capture your day's highlights (optional)
3. Click the checkbox next to each habit to mark as complete
4. Click the note icon on any habit to add habit-specific notes
5. Click "Save Note" to save habit notes without toggling completion
6. Your daily score updates automatically

### Viewing Analytics
1. Navigate to "Dashboard" tab
2. View your stats overview at the top
3. Analyze trends in the weekly charts
4. Check the activity heatmap for long-term patterns

### Managing Habits
1. Go to "Manage" tab
2. View all habits with their statistics
3. Edit, archive, or delete habits as needed
4. Switch between active and archived habits
5. View archived habits through Data Management dialog
6. Export your data for backup

### Using Notes
1. Navigate to "Notes" tab to view all daily notes
2. Each note shows the date and a preview of the content
3. Click on any date card to view detailed notes for that day
4. In detailed view, see your daily note plus all habit-specific notes
5. Notes from past days are read-only to prevent accidental changes

## License

MIT


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
