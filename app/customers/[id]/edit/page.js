'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerForm from '@/components/customers/CustomerForm';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/customers/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch customer');
        }

        const data = await res.json();
        if (data.success) {
          setCustomer(data.data);
        } else {
          throw new Error(data.error || 'Failed to load customer');
        }
      } catch (err) {
        console.error('Fetch customer error:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Customers', href: '/customers' },
    { label: customer?.customer_name || 'Edit', href: `/customers/${params.id}/edit`, active: true }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Customer not found'}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation items={breadcrumbs} />
      
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/customers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Customer</h1>
      </div>

      <CustomerForm customer={customer} isEdit />
    </div>
  );
}