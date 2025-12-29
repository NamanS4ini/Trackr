'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit, Priority, PlannedTask } from '@/lib/types';
import { generateId } from '@/lib/utils-habit';
import { Plus } from 'lucide-react';

interface AddTaskDialogProps {
  date: string;
  habits: Habit[];
  existingTasks: PlannedTask[];
  onAddTask: (task: PlannedTask) => void;
  children?: React.ReactNode;
}

export function AddTaskDialog({ date, habits, existingTasks, onAddTask, children }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitId, setHabitId] = useState<string>('none');
  const [recurring, setRecurring] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const maxOrder = existingTasks.length > 0 
      ? Math.max(...existingTasks.map(t => t.order)) 
      : -1;

    const newTask: PlannedTask = {
      id: generateId(),
      habitId: habitId !== 'none' ? habitId : undefined,
      date,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
      order: maxOrder + 1,
      recurring,
    };

    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setDescription('');
    setHabitId('none');
    setPriority('medium');
    setRecurring(false);
    setOpen(false);
  };

  const activeHabits = habits.filter(h => !h.archived).sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a task for your daily plan. Optionally link it to a habit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you need to do?"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="habit">Link to Habit (Optional)</Label>
              <Select value={habitId} onValueChange={setHabitId}>
                <SelectTrigger id="habit">
                  <SelectValue placeholder="No habit (standalone task)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No habit (standalone task)</SelectItem>
                  {activeHabits.map((habit) => (
                    <SelectItem key={habit.id} value={habit.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        {habit.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Linked tasks count towards habit completion
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={recurring}
                onCheckedChange={(checked) => setRecurring(checked as boolean)}
              />
              <div className="grid gap-0.5">
                <Label htmlFor="recurring" className="cursor-pointer">
                  Recurring Task
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically add this task to the next day when completed
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
