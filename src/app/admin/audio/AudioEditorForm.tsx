'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AudioJournal } from '@/types';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import { ArrowLeft, Music, Image as ImageIcon, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface AudioEditorFormProps {
  initialAudio?: AudioJournal;
  isNew?: boolean;
}

export function AudioEditorForm({ initialAudio, isNew = false }: AudioEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialAudio?.title || '');
  const [description, setDescription] = useState(initialAudio?.description || '');
  const [audioUrl, setAudioUrl] = useState(initialAudio?.audio_url || '');
  const [duration, setDuration] = useState(initialAudio?.duration || '0:00');
  const [coverImage, setCoverImage] = useState(initialAudio?.cover_image || '');
  const [status, setStatus] = useState<'published' | 'draft'>(initialAudio?.status || 'published');
  const [publishedAt, setPublishedAt] = useState(
    initialAudio?.published_at ? initialAudio.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'audio' | 'image'>('audio');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (submitStatus: 'published' | 'draft') => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!audioUrl) {
      setError('Please select or upload an audio file');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      audio_url: audioUrl,
      duration: duration || '0:00',
      cover_image: coverImage || null,
      status: submitStatus,
      published_at: new Date(publishedAt).toISOString(),
    };

    try {
      const url = isNew ? '/api/audio' : `/api/audio/${initialAudio?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/audio');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save audio journal');
      }
    } catch {
      setError('Connection error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--theme-border)]">
        <Link
          href="/admin/audio"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to audio journal</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('draft')}
            className="px-3.5 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] hover:bg-[var(--theme-bg)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit('published')}
            className="px-4 py-1.5 text-xs rounded-md bg-[var(--theme-accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
          >
            {saving ? 'Saving...' : isNew ? 'Publish Audio' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-xs text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Audio file & details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio File Selection */}
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 space-y-4">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Audio File <span className="text-[var(--theme-accent)]">*</span>
            </label>

            {audioUrl ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-md bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Music className="h-4 w-4 text-[var(--theme-accent)] shrink-0" />
                    <span className="truncate font-mono">{audioUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioUrl('')}
                    className="p-1 text-[var(--theme-secondary)] hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove audio file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <AudioPlayer
                  src={audioUrl}
                  duration={duration}
                  onDurationDetected={(detected) => setDuration(detected)}
                />
              </div>
            ) : (
              <div
                onClick={() => {
                  setMediaPickerType('audio');
                  setShowMediaModal(true);
                }}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--theme-border)] rounded-md cursor-pointer hover:border-[var(--theme-accent)]/50 transition-colors text-center"
              >
                <Music className="h-8 w-8 text-[var(--theme-secondary)] mb-2" />
                <p className="font-medium text-xs sm:text-sm">Select or upload an audio recording</p>
                <p className="text-[11px] text-[var(--theme-secondary)] mt-0.5">
                  MP3, WAV, M4A, OGG supported
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setMediaPickerType('audio');
                setShowMediaModal(true);
              }}
              className="w-full py-2 text-xs font-medium rounded border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Choose from Media Library / Upload</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Title <span className="text-[var(--theme-accent)]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Late Evening Musings on Stillness"
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-base font-serif text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Description / Journal Notes
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context about this recording, what was happening, thoughts while recording..."
              className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-sm text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-y"
            />
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className="space-y-6">
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Duration (e.g. 5:24)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0:00"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] tabular-nums focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Recording Date
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Status
              </label>
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="audio_status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-[var(--theme-accent)]"
                  />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="audio_status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-[var(--theme-accent)]"
                  />
                  <span>Draft</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        acceptType={mediaPickerType}
        title={mediaPickerType === 'audio' ? 'Choose Audio File' : 'Choose Cover Image'}
        onSelect={(url) => {
          if (mediaPickerType === 'audio') {
            setAudioUrl(url);
          } else {
            setCoverImage(url);
          }
        }}
      />
    </div>
  );
}
