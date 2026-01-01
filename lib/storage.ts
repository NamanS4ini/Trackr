import { Habit, HabitEntry, DayNote, PlannedTask, PRIORITY_VALUES } from './types';

const HABITS_KEY = 'habit-tracker-habits';
const ENTRIES_KEY = 'habit-tracker-entries';
const DAY_NOTES_KEY = 'habit-tracker-day-notes';
const PLANNED_TASKS_KEY = 'habit-tracker-planned-tasks';

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

    // Get tasks for this habit and date to calculate completion percentage
    const habitTasks = storage.getPlannedTasksForDate(date).filter(t => t.habitId === habitId);
    const hasTasks = habitTasks.length > 0;
    const completionPercentage = hasTasks 
      ? (habitTasks.filter(t => t.completed).length / habitTasks.length) * 100 
      : 100;

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

      // Update completion percentage and tasks array
      entries[existingIndex].completionPercentage = completionPercentage;
      entries[existingIndex].tasks = habitTasks.map(t => t.id);
    } else {
      // Create new entry
      entries.push({
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString(),
        note,
        completionPercentage,
        tasks: habitTasks.map(t => t.id),
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
    
    // Detect and archive years from imported data
    const currentYear = new Date().getFullYear();
    const yearsInData = new Set<number>();
    
    data.entries.forEach(entry => {
      // Parse date as YYYY-MM-DD to avoid timezone issues
      const [year] = entry.date.split('-').map(Number);
      if (year < currentYear) {
        yearsInData.add(year);
      }
    });
    
    // Update archived years list
    if (yearsInData.size > 0) {
      const archivedYears = storage.getArchivedYears();
      const updatedYears = new Set([...archivedYears, ...Array.from(yearsInData)]);
      const sortedYears = Array.from(updatedYears).sort((a, b) => b - a);
      localStorage.setItem('habit-tracker-archived-years', JSON.stringify(sortedYears));
      
      // Create archived year data for each year
      yearsInData.forEach(year => {
        const yearHabits = data.habits.filter(h => {
          const createdYear = new Date(h.createdAt).getFullYear();
          return createdYear <= year;
        });
        
        const yearEntries = data.entries.filter(e => {
          // Parse date as YYYY-MM-DD to avoid timezone issues
          const [entryYear] = e.date.split('-').map(Number);
          return entryYear === year;
        });
        
        const yearData = {
          year,
          habits: yearHabits,
          entries: yearEntries,
          archivedAt: new Date().toISOString(),
        };
        
        localStorage.setItem(`habit-tracker-year-${year}`, JSON.stringify(yearData));
      });
    }
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

  // Day Notes
  getDayNotes: (): DayNote[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(DAY_NOTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveDayNotes: (notes: DayNote[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(DAY_NOTES_KEY, JSON.stringify(notes));
  },

  getDayNote: (date: string): DayNote | undefined => {
    const notes = storage.getDayNotes();
    return notes.find(n => n.date === date);
  },

  saveDayNote: (date: string, note: string): void => {
    const notes = storage.getDayNotes();
    const existingIndex = notes.findIndex(n => n.date === date);
    
    if (existingIndex !== -1) {
      notes[existingIndex] = { date, note, createdAt: notes[existingIndex].createdAt };
    } else {
      notes.push({ date, note, createdAt: new Date().toISOString() });
    }
    
    storage.saveDayNotes(notes);
  },

  deleteDayNote: (date: string): void => {
    const notes = storage.getDayNotes();
    const filtered = notes.filter(n => n.date !== date);
    storage.saveDayNotes(filtered);
  },

  // Planned Tasks
  getPlannedTasks: (): PlannedTask[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(PLANNED_TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePlannedTasks: (tasks: PlannedTask[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLANNED_TASKS_KEY, JSON.stringify(tasks));
  },

  getPlannedTasksForDate: (date: string): PlannedTask[] => {
    const tasks = storage.getPlannedTasks();
    
    // Check if we need to copy recurring tasks from previous day
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    const prevDayTasks = tasks.filter(t => t.date === prevDateStr && t.recurring);
    const currentDayTasks = tasks.filter(t => t.date === date);
    let needsSave = false;
    
    // Copy recurring tasks from previous day if they don't exist
    prevDayTasks.forEach(prevTask => {
      const existsForCurrentDay = currentDayTasks.some(
        t => t.title === prevTask.title && t.habitId === prevTask.habitId && t.recurring
      );
      
      if (!existsForCurrentDay) {
        const maxOrder = currentDayTasks.length > 0 
          ? Math.max(...currentDayTasks.map(t => t.order)) 
          : -1;
        
        const newTask: PlannedTask = {
          ...prevTask,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date: date,
          completed: false,
          completedAt: undefined,
          createdAt: new Date().toISOString(),
          order: maxOrder + 1,
        };
        
        tasks.push(newTask);
        currentDayTasks.push(newTask);
        needsSave = true;
      }
    });
    
    if (needsSave) {
      storage.savePlannedTasks(tasks);
    }
    
    return tasks.filter((t) => t.date === date).sort((a, b) => a.order - b.order);
  },

  getPlannedTasksForHabit: (habitId: string, date: string): PlannedTask[] => {
    const tasks = storage.getPlannedTasks();
    return tasks.filter((t) => t.habitId === habitId && t.date === date).sort((a, b) => a.order - b.order);
  },

  addPlannedTask: (task: PlannedTask): void => {
    const tasks = storage.getPlannedTasks();
    tasks.push(task);
    storage.savePlannedTasks(tasks);
  },

  updatePlannedTask: (id: string, updates: Partial<PlannedTask>): void => {
    const tasks = storage.getPlannedTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      storage.savePlannedTasks(tasks);
      
      // Update entry completion percentage if task belongs to a habit
      const task = tasks[index];
      if (task.habitId) {
        storage.recalculateHabitCompletion(task.habitId, task.date);
      }
    }
  },

  toggleTaskCompletion: (taskId: string): void => {
    const tasks = storage.getPlannedTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed) {
        task.completedAt = new Date().toISOString();
      } else {
        task.completedAt = undefined;
      }
      storage.savePlannedTasks(tasks);
      
      // Update entry completion percentage if task belongs to a habit
      if (task.habitId) {
        storage.recalculateHabitCompletion(task.habitId, task.date);
      }
    }
  },

  deletePlannedTask: (id: string): void => {
    const tasks = storage.getPlannedTasks();
    const task = tasks.find((t) => t.id === id);
    const filtered = tasks.filter((t) => t.id !== id);
    storage.savePlannedTasks(filtered);
    
    // Update entry completion percentage if task belonged to a habit
    if (task?.habitId) {
      storage.recalculateHabitCompletion(task.habitId, task.date);
    }
  },

  reorderPlannedTasks: (taskIds: string[]): void => {
    const tasks = storage.getPlannedTasks();
    const reordered = taskIds.map((id, index) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        return { ...task, order: index };
      }
      return null;
    }).filter(Boolean) as PlannedTask[];
    
    // Add any tasks that weren't in the reorder list
    const missingTasks = tasks.filter((t) => !taskIds.includes(t.id));
    missingTasks.forEach((t, i) => {
      reordered.push({ ...t, order: taskIds.length + i });
    });
    
    storage.savePlannedTasks(reordered);
  },

  recalculateHabitCompletion: (habitId: string, date: string): void => {
    const habitTasks = storage.getPlannedTasksForHabit(habitId, date);
    const entries = storage.getEntries();
    let entryIndex = entries.findIndex((e) => e.habitId === habitId && e.date === date);
    
    let completionPercentage = 100;
    if (habitTasks.length > 0) {
      // Calculate total priority weight of all tasks
      const totalTaskWeight = habitTasks.reduce((sum, t) => sum + PRIORITY_VALUES[t.priority], 0);
      // Calculate weighted completion
      const completedWeight = habitTasks
        .filter(t => t.completed)
        .reduce((sum, t) => sum + PRIORITY_VALUES[t.priority], 0);
      completionPercentage = totalTaskWeight > 0 ? (completedWeight / totalTaskWeight) * 100 : 0;
    }
    
    const allTasksCompleted = habitTasks.length > 0 && habitTasks.every(t => t.completed);
    
    // Create entry if it doesn't exist
    if (entryIndex === -1) {
      entries.push({
        habitId,
        date,
        completed: allTasksCompleted,
        completedAt: allTasksCompleted ? new Date().toISOString() : undefined,
        completionPercentage,
        tasks: habitTasks.map(t => t.id),
      });
    } else {
      entries[entryIndex].completionPercentage = completionPercentage;
      entries[entryIndex].completed = allTasksCompleted;
      entries[entryIndex].tasks = habitTasks.map(t => t.id);
      
      if (allTasksCompleted) {
        entries[entryIndex].completedAt = new Date().toISOString();
      } else {
        entries[entryIndex].completedAt = undefined;
      }
    }
    
    storage.saveEntries(entries);
  },
};
