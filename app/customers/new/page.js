'use client';

import { useRouter } from 'next/navigation';
import CustomerForm from '@/components/customers/CustomerForm';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewCustomerPage() {
  const router = useRouter();

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Customers', href: '/customers' },
    { label: 'New Customer', href: '/customers/new', active: true }
  ];

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Add New Customer</h1>
      </div>

      <CustomerForm />
    </div>
  );
}