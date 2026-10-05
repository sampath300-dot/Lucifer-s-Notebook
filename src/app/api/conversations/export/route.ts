import { NextResponse } from 'next/server';
import { getConversations } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function escapeCsvCell(text: string | null | undefined): string {
  if (text === null || text === undefined) return '""';
  const str = String(text).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = getConversations();

    const headers = [
      'ID',
      'Date',
      'Name',
      'Preferred Format',
      'Contact Method',
      'Contact Info',
      'What they want to talk about',
      'Additional Context',
      'Status',
      'Notes',
    ];

    const rows = conversations.map((c) => [
      c.id,
      c.created_at,
      escapeCsvCell(c.name),
      escapeCsvCell(c.preferred_format),
      escapeCsvCell(c.contact_method),
      escapeCsvCell(c.contact_info),
      escapeCsvCell(c.content),
      escapeCsvCell(c.additional_context),
      escapeCsvCell(c.status),
      escapeCsvCell(c.notes),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="conversations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting conversations:', error);
    return NextResponse.json({ error: 'Failed to export conversations' }, { status: 500 });
  }
}
