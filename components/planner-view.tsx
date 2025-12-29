'use client';

import { useState } from 'react';
import { format, parseISO, addDays, subDays, isFuture, isPast } from 'date-fns';
import { Habit, PlannedTask } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { TaskList } from '@/components/task-list';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils-habit';

interface PlannerViewProps {
  initialDate: string;
  habits: Habit[];
  tasks: PlannedTask[];
  onAddTask: (task: PlannedTask) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDateChange: (date: string) => void;
}

export function PlannerView({
  initialDate,
  habits,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onDateChange,
}: PlannerViewProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handlePrevDay = () => {
    const newDate = formatDate(subDays(parseISO(selectedDate), 1));
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = formatDate(addDays(parseISO(selectedDate), 1));
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleToday = () => {
    const today = formatDate(new Date());
    setSelectedDate(today);
    onDateChange(today);
  };

  const handleTomorrow = () => {
    const tomorrow = formatDate(addDays(new Date(), 1));
    setSelectedDate(tomorrow);
    onDateChange(tomorrow);
  };

  const dateObj = parseISO(selectedDate);
  const isDateInPast = isPast(dateObj) && formatDate(dateObj) !== formatDate(new Date());
  const isToday = formatDate(dateObj) === formatDate(new Date());
  const isDateInFuture = !isToday && (isFuture(dateObj) || formatDate(dateObj) > formatDate(new Date()));
  const isTomorrow = formatDate(dateObj) === formatDate(addDays(new Date(), 1));

  const dateFormatted = format(dateObj, 'EEEE, MMMM d, yyyy');

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const tasksLinkedToHabits = tasks.filter(t => t.habitId).length;
  const standaloneTasksCount = tasks.filter(t => !t.habitId).length;

  // Calculate estimated score
  const estimatedScore = tasks
    .filter(t => t.habitId)
    .reduce((score, task) => {
      const habit = habits.find(h => h.id === task.habitId);
      if (!habit) return score;
      
      // Calculate what percentage this task contributes to the habit
      const habitTasks = tasks.filter(t => t.habitId === task.habitId);
      const taskWeight = 1 / habitTasks.length;
      const habitPoints = { low: 1, medium: 2, high: 3, critical: 5 }[habit.priority];
      
      return score + (habitPoints * taskWeight);
    }, 0);

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center min-w-[300px]">
              <div className="flex items-center justify-center gap-2">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">{dateFormatted}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isToday && 'Today'}
                {isTomorrow && 'Tomorrow'}
                {!isToday && !isTomorrow && isDateInPast && 'Past Date (Read Only)'}
                {!isToday && !isTomorrow && isDateInFuture && 'Future Date (Planning Only)'}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" onClick={handleTomorrow}>
              Tomorrow
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold">{completedTasks}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold">{tasksLinkedToHabits}</div>
            <div className="text-xs text-muted-foreground">Habit Tasks</div>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="text-2xl font-bold">{estimatedScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">Est. Points</div>
          </div>
        </div>

        {/* Add Task Button */}
        {!isDateInPast && (
          <div className="mt-4">
            <AddTaskDialog
              date={selectedDate}
              habits={habits}
              existingTasks={tasks}
              onAddTask={onAddTask}
            />
          </div>
        )}
      </Card>

      {/* Task List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tasks</h3>
        <TaskList
          tasks={tasks}
          habits={habits}
          onToggleTask={onToggleTask}
          onDeleteTask={onDeleteTask}
          groupByHabit={true}
          readOnly={!isToday}
        />
      </Card>

      {/* Standalone Tasks Info */}
      {standaloneTasksCount > 0 && (
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <p className="text-sm text-blue-300">
            <strong>{standaloneTasksCount}</strong> standalone task{standaloneTasksCount !== 1 ? 's' : ''} 
            {' '}(not linked to habits) won't affect your daily score
          </p>
        </Card>
      )}
    </div>
  );
}
