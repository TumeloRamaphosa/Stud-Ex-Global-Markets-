'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  getDriveConfig,
  isDriveConnected,
  GoogleDriveConfig,
  DriveUploadResult,
} from '@/lib/content-studio/google-drive';
import Link from 'next/link';

interface SaveToDriveProps {
  fileUrl?: string;
  fileName: string;
  mimeType: string;
}

interface DriveFolder {
  id: string;
  name: string;
}

export default function SaveToDrive({ fileUrl, fileName, mimeType }: SaveToDriveProps) {
  const [driveConfig, setDriveConfig] = useState<GoogleDriveConfig | null>(null);
  const [connected, setConnected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DriveUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderPath, setFolderPath] = useState<DriveFolder[]>([{ id: 'root', name: 'My Drive' }]);

  useEffect(() => {
    const config = getDriveConfig();
    setDriveConfig(config);
    setConnected(isDriveConnected());
  }, []);

  const loadFolders = async (parentId: string = 'root') => {
    if (!driveConfig?.accessToken) return;
    setLoadingFolders(true);
    try {
      const res = await fetch(`/api/content-studio/drive/folders?parentId=${parentId}`, {
        headers: {
          Authorization: `Bearer ${driveConfig.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load folders');
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingFolders(false);
    }
  };

  const handleOpenFolderPicker = () => {
    setShowFolderPicker(true);
    setFolderPath([{ id: 'root', name: 'My Drive' }]);
    loadFolders('root');
  };

  const handleNavigateFolder = (folder: DriveFolder) => {
    setFolderPath([...folderPath, folder]);
    loadFolders(folder.id);
  };

  const handleNavigateBack = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    loadFolders(newPath[newPath.length - 1].id);
  };

  const handleSelectFolder = (folder: DriveFolder | null) => {
    setSelectedFolder(folder);
    setShowFolderPicker(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !driveConfig?.accessToken) return;
    setCreatingFolder(true);
    try {
      const currentParent = folderPath[folderPath.length - 1];
      const res = await fetch('/api/content-studio/drive/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: driveConfig.accessToken,
          folderName: newFolderName.trim(),
          parentId: currentParent.id === 'root' ? undefined : currentParent.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to create folder');
      const data = await res.json();
      const newFolder = { id: data.folderId, name: data.folderName };
      setFolders([...folders, newFolder]);
      setSelectedFolder(newFolder);
      setNewFolderName('');
      setShowFolderPicker(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUpload = async () => {
    if (!fileUrl || !driveConfig?.accessToken) return;
    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const res = await fetch('/api/content-studio/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: driveConfig.accessToken,
          fileUrl,
          fileName,
          folderId: selectedFolder?.id,
          mimeType,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      const result = await res.json();
      setUploadResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Not connected to Google Drive
  if (!connected) {
    return (
      <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📁</span>
            <div>
              <p className="text-sm font-medium text-primary-300">
                Save to Google Drive
              </p>
              <p className="text-xs text-primary-500">
                Connect your Google Drive to save generated content
              </p>
            </div>
          </div>
          <Link
            href="/content-studio/api-keys"
            className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
          >
            Set Up Drive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📁</span>
        <h4 className="font-medium text-white">Save to Google Drive</h4>
        {driveConfig?.userEmail && (
          <span className="text-xs text-primary-500">({driveConfig.userEmail})</span>
        )}
      </div>

      {/* Folder Selection */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-primary-600 bg-primary-800 px-3 py-2 text-sm">
          <span className="text-primary-500">Folder: </span>
          <span className="text-white">
            {selectedFolder ? selectedFolder.name : 'My Drive (root)'}
          </span>
        </div>
        <button
          onClick={handleOpenFolderPicker}
          className="rounded-lg border border-primary-600 px-3 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
        >
          Browse
        </button>
      </div>

      {/* Folder Picker Modal */}
      {showFolderPicker && (
        <div className="mt-3 rounded-lg border border-primary-600 bg-primary-800 p-4">
          {/* Breadcrumb */}
          <div className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            {folderPath.map((folder, i) => (
              <span key={folder.id} className="flex items-center gap-1">
                {i > 0 && <span className="text-primary-500">/</span>}
                <button
                  onClick={() => handleNavigateBack(i)}
                  className="text-gold-400 hover:text-gold-300"
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>

          {/* Folder List */}
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {loadingFolders ? (
              <p className="py-4 text-center text-sm text-primary-400">
                Loading folders...
              </p>
            ) : folders.length === 0 ? (
              <p className="py-4 text-center text-sm text-primary-500">
                No subfolders found
              </p>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-primary-700"
                >
                  <button
                    onClick={() => handleNavigateFolder(folder)}
                    className="flex items-center gap-2 text-sm text-primary-200"
                  >
                    <span>📂</span>
                    {folder.name}
                  </button>
                  <button
                    onClick={() => handleSelectFolder(folder)}
                    className="rounded bg-gold-500/20 px-2 py-1 text-xs text-gold-400 hover:bg-gold-500/30"
                  >
                    Select
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Create New Folder */}
          <div className="mt-3 flex gap-2 border-t border-primary-700 pt-3">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name..."
              className="flex-1 rounded-lg border border-primary-600 bg-primary-900 px-3 py-2 text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none"
            />
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || creatingFolder}
              className="rounded-lg bg-gold-500/20 px-3 py-2 text-sm text-gold-400 transition hover:bg-gold-500/30 disabled:opacity-50"
            >
              {creatingFolder ? 'Creating...' : 'Create'}
            </button>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleSelectFolder(folderPath[folderPath.length - 1].id === 'root' ? null : folderPath[folderPath.length - 1])}
              className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-primary-950 transition hover:bg-gold-400"
            >
              Use Current Folder
            </button>
            <button
              onClick={() => setShowFolderPicker(false)}
              className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!fileUrl || uploading}
        className={clsx(
          'mt-3 w-full rounded-lg py-3 text-sm font-semibold transition',
          fileUrl && !uploading
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'cursor-not-allowed bg-primary-700 text-primary-500'
        )}
      >
        {uploading
          ? 'Uploading to Google Drive...'
          : !fileUrl
            ? 'Generate content first to save'
            : `Save "${fileName}" to Drive`}
      </button>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-3 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
          <p className="text-sm font-medium text-green-400">
            Saved to Google Drive!
          </p>
          <p className="mt-1 text-xs text-green-300">
            {uploadResult.fileName}
          </p>
          {uploadResult.webViewLink && (
            <a
              href={uploadResult.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm text-gold-400 underline hover:text-gold-300"
            >
              Open in Google Drive &rarr;
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-red-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
