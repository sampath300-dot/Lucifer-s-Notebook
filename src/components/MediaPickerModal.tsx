'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/types';
import { X, Upload, Check, Music, Image as ImageIcon, Search } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  acceptType?: 'all' | 'image' | 'audio';
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  acceptType = 'all',
  title = 'Select Media',
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
        const newItem: MediaItem = await res.json();
        setItems((prev) => [newItem, ...prev]);
        setSelectedUrl(newItem.url);
        onSelect(newItem.url, newItem);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.original_name.toLowerCase().includes(search.toLowerCase());
    if (acceptType === 'image') return matchesSearch && item.mime_type.startsWith('image/');
    if (acceptType === 'audio') return matchesSearch && item.mime_type.startsWith('audio/');
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-[var(--theme-text)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--theme-border)]">
          <h3 className="font-serif text-lg font-medium">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--theme-secondary)] hover:text-[var(--theme-text)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[var(--theme-border)] px-4 bg-[var(--theme-bg)]">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
            }`}
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
            }`}
          >
            Upload New File
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {activeTab === 'upload' ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--theme-border)] rounded-lg p-10 text-center">
              <Upload className="h-10 w-10 text-[var(--theme-secondary)] mb-3" />
              <p className="font-medium text-sm mb-1">Upload an image or audio file</p>
              <p className="text-xs text-[var(--theme-secondary)] mb-4">
                Supported formats: PNG, JPG, WEBP, SVG, MP3, WAV, M4A, OGG
              </p>
              <label className="cursor-pointer bg-[var(--theme-accent)] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                {uploading ? 'Uploading...' : 'Browse Computer'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept={
                    acceptType === 'image'
                      ? 'image/*'
                      : acceptType === 'audio'
                      ? 'audio/*'
                      : 'image/*,audio/*'
                  }
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--theme-secondary)]" />
                <input
                  type="text"
                  placeholder="Filter media files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>

              {loading ? (
                <p className="text-center py-10 text-sm text-[var(--theme-secondary)]">Loading media...</p>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-sm text-[var(--theme-secondary)]">
                  <p>No media files found.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-2 text-xs text-[var(--theme-accent)] underline cursor-pointer"
                  >
                    Upload a file now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredItems.map((item) => {
                    const isImage = item.mime_type.startsWith('image/');
                    const isSelected = selectedUrl === item.url;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        className={`group relative rounded-md border p-2 flex flex-col items-center justify-center cursor-pointer transition-all aspect-square ${
                          isSelected
                            ? 'border-[var(--theme-accent)] ring-2 ring-[var(--theme-accent)]/30 bg-[var(--theme-bg)]'
                            : 'border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50 bg-[var(--theme-bg)]/40'
                        }`}
                      >
                        {isImage ? (
                          <img
                            src={item.url}
                            alt={item.original_name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <Music className="h-8 w-8 text-[var(--theme-accent)] mb-1" />
                            <span className="text-[10px] text-[var(--theme-secondary)] truncate max-w-[80px]">
                              {item.original_name}
                            </span>
                          </div>
                        )}

                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[var(--theme-accent)] text-white p-0.5 rounded-full shadow-xs">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-[var(--theme-border)] bg-[var(--theme-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded border border-[var(--theme-border)] hover:bg-[var(--theme-card)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedUrl}
            onClick={() => {
              if (selectedUrl) {
                const item = items.find((i) => i.url === selectedUrl);
                onSelect(selectedUrl, item);
                onClose();
              }
            }}
            className="px-4 py-1.5 text-xs rounded bg-[var(--theme-accent)] text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
          >
            Choose Selected
          </button>
        </div>
      </div>
    </div>
  );
}
