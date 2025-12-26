'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart3 } from 'lucide-react';
import { ChartFormat } from '@/lib/types';

export function ChartFormatSettings() {
  const [chartFormat, setChartFormat] = useState<ChartFormat>('weekly');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('trackr-chart-format');
    if (saved === 'daily' || saved === 'weekly' || saved === 'monthly') {
      setChartFormat(saved);
    }
  }, []);

  const handleChange = (value: ChartFormat) => {
    setChartFormat(value);
    localStorage.setItem('trackr-chart-format', value);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <CardTitle className="text-lg">Default Chart Format</CardTitle>
        </div>
        <CardDescription>Choose the default time range for dashboard charts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Label htmlFor="chart-format" className="text-sm font-medium">
            Default Format:
          </Label>
          <Select value={chartFormat} onValueChange={handleChange}>
            <SelectTrigger id="chart-format" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
