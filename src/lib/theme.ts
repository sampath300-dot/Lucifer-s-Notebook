import { AppearanceSettings, ThemePreset } from '@/types';

export interface PresetConfig {
  id: ThemePreset;
  name: string;
  description: string;
  bg_color: string;
  text_color: string;
  accent_color: string;
  card_bg: string;
  border_color: string;
  secondary_text: string;
  font_heading: string;
  font_body: string;
}

export const THEME_PRESETS: Record<ThemePreset, PresetConfig> = {
  'warm-editorial': {
    id: 'warm-editorial',
    name: 'Warm Editorial',
    description: 'Earthy, parchment-like warmth with terracotta accents and classic editorial elegance.',
    bg_color: '#FAF7F2',
    card_bg: '#FFFFFF',
    text_color: '#2C2723',
    secondary_text: '#6E665F',
    accent_color: '#A35C4A',
    border_color: '#E8E2D8',
    font_heading: 'serif-editorial',
    font_body: 'sans-clean',
  },
  'minimal-light': {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Crisp, bright, and uncluttered with slate gray accents and quiet precision.',
    bg_color: '#FFFFFF',
    card_bg: '#F9FAFB',
    text_color: '#111827',
    secondary_text: '#6B7280',
    accent_color: '#374151',
    border_color: '#E5E7EB',
    font_heading: 'sans-minimal',
    font_body: 'sans-clean',
  },
  'dark-journal': {
    id: 'dark-journal',
    name: 'Dark Journal',
    description: 'Intimate nocturnal atmosphere with deep charcoal tones and warm amber highlights.',
    bg_color: '#141416',
    card_bg: '#1E1E22',
    text_color: '#F4F4F6',
    secondary_text: '#A0A0AB',
    accent_color: '#D97706',
    border_color: '#2A2A30',
    font_heading: 'serif-literary',
    font_body: 'sans-humanist',
  },
  'soft-neutral': {
    id: 'soft-neutral',
    name: 'Soft Neutral',
    description: 'Gentle sandstone and linen with muted sage tones for an understated, calming feel.',
    bg_color: '#F4F2EC',
    card_bg: '#FCFAF6',
    text_color: '#23211E',
    secondary_text: '#6E6A63',
    accent_color: '#526650',
    border_color: '#DFDCD4',
    font_heading: 'serif-editorial',
    font_body: 'sans-humanist',
  },
};

export const FONT_OPTIONS = {
  headings: [
    { id: 'serif-editorial', name: 'Editorial Serif (Georgia / Newsreader)', className: 'font-serif' },
    { id: 'serif-literary', name: 'Literary Serif (Lora / Garamond)', className: 'font-serif-literary' },
    { id: 'sans-minimal', name: 'Minimal Sans (Inter / Clean)', className: 'font-sans' },
  ],
  bodies: [
    { id: 'sans-clean', name: 'Clean Sans (Inter / Modern)', className: 'font-sans' },
    { id: 'sans-humanist', name: 'Humanist Sans (Jakarta / Friendly)', className: 'font-sans' },
    { id: 'serif-classic', name: 'Classic Serif (Bookish)', className: 'font-serif' },
  ],
};

export const SPACING_CLASSES = {
  compact: 'py-10 sm:py-16 space-y-12',
  normal: 'py-16 sm:py-24 space-y-20',
  spacious: 'py-20 sm:py-32 space-y-28',
};

export const BUTTON_CLASSES = {
  simple: 'rounded-none',
  'slightly-rounded': 'rounded-md',
  rounded: 'rounded-full',
};

export const BORDER_CLASSES = {
  minimal: 'border border-[var(--theme-border)] shadow-none',
  subtle: 'border border-[var(--theme-border)] shadow-xs',
};

export function getCssVariables(appearance: AppearanceSettings) {
  const preset = THEME_PRESETS[appearance.preset] || THEME_PRESETS['warm-editorial'];
  const bgColor = appearance.bg_color || preset.bg_color;
  const textColor = appearance.text_color || preset.text_color;
  const accentColor = appearance.accent_color || preset.accent_color;

  return {
    '--theme-bg': bgColor,
    '--theme-text': textColor,
    '--theme-accent': accentColor,
    '--theme-border': preset.border_color,
    '--theme-card': preset.card_bg,
    '--theme-secondary': preset.secondary_text,
  } as React.CSSProperties;
}
