import { NextResponse } from 'next/server';
import { getAudioJournals, createAudioJournal } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    if (includeDrafts) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized to view drafts' }, { status: 401 });
      }
    }

    const audioJournals = getAudioJournals(includeDrafts);
    return NextResponse.json(audioJournals);
  } catch (error) {
    console.error('Failed to get audio journals:', error);
    return NextResponse.json({ error: 'Failed to get audio journals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.title || !data.audio_url) {
      return NextResponse.json({ error: 'Title and audio file are required' }, { status: 400 });
    }

    const newAudio = createAudioJournal({
      title: data.title,
      description: data.description || '',
      audio_url: data.audio_url,
      duration: data.duration || '0:00',
      cover_image: data.cover_image || null,
      status: data.status === 'draft' ? 'draft' : 'published',
      published_at: data.published_at || new Date().toISOString(),
    });

    return NextResponse.json(newAudio, { status: 201 });
  } catch (error) {
    console.error('Failed to create audio journal:', error);
    return NextResponse.json({ error: 'Failed to create audio journal' }, { status: 500 });
  }
}
