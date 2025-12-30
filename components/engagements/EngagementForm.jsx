'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import FormInput from '@/components/shared/FormInput';
import SelectDropdown from '@/components/shared/SelectDropdown';
import DatePicker from '@/components/shared/DatePicker';
import { toast } from 'sonner';
import { ENGAGEMENT_TYPES, ENGAGEMENT_CHANNELS, ENGAGEMENT_OUTCOMES } from '@/lib/constants';

export default function EngagementForm({ engagement, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    engagement_id: engagement?.engagement_id || '',
    client_id: engagement?.client_id || '',
    engagement_type: engagement?.engagement_type || '',
    engagement_date: engagement?.engagement_date || new Date().toISOString().split('T')[0],
    engagement_outcome: engagement?.engagement_outcome || '',
    contact_person: engagement?.contact_person || '',
    recorded_by: engagement?.recorded_by || '',
    engagement_channel: engagement?.engagement_channel || '',
    engagement_notes: engagement?.engagement_notes || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(userData);

        if (!isEdit) {
          setFormData(prev => ({ ...prev, recorded_by: userData.name || '' }));
        }

        const customersRes = await fetch('/api/customers', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const customersData = await customersRes.json();
        if (customersData.success) {
          setCustomers(customersData.data.map(c => ({ value: c.id, label: c.customer_name })));
        }
      } catch (err) {
        console.error('Fetch data error:', err);
      }
    };

    fetchData();
  }, [isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEdit ? `/api/engagements/${engagement.id}` : '/api/engagements';
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
        throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} engagement`);
      }

      toast.success(`Engagement ${isEdit ? 'updated' : 'created'} successfully`);
      router.push('/engagements');
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
        <CardTitle>{isEdit ? 'Edit Engagement' : 'Log New Engagement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Engagement ID"
              value={formData.engagement_id}
              onChange={(value) => setFormData({ ...formData, engagement_id: value })}
              placeholder="AUTO or enter custom ID"
              disabled={isEdit}
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
              label="Engagement Type"
              value={formData.engagement_type}
              onChange={(value) => setFormData({ ...formData, engagement_type: value })}
              options={ENGAGEMENT_TYPES}
              required
            />

            <DatePicker
              label="Engagement Date"
              value={formData.engagement_date}
              onChange={(value) => setFormData({ ...formData, engagement_date: value })}
              required
            />

            <SelectDropdown
              label="Engagement Channel"
              value={formData.engagement_channel}
              onChange={(value) => setFormData({ ...formData, engagement_channel: value })}
              options={ENGAGEMENT_CHANNELS}
              required
            />

            <SelectDropdown
              label="Engagement Outcome"
              value={formData.engagement_outcome}
              onChange={(value) => setFormData({ ...formData, engagement_outcome: value })}
              options={ENGAGEMENT_OUTCOMES}
              required
            />

            <FormInput
              label="Contact Person"
              value={formData.contact_person}
              onChange={(value) => setFormData({ ...formData, contact_person: value })}
              required
            />

            <FormInput
              label="Recorded By"
              value={formData.recorded_by}
              onChange={(value) => setFormData({ ...formData, recorded_by: value })}
              disabled
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Engagement Notes</label>
            <Textarea
              value={formData.engagement_notes}
              onChange={(e) => setFormData({ ...formData, engagement_notes: e.target.value })}
              placeholder="Enter detailed notes about this engagement..."
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Engagement' : 'Create Engagement'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/engagements')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}