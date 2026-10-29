import { NextRequest, NextResponse } from 'next/server';
import { landingService } from '@/services/landing';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { hero, gallery } = await landingService.getGallery();
    return NextResponse.json({ hero, gallery });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch gallery items' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { hero, gallery } = await req.json();
    await landingService.updateGallery(hero, gallery);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update gallery items' },
      { status: 500 },
    );
  }
}

