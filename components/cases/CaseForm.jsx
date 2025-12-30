'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FormInput from '@/components/shared/FormInput';
import SelectDropdown from '@/components/shared/SelectDropdown';
import DatePicker from '@/components/shared/DatePicker';
import { toast } from 'sonner';
import { CASE_STATUS, CASE_TYPES } from '@/lib/constants';

export default function CaseForm({ caseData, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [attorneys, setAttorneys] = useState([]);
  const [formData, setFormData] = useState({
    case_id: caseData?.case_id || '',
    case_title: caseData?.case_title || '',
    client_id: caseData?.client_id || '',
    case_type: caseData?.case_type || '',
    case_status: caseData?.case_status || 'Open',
    assigned_attorney: caseData?.assigned_attorney || '',
    filing_date: caseData?.filing_date || new Date().toISOString().split('T')[0],
    court_name: caseData?.court_name || '',
    hearing_date: caseData?.hearing_date || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [customersRes, usersRes] = await Promise.all([
          fetch('/api/customers', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        const customersData = await customersRes.json();
        if (customersData.success) {
          setCustomers(customersData.data.map(c => ({ value: c.id, label: c.customer_name })));
        }

        setAttorneys([
          { value: 'John Smith', label: 'John Smith' },
          { value: 'Sarah Johnson', label: 'Sarah Johnson' },
          { value: 'Michael Brown', label: 'Michael Brown' },
        ]);
      } catch (err) {
        console.error('Fetch data error:', err);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/cases/${caseData.id}` : '/api/cases';
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
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} case`);
      }

      toast.success(`Case ${isEdit ? 'updated' : 'created'} successfully`);
      router.push('/cases');
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
        <CardTitle>{isEdit ? 'Edit Case' : 'Add New Case'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Case ID"
              value={formData.case_id}
              onChange={(value) => setFormData({ ...formData, case_id: value })}
              placeholder="AUTO or enter custom ID"
              disabled={isEdit}
            />
            
            <FormInput
              label="Case Title"
              value={formData.case_title}
              onChange={(value) => setFormData({ ...formData, case_title: value })}
              required
            />

            <SelectDropdown
              label="Client"
              value={formData.client_id}
              onChange={(value) => setFormData({ ...formData, client_id: value })}
              options={customers}
              placeholder="Select a client"
              required
            />

            <SelectDropdown
              label="Case Type"
              value={formData.case_type}
              onChange={(value) => setFormData({ ...formData, case_type: value })}
              options={CASE_TYPES}
              required
            />

            <SelectDropdown
              label="Case Status"
              value={formData.case_status}
              onChange={(value) => setFormData({ ...formData, case_status: value })}
              options={CASE_STATUS}
              required
            />

            <SelectDropdown
              label="Assigned Attorney"
              value={formData.assigned_attorney}
              onChange={(value) => setFormData({ ...formData, assigned_attorney: value })}
              options={attorneys}
              placeholder="Select an attorney"
              required
            />

            <DatePicker
              label="Filing Date"
              value={formData.filing_date}
              onChange={(value) => setFormData({ ...formData, filing_date: value })}
              required
            />

            <DatePicker
              label="Hearing Date"
              value={formData.hearing_date}
              onChange={(value) => setFormData({ ...formData, hearing_date: value })}
            />

            <FormInput
              label="Court Name"
              value={formData.court_name}
              onChange={(value) => setFormData({ ...formData, court_name: value })}
              className="md:col-span-2"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Case' : 'Create Case'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/cases')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}