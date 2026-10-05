import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ThoughtEditorForm } from '../ThoughtEditorForm';

export const dynamic = 'force-dynamic';

export default async function NewThoughtPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl xl:max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          New Thought
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Write an unhurried essay or personal reflection.
        </p>
      </div>

      <ThoughtEditorForm isNew />
    </div>
  );
}
