'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EngagementDetail from '@/components/engagements/EngagementDetail';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function EngagementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/engagements/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch engagement details');
        }

        const data = await res.json();
        if (data.success) {
          setEngagement(data.data);
        } else {
          throw new Error(data.error || 'Failed to load engagement');
        }
      } catch (err) {
        console.error('Fetch engagement error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchEngagement();
    }
  }, [params.id]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Engagements', href: '/engagements' },
    { label: engagement?.engagement_type || 'Details', href: `/engagements/${params.id}`, active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !engagement) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Engagement not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/engagements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Engagements
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/engagements')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Engagement Details</h1>
        </div>
        <Button onClick={() => router.push(`/engagements/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Engagement
        </Button>
      </div>

      <EngagementDetail engagement={engagement} />
    </div>
  );
}