'use client';

import { StatsOverview } from '@/components/stats-overview';
import { DashboardCharts } from '@/components/dashboard-charts';
import { Heatmap } from '@/components/heatmap';
import { useHabits } from '@/components/habit-provider';
import AppLayout from '@/components/app-layout';

export default function DashboardPage() {
  const { habits, entries, mounted } = useHabits();

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
        <DashboardCharts habits={habits} entries={entries} />
        <Heatmap habits={habits} entries={entries} />
      </div>
    </AppLayout>
  );
}
