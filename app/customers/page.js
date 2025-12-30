'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerTable from '@/components/customers/CustomerTable';
import SearchBar from '@/components/shared/SearchBar';
import EmptyState from '@/components/shared/EmptyState';
import BreadcrumbNavigation from '@/components/layout/BreadcrumbNavigation';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    industry: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.industry) queryParams.append('industry', filters.industry);

      const res = await fetch(`/api/customers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Fetch customers error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, filters]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete customer');
      }

      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (err) {
      console.error('Delete customer error:', err);
      toast.error(err.message);
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Customers', href: '/customers', active: true }
  ];

  if (loading && customers.length === 0) {
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
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={() => router.push('/customers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search customers..."
        />
      </div>

      {customers.length === 0 && !loading ? (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="Get started by adding your first customer"
          action={{
            label: 'Add Customer',
            onClick: () => router.push('/customers/new')
          }}
        />
      ) : (
        <CustomerTable
          customers={customers}
          onDelete={handleDelete}
          onEdit={(id) => router.push(`/customers/${id}/edit`)}
          onView={(id) => router.push(`/customers/${id}`)}
        />
      )}
    </div>
  );
}