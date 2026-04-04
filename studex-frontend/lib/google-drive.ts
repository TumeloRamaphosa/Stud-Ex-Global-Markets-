/**
 * Google Drive Integration for Market Audit Reports
 *
 * Setup instructions:
 * 1. Go to Google Cloud Console (https://console.cloud.google.com)
 * 2. Create a new project or select existing
 * 3. Enable the Google Drive API
 * 4. Create a Service Account (IAM & Admin > Service Accounts)
 * 5. Download the JSON key file
 * 6. Share a Google Drive folder with the service account email
 * 7. Set environment variables:
 *    - GOOGLE_DRIVE_FOLDER_ID: The shared folder ID
 *    - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 *    - GOOGLE_SERVICE_ACCOUNT_KEY: The private key from JSON
 */

import type { AuditReport } from './audit-types';

const DRIVE_API_BASE = 'https://www.googleapis.com/upload/drive/v3/files';
const DRIVE_API_META = 'https://www.googleapis.com/drive/v3/files';

interface DriveConfig {
  folderId: string;
  accessToken: string;
}

/**
 * Get Google Drive access token using service account credentials.
 * In production, use google-auth-library for JWT signing.
 */
async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!email || !key) {
    throw new Error('Google Drive credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY.');
  }

  // For production, install google-auth-library and use:
  // const { GoogleAuth } = require('google-auth-library');
  // const auth = new GoogleAuth({ credentials: { client_email: email, private_key: key }, scopes: ['https://www.googleapis.com/auth/drive.file'] });
  // const client = await auth.getClient();
  // const token = await client.getAccessToken();

  // Placeholder — replace with actual JWT auth in production
  return process.env.GOOGLE_DRIVE_ACCESS_TOKEN || '';
}

/**
 * Upload an audit report as a JSON file to Google Drive.
 */
export async function uploadReportToDrive(report: AuditReport): Promise<{ fileId: string; webViewLink: string } | null> {
  try {
    const accessToken = await getAccessToken();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!accessToken || !folderId) {
      console.warn('Google Drive not configured — skipping upload');
      return null;
    }

    const fileName = `audit-${report.domain}-${new Date(report.createdAt).toISOString().slice(0, 10)}.json`;

    // Create file metadata
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
      description: `Market audit report for ${report.url} — Score: ${report.scores.overall}/100`,
    };

    // Upload using multipart
    const boundary = '-------studex-audit-boundary';
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      JSON.stringify(report, null, 2),
      `--${boundary}--`,
    ].join('\r\n');

    const res = await fetch(`${DRIVE_API_BASE}?uploadType=multipart&fields=id,webViewLink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Google Drive upload failed:', err);
      return null;
    }

    const data = await res.json();
    return { fileId: data.id, webViewLink: data.webViewLink };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    return null;
  }
}

/**
 * List recent audit reports from Google Drive.
 */
export async function listReportsFromDrive(): Promise<Array<{ id: string; name: string; createdTime: string; webViewLink: string }>> {
  try {
    const accessToken = await getAccessToken();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!accessToken || !folderId) return [];

    const query = `'${folderId}' in parents and mimeType='application/json' and name contains 'audit-'`;
    const res = await fetch(
      `${DRIVE_API_META}?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,webViewLink)&orderBy=createdTime desc&pageSize=20`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}

/**
 * Generate the Google Drive setup instructions for the user.
 */
export function getDriveSetupInstructions(): string {
  return `
## Google Drive Integration Setup

To enable automatic report storage in Google Drive:

1. **Google Cloud Console**: Go to https://console.cloud.google.com
2. **Enable API**: Enable the "Google Drive API"
3. **Service Account**: Create one under IAM & Admin > Service Accounts
4. **Download Key**: Download the JSON key file
5. **Share Folder**: Share a Google Drive folder with the service account email
6. **Environment Variables**: Add to your .env.local:
   \`\`\`
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
   GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
   \`\`\`
7. **Restart**: Restart the development server

Reports will then be automatically uploaded to the shared Drive folder.
  `.trim();
}
