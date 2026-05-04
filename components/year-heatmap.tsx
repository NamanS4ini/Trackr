'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearHeatmapProps {
    habits: Habit[];
    entries: HabitEntry[];
}

interface DayData {
    date: string;
    score: number;
}

export function YearHeatmap({ habits, entries }: YearHeatmapProps) {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Find the earliest year with activity
    const earliestYear = useMemo(() => {
        if (entries.length === 0) return currentYear;
        const dates = entries.map((e) => e.date);
        const years = dates
            .map((date) => parseInt(date.split('-')[0]))
            .filter((year) => !isNaN(year));
        return Math.min(...years, currentYear);
    }, [entries, currentYear]);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);
    const monthsContainerRef = useRef<HTMLDivElement | null>(null);

    // Generate a range of years from earliest activity to current year
    const availableYears = useMemo(() => {
        const years = [];
        for (let i = earliestYear; i <= currentYear; i++) {
            years.push(i);
        }
        return years.sort((a, b) => b - a);
    }, [earliestYear, currentYear]);

    const { daysData, maxScore, stats } = useMemo(() => {
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

        const days: DayData[] = [];
        let max = 0;
        let totalScore = 0;
        let activeDaysCount = 0;

        const now = new Date();
        const currentYearCheck = selectedYear === currentYear;

        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
            const monthEnd = currentYearCheck && month === now.getMonth() ? now.getDate() : daysInMonth;

            for (let day = 1; day <= monthEnd; day++) {
                const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const score = calculateDailyScore(yearHabits, yearEntries, dateStr);
                days.push({ date: dateStr, score });
                if (score > 0) {
                    totalScore += score;
                    activeDaysCount++;
                }
                max = Math.max(max, score);
            }
        }

        return {
            daysData: days,
            maxScore: max,
            stats: {
                totalDays: days.length,
                activeDays: activeDaysCount,
                totalScore,
                avgScore: days.length > 0 ? totalScore / days.length : 0,
            },
        };
    }, [selectedYear, habits, entries, currentYear]);

    // Generate weeks organized by month for horizontal display
    const monthsData = useMemo(() => {
        const months = [];

        for (let month = 0; month < 12; month++) {
            const daysInMonth = new Date(selectedYear, month + 1, 0).getDate();
            const now = new Date();
            const currentYearCheck = selectedYear === currentYear;
            const currentMonthCheck = currentYearCheck && month === now.getMonth();

            const monthDays: (DayData | null)[] = [];

            // Add empty cells for days before month starts
            const firstDay = new Date(selectedYear, month, 1).getDay();
            for (let i = 0; i < firstDay; i++) {
                monthDays.push(null);
            }

            // Add all days in month
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${selectedYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const score = currentMonthCheck && day > now.getDate() ? 0 : calculateDailyScore(habits, entries, dateStr);
                monthDays.push({ date: dateStr, score });
            }

            // Split into weeks (7 days per week)
            const weeks = [];
            for (let i = 0; i < monthDays.length; i += 7) {
                weeks.push(monthDays.slice(i, i + 7));
            }

            const monthName = new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'short' });
            months.push({ monthName, weeks, monthIndex: month });
        }

        return months;
    }, [selectedYear, habits, entries, currentYear]);

    const getColorClass = (score: number): string => {
        if (score === 0) return 'bg-zinc-800';
        const intensity = Math.min(score / (maxScore || 1), 1);
        if (intensity < 0.2) return 'bg-green-900';
        if (intensity < 0.4) return 'bg-green-800';
        if (intensity < 0.6) return 'bg-green-700';
        if (intensity < 0.8) return 'bg-green-600';
        return 'bg-green-500';
    };

    const handlePrevYear = () => {
        const idx = availableYears.indexOf(selectedYear);
        if (idx < availableYears.length - 1) {
            setSelectedYear(availableYears[idx + 1]);
        }
    };

    const handleNextYear = () => {
        const idx = availableYears.indexOf(selectedYear);
        if (idx > 0) {
            setSelectedYear(availableYears[idx - 1]);
        }
    };

    useEffect(() => {
        const container = monthsContainerRef.current;
        if (!container) return;

        if (selectedYear !== currentYear) {
            container.scrollTo({ left: 0, behavior: 'auto' });
            return;
        }

        const shouldStartFromEnd = currentMonth >= 6;
        const targetScrollLeft = shouldStartFromEnd
            ? container.scrollWidth - container.clientWidth
            : 0;

        container.scrollTo({
            left: Math.max(0, targetScrollLeft),
            behavior: 'auto',
        });
    }, [selectedYear, currentYear, currentMonth, monthsData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Year Heatmap - {selectedYear}</CardTitle>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevYear}
                            disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextYear}
                            disabled={availableYears.indexOf(selectedYear) === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 bg-secondary/50 rounded text-center">
                        <div className="text-sm font-semibold">{stats.totalDays}</div>
                        <div className="text-xs text-muted-foreground">Total Days</div>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded text-center">
                        <div className="text-sm font-semibold">{stats.activeDays}</div>
                        <div className="text-xs text-muted-foreground">Active Days</div>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded text-center">
                        <div className="text-sm font-semibold">{stats.totalScore.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded text-center">
                        <div className="text-sm font-semibold">{stats.avgScore.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                </div>

                {/* Heatmap - Months in horizontal grid */}
                <div ref={monthsContainerRef} className="overflow-x-auto">
                    <div className="inline-flex gap-6 pb-4">
                        {monthsData.map((month) => (
                            <div key={month.monthIndex} className="shrink-0">
                                {/* Month label */}
                                <div className="text-center text-sm font-semibold mb-2 text-muted-foreground">
                                    {month.monthName}
                                </div>

                                {/* Day labels (Sun-Sat) - only once per month */}
                                <div className="flex gap-1 mb-1">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                        <div key={`${month.monthIndex}-day-${index}`} className="w-4 text-center text-xs text-muted-foreground font-medium">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Weeks */}
                                {month.weeks.map((week, weekIdx) => (
                                    <div key={`${month.monthIndex}-week-${weekIdx}`} className="flex gap-1 mb-1">
                                        {week.map((day, dayIdx) => {
                                            if (!day) {
                                                return <div key={`${month.monthIndex}-empty-${dayIdx}`} className="w-4 h-4" />;
                                            }
                                            const dateObj = new Date(day.date);
                                            const dateFormatted = `${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

                                            return (
                                                <div
                                                    key={day.date}
                                                    className={`w-4 h-4 rounded-sm transition-all cursor-pointer hover:ring-1 hover:ring-foreground/50 ${getColorClass(day.score)}`}
                                                    onMouseEnter={() => setHoveredDate(day.date)}
                                                    onMouseLeave={() => setHoveredDate(null)}
                                                    title={`${dateFormatted}: ${day.score.toFixed(1)} pts`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hover Info */}
                {hoveredDate && (
                    <div className="text-xs text-muted-foreground p-2 bg-secondary/30 rounded">
                        <strong>{hoveredDate}</strong>:{' '}
                        {daysData.find((d) => d.date === hoveredDate)?.score.toFixed(1) || 0} points
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-muted-foreground">
                    <span>Score intensity:</span>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-zinc-800 rounded" />
                        <span>No activity</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-900 rounded" />
                        <span>Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-600 rounded" />
                        <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span>High</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
