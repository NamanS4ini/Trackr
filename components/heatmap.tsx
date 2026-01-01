'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Habit, HabitEntry } from '@/lib/types';
import { calculateDailyScore } from '@/lib/utils-habit';
import { storage } from '@/lib/storage';

interface HeatmapProps {
  habits: Habit[];
  entries: HabitEntry[];
}

interface DayData {
  date: string;
  count: number;
  month: number;
  day: number;
}

export function Heatmap({ habits, entries }: HeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  useEffect(() => {
    const archived = storage.getArchivedYears();
    const allYears = [currentYear, ...archived];
    const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => b - a);
    setAvailableYears(uniqueYears);
  }, [currentYear]);

  const { heatmapData, maxScore } = useMemo(() => {
    let yearHabits = habits;
    let yearEntries = entries;
    
    if (selectedYear !== currentYear) {
      const yearData = storage.getYearData(selectedYear);
      if (yearData) {
        yearHabits = yearData.habits;
        yearEntries = yearData.entries;
      } else {
        yearHabits = [];
        yearEntries = [];
      }
    }

    const data: DayData[] = [];
    
    // Generate dates for the entire year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const score = calculateDailyScore(yearHabits, yearEntries, dateStr);
        data.push({
          date: dateStr,
          count: score,
          month: month,
          day: day
        });
      }
    }

    const max = Math.max(...data.map(d => d.count), 1);
    
    return { heatmapData: data, maxScore: max };
  }, [habits, entries, selectedYear, currentYear]);

  const getColor = (count: number) => {
    if (count === 0) return '#27272a';
    const intensity = count / maxScore;
    if (intensity < 0.25) return '#1e40af';
    if (intensity < 0.5) return '#2563eb';
    if (intensity < 0.75) return '#3b82f6';
    return '#60a5fa';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group days by week
  const weeks: DayData[][] = useMemo(() => {
    const firstDay = new Date(selectedYear, 0, 1).getDay();
    const result: DayData[][] = [[]];
    
    // Add empty days for the first week
    for (let i = 0; i < firstDay; i++) {
      result[0].push({ date: '', count: -1, month: -1, day: -1 });
    }
    
    // Add all days
    heatmapData.forEach(day => {
      const currentWeek = result[result.length - 1];
      if (currentWeek.length === 7) {
        result.push([day]);
      } else {
        currentWeek.push(day);
      }
    });
    
    // Fill last week
    const lastWeek = result[result.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push({ date: '', count: -1, month: -1, day: -1 });
    }
    
    return result;
  }, [heatmapData, selectedYear]);

  const formatDate = (dateStr: string, count: number) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${formatted} - ${count} point${count !== 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">Activity Heatmap - {selectedYear}</CardTitle>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-[800px]">
            {/* Month labels */}
            <div className="flex ml-8 mb-1">
              {months.map((month, idx) => {
                const monthWeeks = weeks.filter(week => 
                  week.some(day => day.month === idx)
                );
                const weekSpan = monthWeeks.length;
                return weekSpan > 0 ? (
                  <div 
                    key={month} 
                    className="text-xs text-muted-foreground"
                    style={{ width: `${weekSpan * 14}px` }}
                  >
                    {month}
                  </div>
                ) : null;
              })}
            </div>

            {/* Calendar grid */}
            <div className="flex">
              {/* Weekday labels */}
              <div className="flex flex-col gap-[3px] mr-2">
                {weekdays.map((day, idx) => (
                  <div 
                    key={day} 
                    className="text-[10px] text-muted-foreground h-[11px] flex items-center"
                  >
                    {idx % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.map((day, dayIdx) => (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`w-[11px] h-[11px] rounded-sm transition-all ${
                          day.count >= 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                        }`}
                        style={{
                          backgroundColor: day.count >= 0 ? getColor(day.count) : 'transparent',
                          border: day.count === -1 ? 'none' : day.count === 0 ? '1px solid #52525b' : 'none'
                        }}
                        onMouseEnter={() => day.count >= 0 && setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={day.date ? formatDate(day.date, day.count) : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && hoveredDay.date && (
              <div className="mt-3 text-xs text-muted-foreground p-2 bg-zinc-800 rounded border border-zinc-700">
                {formatDate(hoveredDay.date, hoveredDay.count)}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm border border-zinc-700" style={{ backgroundColor: '#27272a' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#1e40af' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#2563eb' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#60a5fa' }} />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
