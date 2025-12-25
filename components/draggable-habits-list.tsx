'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitStats, PRIORITY_COLORS, PRIORITY_VALUES } from '@/lib/types';
import { Pencil, Trash2, Archive, ArchiveRestore, GripVertical } from 'lucide-react';
import { EditHabitDialog } from './edit-habit-dialog';

interface DraggableHabitsListProps {
  habits: Habit[];
  stats: Record<string, HabitStats>;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onReorder: (habitIds: string[]) => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

interface SortableHabitProps {
  habit: Habit;
  stats: HabitStats;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

function SortableHabit({ habit, stats, onUpdate, onDelete }: SortableHabitProps) {
  const [showEdit, setShowEdit] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleArchive = () => {
    onUpdate(habit.id, { archived: !habit.archived });
  };

  return (
    <>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className="relative overflow-hidden border-zinc-800 hover:bg-zinc-900/30 transition-colors"
      >
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: habit.color }}
        />
        <CardContent className="p-2 pl-3">
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
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

            <div className="flex items-center gap-4 ml-2">
              <div className="text-center">
                <div className="text-xl font-bold">{stats.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Current</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{stats.longestStreak}</div>
                <div className="text-xs text-muted-foreground">Best</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{stats.totalCompletions}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{stats.completionRate}%</div>
                <div className="text-xs text-muted-foreground">Rate</div>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEdit(true)}
                className="h-7 w-7 p-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleArchive}
                className="h-7 w-7 p-0"
              >
                {habit.archived ? (
                  <ArchiveRestore className="h-3.5 w-3.5" />
                ) : (
                  <Archive className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this habit? This cannot be undone.')) {
                    onDelete(habit.id);
                  }
                }}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
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

export function DraggableHabitsList({
  habits,
  stats,
  onUpdate,
  onDelete,
  onReorder,
}: DraggableHabitsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedHabits = [...habits].sort((a, b) => (a.order || 0) - (b.order || 0));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedHabits.findIndex((h) => h.id === active.id);
      const newIndex = sortedHabits.findIndex((h) => h.id === over.id);

      const newOrder = arrayMove(sortedHabits, oldIndex, newIndex);
      onReorder(newOrder.map((h) => h.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedHabits.map((h) => h.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-2">
          {sortedHabits.map((habit) => (
            <SortableHabit
              key={habit.id}
              habit={habit}
              stats={stats[habit.id]}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
