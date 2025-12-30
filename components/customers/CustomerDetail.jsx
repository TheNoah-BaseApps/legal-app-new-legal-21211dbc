'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TabNavigation from '@/components/shared/TabNavigation';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Mail, Phone, MapPin, Calendar, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomerDetail({ customer, cases, engagements }) {
  const router = useRouter();

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Customer ID</div>
                  <div className="font-medium">{customer.customer_id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <StatusBadge status={customer.customer_status} type="customer" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Contact Person</div>
                  <div className="font-medium">{customer.contact_person}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Industry Type</div>
                  <Badge variant="outline">{customer.industry_type}</Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email_address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.contact_number}</span>
                </div>
                {customer.address_line && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.address_line}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Registered on {formatDate(customer.registration_date)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      label: `Cases (${cases.length})`,
      value: 'cases',
      content: (
        <div className="space-y-4">
          {cases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cases found for this customer</p>
              </CardContent>
            </Card>
          ) : (
            cases.map((caseItem) => (
              <Card 
                key={caseItem.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/cases/${caseItem.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{caseItem.case_title}</CardTitle>
                    <StatusBadge status={caseItem.case_status} type="case" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Case ID</div>
                      <div className="font-medium">{caseItem.case_id}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Case Type</div>
                      <div className="font-medium">{caseItem.case_type}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Attorney</div>
                      <div className="font-medium">{caseItem.assigned_attorney}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Filing Date</div>
                      <div className="font-medium">{formatDate(caseItem.filing_date)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
    {
      label: `Engagements (${engagements.length})`,
      value: 'engagements',
      content: (
        <div className="space-y-4">
          {engagements.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No engagements found for this customer</p>
              </CardContent>
            </Card>
          ) : (
            engagements.map((engagement) => (
              <Card 
                key={engagement.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/engagements/${engagement.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{engagement.engagement_type}</CardTitle>
                    <StatusBadge status={engagement.engagement_outcome} type="engagement" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Date</div>
                      <div className="font-medium">{formatDate(engagement.engagement_date)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Channel</div>
                      <div className="font-medium">{engagement.engagement_channel}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Contact Person</div>
                      <div className="font-medium">{engagement.contact_person}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ),
    },
  ];

  return <TabNavigation tabs={tabs} />;
}