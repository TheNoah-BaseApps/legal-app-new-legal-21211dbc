'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Calendar, User, Building2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaseDetail({ caseData }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Case ID</div>
              <div className="font-medium">{caseData.case_id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <StatusBadge status={caseData.case_status} type="case" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Case Type</div>
              <Badge variant="outline">{caseData.case_type}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Assigned Attorney</div>
              <div className="font-medium">{caseData.assigned_attorney}</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Filed on {formatDate(caseData.filing_date)}</span>
            </div>
            {caseData.hearing_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Hearing scheduled for {formatDate(caseData.hearing_date)}</span>
              </div>
            )}
            {caseData.court_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{caseData.court_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {caseData.customer_name && (
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/customers/${caseData.client_id}`)}
            >
              <div className="flex items-center gap-3">
                <User className="h-10 w-10 text-muted-foreground" />
                <div>
                  <div className="font-medium">{caseData.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{caseData.customer_email}</div>
                </div>
              </div>
              <Badge variant="outline">View Profile</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}