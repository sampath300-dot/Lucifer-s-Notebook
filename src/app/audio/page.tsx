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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="border-b border-[var(--theme-border)] pb-8 mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--theme-accent)] font-semibold mb-2">
            <Headphones className="h-4 w-4" />
            <span>Spoken Notes</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--theme-text)]">
            Audio Journal
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--theme-secondary)] max-w-2xl leading-relaxed">
            Unedited voice memos and quiet reflections recorded along the way. Listening to a thought in someone&apos;s natural voice often reveals subtleties that writing leaves behind.
          </p>
        </div>

        {/* Audio Entries List */}
        {journals.length === 0 ? (
          <div className="py-16 text-center text-[var(--theme-secondary)] border border-dashed border-[var(--theme-border)] rounded-lg">
            <p className="font-serif text-lg">No audio journals published yet.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {journals.map((entry) => {
              const dateStr = new Date(entry.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-6 sm:p-8 shadow-xs space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--theme-secondary)]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <time dateTime={entry.published_at}>{dateStr}</time>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="tabular-nums font-medium">Duration: {entry.duration}</span>
                      </div>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
                      {entry.title}
                    </h2>

                    {entry.description && (
                      <p className="text-sm sm:text-base text-[var(--theme-secondary)] leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>

                  {/* Clean Accessible Audio Player */}
                  <AudioPlayer
                    src={entry.audio_url}
                    duration={entry.duration}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
