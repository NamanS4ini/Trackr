'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { FileText, Save, X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { format } from 'date-fns';

interface DayNoteCardProps {
  date: Date;
}

export function DayNoteCard({ date }: DayNoteCardProps) {
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const isPastDay = dateStr < today;

  useEffect(() => {
    setMounted(true);
    const dayNote = storage.getDayNote(dateStr);
    if (dayNote) {
      setNote(dayNote.note);
    } else {
      setNote('');
    }
  }, [dateStr]);

  if (!mounted) return null;

  const handleSave = () => {
    if (note.trim()) {
      storage.saveDayNote(dateStr, note.trim());
    } else {
      storage.deleteDayNote(dateStr);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    const dayNote = storage.getDayNote(dateStr);
    setNote(dayNote?.note || '');
    setIsEditing(false);
  };

  return (
    <Card className="border-zinc-800 bg-blue-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          Daily Note - {format(date, 'EEEE, MMMM d')}
          {isPastDay && note && (
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              Read-only (past day)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing && !isPastDay ? (
          <div className="space-y-2">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about your day..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        ) : note ? (
          <div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">
              {note}
            </p>
            {!isPastDay && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit Note
              </Button>
            )}
          </div>
        ) : (
          !isPastDay && (
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Add Daily Note
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
