'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import ExportButton from '@/components/shared/ExportButton';
import { FileDown, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('customers');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reports/export?type=${reportType}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports', active: true }
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Export</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
            <CardDescription>Export your data in various formats</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="cases">Cases</SelectItem>
                  <SelectItem value="engagements">Engagements</SelectItem>
                  <SelectItem value="all">All Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} disabled={loading} className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              {loading ? 'Exporting...' : 'Export Data'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common report exports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ExportButton
              label="Export Customer List"
              onClick={() => {
                setReportType('customers');
                setFormat('csv');
                setTimeout(handleExport, 100);
              }}
              icon={FileText}
            />
            <ExportButton
              label="Export Active Cases"
              onClick={() => {
                setReportType('cases');
                setFormat('csv');
                setTimeout(handleExport, 100);
              }}
              icon={Table}
            />
            <ExportButton
              label="Export Engagement Log"
              onClick={() => {
                setReportType('engagements');
                setFormat('csv');
                setTimeout(handleExport, 100);
              }}
              icon={FileDown}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong>Customers Report:</strong> Includes customer ID, name, contact details, industry type, status, and registration date.
            </p>
            <p>
              <strong>Cases Report:</strong> Includes case ID, title, client information, case type, status, assigned attorney, filing date, and hearing dates.
            </p>
            <p>
              <strong>Engagements Report:</strong> Includes engagement ID, client information, engagement type, date, outcome, contact person, and channel.
            </p>
            <p>
              <strong>All Data:</strong> Exports all tables with complete information in a structured format.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}