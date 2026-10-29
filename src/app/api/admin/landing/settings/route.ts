import { NextRequest, NextResponse } from 'next/server';
import { landingService } from '@/services/landing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await landingService.getSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch settings' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await landingService.updateSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update settings' },
      { status: 500 },
    );
  }
}

