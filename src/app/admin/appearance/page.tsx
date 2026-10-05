import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAppearanceSettings } from '@/lib/db';
import { AppearanceClient } from './AppearanceClient';

export const dynamic = 'force-dynamic';

export default async function AdminAppearancePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const appearance = getAppearanceSettings();

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-6">
      <AppearanceClient initialAppearance={appearance} />
    </div>
  );
}
