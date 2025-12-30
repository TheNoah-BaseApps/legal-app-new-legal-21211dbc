'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EngagementTable from '@/components/engagements/EngagementTable';
import SearchBar from '@/components/shared/SearchBar';
import EmptyState from '@/components/shared/EmptyState';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { Plus, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function EngagementsPage() {
  const router = useRouter();
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEngagements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);

      const res = await fetch(`/api/engagements?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch engagements');
      }

      const data = await res.json();
      if (data.success) {
        setEngagements(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load engagements');
      }
    } catch (err) {
      console.error('Fetch engagements error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagements();
  }, [searchTerm]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/engagements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete engagement');
      }

      toast.success('Engagement deleted successfully');
      fetchEngagements();
    } catch (err) {
      console.error('Delete engagement error:', err);
      toast.error(err.message);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Engagements', href: '/engagements', active: true }
  ];

  if (loading && engagements.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Engagements</h1>
        <Button onClick={() => router.push('/engagements/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Engagement
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search engagements..."
      />

      {engagements.length === 0 && !loading ? (
        <EmptyState
          icon={MessageSquare}
          title="No engagements found"
          description="Get started by logging your first client engagement"
          action={{
            label: 'Add Engagement',
            onClick: () => router.push('/engagements/new')
          }}
        />
      ) : (
        <EngagementTable
          engagements={engagements}
          onDelete={handleDelete}
          onEdit={(id) => router.push(`/engagements/${id}/edit`)}
          onView={(id) => router.push(`/engagements/${id}`)}
        />
      )}
    </div>
  );
}