'use client';

import React, { useState, useEffect } from 'react';
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
            className="flex items-center gap-2.5 text-base sm:text-lg font-serif tracking-tight text-[var(--theme-text)] hover:opacity-75 transition-opacity py-2"
          >
            {logoUrl && (
              <img src={logoUrl} alt="" className="h-6 w-6 object-contain rounded" />
            )}
            <span>{websiteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive(link.href)
                    ? 'text-[var(--theme-text)] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[var(--theme-accent)]'
                    : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button - 44x44 touch target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-[var(--theme-text)] hover:opacity-70 transition-opacity cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--theme-border)]/70 py-4 px-1 space-y-1 bg-[var(--theme-bg)] animate-in fade-in duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded text-base transition-colors min-h-[44px] flex items-center ${
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
