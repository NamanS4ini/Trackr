'use client';

import { useHabits } from '@/components/habit-provider';
import { PlannerView } from '@/components/planner-view';
import { storage } from '@/lib/storage';
import { getTomorrow } from '@/lib/utils-habit';
import { PlannedTask } from '@/lib/types';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/app-layout';

export default function PlanPage() {
  const { habits, mounted } = useHabits();
  const [selectedDate, setSelectedDate] = useState(getTomorrow());
  const [tasks, setTasks] = useState<PlannedTask[]>([]);

  useEffect(() => {
    if (mounted) {
      loadTasks(selectedDate);
    }
  }, [mounted, selectedDate]);

  const loadTasks = (date: string) => {
    const dateTasks = storage.getPlannedTasksForDate(date);
    setTasks(dateTasks);
  };

  const handleAddTask = (task: PlannedTask) => {
    storage.addPlannedTask(task);
    loadTasks(selectedDate);
  };

  const handleToggleTask = (taskId: string) => {
    storage.toggleTaskCompletion(taskId);
    loadTasks(selectedDate);
  };

  const handleDeleteTask = (taskId: string) => {
    storage.deletePlannedTask(taskId);
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
          onDateChange={handleDateChange}
        />
      </div>
    </AppLayout>
  );
}
