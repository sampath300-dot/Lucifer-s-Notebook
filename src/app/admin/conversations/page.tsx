import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getConversations } from '@/lib/db';
import { ConversationsClient } from './ConversationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminConversationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const conversations = getConversations();

  return (
    <div className="p-6 sm:p-10 max-w-6xl xl:max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          Conversations
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Private requests and messages submitted by visitors who want to talk through something.
        </p>
      </div>

      <ConversationsClient initialConversations={conversations} />
    </div>
  );
}
