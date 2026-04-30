'use client';

import { useState } from 'react';
import { PlannedTask, Habit, PRIORITY_COLORS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EditTaskDialog } from './edit-task-dialog';
import { Trash2, Repeat, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: PlannedTask[];
  habits: Habit[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string, mode?: 'day-only' | 'all-future') => void;
  onEditTask: (taskId: string, updates: Partial<PlannedTask>, mode?: 'day-only' | 'all-future') => void;
  groupByHabit?: boolean;
  readOnly?: boolean;
  allowDelete?: boolean;
}

export function TaskList({
  tasks,
  habits,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  groupByHabit = true,
  readOnly = false,
  allowDelete = true,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks planned yet</div>;
  }

  const renderTask = (task: PlannedTask) => (
    <TaskItem
      key={task.id}
      task={task}
      habits={habits}
      onToggle={onToggleTask}
      onDelete={onDeleteTask}
      onEdit={onEditTask}
      readOnly={readOnly}
      allowDelete={allowDelete}
    />
  );

  if (groupByHabit) {
    const tasksByHabit = new Map<string | undefined, PlannedTask[]>();
    tasks.forEach((t) => {
      const key = t.habitId || 'standalone';
      if (!tasksByHabit.has(key)) tasksByHabit.set(key, []);
      tasksByHabit.get(key)!.push(t);
    });

    return (
      <div className="space-y-6">
        {Array.from(tasksByHabit.entries()).map(([habitKey, habitTasks]) => {
          const habit = habitKey !== 'standalone' ? habits.find((h) => h.id === habitKey) : null;
          const completedCount = habitTasks.filter((t) => t.completed).length;
          const totalCount = habitTasks.length;
          const completionPercentage = Math.round((completedCount / totalCount) * 100);

          return (
            <div key={habitKey} className="space-y-2">
              {habit ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                    <h3 className="font-semibold text-base sm:text-lg">{habit.name}</h3>
                    <Badge variant="outline" className="text-xs">{completedCount}/{totalCount} tasks</Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{completionPercentage}% complete</div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Standalone Tasks</h3>
                  <Badge variant="outline" className="text-xs">{completedCount}/{totalCount} tasks</Badge>
                </div>
              )}

              <div className="space-y-2 ml-7">{habitTasks.map((t) => renderTask(t))}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return <div className="space-y-2">{tasks.map((t) => renderTask(t))}</div>;
}

interface TaskItemProps {
  task: PlannedTask;
  habits: Habit[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string, mode?: 'day-only' | 'all-future') => void;
  onEdit: (taskId: string, updates: Partial<PlannedTask>, mode?: 'day-only' | 'all-future') => void;
  readOnly: boolean;
  allowDelete: boolean;
}

function TaskItem({ task, habits, onToggle, onDelete, onEdit, readOnly, allowDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopoverOpen, setDeletePopoverOpen] = useState(false);
  const [editChoiceOpen, setEditChoiceOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'day-only' | 'all-future'>('day-only');

  const handleDelete = (mode: 'day-only' | 'all-future' = 'day-only') => {
    setIsDeleting(true);
    onDelete(task.id, mode);
    setDeletePopoverOpen(false);
  };

  const openEdit = (mode: 'day-only' | 'all-future' = 'day-only') => {
    setEditMode(mode);
    setEditDialogOpen(true);
    setEditChoiceOpen(false);
  };

  return (
    <Card className={cn('p-3 sm:p-4 transition-all', task.completed && 'opacity-60', isDeleting && 'opacity-30')}>
      <div className="flex items-start gap-2 sm:gap-3">
        <Checkbox checked={task.completed} onCheckedChange={() => onToggle(task.id)} disabled={readOnly} className="mt-1 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
            <div className="flex-1 w-full">
              <p className={cn('font-medium text-sm sm:text-base break-words', task.completed && 'line-through text-muted-foreground')}>
                {task.title}
                {task.recurring && (
                  <Badge variant="outline" className="ml-2 text-xs h-4 px-1">
                    <Repeat className="w-3 h-3 mr-1" />
                    Daily
                  </Badge>
                )}
              </p>
              {task.description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{task.description}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: PRIORITY_COLORS[task.priority] + '20',
                  color: PRIORITY_COLORS[task.priority],
                  borderColor: PRIORITY_COLORS[task.priority],
                }}
                className="text-xs capitalize"
              >
                {task.priority}
              </Badge>

              {allowDelete && (
                <div className="flex items-center gap-2">
                  {task.recurring ? (
                    <Popover open={editChoiceOpen} onOpenChange={setEditChoiceOpen}>
                        <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" title="Edit task">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Edit recurring task</h4>
                          <p className="text-xs text-muted-foreground">Apply changes to only this date or to all future occurrences.</p>
                          <div className="flex flex-col gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit('day-only')}>Edit this date only</Button>
                            <Button size="sm" variant="default" onClick={() => openEdit('all-future')}>Edit all future occurrences</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    ) : (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer" onClick={() => openEdit('day-only')} title="Edit task">
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}

                  <Popover open={deletePopoverOpen} onOpenChange={setDeletePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setDeletePopoverOpen(true)} className="h-8 w-8 p-0 text-destructive cursor-pointer" disabled={isDeleting}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    {task.recurring && (
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Delete this recurring task?</h4>
                            <p className="text-xs text-muted-foreground">This task repeats daily. How would you like to delete it?</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleDelete('day-only')} className="justify-start">Delete for today only</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete('all-future')} className="justify-start">Delete all future occurrences</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditTaskDialog
        task={task}
        habits={habits}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={(id, updates) => onEdit(id, updates, editMode)}
        mode={editMode}
      />
    </Card>
  );
}
