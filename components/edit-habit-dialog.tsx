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
import { generateId } from '@/lib/utils-habit';
import { RefreshCw } from 'lucide-react';
import { storage } from '@/lib/storage';

interface EditHabitDialogProps {
  habit: Habit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
}

const HABIT_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#6366f1',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RotationOption {
  type: 'none' | 'leave' | 'existing-group' | 'pair-with';
  groupId?: string;
  groupName?: string;
  habitId?: string;
  label: string;
}

export function EditHabitDialog({ habit, open, onOpenChange, onUpdate }: EditHabitDialogProps) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description);
  const [priority, setPriority] = useState<Priority>(habit.priority);
  const [color, setColor] = useState(habit.color);
  const [activeDays, setActiveDays] = useState<number[]>(
    habit.activeDays && habit.activeDays.length > 0 ? habit.activeDays : [0, 1, 2, 3, 4, 5, 6]
  );
  const [rotationSelection, setRotationSelection] = useState<string>(
    habit.rotationGroupId ? `group-${habit.rotationGroupId}` : 'none'
  );
  const [rotationGroupName, setRotationGroupName] = useState(habit.rotationGroupName || '');

  const getRotationOptions = (): RotationOption[] => {
    const allHabits = storage.getHabits().filter(h => !h.archived);
    const options: RotationOption[] = [
      { type: 'none', label: 'No rotation' },
    ];

    // If habit is currently in a group, add "leave" option
    if (habit.rotationGroupId) {
      options.push({
        type: 'leave',
        label: 'Leave current group',
      });
    }

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

    // Add existing groups (excluding current habit's group if it's the only member)
    groups.forEach((group, groupId) => {
      // Skip the habit's own group if it's the only member
      if (groupId === habit.rotationGroupId && group.members.length <= 1) return;

      const memberNames = group.members
        .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0))
        .filter(h => h.id !== habit.id) // exclude self from display
        .map(h => h.name)
        .join(' ↔ ');
      const displayName = group.name || memberNames;

      if (groupId === habit.rotationGroupId) {
        options.push({
          type: 'existing-group',
          groupId,
          groupName: group.name,
          label: `Current: ${displayName}`,
        });
      } else {
        options.push({
          type: 'existing-group',
          groupId,
          groupName: group.name,
          label: `Join: ${displayName}`,
        });
      }
    });

    // Add ungrouped habits for pairing (exclude self)
    const ungroupedHabits = allHabits.filter(h => !h.rotationGroupId && h.id !== habit.id);
    ungroupedHabits.forEach(h => {
      options.push({
        type: 'pair-with',
        habitId: h.id,
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

    const isAllDays = activeDays.length === 7 || activeDays.length === 0;
    const finalActiveDays = isAllDays ? undefined : activeDays;

    // Determine rotation group
    let finalRotationGroupId: string | undefined = habit.rotationGroupId;
    let finalRotationGroupOrder: number | undefined = habit.rotationGroupOrder;
    let finalRotationGroupName: string | undefined = habit.rotationGroupName;

    const allHabits = storage.getHabits();

    if (rotationSelection === 'none' || rotationSelection === 'leave') {
      // Remove from group
      if (habit.rotationGroupId) {
        // Clean up: if leaving a group, update remaining members' order
        const oldGroupMembers = allHabits.filter(
          h => h.rotationGroupId === habit.rotationGroupId && h.id !== habit.id
        );
        oldGroupMembers
          .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0))
          .forEach((member, idx) => {
            storage.updateHabit(member.id, { rotationGroupOrder: idx });
          });
        // If only one member remains, remove their group too
        if (oldGroupMembers.length === 1) {
          storage.updateHabit(oldGroupMembers[0].id, {
            rotationGroupId: undefined,
            rotationGroupOrder: undefined,
            rotationGroupName: undefined,
          });
        }
      }
      finalRotationGroupId = undefined;
      finalRotationGroupOrder = undefined;
      finalRotationGroupName = undefined;
    } else {
      const options = getRotationOptions();
      const selected = options.find(o => {
        if (o.type === 'existing-group') return `group-${o.groupId}` === rotationSelection;
        if (o.type === 'pair-with') return `pair-${o.habitId}` === rotationSelection;
        return false;
      });

      if (selected?.type === 'existing-group' && selected.groupId) {
        if (selected.groupId !== habit.rotationGroupId) {
          // Leaving old group if any
          if (habit.rotationGroupId) {
            const oldGroupMembers = allHabits.filter(
              h => h.rotationGroupId === habit.rotationGroupId && h.id !== habit.id
            );
            oldGroupMembers
              .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0))
              .forEach((member, idx) => {
                storage.updateHabit(member.id, { rotationGroupOrder: idx });
              });
            if (oldGroupMembers.length === 1) {
              storage.updateHabit(oldGroupMembers[0].id, {
                rotationGroupId: undefined,
                rotationGroupOrder: undefined,
                rotationGroupName: undefined,
              });
            }
          }
          // Joining new group
          const newGroupMembers = allHabits.filter(h => h.rotationGroupId === selected.groupId);
          finalRotationGroupId = selected.groupId;
          finalRotationGroupOrder = newGroupMembers.length;
          finalRotationGroupName = rotationGroupName.trim() || selected.groupName;
        } else {
          // Staying in current group, maybe updating name
          finalRotationGroupName = rotationGroupName.trim() || selected.groupName;
        }

        // Sync activeDays to all group members
        const groupMembers = allHabits.filter(
          h => h.rotationGroupId === finalRotationGroupId && h.id !== habit.id
        );
        groupMembers.forEach(member => {
          storage.updateHabit(member.id, {
            activeDays: finalActiveDays,
            rotationGroupName: finalRotationGroupName,
          });
        });
      } else if (selected?.type === 'pair-with' && selected.habitId) {
        // Leave old group if any
        if (habit.rotationGroupId) {
          const oldGroupMembers = allHabits.filter(
            h => h.rotationGroupId === habit.rotationGroupId && h.id !== habit.id
          );
          oldGroupMembers
            .sort((a, b) => (a.rotationGroupOrder ?? 0) - (b.rotationGroupOrder ?? 0))
            .forEach((member, idx) => {
              storage.updateHabit(member.id, { rotationGroupOrder: idx });
            });
          if (oldGroupMembers.length === 1) {
            storage.updateHabit(oldGroupMembers[0].id, {
              rotationGroupId: undefined,
              rotationGroupOrder: undefined,
              rotationGroupName: undefined,
            });
          }
        }

        // Create new group
        finalRotationGroupId = generateId();
        finalRotationGroupOrder = 1;
        finalRotationGroupName = rotationGroupName.trim() || undefined;

        // Update the paired habit
        storage.updateHabit(selected.habitId, {
          rotationGroupId: finalRotationGroupId,
          rotationGroupOrder: 0,
          rotationGroupName: finalRotationGroupName,
          activeDays: finalActiveDays,
        });
      }
    }

    onUpdate(habit.id, {
      name: name.trim(),
      description: description.trim(),
      priority,
      color,
      activeDays: finalActiveDays,
      rotationGroupId: finalRotationGroupId,
      rotationGroupOrder: finalRotationGroupOrder,
      rotationGroupName: finalRotationGroupName,
    });

    onOpenChange(false);
  };

  const rotationOptions = open ? getRotationOptions() : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update habit details and scheduling settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger id="edit-priority">
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
              {habit.rotationGroupId && rotationSelection !== 'none' && rotationSelection !== 'leave' && (
                <p className="text-xs text-yellow-400">
                  Changing schedule updates all habits in this rotation group
                </p>
              )}
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
                      : opt.type === 'leave'
                        ? 'leave'
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
              {rotationSelection !== 'none' && rotationSelection !== 'leave' && (
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
            <Button type="submit" disabled={activeDays.length === 0}>Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
