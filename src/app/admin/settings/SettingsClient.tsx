'use client';

import React, { useState } from 'react';
import { SiteSettings } from '@/types';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import {
  Save,
  Check,
  Home,
  User,
  Share2,
  Globe,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SettingsClientProps {
  initialSettings: SiteSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'home' | 'identity' | 'contact' | 'seo'>('home');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<keyof SiteSettings | null>(null);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field: keyof SiteSettings) => {
    const current = settings[field] === 'true';
    handleChange(field, current ? 'false' : 'true');
  };

  const handleOpenMedia = (field: keyof SiteSettings) => {
    setMediaTargetField(field);
    setShowMediaModal(true);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save settings');
      }
    } catch {
      alert('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)]">
        <div>
          <h2 className="font-serif text-lg font-medium text-[var(--theme-text)]">
            Website & Homepage Settings
          </h2>
          <p className="text-xs text-[var(--theme-secondary)]">
            Configure homepage copy, section visibility, profile information, and SEO.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md bg-[var(--theme-accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs self-start sm:self-auto"
        >
          {saving ? (
            <span>Saving...</span>
          ) : saveSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-[var(--theme-border)]">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'home'
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
              : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Homepage Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'identity'
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
              : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>Site & Owner Identity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'contact'
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
              : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Contact & Social</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
            activeTab === 'seo'
              ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
              : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>SEO & Metadata</span>
        </button>
      </div>

      {/* TAB 1: HOMEPAGE CONTENT */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Section Visibility Toggles */}
          <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-3">
            <h3 className="font-serif text-base font-medium text-[var(--theme-text)]">
              Section Visibility
            </h3>
            <p className="text-xs text-[var(--theme-secondary)]">
              Easily turn homepage sections on or off without altering layout balance.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {[
                { field: 'show_hero' as const, label: 'Hero Section' },
                { field: 'show_intro' as const, label: 'Introduction' },
                { field: 'show_thoughts' as const, label: 'Recent Thoughts' },
                { field: 'show_audio' as const, label: 'Audio Journal' },
                { field: 'show_talk' as const, label: "Let's Talk CTA" },
              ].map((item) => {
                const isVisible = settings[item.field] !== 'false';
                return (
                  <button
                    key={item.field}
                    type="button"
                    onClick={() => handleToggle(item.field)}
                    className={`flex flex-col items-center justify-center p-3 rounded-md border text-xs transition-colors cursor-pointer text-center gap-1.5 ${
                      isVisible
                        ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] font-medium'
                        : 'border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-secondary)]'
                    }`}
                  >
                    {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Section Content */}
          <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
            <h3 className="font-serif text-base font-medium text-[var(--theme-text)]">
              Hero Section
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  Hero Heading
                </label>
                <input
                  type="text"
                  value={settings.hero_heading}
                  onChange={(e) => handleChange('hero_heading', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  Hero Supporting Description
                </label>
                <textarea
                  rows={2}
                  value={settings.hero_description}
                  onChange={(e) => handleChange('hero_description', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero_primary_cta_text}
                    onChange={(e) => handleChange('hero_primary_cta_text', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={settings.hero_primary_cta_link}
                    onChange={(e) => handleChange('hero_primary_cta_link', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.hero_secondary_cta_text}
                    onChange={(e) => handleChange('hero_secondary_cta_text', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={settings.hero_secondary_cta_link}
                    onChange={(e) => handleChange('hero_secondary_cta_link', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                  />
                </div>
              </div>

              {/* Hero Image & Toggle */}
              <div className="pt-2 border-t border-[var(--theme-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[var(--theme-text)]">
                    Hero Image
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[var(--theme-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.hero_show_image !== 'false'}
                      onChange={() => handleToggle('hero_show_image')}
                      className="accent-[var(--theme-accent)]"
                    />
                    <span>Show image in hero</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  {settings.hero_image ? (
                    <div className="relative h-16 w-24 rounded border border-[var(--theme-border)] overflow-hidden shrink-0">
                      <img src={settings.hero_image} alt="Hero" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleChange('hero_image', '')}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleOpenMedia('hero_image')}
                    className="px-3 py-1.5 text-xs rounded border border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-card)] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-[var(--theme-accent)]" />
                    <span>{settings.hero_image ? 'Change Hero Image' : 'Choose Hero Image'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
            <h3 className="font-serif text-base font-medium text-[var(--theme-text)]">
              Introduction Section
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  Intro Subtitle / Label
                </label>
                <input
                  type="text"
                  value={settings.intro_heading}
                  onChange={(e) => handleChange('intro_heading', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                  Intro Statement / Quote
                </label>
                <textarea
                  rows={3}
                  value={settings.intro_text}
                  onChange={(e) => handleChange('intro_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section Headings */}
          <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
            <h3 className="font-serif text-base font-medium text-[var(--theme-text)]">
              Section Headings & Subtitles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Thoughts Section Title</label>
                <input
                  type="text"
                  value={settings.section_thoughts_title}
                  onChange={(e) => handleChange('section_thoughts_title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Thoughts Description</label>
                <input
                  type="text"
                  value={settings.section_thoughts_desc}
                  onChange={(e) => handleChange('section_thoughts_desc', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Audio Section Title</label>
                <input
                  type="text"
                  value={settings.section_audio_title}
                  onChange={(e) => handleChange('section_audio_title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Audio Description</label>
                <input
                  type="text"
                  value={settings.section_audio_desc}
                  onChange={(e) => handleChange('section_audio_desc', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Let&apos;s Talk CTA Title</label>
                <input
                  type="text"
                  value={settings.section_talk_title}
                  onChange={(e) => handleChange('section_talk_title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">Let&apos;s Talk CTA Description</label>
                <input
                  type="text"
                  value={settings.section_talk_desc}
                  onChange={(e) => handleChange('section_talk_desc', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SITE & OWNER IDENTITY */}
      {activeTab === 'identity' && (
        <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Website Brand Name</label>
              <input
                type="text"
                value={settings.website_name}
                onChange={(e) => handleChange('website_name', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Owner Name</label>
              <input
                type="text"
                value={settings.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Short Bio / Tagline</label>
              <textarea
                rows={2}
                value={settings.short_bio}
                onChange={(e) => handleChange('short_bio', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Footer Statement</label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => handleChange('footer_text', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            {/* Profile Avatar */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Profile Avatar Image</label>
              <div className="flex items-center gap-3">
                {settings.profile_image ? (
                  <img
                    src={settings.profile_image}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full border border-[var(--theme-border)] object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => handleOpenMedia('profile_image')}
                  className="px-3 py-1.5 text-xs rounded border border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-card)]"
                >
                  Choose Avatar
                </button>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Optional Logo Mark</label>
              <div className="flex items-center gap-3">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Logo"
                    className="h-10 w-10 object-contain border border-[var(--theme-border)] rounded"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => handleOpenMedia('logo')}
                  className="px-3 py-1.5 text-xs rounded border border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-card)]"
                >
                  Choose Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT & SOCIAL */}
      {activeTab === 'contact' && (
        <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Contact Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">X / Twitter Link</label>
              <input
                type="url"
                value={settings.social_x}
                onChange={(e) => handleChange('social_x', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Instagram Link</label>
              <input
                type="url"
                value={settings.social_instagram}
                onChange={(e) => handleChange('social_instagram', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--theme-text)]">Substack Link</label>
              <input
                type="url"
                value={settings.social_substack}
                onChange={(e) => handleChange('social_substack', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                SEO Website Title
              </label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) => handleChange('seo_title', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                SEO Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.seo_description}
                onChange={(e) => handleChange('seo_description', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--theme-text)] mb-1">
                Favicon Path
              </label>
              <input
                type="text"
                value={settings.favicon}
                onChange={(e) => handleChange('favicon', e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        acceptType="image"
        title="Select Image"
        onSelect={(url) => {
          if (mediaTargetField) {
            handleChange(mediaTargetField, url);
          }
        }}
      />
    </form>
  );
}
