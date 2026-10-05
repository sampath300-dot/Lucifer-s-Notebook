import React from 'react';
import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/db';
import { TalkClient } from './TalkClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteSettings();
  return {
    title: `Let's Talk — ${site.website_name}`,
    description: "If there's something you're struggling with, thinking about, or simply want to talk through, you can tell me about it here.",
  };
}

export default async function TalkPage() {
  const site = getSiteSettings();

  return (
    <TalkClient
      whatsappNumber={site.whatsapp}
      email={site.email}
    />
  );
}
