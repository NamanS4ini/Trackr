'use client';

import { useHabits } from '@/components/habit-provider';
import { PlannerView } from '@/components/planner-view';
import { storage } from '@/lib/storage';
import { getToday } from '@/lib/utils-habit';
import { PlannedTask } from '@/lib/types';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';

export default function PlanPage() {
  const { habits, mounted } = useHabits();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [tasks, setTasks] = useState<PlannedTask[]>([]);

  const loadTasks = (date: string) => {
    const dateTasks = storage.getPlannedTasksForDate(date);
    setTasks(dateTasks);
  };

  useEffect(() => {
    if (mounted) {
      loadTasks(selectedDate);
    }
  }, [mounted, selectedDate]);

  const handleAddTask = (task: PlannedTask) => {
    storage.addPlannedTask(task);
    loadTasks(selectedDate);
  };

  const handleToggleTask = (taskId: string) => {
    storage.toggleTaskCompletion(taskId);
    loadTasks(selectedDate);
  };

  const handleDeleteTask = (taskId: string, mode: 'day-only' | 'all-future' = 'day-only') => {
    storage.deletePlannedTask(taskId, mode);
    loadTasks(selectedDate);
  };

  const handleEditTask = (taskId: string, updates: Partial<PlannedTask>, mode: 'day-only' | 'all-future' = 'day-only') => {
    storage.updatePlannedTask(taskId, updates, mode);
    loadTasks(selectedDate);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading planner...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Daily Planner</h2>
          <p className="text-muted-foreground">
            Plan your tasks and link them to habits. Complete all tasks for a habit to receive full points.
          </p>
        </div>

        <PlannerView
          initialDate={selectedDate}
          habits={habits}
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          onDateChange={handleDateChange}
        />
      </div>
    </AppLayout>
  );
}
