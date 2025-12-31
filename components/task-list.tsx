'use client';

import { useState } from 'react';
import { PlannedTask, Habit, PRIORITY_COLORS } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: PlannedTask[];
  habits: Habit[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  groupByHabit?: boolean;
  readOnly?: boolean;
  allowDelete?: boolean;
}

export function TaskList({ 
  tasks, 
  habits, 
  onToggleTask, 
  onDeleteTask,
  groupByHabit = true,
  readOnly = false,
  allowDelete = true,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks planned yet
      </div>
    );
  }

  if (groupByHabit) {
    // Group tasks by habit
    const tasksByHabit = new Map<string | undefined, PlannedTask[]>();
    
    tasks.forEach(task => {
      const key = task.habitId || 'standalone';
      if (!tasksByHabit.has(key)) {
        tasksByHabit.set(key, []);
      }
      tasksByHabit.get(key)!.push(task);
    });

    return (
      <div className="space-y-6">
        {Array.from(tasksByHabit.entries()).map(([habitKey, habitTasks]) => {
          const habit = habitKey !== 'standalone' 
            ? habits.find(h => h.id === habitKey)
            : null;

          const completedCount = habitTasks.filter(t => t.completed).length;
          const totalCount = habitTasks.length;
          const completionPercentage = Math.round((completedCount / totalCount) * 100);

          return (
            <div key={habitKey} className="space-y-2">
              {habit ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <h3 className="font-semibold text-base sm:text-lg">{habit.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {completedCount}/{totalCount} tasks
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {completionPercentage}% complete
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Standalone Tasks</h3>
                  <Badge variant="outline" className="text-xs">
                    {completedCount}/{totalCount} tasks
                  </Badge>
                </div>
              )}
              
              <div className="space-y-2 ml-7">
                {habitTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    readOnly={readOnly}
                    allowDelete={allowDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Flat list of tasks
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          readOnly={readOnly}
          allowDelete={allowDelete}
        />
      ))}
    </div>
  );
}

interface TaskItemProps {
  task: PlannedTask;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  readOnly: boolean;
  allowDelete: boolean;
}

function TaskItem({ task, onToggle, onDelete, readOnly, allowDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setIsDeleting(true);
      onDelete(task.id);
    }
  };

  return (
    <Card className={cn(
      "p-3 sm:p-4 transition-all",
      task.completed && "opacity-60",
      isDeleting && "opacity-30"
    )}>
      <div className="flex items-start gap-2 sm:gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          disabled={readOnly}
          className="mt-1 shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
            <div className="flex-1 w-full">
              <p className={cn(
                "font-medium text-sm sm:text-base break-words",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
                {task.recurring && (
                  <Badge variant="outline" className="ml-2 text-xs h-4 px-1">
                    <Repeat className="w-3 h-3 mr-1" />
                    Daily
                  </Badge>
                )}
              </p>
              {task.description && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                  {task.description}
                </p>
              )}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
