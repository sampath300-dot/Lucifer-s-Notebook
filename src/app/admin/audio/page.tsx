import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAudioJournals } from '@/lib/db';
import { Plus } from 'lucide-react';
import { AudioManagerClient } from './AudioManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminAudioPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const audioList = getAudioJournals(true); // include drafts

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
            Audio Journal
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
            Upload and manage voice notes, spoken journals, and recordings.
          </p>
        </div>

        <Link
          href="/admin/audio/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-md bg-[var(--theme-accent)] text-white hover:opacity-90 transition-opacity shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Audio</span>
        </Link>
      </div>

      <AudioManagerClient initialAudio={audioList} />
    </div>
  );
}
