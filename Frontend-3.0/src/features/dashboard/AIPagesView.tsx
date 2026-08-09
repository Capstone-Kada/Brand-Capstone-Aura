import React, { useState } from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Copy, 
  ExternalLink, 
  Palette, 
  QrCode, 
  Check, 
  Share2, 
  Eye, 
  Camera
} from 'lucide-react';
import { AIPageConfig, Product, UserProfile } from '../../types';
import { Card, Button, Input, Badge, Progress } from '../../components/ui/UIComponents';

interface AIPagesViewProps {
  user: UserProfile;
  aiPages: AIPageConfig[];
  products: Product[];
  onUpdateAIPage: (id: string, updated: Partial<AIPageConfig>) => void;
  onCopyLink: (link: string) => void;
  onPreviewPublic: () => void;
}

export const AIPagesView: React.FC<AIPagesViewProps> = ({
  user,
  aiPages,
  products,
  onUpdateAIPage,
  onCopyLink,
  onPreviewPublic
}) => {
  const activePage = aiPages[0];

  const [title, setTitle] = useState(activePage?.title || 'Kate\'s AI Skin Matchmaker');
  const [welcomeMsg, setWelcomeMsg] = useState(activePage?.welcomeMessage || 'Upload a quick selfie to discover your exact undertone & foundation matches ✨');
  const [primaryColor, setPrimaryColor] = useState(activePage?.primaryColor || '#F26CA7');
  const [bio, setBio] = useState(user.bio);
  const [allowCamera, setAllowCamera] = useState(true);

  const publicUrl = `https://beauty.ai/${activePage?.slug || 'kate-glow'}`;

  const handleSavePage = () => {
    if (activePage) {
      onUpdateAIPage(activePage.id, {
        title,
        welcomeMessage: welcomeMsg,
        primaryColor,
        allowCameraUpload: allowCamera
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">AI Recommendation Page Customizer</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Customize your interactive selfie scan page & live mobile preview</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => onCopyLink(publicUrl)} variant="outline" size="sm" icon={<Copy className="w-4 h-4" />}>
            Copy Public Link
          </Button>
          <Button onClick={onPreviewPublic} variant="primary" size="sm" icon={<ExternalLink className="w-4 h-4" />}>
            View Public Page
          </Button>
        </div>
      </div>

      {/* Editor & Live Mobile Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Customization Settings */}
        <div className="lg:col-span-7 space-y-6">
          
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">Branding & Theme Settings</h3>

            <Input
              label="AI Page Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              label="Welcome Message to Followers"
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-700 tracking-wide uppercase mb-2">
                Primary Brand Color Accent
              </label>
              <div className="flex items-center gap-3">
                {['#F26CA7', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#0F0F11'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setPrimaryColor(hex)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                      primaryColor === hex ? 'scale-110 border-zinc-900 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-zinc-900">Allow Live Webcam Camera Scan</h4>
                <p className="text-[11px] text-zinc-500">Enables followers to snap a selfie directly in their browser</p>
              </div>
              <input
                type="checkbox"
                checked={allowCamera}
                onChange={(e) => setAllowCamera(e.target.checked)}
                className="w-5 h-5 rounded text-[#F26CA7] focus:ring-[#F26CA7]"
              />
            </div>

            <Button onClick={handleSavePage} variant="primary" size="md" className="w-full">
              Publish & Save Changes Live
            </Button>
          </Card>

          {/* Share & QR Code Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900">QR Code for TikTok & IG Stories</h3>
            <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
              <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-xs">
                <QrCode className="w-16 h-16 text-zinc-900" />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-zinc-600">
                  Scan this QR code or add your custom URL <span className="font-bold text-zinc-900">{publicUrl}</span> to your social bios.
                </p>
                <Button onClick={() => onCopyLink(publicUrl)} variant="outline" size="sm" icon={<Copy className="w-3.5 h-3.5" />}>
                  Copy Bio Link
                </Button>
              </div>
            </div>
          </Card>

        </div>

        {/* Right: Live Interactive Mobile Phone Preview */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="w-4 h-4 text-[#F26CA7]" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">Real-Time Mobile Preview</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[320px] h-[640px] bg-[#0F0F11] rounded-[42px] p-3 shadow-2xl border-4 border-zinc-800 relative overflow-hidden flex flex-col">
            
            {/* Camera Notch */}
            <div className="w-28 h-4 bg-zinc-800 rounded-full mx-auto mb-2 shrink-0" />

            {/* Simulated Phone Screen */}
            <div className="flex-1 bg-[#FAFAFC] rounded-[32px] overflow-y-auto p-4 space-y-4 text-zinc-900 text-xs">
              
              {/* Creator Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="w-16 h-16 rounded-full mx-auto p-1 bg-gradient-to-tr from-[#F26CA7] to-[#FFB6D9] shadow-md">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900">{user.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-semibold">{user.handle}</p>
                </div>
                <p className="text-[11px] text-zinc-600 px-2 line-clamp-2">{title}</p>
              </div>

              {/* Upload Selfie Box */}
              <div className="p-4 bg-white rounded-2xl border border-zinc-200/80 shadow-xs text-center space-y-2">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white shadow-xs" style={{ backgroundColor: primaryColor }}>
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-[11px] text-zinc-700 font-medium leading-tight">{welcomeMsg}</p>
                <div className="py-2 px-3 rounded-xl text-white font-bold text-xs shadow-xs" style={{ backgroundColor: primaryColor }}>
                  Upload Selfie Scan
                </div>
              </div>

              {/* Products Featured Preview */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Featured Match Products</p>
                {products.slice(0, 2).map((p) => (
                  <div key={p.id} className="p-2.5 bg-white rounded-xl border border-zinc-200/60 flex items-center gap-2">
                    <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[11px] text-zinc-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-500">${p.price}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
