'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/components/app-layout';
import { storage } from '@/lib/storage';
import { DayNote } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Calendar, FileText, ChevronRight } from 'lucide-react';

export default function NotesPage() {
  const [dayNotes, setDayNotes] = useState<DayNote[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDayNotes(storage.getDayNotes().sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  if (!mounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold">Daily Notes</h1>
          <Badge variant="outline" className="ml-2">
            {dayNotes.length} {dayNotes.length === 1 ? 'note' : 'notes'}
          </Badge>
        </div>

        {dayNotes.length === 0 ? (
          <Card className="border-zinc-800">
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">
                Add daily notes from the Track page to see them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {dayNotes.map((note, index) => {
              const date = parseISO(note.date);
              const isToday = note.date === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <motion.div
                  key={note.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/notes/${note.date}`}>
                    <Card className="border-zinc-800 hover:bg-zinc-900/50 transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg ${
                              isToday 
                                ? 'bg-blue-500/20 border-2 border-blue-500' 
                                : 'bg-zinc-800 border border-zinc-700'
                            }`}>
                              <div className={`text-2xl font-bold ${isToday ? 'text-blue-400' : 'text-foreground'}`}>
                                {format(date, 'd')}
                              </div>
                              <div className={`text-xs ${isToday ? 'text-blue-400' : 'text-muted-foreground'}`}>
                                {format(date, 'MMM')}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold">
                                {format(date, 'EEEE, MMMM d, yyyy')}
                              </h3>
                              {isToday && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                                  Today
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {note.note}
                            </p>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
