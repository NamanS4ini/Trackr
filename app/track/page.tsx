'use client';

import { HabitChecklist } from '@/components/habit-checklist';
import { StatsOverview } from '@/components/stats-overview';
import { useHabits } from '@/components/habit-provider';
import { getToday } from '@/lib/utils-habit';
import AppLayout from '@/components/app-layout';

export default function TrackPage() {
  const { habits, entries, toggleEntry, updateEntryNote, refreshData, mounted } = useHabits();

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
        <StatsOverview habits={habits} entries={entries} />
        <HabitChecklist
          habits={habits}
          entries={entries}
          date={getToday()}
          onToggle={toggleEntry}
          onUpdateNote={updateEntryNote}
          onRefresh={refreshData}
        />
      </div>
    </AppLayout>
  );
}
