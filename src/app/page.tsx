import React from 'react';
import Link from 'next/link';
import { getSiteSettings, getAppearanceSettings, getThoughts, getAudioJournals } from '@/lib/db';
import { AudioPlayer } from '@/components/AudioPlayer';
import { ArrowRight, Headphones, BookOpen, MessageCircleHeart } from 'lucide-react';
import { BUTTON_CLASSES } from '@/lib/theme';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const site = getSiteSettings();
  const appearance = getAppearanceSettings();
  const latestThoughts = getThoughts().slice(0, 3);
  const latestAudio = getAudioJournals().slice(0, 2);

  const buttonRadiusClass = BUTTON_CLASSES[appearance.button_style] || 'rounded-md';

  const showHero = site.show_hero !== 'false';
  const showIntro = site.show_intro !== 'false';
  const showThoughts = site.show_thoughts !== 'false';
  const showAudio = site.show_audio !== 'false';
  const showTalk = site.show_talk !== 'false';
  const showHeroImage = site.hero_show_image !== 'false' && Boolean(site.hero_image);

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      {showHero && (
        <section className="border-b border-[var(--theme-border)]/50">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-32">
            <div className={`grid gap-10 lg:gap-16 items-center ${showHeroImage ? 'md:grid-cols-12' : 'max-w-3xl'}`}>
              <div className={showHeroImage ? 'md:col-span-7 space-y-6 sm:space-y-8' : 'space-y-6 sm:space-y-8'}>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[var(--theme-text)] leading-[1.2]">
                  {site.hero_heading}
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-[var(--theme-secondary)] leading-relaxed max-w-2xl">
                  {site.hero_description}
                </p>

                {/* Mobile-friendly button row (full width on mobile, inline on sm+) */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  {site.hero_primary_cta_text && (
                    <Link
                      href={site.hero_primary_cta_link || '/thoughts'}
                      className={`inline-flex items-center justify-center px-6 py-3.5 sm:py-3 text-sm sm:text-base font-medium bg-[var(--theme-accent)] text-white hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-none min-h-[46px] ${buttonRadiusClass}`}
                    >
                      <span>{site.hero_primary_cta_text}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                  {site.hero_secondary_cta_text && (
                    <Link
                      href={site.hero_secondary_cta_link || '/talk'}
                      className={`inline-flex items-center justify-center px-6 py-3.5 sm:py-3 text-sm sm:text-base font-medium border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors cursor-pointer min-h-[46px] ${buttonRadiusClass}`}
                    >
                      {site.hero_secondary_cta_text}
                    </Link>
                  )}
                </div>
              </div>

              {showHeroImage && (
                <div className="md:col-span-5 flex justify-center order-first md:order-last">
                  <div className="relative w-full max-w-md lg:max-w-lg aspect-4/3 rounded-xl overflow-hidden border border-[var(--theme-border)]/80 bg-[var(--theme-card)]">
                    <img
                      src={site.hero_image}
                      alt="Personal reflection"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. INTRODUCTION SECTION */}
      {showIntro && (
        <section className="border-b border-[var(--theme-border)]/50 bg-[var(--theme-card)]/30">
          <div className="max-w-4xl xl:max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 text-center">
            {site.intro_heading && (
              <span className="text-xs uppercase tracking-widest text-[var(--theme-accent)] font-semibold mb-3.5 block">
                {site.intro_heading}
              </span>
            )}
            <blockquote className="font-serif text-xl sm:text-3xl text-[var(--theme-text)] font-normal leading-relaxed italic max-w-3xl mx-auto">
              &ldquo;{site.intro_text}&rdquo;
            </blockquote>
          </div>
        </section>
      )}

      {/* 3. LATEST THOUGHTS */}
      {showThoughts && (
        <section className="border-b border-[var(--theme-border)]/50">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--theme-accent)] font-semibold mb-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Writings</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[var(--theme-text)]">
                  {site.section_thoughts_title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--theme-secondary)] mt-1.5 max-w-xl">
                  {site.section_thoughts_desc}
                </p>
              </div>
              <Link
                href="/thoughts"
                className="text-xs sm:text-sm font-medium text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto py-1"
              >
                <span>All thoughts</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Expansive 3-Column Editorial Grid on Desktop/Laptop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {latestThoughts.map((thought) => {
                const dateStr = new Date(thought.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <article
                    key={thought.id}
                    className="group flex flex-col justify-between rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 sm:p-6 hover:border-[var(--theme-accent)]/50 transition-all shadow-none"
                  >
                    <div className="space-y-4">
                      {thought.cover_image && (
                        <Link
                          href={`/thoughts/${thought.slug}`}
                          className="block w-full aspect-16/10 rounded-lg overflow-hidden border border-[var(--theme-border)]/60 bg-[var(--theme-bg)]"
                        >
                          <img
                            src={thought.cover_image}
                            alt={thought.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </Link>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 text-xs text-[var(--theme-secondary)]">
                          <time dateTime={thought.published_at}>{dateStr}</time>
                          <span>•</span>
                          <span className="font-medium text-[var(--theme-accent)]">{thought.category}</span>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl font-medium text-[var(--theme-text)] group-hover:text-[var(--theme-accent)] transition-colors leading-snug">
                          <Link href={`/thoughts/${thought.slug}`}>
                            {thought.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] leading-relaxed line-clamp-3">
                          {thought.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[var(--theme-border)]/50">
                      <Link
                        href={`/thoughts/${thought.slug}`}
                        className="text-xs font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] inline-flex items-center gap-1 transition-colors py-1"
                      >
                        <span>Read reflection</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. AUDIO JOURNAL */}
      {showAudio && (
        <section className="border-b border-[var(--theme-border)]/50 bg-[var(--theme-card)]/15">
          <div className="max-w-6xl xl:max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--theme-accent)] font-semibold mb-1.5">
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Audio Journal</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[var(--theme-text)]">
                  {site.section_audio_title}
                </h2>
                <p className="text-sm sm:text-base text-[var(--theme-secondary)] mt-1.5 max-w-xl">
                  {site.section_audio_desc}
                </p>
              </div>
              <Link
                href="/audio"
                className="text-xs sm:text-sm font-medium text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto py-1"
              >
                <span>All recordings</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
              {latestAudio.map((entry) => {
                const dateStr = new Date(entry.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col justify-between p-5 sm:p-7 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] shadow-none"
                  >
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center justify-between text-xs text-[var(--theme-secondary)]">
                        <time dateTime={entry.published_at}>{dateStr}</time>
                        <span className="tabular-nums font-medium">{entry.duration}</span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl font-medium text-[var(--theme-text)]">
                        {entry.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[var(--theme-secondary)] line-clamp-2 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>

                    <AudioPlayer src={entry.audio_url} duration={entry.duration} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. ONE-ON-ONE CONVERSATIONS */}
      {showTalk && (
        <section className="py-20 sm:py-32">
          <div className="max-w-4xl xl:max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-accent)] mb-1">
              <MessageCircleHeart className="h-6 w-6" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-[var(--theme-text)]">
              {site.section_talk_title}
            </h2>

            <p className="text-base sm:text-xl text-[var(--theme-secondary)] leading-relaxed max-w-2xl mx-auto">
              {site.section_talk_desc}
            </p>

            <div className="pt-2">
              <Link
                href="/talk"
                className={`inline-flex items-center justify-center px-8 py-3.5 text-sm sm:text-base font-medium bg-[var(--theme-accent)] text-white hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-none min-h-[48px] ${buttonRadiusClass}`}
              >
                <span>Let&apos;s talk</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
