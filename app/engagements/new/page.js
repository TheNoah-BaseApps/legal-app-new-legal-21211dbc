'use client';

import { useRouter } from 'next/navigation';
import EngagementForm from '@/components/engagements/EngagementForm';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewEngagementPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Engagements', href: '/engagements' },
    { label: 'New Engagement', href: '/engagements/new', active: true }
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/engagements')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Log New Engagement</h1>
      </div>

      <EngagementForm />
    </div>
  );
}