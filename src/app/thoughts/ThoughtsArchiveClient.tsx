'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Thought } from '@/types';
import { Search, ArrowRight, LayoutGrid, List } from 'lucide-react';

interface ThoughtsArchiveClientProps {
  initialThoughts: Thought[];
}

export function ThoughtsArchiveClient({ initialThoughts }: ThoughtsArchiveClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Derive unique categories
  const categories = ['All', ...Array.from(new Set(initialThoughts.map((t) => t.category).filter(Boolean)))];

  const filteredThoughts = initialThoughts.filter((thought) => {
    const matchesSearch =
      thought.title.toLowerCase().includes(search.toLowerCase()) ||
      thought.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      (thought.tags && thought.tags.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || thought.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Search, Category Filters, and Layout Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Categories with mobile swipeable scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[42px] px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[var(--theme-accent)] text-white shadow-none'
                  : 'bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right side: Search and View Mode Switcher */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-80 lg:w-96 shrink-0">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--theme-secondary)]" />
            <input
              type="text"
              placeholder="Search thoughts & essays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base sm:text-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/70 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] min-h-[44px]"
            />
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:inline-flex items-center rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-1 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid layout"
              className={`p-2 rounded-md cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--theme-accent)] text-white shadow-none'
                  : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List layout"
              className={`p-2 rounded-md cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--theme-accent)] text-white shadow-none'
                  : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Thoughts Display */}
      {filteredThoughts.length === 0 ? (
        <div className="py-20 text-center text-[var(--theme-secondary)] border border-dashed border-[var(--theme-border)] rounded-2xl">
          <p className="font-serif text-xl">No reflections match your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-sm text-[var(--theme-accent)] underline cursor-pointer py-1"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Expansive 3-Column Editorial Grid on Widescreen & Laptop */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12">
          {filteredThoughts.map((thought) => {
            const dateStr = new Date(thought.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const words = thought.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
            const readMinutes = Math.max(1, Math.ceil(words / 180));

            return (
              <article
                key={thought.id}
                className="group flex flex-col justify-between rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-6 sm:p-7 hover:border-[var(--theme-accent)]/60 transition-all shadow-none"
              >
                <div className="space-y-4">
                  {thought.cover_image && (
                    <Link
                      href={`/thoughts/${thought.slug}`}
                      className="block w-full aspect-16/10 rounded-xl overflow-hidden border border-[var(--theme-border)]/60 bg-[var(--theme-bg)]"
                    >
                      <img
                        src={thought.cover_image}
                        alt={thought.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </Link>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-xs text-[var(--theme-secondary)]">
                      <time dateTime={thought.published_at}>{dateStr}</time>
                      <span>•</span>
                      <span>{readMinutes} min read</span>
                      <span>•</span>
                      <span className="font-medium text-[var(--theme-accent)]">{thought.category}</span>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors leading-snug">
                      <Link href={`/thoughts/${thought.slug}`}>
                        {thought.title}
                      </Link>
                    </h2>

                    <p className="text-sm sm:text-base text-[var(--theme-secondary)] leading-relaxed line-clamp-3">
                      {thought.excerpt}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[var(--theme-border)]/50 flex items-center justify-between gap-3">
                  <Link
                    href={`/thoughts/${thought.slug}`}
                    className="text-xs sm:text-sm font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] inline-flex items-center gap-1.5 transition-colors py-1"
                  >
                    <span>Read reflection</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  {thought.tags && (
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      {thought.tags.split(',').slice(0, 2).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-border)] text-[var(--theme-secondary)]"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Wide Editorial List on Laptop / Widescreen */
        <div className="space-y-12 sm:space-y-16 divide-y divide-[var(--theme-border)]/60">
          {filteredThoughts.map((thought, idx) => {
            const dateStr = new Date(thought.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const words = thought.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
            const readMinutes = Math.max(1, Math.ceil(words / 180));

            return (
              <article
                key={thought.id}
                className={`group ${idx > 0 ? 'pt-12 sm:pt-16' : ''} flex flex-col lg:flex-row gap-8 lg:gap-12 items-start`}
              >
                {thought.cover_image && (
                  <Link
                    href={`/thoughts/${thought.slug}`}
                    className="w-full lg:w-[420px] xl:w-[480px] shrink-0 aspect-16/10 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)]"
                  >
                    <img
                      src={thought.cover_image}
                      alt={thought.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </Link>
                )}

                <div className="flex-1 space-y-3.5">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[var(--theme-secondary)]">
                    <time dateTime={thought.published_at}>{dateStr}</time>
                    <span>•</span>
                    <span>{readMinutes} min read</span>
                    <span>•</span>
                    <span className="font-medium text-[var(--theme-accent)]">{thought.category}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors leading-snug">
                    <Link href={`/thoughts/${thought.slug}`}>
                      {thought.title}
                    </Link>
                  </h2>

                  <p className="text-base sm:text-lg text-[var(--theme-secondary)] leading-relaxed line-clamp-3">
                    {thought.excerpt}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/thoughts/${thought.slug}`}
                      className="text-sm font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] inline-flex items-center gap-1.5 transition-colors py-1"
                    >
                      <span>Read reflection</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {thought.tags && (
                      <div className="hidden sm:flex gap-2">
                        {thought.tags.split(',').map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-xs px-3 py-1 rounded-full bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)]"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
