import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getMediaList } from '@/lib/db';
import { MediaManagerClient } from './MediaManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const mediaList = getMediaList();

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          Media Library
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Upload and organize cover images, audio files, portraits, and background artwork.
        </p>
      </div>

      <MediaManagerClient initialMedia={mediaList} />
    </div>
  );
}
