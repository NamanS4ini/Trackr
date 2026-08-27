import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, parseISO, addDays } from 'date-fns';
import { Habit, HabitEntry, HabitStats, PRIORITY_VALUES, PlannedTask } from './types';

export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekDates(date: Date = new Date()): string[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  return days.map(formatDate);
}

export function getLast30Days(): string[] {
  const today = new Date();
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push(formatDate(subDays(today, i)));
  }
  return days;
}

export function calculateStreak(entries: HabitEntry[]): { current: number; longest: number } {
  if (entries.length === 0) return { current: 0, longest: 0 };

  const sortedEntries = entries
    .filter((e) => e.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedEntries.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date();

  for (const entry of sortedEntries) {
    const entryDate = parseISO(entry.date);
    const diffDays = Math.floor(
      (expectedDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 || diffDays === 1) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
      expectedDate = subDays(entryDate, 1);
    } else {
      tempStreak = 1;
      longestStreak = Math.max(longestStreak, tempStreak);
      expectedDate = subDays(entryDate, 1);
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

export function calculateHabitStats(habit: Habit, entries: HabitEntry[]): HabitStats {
  const habitEntries = entries.filter((e) => e.habitId === habit.id);
  const completedEntries = habitEntries.filter((e) => e.completed);
  const streaks = calculateStreak(habitEntries);

  const createdDate = parseISO(habit.createdAt);
  const daysSinceCreation = Math.floor(
    (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    habitId: habit.id,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalCompletions: completedEntries.length,
    completionRate: daysSinceCreation > 0 
      ? Math.round((completedEntries.length / daysSinceCreation) * 100) 
      : 0,
  };
}

export function calculateDailyScore(habits: Habit[], entries: HabitEntry[], date: string): number {
  const dateEntries = entries.filter((e) => e.date === date);
  let score = 0;
  
  dateEntries.forEach((entry) => {
    const habit = habits.find((h) => h.id === entry.habitId);
    if (habit) {
      const completionPercentage = entry.completionPercentage ?? 100;
      // Only count if:
      // 1. Habit is fully completed (completed=true), OR
      // 2. Has partial task completion (completionPercentage < 100 means tasks are in progress)
      if (entry.completed || (completionPercentage > 0 && completionPercentage < 100)) {
        score += (PRIORITY_VALUES[habit.priority] * completionPercentage) / 100;
      }
    }
  });

  return Math.round(score * 10) / 10; // Round to 1 decimal place
}

export function calculateHabitCompletionPercentage(habitId: string, date: string, tasks: PlannedTask[]): number {
  const habitTasks = tasks.filter(t => t.habitId === habitId && t.date === date);
  if (habitTasks.length === 0) return 100;
  
  const completedTasks = habitTasks.filter(t => t.completed).length;
  return Math.round((completedTasks / habitTasks.length) * 100);
}

export function getTomorrow(): string {
  return formatDate(addDays(new Date(), 1));
}

export function calculateTaskWeightage(
  task: PlannedTask,
  habit: Habit | undefined,
  allTasksForHabit: PlannedTask[]
): number {
  if (!habit) return 0; // Standalone tasks have no weightage
  
  const habitPoints = PRIORITY_VALUES[habit.priority];
  const taskPriorityMultiplier = PRIORITY_VALUES[task.priority];
  const numberOfTasks = allTasksForHabit.length;
  
  if (numberOfTasks === 0) return 0;
  
  // Calculate: (HabitPriority * TaskPriority) / TotalTasks
  // This ensures higher priority tasks within a habit are worth more
  return (habitPoints * taskPriorityMultiplier) / numberOfTasks;
}

export function getHeatmapData(habits: Habit[], entries: HabitEntry[], days: number = 90) {
  const dates = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = formatDate(subDays(today, i));
    const score = calculateDailyScore(habits, entries, date);
    dates.push({ date, score });
  }
  
  return dates;
}

export function getYearHeatmapData(habits: Habit[], entries: HabitEntry[], year: number) {
  const dates = [];
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const today = new Date();
  
  // If it's the current year, only go up to today
  const endDate = year === today.getFullYear() ? today : endOfYear;
  
  const totalDays = Math.floor((endDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(year, 0, 1 + i);
    const date = formatDate(currentDate);
    const score = calculateDailyScore(habits, entries, date);
    dates.push({ 
      date, 
      score,
      month: currentDate.getMonth(),
      dayOfWeek: currentDate.getDay(),
    });
  }
  
  return dates;
}

export function getWeeklyScores(habits: Habit[], entries: HabitEntry[], weeks: number = 12) {
  const data = [];
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = subDays(today, i * 7);
    const weekStart = subDays(weekEnd, 6);
    const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(formatDate);
    
    let weekScore = 0;
    weekDates.forEach((date) => {
      weekScore += calculateDailyScore(habits, entries, date);
    });
    
    data.push({
      week: `Week ${weeks - i}`,
      score: weekScore,
      date: format(weekStart, 'MMM dd'),
    });
  }
  
  return data;
}

export function getDailyScores(habits: Habit[], entries: HabitEntry[], days: number = 30) {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = formatDate(date);
    const score = calculateDailyScore(habits, entries, dateStr);
    
    data.push({
      date: format(date, 'MMM dd'),
      score: score,
    });
  }
  
  return data;
}

export function getMonthlyScores(habits: Habit[], entries: HabitEntry[], months: number = 12) {
  const data = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    
    // If it's the current month, only count up to today
    const endDate = i === 0 ? today : monthEnd;
    
    const monthDates = eachDayOfInterval({ start: monthStart, end: endDate }).map(formatDate);
    
    let monthScore = 0;
    monthDates.forEach((date) => {
      monthScore += calculateDailyScore(habits, entries, date);
    });
    
    data.push({
      month: format(monthDate, 'MMM yyyy'),
      score: monthScore,
      date: format(monthDate, 'MMM yyyy'),
    });
  }
  
  return data;
}

export function getHabitCompletionData(habits: Habit[], entries: HabitEntry[], days: number = 30) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(formatDate(subDays(today, i)));
  }
  
  return habits.map((habit) => {
    const completions = dates.filter((date) => {
      const entry = entries.find((e) => e.habitId === habit.id && e.date === date);
      return entry?.completed;
    }).length;
    
    return {
      name: habit.name,
      completions,
      priority: habit.priority,
      color: habit.color,
    };
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getNextOrder(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  return Math.max(...habits.map(h => h.order || 0)) + 1;
}

// --- Scheduling & Rotation Helpers ---

/**
 * Returns the number of days since Unix epoch (1970-01-01) for a YYYY-MM-DD string.
 * Uses UTC to avoid timezone issues.
 */
export function getDaysSinceEpoch(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

/**
 * Determines the rotation index (0-based) for a given date within a group of `groupSize`.
 * If `activeDays` is provided, the counter only advances on active days so the
 * rotation skips non-active days entirely.
 */
export function getRotationIndex(dateStr: string, groupSize: number, activeDays?: number[]): number {
  if (groupSize <= 1) return 0;

  const daysSinceEpoch = getDaysSinceEpoch(dateStr);

  if (!activeDays || activeDays.length === 0 || activeDays.length === 7) {
    // Every day is active — simple modulo
    return ((daysSinceEpoch % groupSize) + groupSize) % groupSize;
  }

  // Count how many active days have occurred from epoch (day 0) to this day (inclusive).
  // Epoch (1970-01-01) was a Thursday (getDay() === 4).
  const EPOCH_DOW = 4; // Thursday

  const fullWeeks = Math.floor(daysSinceEpoch / 7);
  const remainder = daysSinceEpoch % 7;
  const activeDaysPerWeek = activeDays.length;

  let count = fullWeeks * activeDaysPerWeek;

  // Count active days in the partial week (day 0 through remainder)
  for (let i = 0; i <= remainder; i++) {
    const dow = (EPOCH_DOW + i) % 7;
    if (activeDays.includes(dow)) {
      count++;
    }
  }

  // count is 1-based (first active day = 1), convert to 0-based
  return count > 0 ? (count - 1) % groupSize : 0;
}

/**
 * Checks whether a habit should be shown on a given date,
 * considering both its day-of-week filter and rotation group membership.
 */
export function isHabitActiveOnDate(habit: Habit, dateStr: string, allHabits: Habit[]): boolean {
  // 1. Day-of-week filter
  if (habit.activeDays && habit.activeDays.length > 0 && habit.activeDays.length < 7) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0=Sun … 6=Sat
    if (!habit.activeDays.includes(dayOfWeek)) {
      return false;
    }
  }

  // 2. Rotation group filter
  if (habit.rotationGroupId) {
    const groupHabits = allHabits
      .filter(h => h.rotationGroupId === habit.rotationGroupId && !h.archived)
      .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0));

    if (groupHabits.length > 1) {
      // Use this habit's activeDays for the rotation counter (all members should share the same schedule)
      const rotIdx = getRotationIndex(dateStr, groupHabits.length, habit.activeDays);
      return groupHabits[rotIdx]?.id === habit.id;
    }
  }

  return true;
}

/**
 * Returns only the habits that should be visible on a given date
 * (respects day-of-week filter and rotation groups).
 */
export function getActiveHabitsForDate(habits: Habit[], dateStr: string): Habit[] {
  return habits.filter(h => isHabitActiveOnDate(h, dateStr, habits));
}
