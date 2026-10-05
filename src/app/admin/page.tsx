import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';
import { BookOpen, Headphones, MessageSquare, Plus, ArrowRight, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const stats = getDashboardStats();

  return (
    <div className="p-6 sm:p-10 max-w-6xl xl:max-w-7xl mx-auto w-full space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
            Welcome back, {user.username}. Here is what has been happening in your quiet space.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/thoughts/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-[var(--theme-accent)] text-white hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Thought</span>
          </Link>
          <Link
            href="/admin/audio/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Audio</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/admin/thoughts"
          className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-[var(--theme-accent)]/50 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-[var(--theme-secondary)] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Thoughts</span>
            <BookOpen className="h-4 w-4 text-[var(--theme-accent)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[var(--theme-text)]">
              {stats.publishedThoughts}
            </span>
            <span className="text-xs text-[var(--theme-secondary)]">published ({stats.totalThoughts} total)</span>
          </div>
        </Link>

        <Link
          href="/admin/audio"
          className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-[var(--theme-accent)]/50 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-[var(--theme-secondary)] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Audio Journal</span>
            <Headphones className="h-4 w-4 text-[var(--theme-accent)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[var(--theme-text)]">
              {stats.publishedAudio}
            </span>
            <span className="text-xs text-[var(--theme-secondary)]">recordings</span>
          </div>
        </Link>

        <Link
          href="/admin/conversations"
          className="p-5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] hover:border-[var(--theme-accent)]/50 transition-colors shadow-xs group"
        >
          <div className="flex items-center justify-between text-[var(--theme-secondary)] mb-3">
            <span className="text-xs uppercase tracking-wider font-medium">Conversations</span>
            <MessageSquare className="h-4 w-4 text-[var(--theme-accent)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[var(--theme-text)]">
              {stats.newConversations}
            </span>
            <span className="text-xs text-[var(--theme-accent)] font-medium">
              new requests ({stats.totalConversations} total)
            </span>
          </div>
        </Link>
      </div>

      {/* Two Column Section: Recent Conversations & Recent Thoughts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Conversations */}
        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="font-serif text-lg font-medium text-[var(--theme-text)]">
              Recent Conversations
            </h2>
            <Link
              href="/admin/conversations"
              className="text-xs text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentConversations.length === 0 ? (
            <p className="text-xs text-[var(--theme-secondary)] py-6 text-center">
              No conversations received yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--theme-border)]/60">
              {stats.recentConversations.map((conv) => {
                const dateStr = new Date(conv.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={conv.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--theme-text)]">{conv.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          conv.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : conv.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : conv.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {conv.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--theme-secondary)] line-clamp-1">
                      {conv.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-[var(--theme-secondary)] pt-0.5">
                      <span>{conv.contact_method}: {conv.contact_info}</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Thoughts */}
        <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="font-serif text-lg font-medium text-[var(--theme-text)]">
              Recent Thoughts
            </h2>
            <Link
              href="/admin/thoughts"
              className="text-xs text-[var(--theme-accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentThoughts.length === 0 ? (
            <p className="text-xs text-[var(--theme-secondary)] py-6 text-center">
              No thoughts written yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--theme-border)]/60">
              {stats.recentThoughts.map((t) => {
                const dateStr = new Date(t.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <Link
                        href={`/admin/thoughts/${t.id}`}
                        className="text-sm font-medium text-[var(--theme-text)] hover:text-[var(--theme-accent)] truncate block transition-colors"
                      >
                        {t.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--theme-secondary)]">
                        <span>{t.category}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${
                        t.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
