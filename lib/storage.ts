import { Habit, HabitEntry } from './types';

const HABITS_KEY = 'habit-tracker-habits';
const ENTRIES_KEY = 'habit-tracker-entries';

export const storage = {
  // Habits
  getHabits: (): Habit[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveHabits: (habits: Habit[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  addHabit: (habit: Habit): void => {
    const habits = storage.getHabits();
    habits.push(habit);
    storage.saveHabits(habits);
  },

  updateHabit: (id: string, updates: Partial<Habit>): void => {
    const habits = storage.getHabits();
    const index = habits.findIndex((h) => h.id === id);
    if (index !== -1) {
      habits[index] = { ...habits[index], ...updates };
      storage.saveHabits(habits);
    }
  },

  deleteHabit: (id: string): void => {
    const habits = storage.getHabits();
    const filtered = habits.filter((h) => h.id !== id);
    storage.saveHabits(filtered);
    
    // Also delete all entries for this habit
    const entries = storage.getEntries();
    const filteredEntries = entries.filter((e) => e.habitId !== id);
    storage.saveEntries(filteredEntries);
  },

  reorderHabits: (habitIds: string[]): void => {
    const habits = storage.getHabits();
    const reordered = habitIds.map((id, index) => {
      const habit = habits.find((h) => h.id === id);
      if (habit) {
        return { ...habit, order: index };
      }
      return null;
    }).filter(Boolean) as Habit[];
    
    // Add any habits that weren't in the reorder list
    const missingHabits = habits.filter((h) => !habitIds.includes(h.id));
    missingHabits.forEach((h, i) => {
      reordered.push({ ...h, order: habitIds.length + i });
    });
    
    storage.saveHabits(reordered);
  },

  // Entries
  getEntries: (): HabitEntry[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEntries: (entries: HabitEntry[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  },

  getEntriesForDate: (date: string): HabitEntry[] => {
    const entries = storage.getEntries();
    return entries.filter((e) => e.date === date);
  },

  getEntriesForHabit: (habitId: string): HabitEntry[] => {
    const entries = storage.getEntries();
    return entries.filter((e) => e.habitId === habitId);
  },

  toggleEntry: (habitId: string, date: string, note?: string): void => {
    const entries = storage.getEntries();
    const existingIndex = entries.findIndex(
      (e) => e.habitId === habitId && e.date === date
    );

    if (existingIndex !== -1) {
      // Toggle completion
      const wasCompleted = entries[existingIndex].completed;
      entries[existingIndex].completed = !wasCompleted;
      
      // Update completedAt timestamp
      if (!wasCompleted) {
        entries[existingIndex].completedAt = new Date().toISOString();
      } else {
        entries[existingIndex].completedAt = undefined;
      }
      
      if (note !== undefined) {
        entries[existingIndex].note = note;
      }
    } else {
      // Create new entry
      entries.push({
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
        note,
      });
    }

    storage.saveEntries(entries);
  },

  updateEntryNote: (habitId: string, date: string, note: string): void => {
    const entries = storage.getEntries();
    const entry = entries.find((e) => e.habitId === habitId && e.date === date);
    if (entry) {
      entry.note = note;
      storage.saveEntries(entries);
    }
  },

  // Export data
  exportData: () => {
    return {
      habits: storage.getHabits(),
      entries: storage.getEntries(),
      exportedAt: new Date().toISOString(),
    };
  },

  // Import data
  importData: (data: { habits: Habit[]; entries: HabitEntry[] }): void => {
    storage.saveHabits(data.habits);
    storage.saveEntries(data.entries);
  },

  // Year archiving
  getArchivedYears: (): number[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('habit-tracker-archived-years');
    return data ? JSON.parse(data) : [];
  },

  getYearData: (year: number) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`habit-tracker-year-${year}`);
    return data ? JSON.parse(data) : null;
  },

  archiveCurrentYear: (): void => {
    if (typeof window === 'undefined') return;
    
    const currentYear = new Date().getFullYear();
    const habits = storage.getHabits();
    const entries = storage.getEntries();
    
    const yearData = {
      year: currentYear,
      habits,
      entries,
      archivedAt: new Date().toISOString(),
    };
    
    // Save the year data
    localStorage.setItem(`habit-tracker-year-${currentYear}`, JSON.stringify(yearData));
    
    // Update archived years list
    const archivedYears = storage.getArchivedYears();
    if (!archivedYears.includes(currentYear)) {
      archivedYears.push(currentYear);
      archivedYears.sort((a, b) => b - a);
      localStorage.setItem('habit-tracker-archived-years', JSON.stringify(archivedYears));
    }
  },

  checkAndArchiveIfNewYear: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const lastCheck = localStorage.getItem('habit-tracker-last-year-check');
    const currentYear = new Date().getFullYear();
    
    if (!lastCheck || parseInt(lastCheck) < currentYear) {
      // Archive previous year if we have data
      const entries = storage.getEntries();
      if (entries.length > 0) {
        const hasOldYearData = entries.some(e => {
          const entryYear = new Date(e.date).getFullYear();
          return entryYear < currentYear;
        });
        
        if (hasOldYearData) {
          storage.archiveCurrentYear();
          // Clear current data for new year
          storage.saveEntries([]);
        }
      }
      
      localStorage.setItem('habit-tracker-last-year-check', currentYear.toString());
      return true;
    }
    
    return false;
  },
};
