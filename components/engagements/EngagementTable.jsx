'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EngagementTable({ engagements, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      key: 'engagement_id',
      label: 'Engagement ID',
      sortable: true,
    },
    {
      key: 'engagement_type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'engagement_date',
      label: 'Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
      sortable: true,
    },
    {
      key: 'engagement_channel',
      label: 'Channel',
      sortable: true,
    },
    {
      key: 'engagement_outcome',
      label: 'Outcome',
      sortable: true,
      render: (value) => <StatusBadge status={value} type="engagement" />,
    },
    {
      key: 'recorded_by',
      label: 'Recorded By',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(row.id)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.id)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(row.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={engagements} />
      
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Engagement"
        description="Are you sure you want to delete this engagement? This action cannot be undone."
      />
    </>
  );
}