'use client';

import { HabitsManager } from '@/components/habits-manager';
import { DataManagement } from '@/components/data-management';
import { StartPageSettings } from '@/components/start-page-settings';
import { ChartFormatSettings } from '@/components/chart-format-settings';
import { AddHabitDialog } from '@/components/add-habit-dialog';
import { useHabits } from '@/components/habit-provider';
import { calculateHabitStats } from '@/lib/utils-habit';
import AppLayout from '@/components/app-layout';
import { Heart } from 'lucide-react';

export default function ManagePage() {
  const { habits, entries, addHabit, updateHabit, deleteHabit, reorderHabits, mounted } = useHabits();

  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {habits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-4">No habits yet</p>
            <AddHabitDialog onAdd={addHabit} />
          </div>
        ) : (
          <HabitsManager
            habits={habits}
            stats={habits.reduce((acc, habit) => {
              acc[habit.id] = calculateHabitStats(habit, entries);
              return acc;
            }, {} as Record<string, any>)}
            onUpdate={updateHabit}
            onDelete={deleteHabit}
            onReorder={reorderHabits}
          />
        )}
        <StartPageSettings />
        <ChartFormatSettings />
        <DataManagement 
          habits={habits}
          stats={habits.reduce((acc, habit) => {
            acc[habit.id] = calculateHabitStats(habit, entries);
            return acc;
          }, {} as Record<string, any>)}
          onUpdate={updateHabit}
          onDelete={deleteHabit}
        />
        
        <div className="flex items-center justify-center gap-1 py-4 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          <span>by</span>
          <a 
            href="https://github.com/namans4ini" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Naman Saini
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
