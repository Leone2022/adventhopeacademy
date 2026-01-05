'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function ActivityPage() {
  return (
    <DevelopmentInProgress
      title="Activity Log"
      description="The activity log is being built to help you track all system activities and changes."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Comprehensive activity timeline",
        "Filter by user, date, or action type",
        "Student enrollment history",
        "Payment transaction logs",
        "System change audit trail",
        "Export activity reports",
      ]}
    />
  );
}
