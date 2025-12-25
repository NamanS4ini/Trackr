'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit, HabitEntry } from '@/lib/types';
import { Flame, Zap } from 'lucide-react';
import { subDays } from 'date-fns';
import { formatDate, calculateDailyScore } from '@/lib/utils-habit';

interface StreakCardProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export function StreakCard({ habits, entries }: StreakCardProps) {
  const activeHabits = habits.filter(h => !h.archived);
  
  // Calculate "All Killed" streak (all habits completed each day)
  const calculateAllKilledStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = formatDate(currentDate);
      const dayEntries = entries.filter(e => e.date === dateStr && e.completed);
      const completedHabitIds = new Set(dayEntries.map(e => e.habitId));
      
      // Check if all active habits were completed
      const allCompleted = activeHabits.every(habit => completedHabitIds.has(habit.id));
      
      if (!allCompleted) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
      
      // Don't go back more than 365 days
      if (streak > 365) break;
    }
    
    return streak;
  };
  
  // Calculate "At Least One" streak (at least one habit completed each day)
  const calculateAtLeastOneStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = formatDate(currentDate);
      const score = calculateDailyScore(activeHabits, entries, dateStr);
      
      if (score === 0) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
      
      // Don't go back more than 365 days
      if (streak > 365) break;
    }
    
    return streak;
  };
  
  const allKilledStreak = calculateAllKilledStreak();
  const atLeastOneStreak = calculateAtLeastOneStreak();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Streaks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-orange-950/50 to-red-950/50 border border-orange-900/50">
            <Flame className="h-6 w-6 text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-orange-400">{allKilledStreak}</div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              All Killed
            </div>
            <div className="text-xs text-muted-foreground/70 text-center">
              All habits done
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border border-blue-900/50">
            <Zap className="h-6 w-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-blue-400">{atLeastOneStreak}</div>
            <div className="text-xs text-muted-foreground text-center mt-1">
              At Least One
            </div>
            <div className="text-xs text-muted-foreground/70 text-center">
              Stayed active
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
