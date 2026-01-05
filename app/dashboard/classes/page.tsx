'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function ClassesPage() {
  return (
    <DevelopmentInProgress
      title="Classes Management"
      description="The class management module is currently being developed. Soon you'll be able to manage all class-related operations from here."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Create and manage classes/forms",
        "Assign class teachers and subject teachers",
        "Manage class schedules and timetables",
        "View class rosters and student lists",
        "Set up class-specific fee structures",
        "Generate class reports and statistics",
      ]}
    />
  );
}
