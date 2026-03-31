import { NextRequest, NextResponse } from 'next/server';

// POST /api/content-studio/drive/upload
// Uploads a file to Google Drive using the user's access token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, fileUrl, fileName, folderId, mimeType } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Drive access token is required' },
        { status: 401 }
      );
    }

    if (!fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'fileUrl and fileName are required' },
        { status: 400 }
      );
    }

    // Step 1: Download the file from the generation URL
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file from ${fileUrl}: ${fileResponse.status}`);
    }
    const fileBlob = await fileResponse.blob();
    const fileBuffer = Buffer.from(await fileBlob.arrayBuffer());

    // Step 2: Upload to Google Drive using multipart upload
    const metadata: Record<string, any> = {
      name: fileName,
      mimeType: mimeType || fileBlob.type || 'application/octet-stream',
    };

    // If a folder ID is specified, put the file there
    if (folderId) {
      metadata.parents = [folderId];
    }

    // Build multipart request body
    const boundary = 'studex_drive_upload_boundary';
    const metadataStr = JSON.stringify(metadata);

    const multipartBody = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${metadataStr}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: ${metadata.mimeType}\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n`
      ),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--`),
    ]);

    // Step 3: Send to Google Drive API
    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,mimeType,size',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Google Drive upload failed (${uploadResponse.status}): ${errorText}`);
    }

    const result = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink,
      mimeType: result.mimeType,
      size: result.size,
    });
  } catch (error: any) {
    console.error('Drive upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
