export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { DriveVault } from '../../../../lib/google/driveVault';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'getPhotos') {
      const photos = await DriveVault.getPhotosList();
      return NextResponse.json({ success: true, items: photos });
    } else {
      const folders = await DriveVault.getFoldersList();
      return NextResponse.json({ success: true, items: folders });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'syncPhotos') {
      const ok = await DriveVault.syncGooglePhotos();
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
