import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AudioEditorForm } from '../AudioEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewAudioPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl xl:max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          Upload Audio Journal
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Add an unedited voice note or spoken reflection.
        </p>
      </div>

      <AudioEditorForm isNew />
    </div>
  );
}
