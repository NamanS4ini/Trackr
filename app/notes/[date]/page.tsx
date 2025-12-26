'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/app-layout';
import { storage } from '@/lib/storage';
import { Habit, HabitEntry, DayNote } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { PRIORITY_COLORS, PRIORITY_VALUES } from '@/lib/types';

export default function NoteDatePage() {
  const params = useParams();
  const router = useRouter();
  const date = params.date as string;
  
  const [dayNote, setDayNote] = useState<DayNote | undefined>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDayNote(storage.getDayNote(date));
    setHabits(storage.getHabits());
    setEntries(storage.getEntriesForDate(date));
  }, [date]);

  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const parsedDate = parseISO(date);
  const entriesWithNotes = entries.filter(e => e.note && e.note.trim());
  const completedCount = entries.filter(e => e.completed).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notes
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-lg bg-blue-500/20 border-2 border-blue-500">
              <div className="text-3xl font-bold text-blue-400">
                {format(parsedDate, 'd')}
              </div>
              <div className="text-xs text-blue-400">
                {format(parsedDate, 'MMM')}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {format(parsedDate, 'EEEE, MMMM d, yyyy')}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {completedCount} completed
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {entriesWithNotes.length} with notes
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Day Note */}
        {dayNote && (
          <Card className="border-zinc-800 bg-blue-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Daily Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {dayNote.note}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Habit Notes */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Habit Notes
          </h2>

          {entriesWithNotes.length === 0 ? (
            <Card className="border-zinc-800">
              <CardContent className="p-8 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No habit notes for this day</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {entriesWithNotes.map(entry => {
                const habit = habits.find(h => h.id === entry.habitId);
                if (!habit) return null;

                return (
                  <Card key={entry.habitId} className="border-zinc-800 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 w-1 h-full"
                      style={{ backgroundColor: habit.color }}
                    />
                    <CardContent className="p-4 pl-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{habit.name}</h3>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5"
                            style={{ 
                              borderColor: PRIORITY_COLORS[habit.priority],
                              color: PRIORITY_COLORS[habit.priority]
                            }}
                          >
                            {PRIORITY_VALUES[habit.priority]}
                          </Badge>
                        </div>
                        {entry.completed && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {entry.note}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
