export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Habit {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  color: string;
  createdAt: string;
  archived: boolean;
  order: number;
}

export interface HabitEntry {
  habitId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  completedAt?: string; // ISO timestamp when completed
  note?: string;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
}

export const PRIORITY_VALUES: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 5,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
};

export interface YearData {
  year: number;
  habits: Habit[];
  entries: HabitEntry[];
  archivedAt: string;
}
