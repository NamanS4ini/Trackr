'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitStats } from '@/lib/types';
import { Pencil, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import { EditHabitDialog } from './edit-habit-dialog';

interface HabitCardProps {
  habit: Habit;
  stats: HabitStats;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function HabitCard({ habit, stats, onUpdate, onDelete }: HabitCardProps) {
  const [showEdit, setShowEdit] = useState(false);

  const toggleArchive = () => {
    onUpdate(habit.id, { archived: !habit.archived });
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: habit.color }}
        />
        <CardHeader className="pl-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{habit.name}</CardTitle>
              {habit.description && (
                <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
              )}
            </div>
            <Badge variant="outline" className="ml-2">
              {PRIORITY_LABELS[habit.priority]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pl-4">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">Rate</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="gap-1"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleArchive}
              className="gap-1"
            >
              {habit.archived ? (
                <>
                  <ArchiveRestore className="h-3 w-3" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="h-3 w-3" />
                  Archive
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
                  onDelete(habit.id);
                }
              }}
              className="gap-1 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {showEdit && (
        <EditHabitDialog
          habit={habit}
          open={showEdit}
          onOpenChange={setShowEdit}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}
