'use client';

import DevelopmentInProgress from '@/components/ui/DevelopmentInProgress';

export default function SettingsPage() {
  return (
    <DevelopmentInProgress
      title="System Settings"
      description="The settings module is being developed to help you customize the school management system."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      features={[
        "School profile and branding settings",
        "Academic year and term configuration",
        "Fee structure management",
        "User roles and permissions",
        "Notification preferences",
        "System backup and restore",
      ]}
    />
  );
}
