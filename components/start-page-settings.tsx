'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Home } from 'lucide-react';

export function StartPageSettings() {
  const [startPage, setStartPage] = useState<'home' | 'track'>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('trackr-start-page');
    if (saved === 'track' || saved === 'home') {
      setStartPage(saved);
    }
  }, []);

  const handleChange = (value: 'home' | 'track') => {
    setStartPage(value);
    localStorage.setItem('trackr-start-page', value);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Card className="border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          <CardTitle className="text-lg">Start Page</CardTitle>
        </div>
        <CardDescription>Choose which page to show when you open Trackr</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Label htmlFor="start-page" className="text-sm font-medium">
            Default Page:
          </Label>
          <Select value={startPage} onValueChange={handleChange}>
            <SelectTrigger id="start-page" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="track">Tracker</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
