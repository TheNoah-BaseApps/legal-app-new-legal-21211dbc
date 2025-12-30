'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CaseForm from '@/components/cases/CaseForm';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/cases/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch case');
        }

        const data = await res.json();
        if (data.success) {
          setCaseData(data.data);
        } else {
          throw new Error(data.error || 'Failed to load case');
        }
      } catch (err) {
        console.error('Fetch case error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCase();
    }
  }, [params.id]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cases', href: '/cases' },
    { label: caseData?.case_title || 'Edit', href: `/cases/${params.id}/edit`, active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Case not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Case</h1>
      </div>

      <CaseForm caseData={caseData} isEdit />
    </div>
  );
}