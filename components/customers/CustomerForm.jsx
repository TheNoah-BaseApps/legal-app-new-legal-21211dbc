'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormInput from '@/components/shared/FormInput';
import SelectDropdown from '@/components/shared/SelectDropdown';
import DatePicker from '@/components/shared/DatePicker';
import { toast } from 'sonner';
import { CUSTOMER_STATUS, INDUSTRY_TYPES } from '@/lib/constants';

export default function CustomerForm({ customer, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: customer?.customer_id || '',
    customer_name: customer?.customer_name || '',
    contact_person: customer?.contact_person || '',
    contact_number: customer?.contact_number || '',
    email_address: customer?.email_address || '',
    industry_type: customer?.industry_type || '',
    registration_date: customer?.registration_date || new Date().toISOString().split('T')[0],
    customer_status: customer?.customer_status || 'Prospective',
    address_line: customer?.address_line || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/customers/${customer.id}` : '/api/customers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} customer`);
      }

      toast.success(`Customer ${isEdit ? 'updated' : 'created'} successfully`);
      router.push('/customers');
    } catch (err) {
      console.error('Form submit error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Customer ID"
              value={formData.customer_id}
              onChange={(value) => setFormData({ ...formData, customer_id: value })}
              placeholder="AUTO or enter custom ID"
              disabled={isEdit}
            />
            
            <FormInput
              label="Customer Name"
              value={formData.customer_name}
              onChange={(value) => setFormData({ ...formData, customer_name: value })}
              required
            />

            <FormInput
              label="Contact Person"
              value={formData.contact_person}
              onChange={(value) => setFormData({ ...formData, contact_person: value })}
              required
            />

            <FormInput
              label="Contact Number"
              type="tel"
              value={formData.contact_number}
              onChange={(value) => setFormData({ ...formData, contact_number: value })}
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              value={formData.email_address}
              onChange={(value) => setFormData({ ...formData, email_address: value })}
              required
            />

            <SelectDropdown
              label="Industry Type"
              value={formData.industry_type}
              onChange={(value) => setFormData({ ...formData, industry_type: value })}
              options={INDUSTRY_TYPES}
              required
            />

            <DatePicker
              label="Registration Date"
              value={formData.registration_date}
              onChange={(value) => setFormData({ ...formData, registration_date: value })}
              required
            />

            <SelectDropdown
              label="Customer Status"
              value={formData.customer_status}
              onChange={(value) => setFormData({ ...formData, customer_status: value })}
              options={CUSTOMER_STATUS}
              required
            />
          </div>

          <FormInput
            label="Address"
            value={formData.address_line}
            onChange={(value) => setFormData({ ...formData, address_line: value })}
            placeholder="Enter full address"
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/customers')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}