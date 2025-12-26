'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload } from 'lucide-react';
import { storage } from '@/lib/storage';

export function DataManagement() {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setImporting(true);
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.habits && data.entries) {
          if (confirm('This will replace all your current data. Are you sure?')) {
            storage.importData(data);
            window.location.reload();
          }
        } else {
          alert('Invalid backup file format');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
        console.error(error);
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleImport} variant="outline" className="gap-2" disabled={importing}>
              <Upload className="h-4 w-4" />
              {importing ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Export your data as JSON for backup or import previously exported data. Years are automatically archived on January 1st and can be viewed in the heatmap dropdown.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
