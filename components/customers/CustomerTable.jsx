'use client';

import { useState } from 'react';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomerTable({ customers, onDelete, onEdit, onView }) {
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    {
      key: 'customer_id',
      label: 'Customer ID',
      sortable: true,
    },
    {
      key: 'customer_name',
      label: 'Customer Name',
      sortable: true,
    },
    {
      key: 'contact_person',
      label: 'Contact Person',
      sortable: true,
    },
    {
      key: 'email_address',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'industry_type',
      label: 'Industry',
      sortable: true,
    },
    {
      key: 'customer_status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} type="customer" />,
    },
    {
      key: 'registration_date',
      label: 'Registration Date',
      sortable: true,
      render: (value) => formatDate(value),
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
      <DataTable columns={columns} data={customers} />
      
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => {
          onDelete(deleteId);
          setDeleteId(null);
        }}
        title="Delete Customer"
        description="Are you sure you want to delete this customer? This action cannot be undone."
      />
    </>
  );
}