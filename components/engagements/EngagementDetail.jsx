'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Calendar, User, MessageSquare, Phone } from 'lucide-react';

export default function EngagementDetail({ engagement }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Engagement ID</div>
              <div className="font-medium">{engagement.engagement_id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Outcome</div>
              <StatusBadge status={engagement.engagement_outcome} type="engagement" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <Badge variant="outline">{engagement.engagement_type}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Channel</div>
              <Badge variant="outline">{engagement.engagement_channel}</Badge>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{formatDate(engagement.engagement_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Contact: {engagement.contact_person}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Recorded by: {engagement.recorded_by}</span>
            </div>
          </div>

          {engagement.engagement_notes && (
            <div className="pt-4">
              <div className="text-sm text-muted-foreground mb-2">Notes</div>
              <div className="p-4 bg-gray-50 rounded-lg text-sm">
                {engagement.engagement_notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}