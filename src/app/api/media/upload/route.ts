import { NextResponse } from 'next/server';
import { addMediaItem } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalName = file.name || 'unnamed-file';
    const ext = path.extname(originalName) || '';
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    const savedFileName = `${baseName}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, savedFileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${savedFileName}`;

    const mediaItem = addMediaItem({
      filename: savedFileName,
      original_name: originalName,
      mime_type: file.type || 'application/octet-stream',
      size: file.size,
      url: publicUrl,
    });

    return NextResponse.json(mediaItem, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
