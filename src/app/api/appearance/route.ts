import { NextResponse } from 'next/server';
import { getAppearanceSettings, updateAppearanceSettings, defaultAppearanceSettings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const appearance = getAppearanceSettings();
    return NextResponse.json(appearance);
  } catch (error) {
    console.error('Error getting appearance settings:', error);
    return NextResponse.json({ error: 'Failed to fetch appearance settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if reset was requested
    if (data.reset) {
      updateAppearanceSettings(defaultAppearanceSettings);
      return NextResponse.json(defaultAppearanceSettings);
    }

    updateAppearanceSettings(data);
    const updated = getAppearanceSettings();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating appearance settings:', error);
    return NextResponse.json({ error: 'Failed to update appearance settings' }, { status: 500 });
  }
}
