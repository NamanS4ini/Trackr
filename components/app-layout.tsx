'use client';

import { AddHabitDialog } from '@/components/add-habit-dialog';
import { Navigation } from '@/components/navigation';
import { useHabits } from '@/components/habit-provider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { addHabit } = useHabits();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Trackr</h1>
            <p className="text-muted-foreground mt-2">
              Build better habits with priority-based tracking
            </p>
          </div>
          <AddHabitDialog onAdd={addHabit} />
        </div>
        <Navigation />
        {children}
      </div>
    </div>
  );
}
