import React, { useEffect, useRef, useState } from 'react';
import { User, Bell, Key, CreditCard, ShieldCheck, Copy, RefreshCw, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card, Button, Input, Tabs, Avatar, Badge } from '../../components/ui/UIComponents';
import { AvatarCropModal } from './AvatarCropModal';
import { api } from '../../services/api';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUploadAvatar: (file: File) => Promise<void>;
  onRegenerateKey: () => void;
  onCopyLink: (link: string) => void;
  onToast: (title: string, desc?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onUploadAvatar,
  onRegenerateKey,
  onCopyLink,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  // Avatar upload/crop — staged locally (preview only) until "Save Profile
  // Changes" is clicked, consistent with every other field in this form.
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [pickedImageSrc, setPickedImageSrc] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreviewUrl, setPendingAvatarPreviewUrl] = useState<string | null>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedImageSrc(URL.createObjectURL(file));
    setCropModalOpen(true);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCropped = (file: File) => {
    if (pendingAvatarPreviewUrl) URL.revokeObjectURL(pendingAvatarPreviewUrl);
    setPendingAvatarFile(file);
    setPendingAvatarPreviewUrl(URL.createObjectURL(file));
  };

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

  // Security & 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.isTwoFactorEnabled || false);
  useEffect(() => {
    setIs2FAEnabled(user.isTwoFactorEnabled || false);
  }, [user.isTwoFactorEnabled]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleGenerate2FA = async () => {
    setIsGenerating(true);
    try {
      const result = await api.auth.generate2FA();
      setSetupSecret(result.secret);
      setQrCodeDataUrl(result.qrCodeDataUrl);
    } catch (e) {
      onToast('Error', 'Failed to generate 2FA setup');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorToken || twoFactorToken.length < 6) return;
    setIsEnabling(true);
    try {
      await api.auth.enable2FA(twoFactorToken);
      setIs2FAEnabled(true);
      setQrCodeDataUrl('');
      setSetupSecret('');
      onToast('Success', 'Two-Factor Authentication enabled');
    } catch (e) {
      onToast('Error', 'Invalid 2FA code');
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable2FA = async () => {
    setIsDisabling(true);
    try {
      await api.auth.disable2FA();
      setIs2FAEnabled(false);
      onToast('Success', 'Two-Factor Authentication disabled');
    } catch (e) {
      onToast('Error', 'Failed to disable 2FA');
    } finally {
      setIsDisabling(false);
    }
  };

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (pendingAvatarFile) {
        await onUploadAvatar(pendingAvatarFile);
        if (pendingAvatarPreviewUrl) URL.revokeObjectURL(pendingAvatarPreviewUrl);
        setPendingAvatarFile(null);
        setPendingAvatarPreviewUrl(null);
      }
      onUpdateProfile({
        name,
        handle,
        bio,
        socialPlatforms: { tiktok, instagram, youtube }
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 w-full">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Account & Developer Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your creator profile, notifications, and API credentials</p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile Settings' },
          { id: 'security', label: 'Security & 2FA' },
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
              <Avatar src={pendingAvatarPreviewUrl || user.avatarUrl} name={user.name} size="lg" />
              <div>
                <Button type="button" onClick={() => avatarInputRef.current?.click()} variant="outline" size="sm">
                  Change Profile Photo
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  {pendingAvatarPreviewUrl ? 'New photo selected — click Save Profile Changes to apply.' : 'PNG, JPG up to 5MB'}
                </p>
              </div>
            </div>

            {pickedImageSrc && (
              <AvatarCropModal
                imageSrc={pickedImageSrc}
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                onCropped={handleCropped}
              />
            )}

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

            <Button type="submit" variant="primary" disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </Card>
        </form>
      )}

      {/* Security & 2FA Tab */}
      {activeTab === 'security' && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Two-Factor Authentication (2FA)
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Protect your account with an additional layer of security using an authenticator app.</p>
          </div>

          <div className="space-y-4">
            {is2FAEnabled ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-800">2FA is Enabled</h4>
                  <p className="text-xs text-emerald-600 mt-1">Your account is secured with two-factor authentication.</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisable2FA} 
                  disabled={isDisabling}
                  className="bg-white border-red-200 text-red-600 hover:bg-red-50 shrink-0"
                >
                  {isDisabling ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </div>
            ) : qrCodeDataUrl ? (
              <div className="space-y-4 max-w-sm">
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-bold text-zinc-700">1. Scan this QR code in your Authenticator App</p>
                  <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-zinc-200" />
                  <p className="text-[10px] text-zinc-500 break-all font-mono bg-white py-1 px-2 rounded border border-zinc-100">{setupSecret}</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-700">2. Enter the 6-digit code</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                    />
                    <Button onClick={handleEnable2FA} disabled={isEnabling || twoFactorToken.length < 6}>
                      Verify
                    </Button>
                  </div>
                </div>
                
                <Button variant="ghost" className="w-full" onClick={() => setQrCodeDataUrl('')}>
                  Cancel Setup
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600">Setup two-factor authentication to secure your earnings and account data.</p>
                <Button onClick={handleGenerate2FA} disabled={isGenerating}>
                  {isGenerating ? 'Loading...' : 'Set Up 2FA'}
                </Button>
              </div>
            )}
          </div>
        </Card>
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
