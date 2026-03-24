'use client';

import { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Badge from './ui/Badge';
import { Eye, EyeOff, CheckCircle, AlertTriangle, Link2 } from 'lucide-react';

interface PlatformCredentials {
  instagram: { username: string; accessToken: string; connected: boolean };
  facebook: { pageId: string; accessToken: string; connected: boolean };
  tiktok: { username: string; accessToken: string; connected: boolean };
  googleAds: { customerId: string; developerToken: string; connected: boolean };
}

interface SocialMediaConnectProps {
  onConnect?: (platform: string, credentials: any) => void;
}

export default function SocialMediaConnect({ onConnect }: SocialMediaConnectProps) {
  const [credentials, setCredentials] = useState<PlatformCredentials>({
    instagram: { username: '', accessToken: '', connected: false },
    facebook: { pageId: '', accessToken: '', connected: false },
    tiktok: { username: '', accessToken: '', connected: false },
    googleAds: { customerId: '', developerToken: '', connected: false },
  });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  const togglePassword = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleConnect = async (platform: string) => {
    setConnecting(platform);

    try {
      // Simulate connection
      await new Promise((r) => setTimeout(r, 1500));

      setCredentials((prev) => ({
        ...prev,
        [platform]: { ...prev[platform as keyof PlatformCredentials], connected: true },
      }));

      onConnect?.(platform, credentials[platform as keyof PlatformCredentials]);
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  const updateField = (platform: keyof PlatformCredentials, field: string, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value },
    }));
  };

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'from-pink-500 to-purple-500',
      borderColor: 'border-pink-200',
      bgColor: 'bg-pink-50',
      fields: [
        { key: 'username', label: 'Username', type: 'text', placeholder: '@youraccount' },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'From Meta Business Suite → API Access' },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'from-blue-500 to-blue-700',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      fields: [
        { key: 'pageId', label: 'Page ID', type: 'text', placeholder: 'Your Facebook Page ID' },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'From Meta Business Suite → API Access' },
      ],
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: 'from-slate-900 to-slate-700',
      borderColor: 'border-slate-300',
      bgColor: 'bg-slate-50',
      fields: [
        { key: 'username', label: 'Username', type: 'text', placeholder: '@yourtiktok' },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'From TikTok for Business → Developer Portal' },
      ],
    },
    {
      id: 'googleAds',
      name: 'Google Ads',
      icon: '📢',
      color: 'from-green-500 to-emerald-500',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50',
      fields: [
        { key: 'customerId', label: 'Customer ID', type: 'text', placeholder: 'XXX-XXX-XXXX' },
        { key: 'developerToken', label: 'Developer Token', type: 'password', placeholder: 'From Google Ads API Center' },
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {platforms.map((platform) => {
        const creds = credentials[platform.id as keyof PlatformCredentials];
        const isConnected = creds.connected;
        const isConnecting = connecting === platform.id;

        return (
          <Card
            key={platform.id}
            className={`p-5 border-2 transition-all ${
              isConnected ? 'border-green-300 bg-green-50/50' : platform.borderColor
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${platform.color} text-transparent bg-clip-text`}>
                  {platform.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{platform.name}</h4>
                  {isConnected ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle size={12} className="mr-1" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <AlertTriangle size={12} className="mr-1" /> Not connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {platform.fields.map((field) => (
                <div key={field.key} className="relative">
                  <Input
                    label={field.label}
                    type={
                      field.type === 'password' && !showPassword[`${platform.id}_${field.key}`]
                        ? 'password'
                        : 'text'
                    }
                    placeholder={field.placeholder}
                    value={(creds as any)[field.key] || ''}
                    onChange={(e) =>
                      updateField(platform.id as keyof PlatformCredentials, field.key, e.target.value)
                    }
                    disabled={isConnected}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => togglePassword(`${platform.id}_${field.key}`)}
                      className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                    >
                      {showPassword[`${platform.id}_${field.key}`] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleConnect(platform.id)}
              disabled={isConnected || isConnecting}
              className={`w-full mt-4 ${
                isConnected
                  ? 'bg-green-600'
                  : `bg-gradient-to-r ${platform.color}`
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : isConnected ? (
                <>
                  <CheckCircle size={16} />
                  Connected
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  Connect {platform.name}
                </>
              )}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
