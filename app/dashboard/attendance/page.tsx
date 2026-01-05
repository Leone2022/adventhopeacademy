'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function AttendancePage() {
  return (
    <DevelopmentInProgress
      title="Attendance Management"
      description="The attendance tracking system is under development. You'll soon be able to manage daily attendance records efficiently."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Daily attendance marking for all classes",
        "Attendance reports by student, class, or date range",
        "Late arrival and early departure tracking",
        "Automated parent notifications for absences",
        "Attendance statistics and analytics",
        "Export attendance data for reporting",
      ]}
    />
  );
}
