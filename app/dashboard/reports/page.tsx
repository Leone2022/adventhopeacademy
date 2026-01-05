'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function ReportsPage() {
  return (
    <DevelopmentInProgress
      title="Reports & Analytics"
      description="The comprehensive reporting system is under development. Generate detailed reports for all school operations."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Student academic performance reports",
        "Financial reports and statements",
        "Attendance summary reports",
        "Staff performance analytics",
        "Custom report builder",
        "Export to PDF, Excel, and CSV",
      ]}
    />
  );
}
