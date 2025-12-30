'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CaseTable from '@/components/cases/CaseTable';
import SearchBar from '@/components/shared/SearchBar';
import EmptyState from '@/components/shared/EmptyState';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);

      const res = await fetch(`/api/cases?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch cases');
      }

      const data = await res.json();
      if (data.success) {
        setCases(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load cases');
      }
    } catch (err) {
      console.error('Fetch cases error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [searchTerm]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cases/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete case');
      }

      toast.success('Case deleted successfully');
      fetchCases();
    } catch (err) {
      console.error('Delete case error:', err);
      toast.error(err.message);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cases', href: '/cases', active: true }
  ];

  if (loading && cases.length === 0) {
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
        <h1 className="text-3xl font-bold">Cases</h1>
        <Button onClick={() => router.push('/cases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Case
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
        placeholder="Search cases..."
      />

      {cases.length === 0 && !loading ? (
        <EmptyState
          icon={Briefcase}
          title="No cases found"
          description="Get started by adding your first case"
          action={{
            label: 'Add Case',
            onClick: () => router.push('/cases/new')
          }}
        />
      ) : (
        <CaseTable
          cases={cases}
          onDelete={handleDelete}
          onEdit={(id) => router.push(`/cases/${id}/edit`)}
          onView={(id) => router.push(`/cases/${id}`)}
        />
      )}
    </div>
  );
}