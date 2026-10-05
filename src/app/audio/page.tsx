import React from 'react';
import { getAudioJournals, getSiteSettings } from '@/lib/db';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Headphones, Calendar, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Audio Journal — Spoken Reflections',
  description: 'Unedited audio entries, voice notes, and quiet reflections.',
};

export default async function AudioJournalPage() {
  const journals = getAudioJournals();
  const site = getSiteSettings();

  return (
    <div className="w-full py-12 sm:py-20">
      <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Page Header */}
        <div className="border-b border-[var(--theme-border)]/60 pb-8 mb-10 sm:mb-14">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--theme-accent)] font-semibold mb-2">
            <Headphones className="h-3.5 w-3.5" />
            <span>Spoken Notes</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--theme-text)]">
            Audio Journal
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-[var(--theme-secondary)] max-w-3xl leading-relaxed">
            Unedited voice memos and quiet reflections recorded along the way. Listening to a thought in someone&apos;s natural voice often reveals subtleties that writing leaves behind.
          </p>
        </div>

        {/* Audio Entries List - Expansive 2 Columns on Laptop / Desktop */}
        {journals.length === 0 ? (
          <div className="py-20 text-center text-[var(--theme-secondary)] border border-dashed border-[var(--theme-border)] rounded-2xl">
            <p className="font-serif text-xl">No audio journals published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {journals.map((entry) => {
              const dateStr = new Date(entry.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-7 sm:p-8 shadow-none flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[var(--theme-secondary)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={entry.published_at}>{dateStr}</time>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span className="tabular-nums font-medium">Duration: {entry.duration}</span>
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)] leading-snug">
                      {entry.title}
                    </h2>

                    {entry.description && (
                      <p className="text-base text-[var(--theme-secondary)] leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  {/* Clean Accessible Audio Player */}
                  <div className="pt-2">
                    <AudioPlayer
                      src={entry.audio_url}
                      duration={entry.duration}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
