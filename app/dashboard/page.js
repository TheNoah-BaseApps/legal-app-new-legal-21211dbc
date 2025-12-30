'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import StatsCard from '@/components/dashboard/StatsCard';
import WorkflowProgress from '@/components/dashboard/WorkflowProgress';
import { Users, Briefcase, MessageSquare, TrendingUp, FileText, CheckSquare, DollarSign, ShieldCheck } from 'lucide-react';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to load stats');
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Customers"
          value={stats?.totalCustomers || 0}
          icon={Users}
          trend={stats?.customerTrend}
          color="blue"
        />
        <StatsCard
          title="Active Cases"
          value={stats?.activeCases || 0}
          icon={Briefcase}
          trend={stats?.caseTrend}
          color="green"
        />
        <StatsCard
          title="Recent Engagements"
          value={stats?.recentEngagements || 0}
          icon={MessageSquare}
          trend={stats?.engagementTrend}
          color="purple"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats?.completionRate || 0}%`}
          icon={TrendingUp}
          trend={stats?.completionTrend}
          color="orange"
        />
      </div>

      <WorkflowProgress stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/documents">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Legal Documents</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage and track legal documents</p>
              {stats?.totalDocuments !== undefined && (
                <p className="text-2xl font-bold mt-2">{stats.totalDocuments}</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Legal Tasks</CardTitle>
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Assign and track legal tasks</p>
              {stats?.totalTasks !== undefined && (
                <p className="text-2xl font-bold mt-2">{stats.totalTasks}</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Legal Invoices</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage billing and invoicing for legal services</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/compliance">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Compliance Management</CardTitle>
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Track regulatory compliance and audits</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.casesByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'Open' ? 'bg-blue-500' :
                      item.status === 'In Progress' ? 'bg-yellow-500' :
                      item.status === 'Closed' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.customersByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'Active' ? 'bg-green-500' :
                      item.status === 'Prospective' ? 'bg-blue-500' :
                      item.status === 'Inactive' ? 'bg-gray-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}