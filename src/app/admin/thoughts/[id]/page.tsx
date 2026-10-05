import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getThoughtById } from '@/lib/db';
import { ThoughtEditorForm } from '../ThoughtEditorForm';

export const dynamic = 'force-dynamic';

export default async function EditThoughtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const thoughtId = parseInt(id, 10);
  const thought = getThoughtById(thoughtId);

  if (!thought) {
    notFound();
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto w-full space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[var(--theme-text)]">
          Edit Thought
        </h1>
        <p className="text-xs sm:text-sm text-[var(--theme-secondary)] mt-1">
          Update content, categories, or publication status.
        </p>
      </div>

      <ThoughtEditorForm initialThought={thought} />
    </div>
  );
}
