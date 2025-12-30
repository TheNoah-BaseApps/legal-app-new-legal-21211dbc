import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_VARIANTS = {
  customer: {
    Active: 'bg-green-100 text-green-700 hover:bg-green-100',
    Inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    Prospective: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    Former: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  case: {
    Open: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    'In Progress': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    Pending: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
    Closed: 'bg-green-100 text-green-700 hover:bg-green-100',
    Settled: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  engagement: {
    Resolved: 'bg-green-100 text-green-700 hover:bg-green-100',
    Pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    'Follow-up Required': 'bg-orange-100 text-orange-700 hover:bg-orange-100',
    'No Action': 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
};

export default function StatusBadge({ status, type = 'customer' }) {
  const variants = STATUS_VARIANTS[type] || STATUS_VARIANTS.customer;
  const variant = variants[status] || 'bg-gray-100 text-gray-700';

  return (
    <Badge variant="secondary" className={cn(variant)}>
      {status}
    </Badge>
  );
}