import { NextRequest, NextResponse } from 'next/server';
import { uploadAndReplaceSiteAsset } from '@/services/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const section = (formData.get('section') as string) || 'gallery';
    const slotNumber = (formData.get('slotNumber') as string) || '1';
    const previousStoragePath = formData.get('previousStoragePath') as
      | string
      | null;
    const settingField = formData.get('settingField') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file was provided in the request' },
        { status: 400 },
      );
    }

    const folder = section === 'settings' ? 'settings' : 'gallery';
    const filenamePrefix =
      section === 'settings'
        ? settingField || 'site-asset'
        : `${section}-slot-${slotNumber}`;

    const { publicUrl, storagePath } = await uploadAndReplaceSiteAsset(file, {
      folder,
      filenamePrefix,
      previousStoragePath,
    });

    return NextResponse.json({
      success: true,
      publicUrl,
      storagePath,
    });
  } catch (err: any) {
    console.error('[UploadAssetAPI] Error uploading asset:', err);
    return NextResponse.json(
      { error: err.message || 'Asset upload failed' },
      { status: 500 },
    );
  }
}

