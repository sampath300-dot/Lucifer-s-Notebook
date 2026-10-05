'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  MessageSquare,
  Image as ImageIcon,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, do not render admin navigation
  if (pathname === '/admin/login') {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/thoughts', label: 'Thoughts', icon: BookOpen },
    { href: '/admin/audio', label: 'Audio Journal', icon: Headphones },
    { href: '/admin/conversations', label: 'Conversations', icon: MessageSquare },
    { href: '/admin/media', label: 'Media', icon: ImageIcon },
    { href: '/admin/appearance', label: 'Appearance', icon: Palette },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-full md:w-64 md:min-h-screen shrink-0 bg-[var(--theme-card)] border-r border-[var(--theme-border)] flex flex-col justify-between">
      <div>
        {/* Admin Header */}
        <div className="h-16 px-6 border-b border-[var(--theme-border)] flex items-center justify-between">
          <Link href="/admin" className="font-serif text-lg font-medium text-[var(--theme-text)]">
            Admin CMS
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-[var(--theme-secondary)] hover:text-[var(--theme-text)]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className={`p-4 space-y-1 ${
            mobileMenuOpen ? 'block' : 'hidden md:block'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--theme-accent)] text-white shadow-xs'
                    : 'text-[var(--theme-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-bg)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div
        className={`p-4 border-t border-[var(--theme-border)] space-y-2 ${
          mobileMenuOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs text-[var(--theme-secondary)] hover:text-[var(--theme-text)] rounded hover:bg-[var(--theme-bg)] transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{loggingOut ? 'Signing out...' : 'Log Out'}</span>
        </button>
      </div>
    </aside>
  );
}
