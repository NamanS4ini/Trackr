'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habit, HabitEntry } from '@/lib/types';
import { storage } from '@/lib/storage';

interface HabitContextType {
  habits: Habit[];
  entries: HabitEntry[];
  mounted: boolean;
  addHabit: (habit: Habit) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleEntry: (habitId: string, date: string, note?: string) => void;
  updateEntryNote: (habitId: string, date: string, note: string) => void;
  reorderHabits: (habitIds: string[]) => void;
  refreshData: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadData = () => {
    setHabits(storage.getHabits());
    setEntries(storage.getEntries());
  };

  useEffect(() => {
    storage.checkAndArchiveIfNewYear();
    loadData();
    setMounted(true);
  }, []);

  const addHabit = (habit: Habit) => {
    storage.addHabit(habit);
    loadData();
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    storage.updateHabit(id, updates);
    loadData();
  };

  const deleteHabit = (id: string) => {
    storage.deleteHabit(id);
    loadData();
  };

  const toggleEntry = (habitId: string, date: string, note?: string) => {
    storage.toggleEntry(habitId, date, note);
    loadData();
  };

  const updateEntryNote = (habitId: string, date: string, note: string) => {
    storage.updateEntryNote(habitId, date, note);
    loadData();
  };

  const reorderHabits = (habitIds: string[]) => {
    storage.reorderHabits(habitIds);
    loadData();
  };

  const refreshData = () => {
    loadData();
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        entries,
        mounted,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleEntry,
        updateEntryNote,
        reorderHabits,
        refreshData,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
}
