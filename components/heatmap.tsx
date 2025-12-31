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
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Habit, HabitEntry } from '@/lib/types';
import { calculateDailyScore } from '@/lib/utils-habit';
import { storage } from '@/lib/storage';
import ReactDOMServer from 'react-dom/server';

interface HeatmapProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export function Heatmap({ habits, entries }: HeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  useEffect(() => {
    const archived = storage.getArchivedYears();
    const years = [currentYear, ...archived].sort((a, b) => b - a);
    setAvailableYears(years);
  }, [currentYear]);

  const heatmapData = useMemo(() => {
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

    const data: Array<{ date: string; count: number }> = [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const score = calculateDailyScore(yearHabits, yearEntries, dateStr);
      data.push({
        date: dateStr,
        count: score,
      });
    }

    return data;
  }, [habits, entries, selectedYear, currentYear]);

  const maxScore = useMemo(() => {
    return Math.max(...heatmapData.map(d => d.count), 1);
  }, [heatmapData]);

  const getColorClass = (value: any) => {
    if (!value || value.count === 0) {
      return 'color-empty';
    }
    const intensity = value.count / maxScore;
    if (intensity < 0.25) return 'color-scale-1';
    if (intensity < 0.5) return 'color-scale-2';
    if (intensity < 0.75) return 'color-scale-3';
    return 'color-scale-4';
  };

  const getTitleText = (value: any) => {
    if (!value || !value.date) {
      return '';
    }
    const date = new Date(value.date);
    const points = value.count || 0;
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} - ${points} point${points !== 1 ? 's' : ''}`;
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
          <div className="min-w-[600px] sm:min-w-0">
            <div className="heatmap-container">
              <CalendarHeatmap
                startDate={new Date(selectedYear, 0, 1)}
                endDate={new Date(selectedYear, 11, 31)}
                values={heatmapData}
                classForValue={getColorClass}
                titleForValue={getTitleText}
                showWeekdayLabels
              />
            </div>
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
        
        <style jsx global>{`
          .heatmap-container {
            width: 100%;
            overflow-x: auto;
          }
          
          .react-calendar-heatmap {
            width: 100%;
          }
          
          .react-calendar-heatmap text {
            font-size: 10px;
            fill: #a1a1aa;
          }
          
          .react-calendar-heatmap .color-empty {
            fill: #27272a;
          }
          
          .react-calendar-heatmap .color-scale-1 {
            fill: #1e40af;
          }
          
          .react-calendar-heatmap .color-scale-2 {
            fill: #2563eb;
          }
          
          .react-calendar-heatmap .color-scale-3 {
            fill: #3b82f6;
          }
          
          .react-calendar-heatmap .color-scale-4 {
            fill: #60a5fa;
          }
          
          .react-calendar-heatmap rect:hover {
            stroke: #60a5fa;
            stroke-width: 2;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
