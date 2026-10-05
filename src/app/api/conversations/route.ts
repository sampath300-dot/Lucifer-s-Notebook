import { NextResponse } from 'next/server';
import { getConversations, createConversation } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ConversationStatus, PreferredFormat, ContactMethod } from '@/types';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ConversationStatus | null;

    const conversations = getConversations(status || undefined);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Honeypot check to stop spam bots
    if (body.website_url_check) {
      return NextResponse.json({ success: true, message: "Thank you for reaching out. I'll get back to you soon." });
    }

    const { name, content, preferred_format, contact_method, contact_info, additional_context } = body;

    // Field validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Please share your name or what you would like to be called.' }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Please share what's on your mind." }, { status: 400 });
    }

    if (!contact_info || !contact_info.trim()) {
      return NextResponse.json({ error: 'Please provide your contact information.' }, { status: 400 });
    }

    const validFormats: PreferredFormat[] = ['Chat', 'Voice call', 'Not sure yet'];
    const validMethods: ContactMethod[] = ['WhatsApp', 'Email', 'Phone'];

    const format: PreferredFormat = validFormats.includes(preferred_format) ? preferred_format : 'Not sure yet';
    const method: ContactMethod = validMethods.includes(contact_method) ? contact_method : 'Email';

    const saved = createConversation({
      name: name.trim(),
      content: content.trim(),
      preferred_format: format,
      contact_method: method,
      contact_info: contact_info.trim(),
      additional_context: additional_context ? additional_context.trim() : null,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. I'll get back to you soon.",
      id: saved.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting conversation request:', error);
    return NextResponse.json({ error: 'Failed to submit conversation request' }, { status: 500 });
  }
}
