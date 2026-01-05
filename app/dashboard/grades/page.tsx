'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function GradesPage() {
  return (
    <DevelopmentInProgress
      title="Grades & Results Management"
      description="The grading system is being built to help you record and manage student academic performance."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Record exam and test scores",
        "Continuous assessment tracking",
        "Grade calculation and GPA computation",
        "Report card generation",
        "Academic performance analytics",
        "Parent access to grades and results",
      ]}
    />
  );
}
