'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface FooterProps {
  websiteName?: string;
  ownerName?: string;
  footerText?: string;
  socialX?: string;
  socialInstagram?: string;
  socialSubstack?: string;
}

export function Footer({
  websiteName = "A Quiet Space",
  ownerName = "Lucifer",
  footerText = "A space for thoughts, conversations, and honest reflection.",
  socialX,
  socialInstagram,
  socialSubstack,
}: FooterProps) {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--theme-border)]/70 bg-[var(--theme-bg)] transition-colors mt-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-6 pb-8 border-b border-[var(--theme-border)]/50">
          <div>
            <h3 className="font-serif text-lg font-medium text-[var(--theme-text)]">
              {websiteName}
            </h3>
            <p className="text-sm text-[var(--theme-secondary)] mt-1 max-w-sm">
              {footerText}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/thoughts"
              className="text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
            >
              Thoughts
            </Link>
            <Link
              href="/audio"
              className="text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
            >
              Audio Journal
            </Link>
            <Link
              href="/talk"
              className="text-[var(--theme-secondary)] hover:text-[var(--theme-text)] transition-colors"
            >
              Let&apos;s Talk
            </Link>
            <Link
              href="/admin"
              className="text-[var(--theme-secondary)]/50 hover:text-[var(--theme-secondary)] transition-colors text-xs self-center"
            >
              Admin
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-[var(--theme-secondary)]">
          <p>© {currentYear} {ownerName}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {socialX && (
              <a
                href={socialX}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--theme-text)] transition-colors"
              >
                X / Twitter
              </a>
            )}
            {socialInstagram && (
              <a
                href={socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--theme-text)] transition-colors"
              >
                Instagram
              </a>
            )}
            {socialSubstack && (
              <a
                href={socialSubstack}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--theme-text)] transition-colors"
              >
                Substack
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
