'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Shield,
  LogOut,
  Save,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/api';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    industry: '',
    website: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      await usersApi.updateProfile(user.uid, {
        display_name: formData.displayName,
        bio: formData.bio,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-2">
                <SettingsIcon size={32} className="text-gold-500" />
                Settings
              </h1>
              <p className="text-gray-400">Manage your account and preferences</p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-600/20 text-primary-300 border border-primary-600/50'
                        : 'text-gray-400 hover:text-white bg-dark-800/50 border border-primary-700/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

                  {/* Avatar */}
                  <div className="mb-8 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold">
                      {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </div>
                    <Button variant="secondary" size="sm" icon={<Upload size={18} />}>
                      Change Avatar
                    </Button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        icon={<User size={18} />}
                      />

                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Industry
                        </label>
                        <select
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">Select industry</option>
                          <option value="tech">Technology</option>
                          <option value="finance">Finance</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="retail">Retail</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <Input
                        label="Website"
                        name="website"
                        type="url"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSaving}
                      icon={<Save size={18} />}
                    >
                      Save Changes
                    </Button>
                  </form>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Security Settings</h2>

                <div className="space-y-6">
                  <div className="border-b border-primary-700/20 pb-6">
                    <h3 className="text-lg font-semibold mb-3">Password</h3>
                    <p className="text-gray-400 mb-4">Change your password regularly to keep your account secure</p>
                    <Button variant="secondary">Change Password</Button>
                  </div>

                  <div className="border-b border-primary-700/20 pb-6">
                    <h3 className="text-lg font-semibold mb-3">Two-Factor Authentication</h3>
                    <p className="text-gray-400 mb-4">Add an extra layer of security to your account</p>
                    <Badge variant="warning">Not Enabled</Badge>
                    <Button variant="secondary" className="mt-3">
                      Enable 2FA
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Connected Devices</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-primary-700/20">
                        <div>
                          <p className="font-medium">Chrome on macOS</p>
                          <p className="text-sm text-gray-400">Last active 5 minutes ago</p>
                        </div>
                        <Badge variant="success" size="sm">Current</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { id: 'messages', label: 'New Messages', enabled: true },
                    { id: 'deals', label: 'Deal Updates', enabled: true },
                    { id: 'events', label: 'Event Invitations', enabled: false },
                    { id: 'newsletter', label: 'Weekly Newsletter', enabled: true },
                  ].map((notif) => (
                    <div key={notif.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-primary-700/20">
                      <label className="flex-1 cursor-pointer">
                        <span className="font-medium">{notif.label}</span>
                      </label>
                      <input
                        type="checkbox"
                        defaultChecked={notif.enabled}
                        className="h-5 w-5 cursor-pointer accent-gold-500 rounded"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <Card>
                <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>

                <div className="space-y-6">
                  <div className="border-b border-primary-700/20 pb-6">
                    <h3 className="text-lg font-semibold mb-2">Profile Visibility</h3>
                    <p className="text-gray-400 mb-3">Control who can see your profile</p>
                    <select className="w-full rounded-lg border border-primary-700/30 bg-dark-800/50 px-4 py-2.5 text-white">
                      <option>Public</option>
                      <option>Investors Only</option>
                      <option>Entrepreneurs Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="border-b border-primary-700/20 pb-6">
                    <h3 className="text-lg font-semibold mb-3">Data & Privacy</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="data-collection" defaultChecked />
                        <label htmlFor="data-collection" className="text-gray-300 cursor-pointer">
                          Allow analytics to improve your experience
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="marketing" />
                        <label htmlFor="marketing" className="text-gray-300 cursor-pointer">
                          Allow marketing communications
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-400">Danger Zone</h3>
                    <p className="text-gray-400 mb-4">Irreversible actions</p>
                    <Button variant="secondary" onClick={handleLogout} icon={<LogOut size={18} />}>
                      Logout
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
