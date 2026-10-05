'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--theme-bg)]">
      <div className="w-full max-w-sm rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--theme-accent)]/15 text-[var(--theme-accent)] mb-1">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-[var(--theme-text)]">
            Admin Dashboard
          </h1>
          <p className="text-xs text-[var(--theme-secondary)]">
            Sign in to manage your journal, audio, and conversations.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded border border-red-200 bg-red-50 text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--theme-text)]">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--theme-text)]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-sm text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-md bg-[var(--theme-accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-xs"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-[var(--theme-secondary)]">
            Default credentials: <span className="font-mono font-medium">admin</span> / <span className="font-mono font-medium">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
