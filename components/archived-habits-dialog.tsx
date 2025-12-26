'use client';

import { useState } from 'react';
import { Habit, HabitStats } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY_VALUES } from '@/lib/types';

interface ArchivedHabitsDialogProps {
  habits: Habit[];
  stats: Record<string, HabitStats>;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export function ArchivedHabitsDialog({ habits, stats, onUpdate, onDelete }: ArchivedHabitsDialogProps) {
  const [open, setOpen] = useState(false);
  const archivedHabits = habits.filter(h => h.archived);

  const handleUnarchive = (habitId: string) => {
    onUpdate(habitId, { archived: false });
  };

  const handleDelete = (habitId: string) => {
    if (confirm('Are you sure you want to permanently delete this habit?')) {
      onDelete(habitId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Archive className="h-4 w-4" />
          View Archived Habits ({archivedHabits.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Archived Habits</DialogTitle>
          <DialogDescription>
            Restore or permanently delete archived habits
          </DialogDescription>
        </DialogHeader>
        
        {archivedHabits.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No archived habits
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {archivedHabits.map(habit => {
              const habitStats = stats[habit.id];
              return (
                <Card key={habit.id} className="border-zinc-800">
                  <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <CardContent className="p-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium">{habit.name}</h3>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 h-5"
                            style={{ 
                              borderColor: PRIORITY_COLORS[habit.priority],
                              color: PRIORITY_COLORS[habit.priority]
                            }}
                          >
                            {PRIORITY_VALUES[habit.priority]}
                          </Badge>
                        </div>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        )}
                      </div>

                      {habitStats && (
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold">{habitStats.currentStreak}</div>
                            <div className="text-xs text-muted-foreground">Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{habitStats.totalCompletions}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">{habitStats.completionRate}%</div>
                            <div className="text-xs text-muted-foreground">Rate</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnarchive(habit.id)}
                          className="h-8 w-8 p-0"
                          title="Restore habit"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(habit.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
