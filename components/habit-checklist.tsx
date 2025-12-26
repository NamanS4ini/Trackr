'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Habit, HabitEntry, PRIORITY_VALUES, PRIORITY_COLORS } from '@/lib/types';
import { Check, Clock, StickyNote, FileText, Save, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { storage } from '@/lib/storage';

interface HabitChecklistProps {
  habits: Habit[];
  entries: HabitEntry[];
  date: string;
  onToggle: (habitId: string, date: string, note?: string) => void;
  onUpdateNote: (habitId: string, date: string, note: string) => void;
}

export function HabitChecklist({ habits, entries, date, onToggle, onUpdateNote }: HabitChecklistProps) {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [dailyNote, setDailyNote] = useState('');
  const [isEditingDailyNote, setIsEditingDailyNote] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const isPastDay = date < today;

  useState(() => {
    setMounted(true);
    const dayNote = storage.getDayNote(date);
    if (dayNote) {
      setDailyNote(dayNote.note);
    }
  });

  const activeHabits = habits
    .filter((h) => !h.archived)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const getEntry = (habitId: string) => {
    return entries.find((e) => e.habitId === habitId && e.date === date);
  };

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
    .reduce((sum, h) => sum + PRIORITY_VALUES[h.priority], 0);

  return (
    <div className="space-y-2">
      <Card className="border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{format(new Date(date), 'EEEE, MMMM d')}</CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">{completedCount}/{activeHabits.length}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-400">{totalPoints}</div>
                <div className="text-xs text-muted-foreground">Pts</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
          {activeHabits.map((habit) => {
            const entry = getEntry(habit.id);
            const isCompleted = entry?.completed || false;
            const showNote = expandedNotes.has(habit.id);
            const completedAt = entry?.completedAt;
            const hasNote = entry?.note && entry.note.length > 0;

            return (
              <Card 
                key={habit.id} 
                className={`border-zinc-800 transition-all ${
                  isCompleted ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/30'
                }`}
              >
                <CardContent className="p-2 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                      style={{
                        backgroundColor: isCompleted ? habit.color : 'transparent',
                        borderColor: isCompleted ? habit.color : undefined,
                      }}
                    >
                      {isCompleted && <Check className="h-3 w-3 text-white" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
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

                    <Button
                      variant={hasNote || showNote ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleNote(habit.id)}
                      className="shrink-0 h-6 w-6 p-0"
                    >
                      <StickyNote className="h-3 w-3" />
                    </Button>
                  </div>

                  {showNote && (
                    <div className="mt-1.5 pl-7 space-y-2">
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
