'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Habit, HabitEntry, PRIORITY_VALUES } from '@/lib/types';
import { calculateDailyScore, getToday } from '@/lib/utils-habit';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';

interface StatsOverviewProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export function StatsOverview({ habits, entries }: StatsOverviewProps) {
  const today = getToday();
  const todayScore = calculateDailyScore(habits, entries, today);
  
  const activeHabits = habits.filter(h => !h.archived);
  const todayEntries = entries.filter(e => e.date === today && e.completed);
  
  const maxPossibleScore = activeHabits.reduce((sum, habit) => {
    return sum + PRIORITY_VALUES[habit.priority];
  }, 0);

  const completionPercentage = maxPossibleScore > 0 
    ? Math.round((todayScore / maxPossibleScore) * 100) 
    : 0;

  const totalCompletions = entries.filter(e => e.completed).length;

  const stats = [
    {
      title: "Today's Score",
      value: todayScore,
      subtitle: `${todayEntries.length} of ${activeHabits.length} habits`,
      icon: Target,
      color: '#3b82f6',
    },
    {
      title: 'Completion Rate',
      value: `${completionPercentage}%`,
      subtitle: 'Today\'s progress',
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      title: 'Total Habits',
      value: activeHabits.length,
      subtitle: `${habits.filter(h => h.archived).length} archived`,
      icon: Flame,
      color: '#f59e0b',
    },
    {
      title: 'All Time',
      value: totalCompletions,
      subtitle: 'Total completions',
      icon: Award,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
