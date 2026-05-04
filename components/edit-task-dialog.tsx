'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Habit, PlannedTask, Priority } from '@/lib/types';

interface EditTaskDialogProps {
  task: PlannedTask | null;
  habits: Habit[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<PlannedTask>, mode?: 'day-only' | 'all-future') => void;
  mode?: 'day-only' | 'all-future';
}

export function EditTaskDialog({ task, habits, open, onOpenChange, onSave, mode = 'day-only' }: EditTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [habitId, setHabitId] = useState<string>('none');
  const [recurring, setRecurring] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setHabitId(task.habitId ?? 'none');
      // If editing only this date and the original task is recurring,
      // we want to replace the recurring instance for this day only,
      // so disable and clear the recurring checkbox in the dialog.
      if (mode === 'day-only' && task.recurring) {
        setRecurring(false);
      } else {
        setRecurring(!!task.recurring);
      }
      setPriority(task.priority);
    }
  }, [task, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    const updates: Partial<PlannedTask> = {
      title: title.trim(),
      description: description.trim() || undefined,
      habitId: habitId !== 'none' ? habitId : undefined,
      // If editing only this date and the original task was recurring,
      // ensure this instance becomes non-recurring (an exception for that day).
      recurring: mode === 'day-only' && task?.recurring ? false : recurring,
      priority,
    };

    onSave(task.id, updates, mode);
    onOpenChange(false);
  };

  const activeHabits = habits.filter(h => !h.archived).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details. For recurring tasks choose whether to apply changes to this date only or to all future occurrences.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="habit">Link to Habit (Optional)</Label>
              <Select value={habitId} onValueChange={setHabitId}>
                <SelectTrigger id="habit"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No habit (standalone task)</SelectItem>
                  {activeHabits.map(h => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="recurring" checked={recurring} onCheckedChange={(c) => setRecurring(c as boolean)} />
              <div className="grid gap-0.5">
                <Label htmlFor="recurring" className="cursor-pointer">Recurring Task</Label>
                <p className="text-xs text-muted-foreground">Automatically add this task to the next day when completed</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}