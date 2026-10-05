import { NextResponse } from 'next/server';
import { getAudioJournalById, updateAudioJournal, deleteAudioJournal } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audioId = parseInt(id, 10);
    const audio = getAudioJournalById(audioId);

    if (!audio) {
      return NextResponse.json({ error: 'Audio journal not found' }, { status: 404 });
    }

    if (audio.status === 'draft') {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized to view draft' }, { status: 401 });
      }
    }

    return NextResponse.json(audio);
  } catch (error) {
    console.error('Error fetching audio journal:', error);
    return NextResponse.json({ error: 'Failed to fetch audio journal' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audioId = parseInt(id, 10);
    const data = await request.json();

    const updated = updateAudioJournal(audioId, data);
    if (!updated) {
      return NextResponse.json({ error: 'Audio journal not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating audio journal:', error);
    return NextResponse.json({ error: 'Failed to update audio journal' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audioId = parseInt(id, 10);
    const success = deleteAudioJournal(audioId);

    if (!success) {
      return NextResponse.json({ error: 'Audio journal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting audio journal:', error);
    return NextResponse.json({ error: 'Failed to delete audio journal' }, { status: 500 });
  }
}
