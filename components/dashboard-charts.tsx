'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Habit, HabitEntry, ChartFormat } from '@/lib/types';
import { getWeeklyScores, getDailyScores, getMonthlyScores } from '@/lib/utils-habit';

interface DashboardChartsProps {
  habits: Habit[];
  entries: HabitEntry[];
}

export function DashboardCharts({ habits, entries }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = useState<ChartFormat>('weekly');

  useEffect(() => {
    const saved = localStorage.getItem('trackr-chart-format');
    if (saved === 'daily' || saved === 'weekly' || saved === 'monthly') {
      setTimeRange(saved);
    }
  }, []);

  const getChartData = () => {
    switch (timeRange) {
      case 'daily':
        return getDailyScores(habits, entries, 30);
      case 'weekly':
        return getWeeklyScores(habits, entries, 8);
      case 'monthly':
        return getMonthlyScores(habits, entries, 12);
      default:
        return getWeeklyScores(habits, entries, 8);
    }
  };

  const chartData = getChartData();
  const chartTitle = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Progress Charts</h3>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as ChartFormat)}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{chartTitle} Progress</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  style={{ fontSize: '10px' }}
                  angle={timeRange === 'daily' ? -45 : 0}
                  textAnchor={timeRange === 'daily' ? 'end' : 'middle'}
                  height={timeRange === 'daily' ? 60 : 30}
                />
                <YAxis 
                  stroke="#71717a"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{chartTitle} Scores</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  style={{ fontSize: '10px' }}
                  angle={timeRange === 'daily' ? -45 : 0}
                  textAnchor={timeRange === 'daily' ? 'end' : 'middle'}
                  height={timeRange === 'daily' ? 60 : 30}
                />
                <YAxis 
                  stroke="#71717a"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: '#e4e4e7' }}
                />
                <Bar
                  dataKey="score"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
