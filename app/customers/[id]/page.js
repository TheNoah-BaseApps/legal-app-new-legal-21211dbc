'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerDetail from '@/components/customers/CustomerDetail';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [cases, setCases] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [customerRes, casesRes, engagementsRes] = await Promise.all([
          fetch(`/api/customers/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`/api/cases/by-customer/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`/api/engagements/by-customer/${params.id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (!customerRes.ok) {
          throw new Error('Failed to fetch customer details');
        }

        const customerData = await customerRes.json();
        const casesData = await casesRes.json();
        const engagementsData = await engagementsRes.json();

        if (customerData.success) {
          setCustomer(customerData.data);
        }
        if (casesData.success) {
          setCases(casesData.data || []);
        }
        if (engagementsData.success) {
          setEngagements(engagementsData.data || []);
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
      fetchCustomerData();
    }
  }, [params.id]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Customers', href: '/customers' },
    { label: customer?.customer_name || 'Details', href: `/customers/${params.id}`, active: true }
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
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{customer.customer_name}</h1>
        </div>
        <Button onClick={() => router.push(`/customers/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Customer
        </Button>
      </div>

      <CustomerDetail
        customer={customer}
        cases={cases}
        engagements={engagements}
      />
    </div>
  );
}