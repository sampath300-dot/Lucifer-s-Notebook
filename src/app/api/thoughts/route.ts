import { NextResponse } from 'next/server';
import { getThoughts, createThought, getThoughtBySlug } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    // If caller requests drafts, require admin authentication
    if (includeDrafts) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized to view drafts' }, { status: 401 });
      }
    }

    const thoughts = getThoughts(includeDrafts);
    return NextResponse.json(thoughts);
  } catch (error) {
    console.error('Failed to get thoughts:', error);
    return NextResponse.json({ error: 'Failed to get thoughts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!slug) {
      slug = 'thought-' + Date.now();
    } else {
      const existing = getThoughtBySlug(slug, true);
      if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-5)}`;
      }
    }

    const newThought = createThought({
      title: data.title,
      slug,
      excerpt: data.excerpt || data.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
      content: data.content,
      cover_image: data.cover_image || null,
      category: data.category || 'Reflections',
      tags: data.tags || '',
      status: data.status === 'draft' ? 'draft' : 'published',
      published_at: data.published_at || new Date().toISOString(),
    });

    return NextResponse.json(newThought, { status: 201 });
  } catch (error) {
    console.error('Failed to create thought:', error);
    return NextResponse.json({ error: 'Failed to create thought' }, { status: 500 });
  }
}
