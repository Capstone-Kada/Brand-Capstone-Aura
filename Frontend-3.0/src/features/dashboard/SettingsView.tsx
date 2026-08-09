import React, { useState } from 'react';
import { User, Bell, Key, CreditCard, ShieldCheck, Copy, RefreshCw, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card, Button, Input, Tabs, Avatar, Badge } from '../../components/ui/UIComponents';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onRegenerateKey: () => void;
  onCopyLink: (link: string) => void;
  onToast: (title: string, desc?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onRegenerateKey,
  onCopyLink,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [tiktok, setTiktok] = useState(user.socialPlatforms.tiktok || '');
  const [instagram, setInstagram] = useState(user.socialPlatforms.instagram || '');
  const [youtube, setYoutube] = useState(user.socialPlatforms.youtube || '');

  // Notifications
  const [emailDigest, setEmailDigest] = useState(user.notifications.emailDigest);
  const [conversionAlerts, setConversionAlerts] = useState(user.notifications.conversionAlerts);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      handle,
      bio,
      socialPlatforms: { tiktok, instagram, youtube }
    });
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Account & Developer Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your creator profile, notifications, and API credentials</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile Settings' },
          { id: 'notifications', label: 'Notification Preferences' },
          { id: 'api', label: 'Developer API Keys' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">Creator Profile Info</h3>

            <div className="flex items-center gap-4">
              <Avatar src={user.avatarUrl} name={user.name} size="lg" />
              <div>
                <Button type="button" onClick={() => onToast('Avatar Updated', 'New profile picture uploaded.')} variant="outline" size="sm">
                  Change Profile Photo
                </Button>
                <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Creator Handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>

            <Input
              label="Creator Bio / Tagline"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pt-2">Connected Social Links</h4>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="TikTok Handle"
                placeholder="@username"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
              />
              <Input
                label="Instagram Handle"
                placeholder="@username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
              <Input
                label="YouTube Channel"
                placeholder="ChannelName"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary">
              Save Profile Changes
            </Button>
          </Card>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">Alert & Email Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Instant Conversion Alerts</h4>
                <p className="text-[11px] text-zinc-500">Get notified when a follower completes an affiliate purchase match</p>
              </div>
              <input
                type="checkbox"
                checked={conversionAlerts}
                onChange={(e) => {
                  setConversionAlerts(e.target.checked);
                  onToast('Preferences Saved', 'Notification setting updated.');
                }}
                className="w-5 h-5 rounded text-[#F26CA7]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Weekly Performance Digest</h4>
                <p className="text-[11px] text-zinc-500">Weekly email summary of scan volume, CTR, and top matched products</p>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => {
                  setEmailDigest(e.target.checked);
                  onToast('Preferences Saved', 'Notification setting updated.');
                }}
                className="w-5 h-5 rounded text-[#F26CA7]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* API Key Tab */}
      {activeTab === 'api' && (
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Aura API Credentials</h3>
              <p className="text-xs text-zinc-500">Use this API key to programmatically submit products or fetch follower scan reports.</p>
            </div>
            <Badge variant="primary">PRODUCTION LIVE</Badge>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700">Secret API Key</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={user.apiKey}
                className="flex-1 bg-zinc-100 border border-zinc-200 text-zinc-900 text-xs rounded-xl py-2.5 px-3.5 font-mono"
              />
              <Button onClick={() => onCopyLink(user.apiKey)} variant="outline" size="sm" icon={<Copy className="w-4 h-4" />}>
                Copy Key
              </Button>
              <Button onClick={onRegenerateKey} variant="ghost" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
                Roll Key
              </Button>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-xs text-amber-800">
            <p className="font-bold">⚠️ Keep your Secret Key Private</p>
            <p>Do not expose this key in client-side applications. Always call Aura endpoints from a server context.</p>
          </div>
        </Card>
      )}

    </div>
  );
};
