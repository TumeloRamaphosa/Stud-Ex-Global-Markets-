/**
 * Google Drive Integration
 * Stores generated marketing content in a shared Drive folder
 *
 * Folder: https://drive.google.com/drive/folders/1yD9nwyGqRcHbMOEyoug4kcez5CRBuDLn
 *
 * Authentication: Use Google service account or OAuth2 token.
 * Store credentials in environment variables, never in code.
 */

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1yD9nwyGqRcHbMOEyoug4kcez5CRBuDLn';
const GOOGLE_API_BASE = 'https://www.googleapis.com';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = process.env.GOOGLE_ACCESS_TOKEN;
  if (!token) throw new Error('GOOGLE_ACCESS_TOKEN not configured. Set up OAuth2 or service account.');
  return { Authorization: `Bearer ${token}` };
}

/**
 * Upload a file to the marketing content Drive folder.
 * Returns the Drive file ID and web view link.
 */
export async function uploadToDrive(
  fileName: string,
  mimeType: string,
  content: Blob | Buffer | string
): Promise<{ fileId: string; webViewLink: string }> {
  const headers = await getAuthHeaders();

  // Create metadata
  const metadata = {
    name: fileName,
    parents: [DRIVE_FOLDER_ID],
  };

  // Multipart upload
  const boundary = 'gobot_upload_boundary';
  const metadataStr = JSON.stringify(metadata);

  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    metadataStr,
    `--${boundary}`,
    `Content-Type: ${mimeType}`,
    '',
    typeof content === 'string' ? content : '',
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    `${GOOGLE_API_BASE}/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Drive upload failed: ${JSON.stringify(error)}`);
  }

  return res.json();
}

/**
 * List files in the marketing content folder.
 */
export async function listDriveFiles(
  maxResults: number = 50
): Promise<{ id: string; name: string; webViewLink: string; createdTime: string }[]> {
  const headers = await getAuthHeaders();

  const query = encodeURIComponent(`'${DRIVE_FOLDER_ID}' in parents and trashed = false`);
  const res = await fetch(
    `${GOOGLE_API_BASE}/drive/v3/files?q=${query}&pageSize=${maxResults}&fields=files(id,name,webViewLink,createdTime)&orderBy=createdTime desc`,
    { headers }
  );

  if (!res.ok) throw new Error('Failed to list Drive files');

  const data = await res.json();
  return data.files || [];
}

/**
 * Create a folder for a specific post's content.
 */
export async function createPostFolder(postTitle: string): Promise<string> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${GOOGLE_API_BASE}/drive/v3/files`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `${new Date().toISOString().split('T')[0]}_${postTitle.slice(0, 30)}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [DRIVE_FOLDER_ID],
    }),
  });

  if (!res.ok) throw new Error('Failed to create Drive folder');

  const data = await res.json();
  return data.id;
}

export const driveApi = {
  upload: uploadToDrive,
  list: listDriveFiles,
  createPostFolder,
};
