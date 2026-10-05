import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getThoughtBySlug, getThoughts } from '@/lib/db';
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const thought = getThoughtBySlug(slug);
  if (!thought) return { title: 'Thought not found' };

  return {
    title: `${thought.title} — Thoughts`,
    description: thought.excerpt,
  };
}

export default async function IndividualThoughtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thought = getThoughtBySlug(slug);

  if (!thought) {
    notFound();
  }

  const dateStr = new Date(thought.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate reading time
  const words = thought.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readMinutes = Math.max(1, Math.ceil(words / 180));

  // Related thoughts (same category or recent, excluding current)
  const allThoughts = getThoughts();
  const related = allThoughts
    .filter((t) => t.id !== thought.id)
    .slice(0, 2);

  return (
    <div className="w-full py-10 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to all thoughts</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 pb-8 border-b border-[var(--theme-border)]/70">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--theme-secondary)]">
            <span className="font-semibold uppercase tracking-wider text-[var(--theme-accent)]">
              {thought.category}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={thought.published_at}>{dateStr}</time>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{readMinutes} min read</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[var(--theme-text)] leading-[1.25]">
            {thought.title}
          </h1>

          {thought.excerpt && (
            <p className="font-serif text-lg sm:text-xl text-[var(--theme-secondary)] italic leading-relaxed pt-1">
              {thought.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image if present */}
        {thought.cover_image && (
          <div className="my-8 rounded-lg overflow-hidden border border-[var(--theme-border)] shadow-xs">
            <img
              src={thought.cover_image}
              alt={thought.title}
              className="w-full h-auto max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <main className="py-6">
          <div
            className="editorial-prose"
            dangerouslySetInnerHTML={{ __html: thought.content }}
          />
        </main>

        {/* Tags */}
        {thought.tags && (
          <div className="pt-8 pb-12 border-b border-[var(--theme-border)]/70 flex flex-wrap items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-[var(--theme-secondary)] mr-1" />
            {thought.tags.split(',').map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)]"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Reach out CTA block */}
        <div className="my-12 p-6 sm:p-8 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)]/50 text-center space-y-4">
          <h3 className="font-serif text-xl sm:text-2xl text-[var(--theme-text)] font-medium">
            Did this bring something to mind?
          </h3>
          <p className="text-sm text-[var(--theme-secondary)] max-w-md mx-auto leading-relaxed">
            If you found yourself reflecting on something while reading, you are welcome to reach out and talk through it.
          </p>
          <div>
            <Link
              href="/talk"
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium bg-[var(--theme-accent)] text-white rounded-md hover:opacity-90 transition-opacity"
            >
              Start a private conversation
            </Link>
          </div>
        </div>

        {/* Related Thoughts */}
        {related.length > 0 && (
          <div className="pt-8 space-y-6">
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[var(--theme-text)]">
              More Thoughts
            </h2>

            <div className="grid gap-6 sm:grid-cols-2">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/thoughts/${rel.slug}`}
                  className="group p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-[var(--theme-accent)]/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-xs text-[var(--theme-accent)] font-medium">
                      {rel.category}
                    </span>
                    <h3 className="font-serif text-lg font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-[var(--theme-secondary)] line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 text-xs font-medium text-[var(--theme-text)] inline-flex items-center gap-1 group-hover:text-[var(--theme-accent)]">
                    <span>Read reflection</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
