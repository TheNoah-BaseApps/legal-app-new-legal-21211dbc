import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';

export default function WorkflowProgress({ stats }) {
  const workflows = [
    {
      label: 'Customer Onboarding',
      current: stats?.totalCustomers || 0,
      icon: '👤',
    },
    {
      label: 'Case Management',
      current: stats?.activeCases || 0,
      icon: '📋',
    },
    {
      label: 'Client Engagement',
      current: stats?.recentEngagements || 0,
      icon: '💬',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {workflows.map((workflow, index) => (
            <div key={workflow.label} className="flex items-center gap-4 flex-1">
              <div className="text-center flex-1">
                <div className="text-3xl mb-2">{workflow.icon}</div>
                <div className="text-sm font-medium">{workflow.label}</div>
                <div className="text-2xl font-bold text-primary mt-2">
                  {workflow.current}
                </div>
              </div>
              {index < workflows.length - 1 && (
                <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}