import { NextResponse } from 'next/server';
import { getThoughtById, updateThought, deleteThought } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const thoughtId = parseInt(id, 10);
    const thought = getThoughtById(thoughtId);

    if (!thought) {
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 });
    }

    if (thought.status === 'draft') {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized to view draft' }, { status: 401 });
      }
    }

    return NextResponse.json(thought);
  } catch (error) {
    console.error('Error fetching thought:', error);
    return NextResponse.json({ error: 'Failed to fetch thought' }, { status: 500 });
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
    const thoughtId = parseInt(id, 10);
    const data = await request.json();

    const updated = updateThought(thoughtId, data);
    if (!updated) {
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating thought:', error);
    return NextResponse.json({ error: 'Failed to update thought' }, { status: 500 });
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
    const thoughtId = parseInt(id, 10);
    const success = deleteThought(thoughtId);

    if (!success) {
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thought:', error);
    return NextResponse.json({ error: 'Failed to delete thought' }, { status: 500 });
  }
}
