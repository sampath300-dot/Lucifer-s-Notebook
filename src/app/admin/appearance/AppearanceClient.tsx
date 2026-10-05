'use client';

import React, { useState } from 'react';
import { AppearanceSettings, ThemePreset, ThemeMode, SectionSpacing, ButtonStyle, BorderStyle } from '@/types';
import { THEME_PRESETS, FONT_OPTIONS, BUTTON_CLASSES, SPACING_CLASSES, BORDER_CLASSES } from '@/lib/theme';
import { MediaPickerModal } from '@/components/MediaPickerModal';
import { Check, RotateCcw, Save, Eye, Palette, Type, Layout, Sliders, Image as ImageIcon, X } from 'lucide-react';

interface AppearanceClientProps {
  initialAppearance: AppearanceSettings;
}

export function AppearanceClient({ initialAppearance }: AppearanceClientProps) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'layout'>('presets');

  const presetList: { id: ThemePreset; name: string; description: string; colors: string[] }[] = [
    {
      id: 'warm-editorial',
      name: 'Warm Editorial',
      description: 'Parchment tones with warm terracotta accents and classic literary serif typography.',
      colors: ['#FAF7F2', '#2C2723', '#A35C4A', '#E8E2D8'],
    },
    {
      id: 'minimal-light',
      name: 'Minimal Light',
      description: 'Crisp white paper with graphite slate accents and modern clean aesthetics.',
      colors: ['#FFFFFF', '#111827', '#374151', '#E5E7EB'],
    },
    {
      id: 'dark-journal',
      name: 'Dark Journal',
      description: 'Intimate nocturnal atmosphere with deep charcoal tones and warm amber highlights.',
      colors: ['#141416', '#F4F4F6', '#D97706', '#2A2A30'],
    },
    {
      id: 'soft-neutral',
      name: 'Soft Neutral',
      description: 'Gentle sandstone and linen with muted sage tones for an understated, calming feel.',
      colors: ['#F4F2EC', '#23211E', '#526650', '#DFDCD4'],
    },
  ];

  const accentColorSwatches = [
    { hex: '#A35C4A', name: 'Terracotta' },
    { hex: '#374151', name: 'Slate Gray' },
    { hex: '#D97706', name: 'Warm Amber' },
    { hex: '#526650', name: 'Muted Sage' },
    { hex: '#7A5265', name: 'Withered Plum' },
    { hex: '#3B6978', name: 'Deep Harbor' },
  ];

  const handleSelectPreset = (presetId: ThemePreset) => {
    const config = THEME_PRESETS[presetId];
    if (!config) return;

    setAppearance((prev) => ({
      ...prev,
      preset: presetId,
      bg_color: config.bg_color,
      text_color: config.text_color,
      accent_color: config.accent_color,
      font_heading: config.font_heading,
      font_body: config.font_body,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearance),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Failed to save appearance settings');
      }
    } catch {
      alert('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all appearance settings to default?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });

      if (res.ok) {
        const defaults = await res.json();
        setAppearance(defaults);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert('Failed to reset');
    } finally {
      setResetting(false);
    }
  };

  const previewPreset = THEME_PRESETS[appearance.preset] || THEME_PRESETS['warm-editorial'];
  const previewBg = appearance.bg_color || previewPreset.bg_color;
  const previewText = appearance.text_color || previewPreset.text_color;
  const previewAccent = appearance.accent_color || previewPreset.accent_color;
  const previewCardBg = previewPreset.card_bg;
  const previewBorder = previewPreset.border_color;
  const previewSecondary = previewPreset.secondary_text;
  const buttonRadiusClass = BUTTON_CLASSES[appearance.button_style] || 'rounded-md';
  const overlayOpacity = parseInt(appearance.bg_overlay || '0', 10) / 100;

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)]">
        <div>
          <h2 className="font-serif text-lg font-medium text-[var(--theme-text)]">
            Appearance Customization
          </h2>
          <p className="text-xs text-[var(--theme-secondary)]">
            Carefully curated themes and styling to ensure your website always remains dignified and balanced.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={resetting}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-md bg-[var(--theme-accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
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
      </div>

      {/* Main Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto no-scrollbar border-b border-[var(--theme-border)]">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'presets'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                  : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Theme Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'colors'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                  : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Colors & Background</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('typography')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'typography'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                  : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>Typography</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer shrink-0 min-h-[40px] ${
                activeTab === 'layout'
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)]'
                  : 'border-transparent text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              <span>Layout & Buttons</span>
            </button>
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-[var(--theme-secondary)]">
                Choose one of 4 professionally balanced design presets as your foundation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {presetList.map((p) => {
                  const isSelected = appearance.preset === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[var(--theme-accent)] ring-2 ring-[var(--theme-accent)]/20 bg-[var(--theme-card)] shadow-xs'
                          : 'border-[var(--theme-border)] bg-[var(--theme-card)]/50 hover:border-[var(--theme-accent)]/40 hover:bg-[var(--theme-card)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-medium text-sm text-[var(--theme-text)]">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-[var(--theme-accent)] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--theme-secondary)] line-clamp-2 mb-3">
                        {p.description}
                      </p>

                      {/* Color Palette swatches */}
                      <div className="flex items-center gap-1.5">
                        {p.colors.map((c, i) => (
                          <span
                            key={i}
                            className="h-4 w-4 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mode Selection */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-2">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Display Mode
                </label>
                <div className="flex gap-2">
                  {(['system', 'light', 'dark'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAppearance((prev) => ({ ...prev, mode: m }))}
                      className={`px-3 py-1.5 text-xs rounded-md border font-medium capitalize transition-colors cursor-pointer ${
                        appearance.mode === m
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)] text-white'
                          : 'border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COLORS & BACKGROUND */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Accent Color */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Accent Color
                </label>
                <p className="text-[11px] text-[var(--theme-secondary)]">
                  Used for primary buttons, category tags, link highlights, and subtle accents.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {accentColorSwatches.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setAppearance((prev) => ({ ...prev, accent_color: swatch.hex }))}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition-all cursor-pointer ${
                        appearance.accent_color === swatch.hex
                          ? 'border-[var(--theme-text)] bg-[var(--theme-card)] font-medium shadow-xs ring-1 ring-[var(--theme-text)]'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: swatch.hex }} />
                      <span>{swatch.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-[var(--theme-secondary)]">Custom hex:</span>
                  <input
                    type="color"
                    value={appearance.accent_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="h-8 w-8 rounded cursor-pointer border border-[var(--theme-border)]"
                  />
                  <input
                    type="text"
                    value={appearance.accent_color}
                    onChange={(e) => setAppearance((prev) => ({ ...prev, accent_color: e.target.value }))}
                    className="w-24 px-2 py-1 text-xs font-mono rounded border border-[var(--theme-border)] bg-[var(--theme-card)]"
                  />
                </div>
              </div>

              {/* Background Color & Image */}
              <div className="space-y-4 pt-4 border-t border-[var(--theme-border)]">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Background Settings
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-xs text-[var(--theme-secondary)]">Background Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.bg_color}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, bg_color: e.target.value }))}
                        className="h-8 w-8 rounded cursor-pointer border border-[var(--theme-border)]"
                      />
                      <input
                        type="text"
                        value={appearance.bg_color}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, bg_color: e.target.value }))}
                        className="w-24 px-2 py-1 text-xs font-mono rounded border border-[var(--theme-border)] bg-[var(--theme-card)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-[var(--theme-secondary)]">Text Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.text_color}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, text_color: e.target.value }))}
                        className="h-8 w-8 rounded cursor-pointer border border-[var(--theme-border)]"
                      />
                      <input
                        type="text"
                        value={appearance.text_color}
                        onChange={(e) => setAppearance((prev) => ({ ...prev, text_color: e.target.value }))}
                        className="w-24 px-2 py-1 text-xs font-mono rounded border border-[var(--theme-border)] bg-[var(--theme-card)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Background Image */}
                <div className="pt-2 space-y-3">
                  <span className="text-xs font-medium text-[var(--theme-text)]">
                    Optional Background Image / Texture
                  </span>

                  {appearance.bg_image ? (
                    <div className="p-3 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={appearance.bg_image}
                          alt="Background preview"
                          className="h-10 w-10 object-cover rounded border border-[var(--theme-border)]"
                        />
                        <span className="text-xs truncate max-w-[200px] font-mono">{appearance.bg_image}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAppearance((prev) => ({ ...prev, bg_image: '' }))}
                        className="p-1 text-[var(--theme-secondary)] hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove background image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="w-full py-2.5 rounded-md border border-dashed border-[var(--theme-border)] bg-[var(--theme-card)] text-xs text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:border-[var(--theme-accent)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Choose Background Texture / Image</span>
                    </button>
                  )}

                  {appearance.bg_image && (
                    <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                      <div>
                        <label className="block text-[11px] text-[var(--theme-secondary)] mb-1">Position</label>
                        <select
                          value={appearance.bg_position}
                          onChange={(e) => setAppearance((prev) => ({ ...prev, bg_position: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-[var(--theme-border)] bg-[var(--theme-card)]"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[var(--theme-secondary)] mb-1">Size</label>
                        <select
                          value={appearance.bg_size}
                          onChange={(e) => setAppearance((prev) => ({ ...prev, bg_size: e.target.value }))}
                          className="w-full px-2 py-1 rounded border border-[var(--theme-border)] bg-[var(--theme-card)]"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="auto">Tile (Auto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[var(--theme-secondary)] mb-1">Overlay Opacity</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="80"
                            step="5"
                            value={appearance.bg_overlay || '0'}
                            onChange={(e) => setAppearance((prev) => ({ ...prev, bg_overlay: e.target.value }))}
                            className="w-full h-1 bg-[var(--theme-border)] rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-[11px] tabular-nums font-mono">{appearance.bg_overlay || 0}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              <p className="text-xs text-[var(--theme-secondary)]">
                Select from carefully matched typographic pairings designed specifically for comfortable long-form reading and editorial journals.
              </p>

              {/* Headings Font */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Heading Font
                </label>
                <div className="space-y-2">
                  {FONT_OPTIONS.headings.map((font) => (
                    <label
                      key={font.id}
                      className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                        appearance.font_heading === font.id
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-card)] shadow-xs'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="font_heading"
                          checked={appearance.font_heading === font.id}
                          onChange={() => setAppearance((prev) => ({ ...prev, font_heading: font.id }))}
                          className="accent-[var(--theme-accent)]"
                        />
                        <span className="text-xs font-medium text-[var(--theme-text)]">{font.name}</span>
                      </div>
                      <span className={`text-base font-medium ${font.className}`}>
                        Sample Heading
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Body Font */}
              <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Body Font
                </label>
                <div className="space-y-2">
                  {FONT_OPTIONS.bodies.map((font) => (
                    <label
                      key={font.id}
                      className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                        appearance.font_body === font.id
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-card)] shadow-xs'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] hover:bg-[var(--theme-card)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="font_body"
                          checked={appearance.font_body === font.id}
                          onChange={() => setAppearance((prev) => ({ ...prev, font_body: font.id }))}
                          className="accent-[var(--theme-accent)]"
                        />
                        <span className="text-xs font-medium text-[var(--theme-text)]">{font.name}</span>
                      </div>
                      <span className={`text-xs text-[var(--theme-secondary)] ${font.className}`}>
                        The quick brown fox jumps over the lazy dog.
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT & BUTTONS */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* Spacing */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Section Spacing
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['compact', 'normal', 'spacious'] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setAppearance((prev) => ({ ...prev, spacing: sp }))}
                      className={`p-3 rounded-md border text-xs font-medium capitalize transition-all cursor-pointer ${
                        appearance.spacing === sp
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-card)] text-[var(--theme-text)] shadow-xs ring-1 ring-[var(--theme-accent)]'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Button Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { id: 'simple', label: 'Simple (Sharp)', cls: 'rounded-none' },
                      { id: 'slightly-rounded', label: 'Slightly Rounded', cls: 'rounded-md' },
                      { id: 'rounded', label: 'Pill Rounded', cls: 'rounded-full' },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setAppearance((prev) => ({ ...prev, button_style: btn.id }))}
                      className={`p-3 border text-xs font-medium transition-all cursor-pointer ${btn.cls} ${
                        appearance.button_style === btn.id
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-card)] text-[var(--theme-text)] shadow-xs ring-1 ring-[var(--theme-accent)]'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Style */}
              <div className="space-y-3 pt-4 border-t border-[var(--theme-border)]">
                <label className="block text-xs font-semibold text-[var(--theme-text)]">
                  Card Border Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { id: 'minimal', label: 'Minimal (Hairline)' },
                      { id: 'subtle', label: 'Subtle (Soft Elevation)' },
                    ] as const
                  ).map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setAppearance((prev) => ({ ...prev, border_style: b.id }))}
                      className={`p-3 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                        appearance.border_style === b.id
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-card)] text-[var(--theme-text)] shadow-xs ring-1 ring-[var(--theme-accent)]'
                          : 'border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Live Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--theme-secondary)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              <span>Live Website Preview</span>
            </span>
            <span className="text-[10px] lowercase font-normal">updated in real-time</span>
          </div>

          {/* Mock Preview Window */}
          <div
            className="rounded-xl border shadow-md overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: previewBg,
              color: previewText,
              borderColor: previewBorder,
            }}
          >
            {/* Mock Browser Header */}
            <div
              className="px-4 py-2.5 border-b flex items-center justify-between text-xs"
              style={{
                backgroundColor: previewCardBg,
                borderColor: previewBorder,
                color: previewSecondary,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
              </div>
              <span className="font-serif text-[11px] truncate">A Quiet Space</span>
              <div className="w-8" />
            </div>

            {/* Mock Page Content */}
            <div className="p-6 space-y-6">
              {/* Mock Hero Snippet */}
              <div className="space-y-3">
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold"
                  style={{ color: previewAccent }}
                >
                  Personal Notebook
                </span>
                <h3
                  className={`text-xl font-medium leading-tight ${
                    appearance.font_heading === 'serif-literary'
                      ? 'font-serif-literary'
                      : appearance.font_heading === 'sans-minimal'
                      ? 'font-sans'
                      : 'font-serif'
                  }`}
                >
                  Some thoughts are easier to understand when you talk them through.
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: previewSecondary }}>
                  A quiet space for reflections, unhurried voice journals, and honest one-on-one conversations.
                </p>

                <div className="pt-1 flex items-center gap-2">
                  <span
                    className={`inline-block px-3.5 py-1.5 text-xs font-medium text-white shadow-xs ${buttonRadiusClass}`}
                    style={{ backgroundColor: previewAccent }}
                  >
                    Read thoughts
                  </span>
                  <span
                    className={`inline-block px-3 py-1.5 text-xs font-medium border ${buttonRadiusClass}`}
                    style={{
                      borderColor: previewBorder,
                      backgroundColor: previewCardBg,
                      color: previewText,
                    }}
                  >
                    Let&apos;s talk
                  </span>
                </div>
              </div>

              {/* Mock Thought Card Snippet */}
              <div
                className={`p-4 rounded-lg border space-y-2`}
                style={{
                  backgroundColor: previewCardBg,
                  borderColor: previewBorder,
                }}
              >
                <div className="flex items-center justify-between text-[10px]" style={{ color: previewSecondary }}>
                  <span>Oct 2, 2026</span>
                  <span className="font-semibold" style={{ color: previewAccent }}>
                    Reflections
                  </span>
                </div>
                <h4
                  className={`text-sm font-medium ${
                    appearance.font_heading === 'serif-literary'
                      ? 'font-serif-literary'
                      : appearance.font_heading === 'sans-minimal'
                      ? 'font-sans'
                      : 'font-serif'
                  }`}
                >
                  The Quiet Between Our Thoughts
                </h4>
                <p
                  className={`text-xs leading-relaxed line-clamp-2 ${
                    appearance.font_body === 'serif-classic' ? 'font-serif' : 'font-sans'
                  }`}
                  style={{ color: previewSecondary }}
                >
                  We often rush to fill silence because stillness feels like emptiness. But silence is rarely empty; it is simply unhurried.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        acceptType="image"
        title="Choose Background Texture"
        onSelect={(url) => setAppearance((prev) => ({ ...prev, bg_image: url }))}
      />
    </div>
  );
}
