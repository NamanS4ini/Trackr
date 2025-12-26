'use client';

import { useState } from 'react';
import { Habit, HabitStats } from '@/lib/types';
import { DraggableHabitsList } from './draggable-habits-list';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Archive, List } from 'lucide-react';

interface HabitsManagerProps {
  habits: Habit[];
  stats: Record<string, HabitStats>;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onReorder: (habits: Habit[]) => void;
}

export function HabitsManager({ habits, stats, onUpdate, onDelete, onReorder }: HabitsManagerProps) {
  const [view, setView] = useState<'active' | 'archived'>('active');

  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);

  const displayHabits = view === 'active' ? activeHabits : archivedHabits;

  return (
    <div className="space-y-4">
      {/* Toggle Buttons */}
      <Card className="border-zinc-800">
        <CardContent className="p-3">
          <div className="flex gap-2 justify-center">
            <Button
              variant={view === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('active')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Active ({activeHabits.length})
            </Button>
            <Button
              variant={view === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('archived')}
              className="gap-2"
            >
              <Archive className="h-4 w-4" />
              Archived ({archivedHabits.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Habits List */}
      {displayHabits.length === 0 ? (
        <Card className="border-zinc-800">
          <CardContent className="p-8 text-center text-muted-foreground">
            {view === 'active' ? (
              <p>No active habits. Create one to get started!</p>
            ) : (
              <p>No archived habits yet.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <DraggableHabitsList
          habits={displayHabits}
          stats={stats}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onReorder={onReorder}
          showArchiveToggle={true}
        />
      )}
    </div>
  );
}
