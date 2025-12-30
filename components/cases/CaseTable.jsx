'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CaseTable({ cases, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      key: 'case_id',
      label: 'Case ID',
      sortable: true,
    },
    {
      key: 'case_title',
      label: 'Case Title',
      sortable: true,
    },
    {
      key: 'case_type',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'case_status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} type="case" />,
    },
    {
      key: 'assigned_attorney',
      label: 'Attorney',
      sortable: true,
    },
    {
      key: 'filing_date',
      label: 'Filing Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'hearing_date',
      label: 'Hearing Date',
      sortable: true,
      render: (value) => value ? formatDate(value) : 'N/A',
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
      <DataTable columns={columns} data={cases} />
      
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Case"
        description="Are you sure you want to delete this case? This action cannot be undone."
      />
    </>
  );
}