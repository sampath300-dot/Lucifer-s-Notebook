'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Thought } from '@/types';
import { Plus, Edit3, Trash2, Globe, EyeOff, Search, ExternalLink } from 'lucide-react';

interface ThoughtsManagerClientProps {
  initialThoughts: Thought[];
}

export function ThoughtsManagerClient({ initialThoughts }: ThoughtsManagerClientProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/thoughts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setThoughts((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Failed to delete thought');
      }
    } catch {
      alert('Network error deleting thought');
    }
  };

  const handleToggleStatus = async (thought: Thought) => {
    const newStatus = thought.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/thoughts/${thought.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setThoughts((prev) => prev.map((t) => (t.id === thought.id ? updated : t)));
      }
    } catch {
      alert('Failed to toggle status');
    }
  };

  const filteredThoughts = thoughts.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--theme-secondary)]" />
          <input
            type="text"
            placeholder="Search thoughts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'published', 'draft'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-[var(--theme-accent)] text-white'
                  : 'bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Thoughts Table / List */}
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden shadow-xs">
        {filteredThoughts.length === 0 ? (
          <div className="p-12 text-center text-xs sm:text-sm text-[var(--theme-secondary)]">
            No thoughts found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {filteredThoughts.map((t) => {
              const dateStr = new Date(t.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={t.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--theme-bg)]/50 transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          t.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {t.status === 'published' ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span className="capitalize">{t.status}</span>
                      </span>
                      <span className="text-xs text-[var(--theme-secondary)]">•</span>
                      <span className="text-xs text-[var(--theme-secondary)]">{t.category}</span>
                      <span className="text-xs text-[var(--theme-secondary)]">•</span>
                      <span className="text-xs text-[var(--theme-secondary)]">{dateStr}</span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[var(--theme-text)] truncate max-w-xl">
                      {t.title}
                    </h3>

                    <p className="text-xs text-[var(--theme-secondary)] line-clamp-1 max-w-2xl">
                      {t.excerpt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {t.status === 'published' && (
                      <Link
                        href={`/thoughts/${t.slug}`}
                        target="_blank"
                        title="View live thought"
                        className="p-2 rounded hover:bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t)}
                      title={t.status === 'published' ? 'Unpublish thought' : 'Publish thought'}
                      className="px-2.5 py-1 text-xs rounded border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
                    >
                      {t.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    <Link
                      href={`/admin/thoughts/${t.id}`}
                      className="p-2 rounded hover:bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
                      title="Edit thought"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(t.id, t.title)}
                      className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete thought"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
