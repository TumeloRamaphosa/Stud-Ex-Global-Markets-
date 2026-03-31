// ============================================
// Google Drive Integration — Types & Config
// ============================================

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string; // Google Cloud API key (for Picker)
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  userEmail?: string;
  userName?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
  webContentLink?: string;
  mimeType: string;
  size: number;
}

export interface DriveSaveRequest {
  fileUrl: string; // URL of the generated content
  fileName: string;
  folderId?: string; // Google Drive folder ID (root if not specified)
  mimeType: string;
  metadata?: Record<string, string>;
}

const DRIVE_STORAGE_KEY = 'studex_google_drive_config';

// --- Storage helpers ---
export function getDriveConfig(): GoogleDriveConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRIVE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDriveConfig(config: GoogleDriveConfig): void {
  localStorage.setItem(DRIVE_STORAGE_KEY, JSON.stringify(config));
}

export function clearDriveConfig(): void {
  localStorage.removeItem(DRIVE_STORAGE_KEY);
}

export function isDriveConnected(): boolean {
  const config = getDriveConfig();
  if (!config?.isConnected || !config.accessToken) return false;
  // Check if token is expired
  if (config.expiresAt && Date.now() > config.expiresAt) return false;
  return true;
}
