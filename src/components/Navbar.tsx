'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  websiteName?: string;
  logoUrl?: string;
}

export function Navbar({ websiteName = "A Quiet Space", logoUrl }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide public navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/thoughts', label: 'Thoughts' },
    { href: '/audio', label: 'Audio Journal' },
    { href: '/talk', label: "Let's Talk" },
  ];

  const isActive = (href: string) => {
    if (href === '/thoughts' && pathname.startsWith('/thoughts')) return true;
    if (href === '/audio' && pathname.startsWith('/audio')) return true;
    if (href === '/talk' && pathname === '/talk') return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--theme-bg)]/90 border-b border-[var(--theme-border)]/60 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo / Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-3 text-lg sm:text-xl font-serif tracking-tight text-[var(--theme-text)] hover:opacity-80 transition-opacity"
          >
            {logoUrl && (
              <img src={logoUrl} alt="" className="h-7 w-7 object-contain rounded" />
            )}
            <span>{websiteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive(link.href)
                    ? 'text-[var(--theme-text)] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--theme-accent)]'
                    : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-md text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-card)] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--theme-border)] py-4 space-y-2 bg-[var(--theme-bg)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base transition-colors ${
                  isActive(link.href)
                    ? 'bg-[var(--theme-card)] text-[var(--theme-text)] font-medium border-l-2 border-[var(--theme-accent)]'
                    : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-card)]/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
