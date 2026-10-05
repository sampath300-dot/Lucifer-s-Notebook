'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Thought } from '@/types';
import { RichTextEditor } from '@/components/RichTextEditor';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import { ArrowLeft, Image as ImageIcon, Save, Check, X } from 'lucide-react';
import Link from 'next/link';

interface ThoughtEditorFormProps {
  initialThought?: Thought;
  isNew?: boolean;
}

export function ThoughtEditorForm({ initialThought, isNew = false }: ThoughtEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialThought?.title || '');
  const [slug, setSlug] = useState(initialThought?.slug || '');
  const [excerpt, setExcerpt] = useState(initialThought?.excerpt || '');
  const [content, setContent] = useState(initialThought?.content || '');
  const [coverImage, setCoverImage] = useState(initialThought?.cover_image || '');
  const [category, setCategory] = useState(initialThought?.category || 'Reflections');
  const [tags, setTags] = useState(initialThought?.tags || '');
  const [status, setStatus] = useState<'published' | 'draft'>(initialThought?.status || 'published');
  const [publishedAt, setPublishedAt] = useState(
    initialThought?.published_at ? initialThought.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );

  const [showMediaModal, setShowMediaModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && (!slug || slug === autoSlug(title))) {
      setSlug(autoSlug(val));
    }
  };

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleSubmit = async (submitStatus: 'published' | 'draft') => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      slug: slug || autoSlug(title),
      excerpt: excerpt || content.replace(/<[^>]*>?/gm, '').substring(0, 160),
      content,
      cover_image: coverImage || null,
      category,
      tags,
      status: submitStatus,
      published_at: new Date(publishedAt).toISOString(),
    };

    try {
      const url = isNew ? '/api/thoughts' : `/api/thoughts/${initialThought?.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/admin/thoughts');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save thought');
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
          href="/admin/thoughts"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to thoughts</span>
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
            {saving ? 'Saving...' : isNew ? 'Publish Thought' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md border border-red-200 bg-red-50 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Title, Excerpt, Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Title <span className="text-[var(--theme-accent)]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Quiet Between Our Thoughts"
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-base font-serif text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--theme-secondary)]">
              URL Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="the-quiet-between-our-thoughts"
              className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-xs font-mono text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Short Excerpt / Subtitle
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A brief summary shown in article previews..."
              className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-xs sm:text-sm text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Article Content <span className="text-[var(--theme-accent)]">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your article here..."
              minHeight="400px"
            />
          </div>
        </div>

        {/* Right Column: Settings & Metadata */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 space-y-3">
            <label className="block text-xs font-semibold text-[var(--theme-text)]">
              Cover Image
            </label>

            {coverImage ? (
              <div className="relative rounded-md overflow-hidden border border-[var(--theme-border)] aspect-16/10">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setShowMediaModal(true)}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--theme-border)] rounded-md cursor-pointer hover:border-[var(--theme-accent)]/50 transition-colors text-center"
              >
                <ImageIcon className="h-6 w-6 text-[var(--theme-secondary)] mb-1" />
                <span className="text-xs text-[var(--theme-secondary)]">Choose or upload image</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowMediaModal(true)}
              className="w-full py-1.5 text-xs font-medium rounded border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
            >
              Select from Media Library
            </button>
          </div>

          {/* Category & Tags */}
          <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Reflections, Growth, Honesty"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Stillness, Listening, Mindset"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">
                Publication Date
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
                    name="status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-[var(--theme-accent)]"
                  />
                  <span>Published</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
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
        acceptType="image"
        title="Choose Cover Image"
        onSelect={(url) => setCoverImage(url)}
      />
    </div>
  );
}
