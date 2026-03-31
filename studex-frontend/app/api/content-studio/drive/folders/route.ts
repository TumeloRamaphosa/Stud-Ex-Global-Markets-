import { NextRequest, NextResponse } from 'next/server';

// GET /api/content-studio/drive/folders
// Lists folders in Google Drive for the folder picker
export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Drive access token is required' },
      { status: 401 }
    );
  }

  const parentId = request.nextUrl.searchParams.get('parentId') || 'root';

  try {
    // Query for folders only
    const query = `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&orderBy=name&pageSize=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      folders: (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
      })),
      parentId,
    });
  } catch (error: any) {
    console.error('Drive folders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list folders' },
      { status: 500 }
    );
  }
}

// POST /api/content-studio/drive/folders
// Creates a new folder in Google Drive
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, folderName, parentId } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Drive access token is required' },
        { status: 401 }
      );
    }

    const metadata: Record<string, any> = {
      name: folderName || 'AI Content Studio',
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentId) {
      metadata.parents = [parentId];
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create folder (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      folderId: result.id,
      folderName: result.name,
      webViewLink: result.webViewLink,
    });
  } catch (error: any) {
    console.error('Drive create folder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create folder' },
      { status: 500 }
    );
  }
}
