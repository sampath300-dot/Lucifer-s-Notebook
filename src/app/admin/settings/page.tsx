import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getSiteSettings } from '@/lib/db';
import { SettingsClient } from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const settings = getSiteSettings();

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
