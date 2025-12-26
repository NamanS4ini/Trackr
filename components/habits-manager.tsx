'use client';

import { Habit, HabitStats } from '@/lib/types';
import { DraggableHabitsList } from './draggable-habits-list';

interface HabitsManagerProps {
  habits: Habit[];
  stats: Record<string, HabitStats>;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onReorder: (habitIds: string[]) => void;
}

export function HabitsManager({ habits, stats, onUpdate, onDelete, onReorder }: HabitsManagerProps) {
  // Only show active (non-archived) habits
  const activeHabits = habits.filter(h => !h.archived);

  return (
    <DraggableHabitsList
      habits={activeHabits}
      stats={stats}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onReorder={onReorder}
      showArchiveToggle={true}
    />
  );
}
