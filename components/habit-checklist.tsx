'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Habit, HabitEntry, PRIORITY_VALUES, PRIORITY_COLORS, PlannedTask } from '@/lib/types';
import { Check, Clock, StickyNote, FileText, Save, X, ListTodo, ArrowUpDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { storage } from '@/lib/storage';
import { getActiveHabitsForDate } from '@/lib/utils-habit';

interface HabitChecklistProps {
  habits: Habit[];
  entries: HabitEntry[];
  date: string;
  onToggle: (habitId: string, date: string, note?: string) => void;
  onUpdateNote: (habitId: string, date: string, note: string) => void;
  onRefresh?: () => void;
}

// ─── Time Status ─────────────────────────────────────────────────────────────

type TimeStatus = 'completed' | 'running' | 'missed' | 'upcoming' | 'no-time';

/** Convert "HH:MM" to total minutes since midnight */
function hhmm(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Current time as minutes since midnight */
function nowMinutes(): number {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes();
}

/** Format "HH:MM" → "h:mm AM/PM" */
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/** Format a time range for display */
function formatTimeRange(start?: string, end?: string): string {
  if (!start) return '';
  if (!end) return formatTime(start);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/**
 * Determine the time status of a task given the current date and time.
 * - Today: compare vs. live clock
 * - Past days: missed if not completed (completed handled separately)
 * - Future days: upcoming (time hasn't arrived yet)
 */
function getTaskTimeStatus(
  task: PlannedTask,
  date: string,
  isCompleted: boolean,
): TimeStatus {
  if (isCompleted) return 'completed';
  if (!task.scheduledStart) return 'no-time';

  const today = format(new Date(), 'yyyy-MM-dd');

  if (date < today) {
    // Past day — if not completed and had a time, it's missed
    return 'missed';
  }

  if (date > today) {
    // Future day — always upcoming
    return 'upcoming';
  }

  // Today — compare vs current time
  const now = nowMinutes();
  const start = hhmm(task.scheduledStart);
  const end = task.scheduledEnd ? hhmm(task.scheduledEnd) : start + 60;

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'running';
  return 'missed';
}

/**
 * Derive the overall status for a habit from its tasks (worst status wins).
 * Priority order: running > missed > upcoming > no-time > completed
 */
function getHabitTimeStatus(tasks: PlannedTask[], isHabitCompleted: boolean, date: string): TimeStatus {
  if (isHabitCompleted) return 'completed';
  if (tasks.length === 0) return 'no-time';

  const statuses = tasks.map(t => getTaskTimeStatus(t, date, t.completed));

  if (statuses.includes('running')) return 'running';
  if (statuses.includes('missed')) return 'missed';
  if (statuses.includes('upcoming')) return 'upcoming';
  if (statuses.every(s => s === 'completed')) return 'completed';
  return 'no-time';
}

/** Sort order weight for time-based sorting */
function statusSortWeight(status: TimeStatus): number {
  switch (status) {
    case 'running': return 0;
    case 'upcoming': return 1;
    case 'missed': return 2;
    case 'no-time': return 3;
    case 'completed': return 4;
  }
}

/** Get the earliest scheduledStart across tasks for sorting within a group */
function earliestStart(tasks: PlannedTask[]): string {
  const starts = tasks
    .filter(t => t.scheduledStart)
    .map(t => t.scheduledStart as string)
    .sort();
  return starts[0] ?? '99:99';
}

// ─── Visual styles per status ─────────────────────────────────────────────────

const STATUS_BORDER: Record<TimeStatus, string> = {
  running: 'border-l-4 border-l-blue-500',
  missed: 'border-l-4 border-l-red-500',
  upcoming: 'border-l-4 border-l-green-500',
  completed: 'border-l-4 border-l-zinc-700',
  'no-time': '',
};

const STATUS_TASK_BORDER: Record<TimeStatus, string> = {
  running: 'border-l-2 border-l-blue-500 bg-blue-950/20',
  missed: 'border-l-2 border-l-red-500 bg-red-950/20',
  upcoming: 'border-l-2 border-l-green-500',
  completed: '',
  'no-time': '',
};

const STATUS_BADGE: Record<TimeStatus, { label: string; className: string }> = {
  running: { label: '● Running', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  missed: { label: '✕ Missed', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  upcoming: { label: '◎ Upcoming', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  completed: { label: '', className: '' },
  'no-time': { label: '', className: '' },
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function HabitChecklist({ habits, entries, date, onToggle, onUpdateNote, onRefresh }: HabitChecklistProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [dailyNote, setDailyNote] = useState('');
  const [isEditingDailyNote, setIsEditingDailyNote] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [sortByTime, setSortByTime] = useState(false);
  // Tick state to force re-render every minute for live status updates
  const [, setTick] = useState(0);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isPastDay = date < today;

  const loadData = useCallback(() => {
    const dayNote = storage.getDayNote(date);
    if (dayNote) setDailyNote(dayNote.note);
    const tasks = storage.getPlannedTasksForDate(date);
    setPlannedTasks(tasks);
  }, [date]);

  // Initial load
  useState(() => {
    setMounted(true);
    loadData();
  });

  // Refresh every minute for live time-status updates (only needed for today)
  useEffect(() => {
    if (date !== today) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, [date, today]);

  const activeHabits = getActiveHabitsForDate(
    habits.filter((h) => !h.archived),
    date
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  const getEntry = (habitId: string) => {
    return entries.find((e) => e.habitId === habitId && e.date === date);
  };

  const getHabitTasks = (habitId: string): PlannedTask[] => {
    return plannedTasks.filter(t => t.habitId === habitId);
  };

  // ─── Sort logic ───────────────────────────────────────────────────────────

  const getSortedHabits = () => {
    if (!sortByTime) return activeHabits;

    return [...activeHabits].sort((a, b) => {
      const entryA = getEntry(a.id);
      const entryB = getEntry(b.id);
      const tasksA = getHabitTasks(a.id);
      const tasksB = getHabitTasks(b.id);
      const statusA = getHabitTimeStatus(tasksA, entryA?.completed || false, date);
      const statusB = getHabitTimeStatus(tasksB, entryB?.completed || false, date);

      const weightDiff = statusSortWeight(statusA) - statusSortWeight(statusB);
      if (weightDiff !== 0) return weightDiff;

      // Same status group: sort by earliest start time
      const startA = earliestStart(tasksA);
      const startB = earliestStart(tasksB);
      return startA.localeCompare(startB);
    });
  };

  const displayedHabits = getSortedHabits();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const toggleNote = (habitId: string) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
      const entry = getEntry(habitId);
      if (entry?.note) {
        setNotes((prev) => ({ ...prev, [habitId]: entry.note || '' }));
      }
    }
    setExpandedNotes(newExpanded);
  };

  const toggleTasks = (habitId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(habitId)) {
      newExpanded.delete(habitId);
    } else {
      newExpanded.add(habitId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleToggleTask = (taskId: string) => {
    storage.toggleTaskCompletion(taskId);
    const tasks = storage.getPlannedTasksForDate(date);
    setPlannedTasks(tasks);
    if (onRefresh) onRefresh();
  };

  const handleToggle = (habitId: string) => {
    const entry = getEntry(habitId);
    const note = notes[habitId];
    onToggle(habitId, date, note);

    if (!entry?.completed) {
      setNotes((prev) => ({ ...prev, [habitId]: '' }));
      setExpandedNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(habitId);
        return newSet;
      });
    }
  };

  const handleSaveNote = (habitId: string) => {
    const note = notes[habitId] || '';
    onUpdateNote(habitId, date, note);
  };

  const handleSaveDailyNote = () => {
    if (dailyNote.trim()) {
      storage.saveDayNote(date, dailyNote.trim());
    } else {
      storage.deleteDayNote(date);
    }
    setIsEditingDailyNote(false);
  };

  const handleCancelDailyNote = () => {
    const dayNote = storage.getDayNote(date);
    setDailyNote(dayNote?.note || '');
    setIsEditingDailyNote(false);
  };

  const completedCount = activeHabits.filter(h => getEntry(h.id)?.completed).length;
  const totalPoints = activeHabits
    .filter(h => getEntry(h.id)?.completed)
    .reduce((sum, h) => {
      const entry = getEntry(h.id);
      const completionPercentage = entry?.completionPercentage ?? 100;
      return sum + ((PRIORITY_VALUES[h.priority] * completionPercentage) / 100);
    }, 0);

  // Count habits currently running (for the sort button badge)
  const runningCount = activeHabits.filter(h => {
    const tasks = getHabitTasks(h.id);
    const entry = getEntry(h.id);
    return getHabitTimeStatus(tasks, entry?.completed || false, date) === 'running';
  }).length;

  return (
    <div className="space-y-2">
      <Card className="border-zinc-800">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-base sm:text-lg">{format(new Date(date), 'EEEE, MMMM d')}</CardTitle>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort by time toggle */}
              <Button
                variant={sortByTime ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortByTime(s => !s)}
                className="gap-1.5 h-7 text-xs"
                title="Sort by scheduled time"
              >
                <ArrowUpDown className="h-3 w-3" />
                Sort by time
                {sortByTime && runningCount > 0 && (
                  <span className="ml-0.5 bg-blue-500 text-white rounded-full px-1.5 py-0 text-[10px] leading-4">
                    {runningCount}
                  </span>
                )}
              </Button>

              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-blue-400">{completedCount}/{activeHabits.length}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-purple-400">{totalPoints.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Pts</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Daily Note</span>
              {isPastDay && dailyNote && (
                <span className="text-xs text-muted-foreground ml-auto">
                  Read-only
                </span>
              )}
            </div>
            {mounted && (
              <>
                {isEditingDailyNote && !isPastDay ? (
                  <div className="space-y-2">
                    <Textarea
                      value={dailyNote}
                      onChange={(e) => setDailyNote(e.target.value)}
                      placeholder="Add a note about your day..."
                      className="min-h-25 resize-none text-sm bg-zinc-900 border-zinc-800"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDailyNote} className="gap-2 h-7">
                        <Save className="h-3.5 w-3.5" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelDailyNote} className="gap-2 h-7">
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : dailyNote ? (
                  <div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3 bg-zinc-900 border border-zinc-800 rounded-md p-3">
                      {dailyNote}
                    </p>
                    {!isPastDay && (
                      <Button size="sm" variant="outline" onClick={() => setIsEditingDailyNote(true)} className="h-7">
                        Edit Note
                      </Button>
                    )}
                  </div>
                ) : (
                  !isPastDay && (
                    <Button size="sm" variant="outline" onClick={() => setIsEditingDailyNote(true)} className="gap-2 h-7">
                      <FileText className="h-3.5 w-3.5" />
                      Add Daily Note
                    </Button>
                  )
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {activeHabits.length === 0 ? (
        <Card className="border-zinc-800">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground text-sm">
              No habits to track. Add your first habit to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-1.5">
          {displayedHabits.map((habit) => {
            const entry = getEntry(habit.id);
            const isCompleted = entry?.completed || false;
            const showNote = expandedNotes.has(habit.id);
            const showTasks = expandedTasks.has(habit.id);
            const completedAt = entry?.completedAt;
            const hasNote = entry?.note && entry.note.length > 0;
            const habitTasks = getHabitTasks(habit.id);
            const hasTasks = habitTasks.length > 0;
            const completionPercentage = entry?.completionPercentage ?? 100;
            const completedTasksCount = habitTasks.filter(t => t.completed).length;

            const habitStatus = getHabitTimeStatus(habitTasks, isCompleted, date);
            const borderClass = STATUS_BORDER[habitStatus];
            const statusBadge = STATUS_BADGE[habitStatus];

            return (
              <Card
                key={habit.id}
                className={`border-zinc-800 transition-all overflow-hidden ${borderClass} ${isCompleted ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'
                  } ${!hasTasks || hasTasks ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!hasTasks) {
                    handleToggle(habit.id);
                  } else {
                    toggleTasks(habit.id);
                  }
                }}
              >
                <CardContent className="p-2 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => !hasTasks && handleToggle(habit.id)}
                      disabled={hasTasks}
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${hasTasks
                          ? 'border-zinc-700 cursor-not-allowed opacity-50'
                          : isCompleted
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                      style={{
                        backgroundColor: isCompleted && !hasTasks ? habit.color : 'transparent',
                        borderColor: isCompleted && !hasTasks ? habit.color : undefined,
                      }}
                      title={hasTasks ? 'Complete all tasks to mark habit as complete' : ''}
                    >
                      {isCompleted && <Check className="h-3 w-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className={`text-sm font-medium ${isCompleted ? 'text-zinc-400' : 'text-zinc-100'}`}>
                          {habit.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0 h-4"
                          style={{
                            borderColor: PRIORITY_COLORS[habit.priority],
                            color: PRIORITY_COLORS[habit.priority]
                          }}
                        >
                          {PRIORITY_VALUES[habit.priority]}
                        </Badge>
                        {hasTasks && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                            {completedTasksCount}/{habitTasks.length} tasks • {completionPercentage}%
                          </Badge>
                        )}
                        {/* Time status badge */}
                        {statusBadge.label && (
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 h-4 ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </Badge>
                        )}
                        {isCompleted && completedAt && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(completedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      )}
                    </div>

                    {hasTasks && (
                      <Button
                        variant={showTasks ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTasks(habit.id);
                        }}
                        className="shrink-0 h-6 w-6 p-0"
                      >
                        <ListTodo className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      variant={hasNote || showNote ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNote(habit.id);
                      }}
                      className="shrink-0 h-6 w-6 p-0"
                    >
                      <StickyNote className="h-3 w-3" />
                    </Button>
                  </div>

                  {showTasks && hasTasks && (
                    <div className="mt-2 pl-7 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      {habitTasks.map(task => {
                        const taskStatus = getTaskTimeStatus(task, date, task.completed);
                        const taskBorderClass = STATUS_TASK_BORDER[taskStatus];
                        const timeRange = formatTimeRange(task.scheduledStart, task.scheduledEnd);

                        return (
                          <div
                            key={task.id}
                            className={`flex items-start gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded ${taskBorderClass} ${!isPastDay ? 'cursor-pointer hover:bg-zinc-800/50' : ''} transition-colors`}
                            onClick={() => !isPastDay && handleToggleTask(task.id)}
                          >
                            <Checkbox
                              checked={task.completed}
                              onCheckedChange={() => !isPastDay && handleToggleTask(task.id)}
                              disabled={isPastDay}
                              className="mt-0.5 pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {task.description}
                                </p>
                              )}
                              {timeRange && (
                                <span className={`inline-flex items-center gap-1 text-xs mt-1 ${taskStatus === 'running'
                                  ? 'text-blue-400'
                                  : taskStatus === 'missed'
                                    ? 'text-red-400'
                                    : taskStatus === 'upcoming'
                                      ? 'text-green-400'
                                      : 'text-muted-foreground'
                                  }`}>
                                  <Clock className="h-3 w-3" />
                                  {timeRange}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {showNote && (
                    <div className="mt-1.5 pl-7 space-y-2" onClick={(e) => e.stopPropagation()}>
                      {isPastDay ? (
                        <div className="text-sm text-muted-foreground bg-zinc-900 border border-zinc-800 rounded-md p-2 whitespace-pre-wrap">
                          {entry?.note || 'No note added'}
                        </div>
                      ) : (
                        <>
                          <Textarea
                            placeholder="Add a note..."
                            value={notes[habit.id] || entry?.note || ''}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [habit.id]: e.target.value }))
                            }
                            rows={2}
                            className="text-sm bg-zinc-900 border-zinc-800 min-h-14"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveNote(habit.id)}
                            className="h-7"
                          >
                            Save Note
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
