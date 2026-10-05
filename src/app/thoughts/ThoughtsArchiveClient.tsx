'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Thought } from '@/types';
import { Search, ArrowRight } from 'lucide-react';

interface ThoughtsArchiveClientProps {
  initialThoughts: Thought[];
}

export function ThoughtsArchiveClient({ initialThoughts }: ThoughtsArchiveClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
    <div className="space-y-10">
      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--theme-accent)] text-white'
                  : 'bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--theme-secondary)]" />
          <input
            type="text"
            placeholder="Search thoughts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md text-[var(--theme-text)] placeholder-[var(--theme-secondary)]/70 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
          />
        </div>
      </div>

      {/* List of Thoughts */}
      {filteredThoughts.length === 0 ? (
        <div className="py-16 text-center text-[var(--theme-secondary)] border border-dashed border-[var(--theme-border)] rounded-lg">
          <p className="font-serif text-lg">No reflections match your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
            className="mt-2 text-xs text-[var(--theme-accent)] underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-12 divide-y divide-[var(--theme-border)]/70">
          {filteredThoughts.map((thought, idx) => {
            const dateStr = new Date(thought.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            // Calculate reading time estimate (~200 words/min)
            const words = thought.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
            const readMinutes = Math.max(1, Math.ceil(words / 180));

            return (
              <article
                key={thought.id}
                className={`group ${idx > 0 ? 'pt-12' : ''} flex flex-col md:flex-row gap-6 md:gap-8 items-start`}
              >
                {thought.cover_image && (
                  <Link
                    href={`/thoughts/${thought.slug}`}
                    className="w-full md:w-60 shrink-0 aspect-16/10 rounded-md overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)]"
                  >
                    <img
                      src={thought.cover_image}
                      alt={thought.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </Link>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[var(--theme-secondary)]">
                    <time dateTime={thought.published_at}>{dateStr}</time>
                    <span>•</span>
                    <span>{readMinutes} min read</span>
                    <span>•</span>
                    <span className="font-medium text-[var(--theme-accent)]">{thought.category}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors leading-snug">
                    <Link href={`/thoughts/${thought.slug}`}>
                      {thought.title}
                    </Link>
                  </h2>

                  <p className="text-base text-[var(--theme-secondary)] leading-relaxed">
                    {thought.excerpt}
                  </p>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/thoughts/${thought.slug}`}
                      className="text-xs sm:text-sm font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Read article</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>

                    {thought.tags && (
                      <div className="hidden sm:flex gap-1.5">
                        {thought.tags.split(',').map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] px-2 py-0.5 rounded bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)]"
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
