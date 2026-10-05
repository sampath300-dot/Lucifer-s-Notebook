'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AudioJournal } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Plus, Edit3, Trash2, Globe, EyeOff, Search } from 'lucide-react';

interface AudioManagerClientProps {
  initialAudio: AudioJournal[];
}

export function AudioManagerClient({ initialAudio }: AudioManagerClientProps) {
  const [audioList, setAudioList] = useState<AudioJournal[]>(initialAudio);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/audio/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAudioList((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert('Failed to delete audio journal');
      }
    } catch {
      alert('Network error deleting audio');
    }
  };

  const handleToggleStatus = async (item: AudioJournal) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/audio/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setAudioList((prev) => prev.map((a) => (a.id === item.id ? updated : a)));
      }
    } catch {
      alert('Failed to toggle status');
    }
  };

  const filteredAudio = audioList.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
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
            placeholder="Search audio journals..."
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

      {/* Audio List */}
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden shadow-xs">
        {filteredAudio.length === 0 ? (
          <div className="p-12 text-center text-xs sm:text-sm text-[var(--theme-secondary)]">
            No audio journals found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {filteredAudio.map((item) => {
              const dateStr = new Date(item.published_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div key={item.id} className="p-5 space-y-4 hover:bg-[var(--theme-bg)]/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {item.status === 'published' ? <Globe className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span className="capitalize">{item.status}</span>
                        </span>
                        <span className="text-xs text-[var(--theme-secondary)]">•</span>
                        <span className="text-xs text-[var(--theme-secondary)]">{dateStr}</span>
                        <span className="text-xs text-[var(--theme-secondary)]">•</span>
                        <span className="text-xs text-[var(--theme-secondary)] tabular-nums">{item.duration}</span>
                      </div>

                      <h3 className="font-serif text-lg font-medium text-[var(--theme-text)]">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] line-clamp-2 max-w-2xl">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className="px-2.5 py-1 text-xs rounded border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
                      >
                        {item.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>

                      <Link
                        href={`/admin/audio/${item.id}`}
                        className="p-2 rounded hover:bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
                        title="Edit audio entry"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                        title="Delete audio entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Player Preview */}
                  <div className="max-w-xl">
                    <AudioPlayer src={item.audio_url} duration={item.duration} />
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
