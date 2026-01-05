'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function CalendarPage() {
  return (
    <DevelopmentInProgress
      title="School Calendar"
      description="The school calendar module is under development. Plan and view all school events in one place."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "Academic calendar with term dates",
        "Event scheduling and management",
        "Exam timetable integration",
        "Holiday and break schedules",
        "Parent and staff notifications",
        "Calendar export and sync",
      ]}
    />
  );
}
