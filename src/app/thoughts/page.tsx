import React from 'react';
import Link from 'next/link';
import { getThoughts, getSiteSettings } from '@/lib/db';
import { ArrowRight, Search } from 'lucide-react';
import { ThoughtsArchiveClient } from './ThoughtsArchiveClient';

export const dynamic = 'force-dynamic';

export default async function ThoughtsPage() {
  const thoughts = getThoughts();
  const site = getSiteSettings();

  return (
    <div className="w-full py-12 sm:py-20">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Page Header */}
        <div className="border-b border-[var(--theme-border)] pb-8 mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--theme-text)]">
            Thoughts
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--theme-secondary)] max-w-2xl leading-relaxed">
            Things I&apos;ve been thinking about, learning from, and trying to understand.
          </p>
        </div>

        {/* Client filter & list */}
        <ThoughtsArchiveClient initialThoughts={thoughts} />
      </div>
    </div>
  );
}
