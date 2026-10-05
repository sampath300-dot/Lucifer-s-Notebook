import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAudioJournalById } from '@/lib/db';
import { AudioEditorForm } from '../AudioEditorForm';

export const dynamic = 'force-dynamic';

export default async function EditAudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const audioId = parseInt(id, 10);
  const audio = getAudioJournalById(audioId);

  if (!audio) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          Edit Audio Journal
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Update audio file, recording details, or publication status.
        </p>
      </div>

      <AudioEditorForm initialAudio={audio} />
    </div>
  );
}
