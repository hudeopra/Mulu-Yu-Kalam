import { NextRequest, NextResponse } from 'next/server';
import { landingService } from '@/services/landing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const about = await landingService.getAbout();
    return NextResponse.json({ about });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch about data' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const about = await landingService.updateAbout(body);
    return NextResponse.json({ success: true, about });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update about data' },
      { status: 500 },
    );
  }
}

