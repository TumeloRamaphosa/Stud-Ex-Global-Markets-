'use client';

import { useEffect, useState } from 'react';
import {
  getDriveConfig,
  saveDriveConfig,
  clearDriveConfig,
  isDriveConnected,
  GoogleDriveConfig,
} from '@/lib/content-studio/google-drive';

// Google OAuth2 scopes needed for Drive file management
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Only files created by this app
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export default function GoogleDriveCard() {
  const [config, setConfig] = useState<GoogleDriveConfig | null>(null);
  const [connected, setConnected] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const saved = getDriveConfig();
    setConfig(saved);
    setConnected(isDriveConnected());
    if (saved) {
      setClientIdInput(saved.clientId || '');
      setApiKeyInput(saved.apiKey || '');
    }

    // Handle OAuth callback
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      handleOAuthCallback(hash);
    }
  }, []);

  const handleOAuthCallback = async (hash: string) => {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (!accessToken) return;

    // Fetch user info
    let userEmail = '';
    let userName = '';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        userEmail = userData.email || '';
        userName = userData.name || '';
      }
    } catch {
      // Non-critical, continue without user info
    }

    const existing = getDriveConfig();
    const updatedConfig: GoogleDriveConfig = {
      clientId: existing?.clientId || '',
      apiKey: existing?.apiKey || '',
      isConnected: true,
      accessToken,
      expiresAt: expiresIn ? Date.now() + parseInt(expiresIn) * 1000 : undefined,
      userEmail,
      userName,
    };

    saveDriveConfig(updatedConfig);
    setConfig(updatedConfig);
    setConnected(true);

    // Clear the hash from URL
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleSaveCredentials = () => {
    if (!clientIdInput.trim()) return;

    const existing = getDriveConfig();
    const updatedConfig: GoogleDriveConfig = {
      clientId: clientIdInput.trim(),
      apiKey: apiKeyInput.trim(),
      isConnected: existing?.isConnected ?? false,
      accessToken: existing?.accessToken,
      expiresAt: existing?.expiresAt,
      userEmail: existing?.userEmail,
      userName: existing?.userName,
    };

    saveDriveConfig(updatedConfig);
    setConfig(updatedConfig);
    setIsEditing(false);
  };

  const handleConnect = () => {
    if (!config?.clientId) {
      setShowSetup(true);
      return;
    }

    // Build OAuth2 URL for implicit grant flow
    const redirectUri = window.location.origin + '/content-studio/api-keys';
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', DRIVE_SCOPES);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  };

  const handleDisconnect = () => {
    const existing = getDriveConfig();
    if (existing) {
      saveDriveConfig({
        ...existing,
        isConnected: false,
        accessToken: undefined,
        expiresAt: undefined,
        userEmail: undefined,
        userName: undefined,
      });
    }
    setConnected(false);
    setConfig(getDriveConfig());
  };

  const handleRemove = () => {
    clearDriveConfig();
    setConfig(null);
    setConnected(false);
    setClientIdInput('');
    setApiKeyInput('');
  };

  return (
    <div className="rounded-xl border border-primary-700/50 bg-primary-900/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">📁</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Google Drive
            </h3>
            <p className="text-sm text-primary-400">
              Save generated content directly to your Google Drive. Organize
              videos and images in folders automatically.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {['Auto-Save Content', 'Folder Organization', 'One-Click Upload'].map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-primary-800 px-2.5 py-0.5 text-xs text-primary-300"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          {connected ? (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
              Connected
            </span>
          ) : config?.clientId ? (
            <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
              Not signed in
            </span>
          ) : (
            <span className="rounded-full bg-primary-800 px-3 py-1 text-sm text-primary-400">
              Not configured
            </span>
          )}
        </div>
      </div>

      {/* Connected State */}
      {connected && config && (
        <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-400">Signed in as</p>
              <p className="mt-1 font-medium text-white">
                {config.userName || config.userEmail || 'Google Account'}
              </p>
              {config.userEmail && (
                <p className="text-sm text-primary-400">{config.userEmail}</p>
              )}
              {config.expiresAt && (
                <p className="mt-1 text-xs text-primary-500">
                  Token expires: {new Date(config.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
              >
                Reconnect
              </button>
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup / Edit Credentials */}
      {(!config?.clientId || isEditing || showSetup) && !connected && (
        <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
          <div className="space-y-4">
            {/* Setup Instructions */}
            <div className="rounded-lg bg-primary-800/50 p-3">
              <p className="text-sm font-medium text-primary-200">
                How to set up Google Drive:
              </p>
              <ol className="mt-2 space-y-1 text-xs text-primary-400">
                <li>
                  1. Go to{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 underline hover:text-gold-300"
                  >
                    Google Cloud Console &rarr; Credentials
                  </a>
                </li>
                <li>2. Create a project (or use existing)</li>
                <li>
                  3. Enable the{' '}
                  <a
                    href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-400 underline hover:text-gold-300"
                  >
                    Google Drive API
                  </a>
                </li>
                <li>
                  4. Create an <strong>OAuth 2.0 Client ID</strong> (Web
                  application type)
                </li>
                <li>
                  5. Add <code className="rounded bg-primary-700 px-1">
                    {typeof window !== 'undefined'
                      ? window.location.origin
                      : 'http://localhost:3000'}
                    /content-studio/api-keys
                  </code>{' '}
                  as an authorized redirect URI
                </li>
                <li>6. Copy the Client ID and paste it below</li>
                <li>
                  7. (Optional) Create an <strong>API Key</strong> for the
                  Google Picker
                </li>
              </ol>
            </div>

            {/* Client ID Input */}
            <div>
              <label className="block text-sm font-medium text-primary-200">
                Google OAuth Client ID
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="123456789-abc123.apps.googleusercontent.com"
                className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 font-mono text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* API Key Input (Optional) */}
            <div>
              <label className="block text-sm font-medium text-primary-200">
                Google API Key{' '}
                <span className="text-primary-500">(optional, for Picker)</span>
              </label>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="mt-1 w-full rounded-lg border border-primary-600 bg-primary-800 px-4 py-3 font-mono text-sm text-white placeholder-primary-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveCredentials}
                disabled={!clientIdInput.trim()}
                className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save & Connect
              </button>
              {config?.clientId && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setShowSetup(false);
                  }}
                  className="rounded-lg border border-primary-600 px-6 py-2.5 text-sm text-primary-300 transition hover:bg-primary-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Has credentials but not connected */}
      {config?.clientId && !connected && !isEditing && !showSetup && (
        <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-primary-400">
              Credentials saved. Sign in with Google to enable Drive access.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-gold-400"
              >
                Sign in with Google
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-lg border border-primary-600 px-4 py-2 text-sm text-primary-300 transition hover:bg-primary-700"
              >
                Edit
              </button>
              <button
                onClick={handleRemove}
                className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not configured — show add button */}
      {!config?.clientId && !showSetup && (
        <div className="border-t border-primary-700/30 bg-primary-900/30 px-6 py-4">
          <button
            onClick={() => setShowSetup(true)}
            className="w-full rounded-lg border-2 border-dashed border-primary-600 py-4 text-sm font-medium text-primary-300 transition hover:border-gold-500 hover:text-gold-400"
          >
            + Click to set up Google Drive integration
          </button>
        </div>
      )}
    </div>
  );
}
