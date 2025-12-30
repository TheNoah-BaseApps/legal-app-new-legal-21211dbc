'use client';

import { useRouter } from 'next/navigation';
import CaseForm from '@/components/cases/CaseForm';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewCasePage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Cases', href: '/cases' },
    { label: 'New Case', href: '/cases/new', active: true }
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Case</h1>
      </div>

      <CaseForm />
    </div>
  );
}