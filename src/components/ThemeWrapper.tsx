'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppearanceSettings } from '@/types';
import { THEME_PRESETS } from '@/lib/theme';

interface ThemeContextType {
  appearance: AppearanceSettings;
  setAppearance: (settings: AppearanceSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeWrapper');
  }
  return context;
}

interface ThemeWrapperProps {
  initialAppearance: AppearanceSettings;
  children: React.ReactNode;
}

export function ThemeWrapper({ initialAppearance, children }: ThemeWrapperProps) {
  const [appearance, setAppearance] = useState<AppearanceSettings>(initialAppearance);

  const preset = THEME_PRESETS[appearance.preset] || THEME_PRESETS['warm-editorial'];
  const bgColor = appearance.bg_color || preset.bg_color;
  const textColor = appearance.text_color || preset.text_color;
  const accentColor = appearance.accent_color || preset.accent_color;
  const cardBg = preset.card_bg;
  const borderColor = preset.border_color;
  const secondaryText = preset.secondary_text;

  // Background overlay calculation
  const overlayOpacity = parseInt(appearance.bg_overlay || '0', 10) / 100;

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance }}>
      <div
        className="min-h-screen flex flex-col transition-colors duration-200 relative selection:bg-[var(--theme-accent)] selection:text-white"
        style={
          {
            '--theme-bg': bgColor,
            '--theme-text': textColor,
            '--theme-accent': accentColor,
            '--theme-border': borderColor,
            '--theme-card': cardBg,
            '--theme-secondary': secondaryText,
            backgroundColor: bgColor,
            color: textColor,
          } as React.CSSProperties
        }
      >
        {/* Background Image Layer if configured */}
        {appearance.bg_image && (
          <div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${appearance.bg_image})`,
              backgroundPosition: appearance.bg_position || 'center',
              backgroundSize: appearance.bg_size || 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {overlayOpacity > 0 && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: bgColor,
                  opacity: overlayOpacity,
                }}
              />
            )}
          </div>
        )}

        {/* Main Content with font class */}
        <div className="relative z-10 flex flex-col flex-grow w-full">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
