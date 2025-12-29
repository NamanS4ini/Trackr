'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecks, LayoutDashboard, Settings, Flame, Zap, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHabits } from '@/components/habit-provider';
import { subDays } from 'date-fns';
import { formatDate, calculateDailyScore } from '@/lib/utils-habit';

export function Navigation() {
  const pathname = usePathname();
  const { habits, entries } = useHabits();

  const links = [
    { href: '/track', label: 'Track', icon: ListChecks },
    { href: '/plan', label: 'Plan', icon: Calendar },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/notes', label: 'Notes', icon: FileText },
    { href: '/manage', label: 'Manage', icon: Settings },
  ];

  const activeHabits = habits.filter(h => !h.archived);
  
  // Calculate "All Killed" streak
  const calculateAllKilledStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    while (streak < 365) {
      const dateStr = formatDate(currentDate);
      const dayEntries = entries.filter(e => e.date === dateStr && e.completed);
      const completedHabitIds = new Set(dayEntries.map(e => e.habitId));
      
      const allCompleted = activeHabits.every(habit => completedHabitIds.has(habit.id));
      
      if (!allCompleted) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  };
  
  // Calculate "At Least One" streak
  const calculateAtLeastOneStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    while (streak < 365) {
      const dateStr = formatDate(currentDate);
      const score = calculateDailyScore(activeHabits, entries, dateStr);
      
      if (score === 0) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  };
  
  const allKilledStreak = calculateAllKilledStreak();
  const atLeastOneStreak = calculateAtLeastOneStreak();

  return (
    <nav className="border-b border-zinc-800 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 pb-4 border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-600 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4 pb-4">
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-orange-950/50 to-red-950/50 border border-orange-900/50 cursor-help transition-all hover:scale-105"
            title="All Killed - All habits completed each day"
          >
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-400">{allKilledStreak}</span>
          </div>
          
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-br from-blue-950/50 to-cyan-950/50 border border-blue-900/50 cursor-help transition-all hover:scale-105"
            title="At Least One - Stayed active daily"
          >
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-400">{atLeastOneStreak}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
