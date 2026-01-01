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
import { Calendar, TrendingUp, Award, Target } from 'lucide-react';

interface YearlyOverviewProps {
  habits: Habit[];
  entries: HabitEntry[];
}

interface MonthData {
  month: string;
  totalDays: number;
  activeDays: number;
  totalScore: number;
  avgScore: number;
  completionRate: number;
}

export function YearlyOverview({ habits, entries }: YearlyOverviewProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);

  useEffect(() => {
    const archived = storage.getArchivedYears();
    const allYears = [currentYear, ...archived];
    const uniqueYears = Array.from(new Set(allYears)).sort((a, b) => b - a);
    setAvailableYears(uniqueYears);
  }, [currentYear]);

  const { monthlyData, yearStats } = useMemo(() => {
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

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: MonthData[] = [];
    let totalActiveDays = 0;
    let totalPossibleDays = 0;
    let totalYearScore = 0;
    let bestMonth = { name: '', score: 0 };

    // Determine how many months to show
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const isCurrentYear = selectedYear === currentYear;
    const monthsToShow = isCurrentYear ? currentMonth + 1 : 12;

    for (let month = 0; month < monthsToShow; month++) {
      const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
      // For current month of current year, only check up to today
      const daysToCheck = (isCurrentYear && month === currentMonth) ? currentDay : daysInMonth;
      
      let activeDays = 0;
      let totalScore = 0;

      for (let day = 1; day <= daysToCheck; day++) {
        const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const score = calculateDailyScore(yearHabits, yearEntries, dateStr);
        totalScore += score;
        if (score > 0) activeDays++;
      }

      const avgScore = daysInMonth > 0 ? totalScore / daysInMonth : 0;
      const completionRate = (activeDays / daysInMonth) * 100;

      data.push({
        month: months[month],
        totalDays: daysInMonth,
        activeDays,
        totalScore,
        avgScore,
        completionRate,
      });

      totalActiveDays += activeDays;
      totalPossibleDays += daysInMonth;
      totalYearScore += totalScore;

      if (totalScore > bestMonth.score) {
        bestMonth = { name: months[month], score: totalScore };
      }
    }

    const yearlyCompletionRate = totalPossibleDays > 0 ? (totalActiveDays / totalPossibleDays) * 100 : 0;
    const avgDailyScore = totalPossibleDays > 0 ? totalYearScore / totalPossibleDays : 0;

    return {
      monthlyData: data,
      yearStats: {
        totalActiveDays,
        totalPossibleDays,
        yearlyCompletionRate,
        totalYearScore,
        avgDailyScore,
        bestMonth: bestMonth.name,
      },
    };
  }, [habits, entries, selectedYear, currentYear]);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">Yearly Overview</CardTitle>
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
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Year Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-zinc-900 rounded-lg p-3 sm:p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Active Days</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {yearStats.totalActiveDays}
              <span className="text-sm text-muted-foreground ml-1">/ {yearStats.totalPossibleDays}</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-3 sm:p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="h-4 w-4" />
              <span className="text-xs">Completion</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {yearStats.yearlyCompletionRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-3 sm:p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Total Points</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {Math.round(yearStats.totalYearScore)}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-3 sm:p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <span className="text-xs">Best Month</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {yearStats.bestMonth || 'N/A'}
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div>
          <h3 className="text-sm font-medium mb-3">Monthly Breakdown</h3>
          <div className="space-y-2">
            {monthlyData.map((month) => (
              <div key={month.month} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium w-12">{month.month}</span>
                  <div className="flex-1 mx-3">
                    <div className="h-8 bg-zinc-900 rounded-md overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all flex items-center justify-end px-2"
                        style={{
                          width: `${month.completionRate}%`,
                        }}
                      >
                        {month.activeDays > 0 && (
                          <span className="text-xs font-medium text-white">
                            {month.activeDays}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="w-16 text-right">
                      {month.activeDays}/{month.totalDays} days
                    </span>
                    <span className="w-12 text-right">
                      {month.completionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="text-xs text-muted-foreground border-t border-zinc-800 pt-4">
          Monthly bars show active days where tasks were completed. Percentage shows completion rate.
        </div>
      </CardContent>
    </Card>
  );
}
