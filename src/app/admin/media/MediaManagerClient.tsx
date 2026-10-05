'use client';

import React, { useState } from 'react';
import { MediaItem } from '@/types';
import { Upload, Music, Image as ImageIcon, Trash2, Copy, Check, Search, ExternalLink } from 'lucide-react';

interface MediaManagerClientProps {
  initialMedia: MediaItem[];
}

export function MediaManagerClient({ initialMedia }: MediaManagerClientProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'audio'>('all');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newItem = await res.json();
        setMediaList((prev) => [newItem, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload');
      }
    } catch {
      alert('Upload failed due to connection error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete media file "${name}"?`)) return;

    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert('Failed to delete file');
      }
    } catch {
      alert('Network error deleting media');
    }
  };

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filtered = mediaList.filter((m) => {
    const matchesSearch = m.original_name.toLowerCase().includes(search.toLowerCase());
    if (filterType === 'image') return matchesSearch && m.mime_type.startsWith('image/');
    if (filterType === 'audio') return matchesSearch && m.mime_type.startsWith('audio/');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="p-6 rounded-xl border-2 border-dashed border-[var(--theme-border)] bg-[var(--theme-card)]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[var(--theme-accent)]/15 text-[var(--theme-accent)] shrink-0">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-medium text-[var(--theme-text)]">
              Upload New Media
            </h3>
            <p className="text-xs text-[var(--theme-secondary)]">
              Upload images (PNG, JPG, SVG, WEBP) or audio recordings (MP3, WAV, M4A) to reuse across the website.
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-[var(--theme-accent)] text-white px-4 py-2 rounded-md text-xs font-medium hover:opacity-90 transition-opacity shrink-0 shadow-xs">
          {uploading ? 'Uploading...' : 'Choose File to Upload'}
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="image/*,audio/*"
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--theme-secondary)]" />
          <input
            type="text"
            placeholder="Search filenames..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'image', 'audio'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-[var(--theme-accent)] text-white'
                  : 'bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              {type === 'all' ? 'All Files' : type === 'image' ? 'Images' : 'Audio'}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-xs sm:text-sm text-[var(--theme-secondary)] border border-dashed border-[var(--theme-border)] rounded-lg">
          No media files found.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => {
            const isImage = item.mime_type.startsWith('image/');
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden shadow-xs flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-[var(--theme-bg)] flex items-center justify-center overflow-hidden border-b border-[var(--theme-border)]">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.original_name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <Music className="h-10 w-10 text-[var(--theme-accent)] mb-2" />
                      <span className="text-[10px] text-[var(--theme-secondary)] uppercase tracking-wider font-semibold">
                        Audio File
                      </span>
                    </div>
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Info & Actions */}
                <div className="p-3 space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-[var(--theme-text)] truncate" title={item.original_name}>
                      {item.original_name}
                    </p>
                    <p className="text-[10px] text-[var(--theme-secondary)]">
                      {formatFileSize(item.size)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[var(--theme-border)]/60 text-xs">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.url)}
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.original_name)}
                      className="p-1 text-[var(--theme-secondary)] hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
