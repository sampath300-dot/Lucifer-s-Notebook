'use client';

import React, { useState } from 'react';
import { Conversation, ConversationStatus } from '@/types';
import {
  Download,
  Search,
  MessageSquare,
  PhoneCall,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  Calendar,
  User,
  X,
  Check,
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

interface ConversationsClientProps {
  initialConversations: Conversation[];
}

export function ConversationsClient({ initialConversations }: ConversationsClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ConversationStatus>('All');
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const statuses: ConversationStatus[] = ['New', 'Contacted', 'Completed', 'Archived'];

  const handleOpenDetail = (conv: Conversation) => {
    setSelectedConv(conv);
    setNotesDraft(conv.notes || '');
  };

  const handleUpdateStatus = async (id: number, newStatus: ConversationStatus) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
        if (selectedConv?.id === id) {
          setSelectedConv(updated);
        }
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedConv) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesDraft }),
      });

      if (res.ok) {
        const updated = await res.json();
        setConversations((prev) => prev.map((c) => (c.id === selectedConv.id ? updated : c)));
        setSelectedConv(updated);
      }
    } catch {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the conversation request from "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (selectedConv?.id === id) {
          setSelectedConv(null);
        }
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_info.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, Export */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--theme-secondary)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['All', ...statuses] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[var(--theme-accent)] text-white'
                    : 'bg-[var(--theme-card)] border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:text-[var(--theme-text)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <a
          href="/api/conversations/export"
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--theme-border)] bg-[var(--theme-card)] text-xs font-medium text-[var(--theme-text)] hover:bg-[var(--theme-bg)] transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Conversations List */}
      <div className="rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs sm:text-sm text-[var(--theme-secondary)]">
            No conversations found.
          </div>
        ) : (
          <div className="divide-y divide-[var(--theme-border)]">
            {filtered.map((c) => {
              const dateStr = new Date(c.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={c.id}
                  onClick={() => handleOpenDetail(c)}
                  className="p-4 sm:p-5 hover:bg-[var(--theme-bg)]/50 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-medium text-base text-[var(--theme-text)]">
                        {c.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          c.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {c.status}
                      </span>
                      <span className="text-xs text-[var(--theme-secondary)]">•</span>
                      <span className="text-xs text-[var(--theme-secondary)]">{dateStr}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--theme-secondary)] line-clamp-2 max-w-3xl">
                      {c.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--theme-secondary)] pt-1">
                      <span>Format: <strong className="font-normal text-[var(--theme-text)]">{c.preferred_format}</strong></span>
                      <span>Method: <strong className="font-normal text-[var(--theme-text)]">{c.contact_method}</strong> ({c.contact_info})</span>
                    </div>
                  </div>

                  {/* Quick status selector */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value as ConversationStatus)}
                      className="px-2.5 py-1 text-xs rounded border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                    >
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation Detail Modal / Drawer */}
      {selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[var(--theme-text)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--theme-border)] bg-[var(--theme-bg)]">
              <div>
                <h3 className="font-serif text-xl font-medium">{selectedConv.name}</h3>
                <p className="text-xs text-[var(--theme-secondary)] mt-0.5">
                  Received on {new Date(selectedConv.created_at).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedConv(null)}
                className="p-1.5 rounded-md text-[var(--theme-secondary)] hover:text-[var(--theme-text)] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Status Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--theme-secondary)] uppercase tracking-wider">
                  Status:
                </span>
                <div className="flex gap-1.5">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedConv.id, st)}
                      className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                        selectedConv.status === st
                          ? 'bg-[var(--theme-accent)] text-white shadow-xs'
                          : 'border border-[var(--theme-border)] text-[var(--theme-secondary)] hover:bg-[var(--theme-bg)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* What they want to talk about */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-[var(--theme-secondary)] uppercase tracking-wider">
                  What they want to talk about:
                </h4>
                <div className="p-4 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {selectedConv.content}
                </div>
              </div>

              {/* Contact & Format Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-[var(--theme-bg)] border border-[var(--theme-border)] text-xs">
                <div>
                  <span className="font-semibold text-[var(--theme-secondary)]">Preferred Format:</span>
                  <p className="text-sm font-medium mt-0.5 text-[var(--theme-text)]">{selectedConv.preferred_format}</p>
                </div>
                <div>
                  <span className="font-semibold text-[var(--theme-secondary)]">Contact Method:</span>
                  <p className="text-sm font-medium mt-0.5 text-[var(--theme-text)]">{selectedConv.contact_method}</p>
                </div>
                <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="font-semibold text-[var(--theme-secondary)]">Contact Information:</span>
                    <p className="text-sm font-mono mt-0.5 select-all text-[var(--theme-text)]">{selectedConv.contact_info}</p>
                  </div>
                  {selectedConv.contact_method === 'WhatsApp' && (
                    <a
                      href={getWhatsAppLink(selectedConv.contact_info, `Hello ${selectedConv.name}, I am following up on your note.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--theme-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Reply on WhatsApp</span>
                    </a>
                  )}
                  {selectedConv.contact_method === 'Email' && (
                    <a
                      href={`mailto:${selectedConv.contact_info}?subject=${encodeURIComponent('Following up on your message')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--theme-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
                {selectedConv.additional_context && (
                  <div className="sm:col-span-2 border-t border-[var(--theme-border)] pt-2">
                    <span className="font-semibold text-[var(--theme-secondary)]">Additional Context:</span>
                    <p className="text-xs text-[var(--theme-text)] mt-0.5">{selectedConv.additional_context}</p>
                  </div>
                )}
              </div>

              {/* Owner Private Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[var(--theme-secondary)] uppercase tracking-wider">
                    Private Owner Notes (Not visible to sender)
                  </h4>
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={handleSaveNotes}
                    className="text-xs text-[var(--theme-accent)] hover:underline font-medium cursor-pointer"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Record your private follow-up notes, conversation logs, or call dates here..."
                  className="w-full p-3 rounded-md border border-[var(--theme-border)] bg-[var(--theme-bg)] text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-bg)] flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleDelete(selectedConv.id, selectedConv.name)}
                className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete submission</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedConv(null)}
                className="px-4 py-1.5 text-xs rounded-md bg-[var(--theme-accent)] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
