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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit, Priority } from '@/lib/types';
import { generateId, getToday, getNextOrder } from '@/lib/utils-habit';
import { Plus, RefreshCw } from 'lucide-react';
import { storage } from '@/lib/storage';

interface AddHabitDialogProps {
  onAdd: (habit: Habit) => void;
}

const HABIT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RotationOption {
  type: 'none' | 'existing-group' | 'pair-with';
  groupId?: string;
  groupName?: string;
  habitId?: string;
  habitName?: string;
  label: string;
}

export function AddHabitDialog({ onAdd }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [rotationSelection, setRotationSelection] = useState('none');
  const [rotationGroupName, setRotationGroupName] = useState('');

  const getRotationOptions = (): RotationOption[] => {
    const allHabits = storage.getHabits().filter(h => !h.archived);
    const options: RotationOption[] = [
      { type: 'none', label: 'No rotation' },
    ];

    // Collect existing groups
    const groups = new Map<string, { name?: string; members: Habit[] }>();
    allHabits.forEach(h => {
      if (h.rotationGroupId) {
        if (!groups.has(h.rotationGroupId)) {
          groups.set(h.rotationGroupId, { name: h.rotationGroupName, members: [] });
        }
        groups.get(h.rotationGroupId)!.members.push(h);
      }
    });

    // Add existing groups
    groups.forEach((group, groupId) => {
      const memberNames = group.members
        .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0))
        .map(h => h.name)
        .join(' ↔ ');
      const displayName = group.name || memberNames;
      options.push({
        type: 'existing-group',
        groupId,
        groupName: group.name,
        label: `Join: ${displayName}`,
      });
    });

    // Add ungrouped habits for pairing
    const ungroupedHabits = allHabits.filter(h => !h.rotationGroupId);
    ungroupedHabits.forEach(h => {
      options.push({
        type: 'pair-with',
        habitId: h.id,
        habitName: h.name,
        label: `Pair with: ${h.name}`,
      });
    });

    return options;
  };

  const toggleDay = (day: number) => {
    setActiveDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const existingHabits = storage.getHabits();

    // Determine scheduling fields
    const isAllDays = activeDays.length === 7 || activeDays.length === 0;
    const finalActiveDays = isAllDays ? undefined : activeDays;

    // Determine rotation group
    let finalRotationGroupId: string | undefined;
    let finalRotationGroupOrder: number | undefined;
    let finalRotationGroupName: string | undefined;

    if (rotationSelection !== 'none') {
      const options = getRotationOptions();
      const selected = options.find(o => {
        if (o.type === 'existing-group') return `group-${o.groupId}` === rotationSelection;
        if (o.type === 'pair-with') return `pair-${o.habitId}` === rotationSelection;
        return false;
      });

      if (selected?.type === 'existing-group' && selected.groupId) {
        // Join existing group
        finalRotationGroupId = selected.groupId;
        const groupMembers = existingHabits.filter(
          h => h.rotationGroupId === selected.groupId
        );
        finalRotationGroupOrder = groupMembers.length;
        finalRotationGroupName = rotationGroupName.trim() || selected.groupName;

        // Sync activeDays with existing group members
        const existingMember = groupMembers[0];
        if (existingMember?.activeDays) {
          // Use the group's existing schedule if user hasn't customized
        }
      } else if (selected?.type === 'pair-with' && selected.habitId) {
        // Create new group by pairing with an existing habit
        finalRotationGroupId = generateId();
        finalRotationGroupOrder = 1;
        finalRotationGroupName = rotationGroupName.trim() || undefined;

        // Update the paired habit to join this group
        storage.updateHabit(selected.habitId, {
          rotationGroupId: finalRotationGroupId,
          rotationGroupOrder: 0,
          rotationGroupName: finalRotationGroupName,
          activeDays: finalActiveDays,
        });
      }
    }

    const habit: Habit = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      priority,
      color,
      createdAt: getToday(),
      archived: false,
      order: getNextOrder(existingHabits),
      activeDays: finalActiveDays,
      rotationGroupId: finalRotationGroupId,
      rotationGroupOrder: finalRotationGroupOrder,
      rotationGroupName: finalRotationGroupName,
    };

    onAdd(habit);
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority('medium');
    setColor(HABIT_COLORS[0]);
    setActiveDays([0, 1, 2, 3, 4, 5, 6]);
    setRotationSelection('none');
    setRotationGroupName('');
  };

  const rotationOptions = open ? getRotationOptions() : [];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
            <DialogDescription>
              Create a new habit to track. Set priority to calculate your daily score.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Exercise"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this habit"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (1 point)</SelectItem>
                  <SelectItem value="medium">Medium (2 points)</SelectItem>
                  <SelectItem value="high">High (3 points)</SelectItem>
                  <SelectItem value="critical">Critical (5 points)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: c === color ? '#ffffff' : 'transparent',
                      transform: c === color ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Active Days Picker */}
            <div className="grid gap-2">
              <Label>Active Days</Label>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((label, index) => {
                  const isActive = activeDays.includes(index);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`w-10 h-8 rounded text-xs font-medium transition-all border ${
                        isActive
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeDays.length === 7 || activeDays.length === 0
                  ? 'Shows every day'
                  : `Shows on ${activeDays.map(d => DAY_LABELS[d]).join(', ')}`}
              </p>
            </div>

            {/* Rotation Group */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <Label>Rotation Group</Label>
              </div>
              <Select value={rotationSelection} onValueChange={setRotationSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="No rotation" />
                </SelectTrigger>
                <SelectContent>
                  {rotationOptions.map((opt) => {
                    const value = opt.type === 'none'
                      ? 'none'
                      : opt.type === 'existing-group'
                        ? `group-${opt.groupId}`
                        : `pair-${opt.habitId}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {opt.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {rotationSelection !== 'none' && (
                <div className="grid gap-2 mt-1">
                  <Input
                    value={rotationGroupName}
                    onChange={(e) => setRotationGroupName(e.target.value)}
                    placeholder="Group name (optional)"
                    className="text-sm"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Rotation groups alternate habits so only one from the group shows per day
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || (activeDays.length === 0)}>
              Add Habit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
