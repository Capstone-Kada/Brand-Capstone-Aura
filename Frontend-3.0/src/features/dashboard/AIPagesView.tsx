import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet,
  Monitor,
  Copy, 
  ExternalLink, 
  QrCode, 
  Check, 
  Share2, 
  Camera,
  Layers,
  Sliders,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  CheckCheck,
  Globe,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AIPageConfig, Product, UserProfile } from '../../types';
import { Card, Button } from '../../components/ui/UIComponents';

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

  // 3 Essential Tabs: Preview, AI Engine Settings, Share & QR Kit
  const [activeTab, setActiveTab] = useState<'preview' | 'ai-engine' | 'share'>('preview');

  // Device Frame Viewport for Preview Tab: 'desktop' | 'tablet' | 'mobile'
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState<number>(0);

  // AI Scan Customization states
  const [allowCamera, setAllowCamera] = useState(activePage?.allowCameraUpload ?? true);
  const [allowGallery, setAllowGallery] = useState(true);
  const [enablePreferences, setEnablePreferences] = useState(true);

  // UI feedback states
  const [isSaved, setIsSaved] = useState(false);
  const [copiedBio, setCopiedBio] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aura.technolabs.my.id';
  const cleanHandle = (user.handle || 'kate-glow').replace('@', '');
  const publicUrl = `${baseUrl}/${cleanHandle}`;

  // Synchronize state when activePage loads or changes
  useEffect(() => {
    if (activePage) {
      setAllowCamera(activePage.allowCameraUpload ?? true);
    }
  }, [activePage]);

  const handleSaveAIScanSettings = () => {
    if (activePage) {
      onUpdateAIPage(activePage.id, {
        allowCameraUpload: allowCamera
      });
    }
    setIsSaved(true);
    // Reload preview iframe to reflect changes immediately
    setPreviewKey((prev) => prev + 1);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleCopyBioLink = () => {
    onCopyLink(publicUrl);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  const handleCopyCaption = (text: string, templateKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(templateKey);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleReloadPreview = () => {
    setPreviewKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">AI Recommendation Portal Customizer</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live & Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Atur konfigurasi fitur AI scanner dan pantau tampilan langsung portal Anda di Desktop, Tablet, dan Mobile.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button 
            onClick={handleCopyBioLink} 
            variant={copiedBio ? 'primary' : 'outline'} 
            size="sm" 
            icon={copiedBio ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          >
            {copiedBio ? 'Link Tersalin!' : 'Salin Bio Link'}
          </Button>

          <Button 
            onClick={onPreviewPublic} 
            variant="outline" 
            size="sm" 
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Buka di Tab Baru
          </Button>

          <Button 
            onClick={handleSaveAIScanSettings} 
            variant="primary" 
            size="sm" 
            icon={isSaved ? <CheckCheck className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            className="shadow-md"
          >
            {isSaved ? 'Pengaturan Tersimpan!' : 'Publish Perubahan'}
          </Button>
        </div>
      </div>

      {/* TOP TAB & DEVICE SWITCHER ROW (ALIGNED ON THE SAME LINE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Main Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-200/60 rounded-2xl border border-black/[0.04] w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                : 'bg-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-[var(--primary)]" />
            <span>Live Device Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-engine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ai-engine'
                ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                : 'bg-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Pengaturan AI Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                : 'bg-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Share & QR Kit</span>
          </button>
        </div>

        {/* Right: Compact Device Icon Switcher & Quick Actions (Aligned inline when on preview tab) */}
        {activeTab === 'preview' && (
          <div className="flex items-center gap-2">
            {/* Desktop, Tablet, Mobile Icon Pill */}
            <div className="flex items-center gap-1 p-1 bg-zinc-200/60 rounded-2xl border border-black/[0.04]">
              <button
                onClick={() => setDeviceType('desktop')}
                title="Desktop View (100%)"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  deviceType === 'desktop'
                    ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeviceType('tablet')}
                title="Tablet View (768px)"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  deviceType === 'tablet'
                    ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>

              <button
                onClick={() => setDeviceType('mobile')}
                title="Mobile View (375px)"
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  deviceType === 'mobile'
                    ? 'bg-white text-zinc-900 shadow-xs border border-black/[0.04]'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions (Reload Preview & Open Fullscreen) */}
            <button
              onClick={handleReloadPreview}
              title="Reload Preview"
              className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onPreviewPublic}
              title="Buka Fullscreen di Tab Baru"
              className="p-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REAL LIVE MULTI-DEVICE PREVIEW (DESKTOP, TABLET, MOBILE)          */}
      {/* ========================================================================= */}
      {activeTab === 'preview' && (
        <div className="w-full bg-zinc-900/5 rounded-3xl p-3 sm:p-6 flex items-center justify-center min-h-[680px] border border-zinc-200/80 overflow-x-auto">
          
          {/* 1. DESKTOP VIEWPORT FRAME */}
          {deviceType === 'desktop' && (
            <div className="w-full max-w-6xl bg-[#0F0F11] rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col">
              {/* Browser Address Bar Header */}
              <div className="bg-zinc-900 px-4 py-2.5 flex items-center gap-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <div className="flex-1 max-w-md mx-auto bg-zinc-950/80 px-3 py-1 rounded-lg text-[11px] font-mono text-zinc-400 flex items-center gap-2 border border-zinc-800">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="truncate">{publicUrl}</span>
                </div>
              </div>

              {/* Real Live Embedded View */}
              <div className="relative w-full h-[620px] bg-white">
                <iframe
                  key={`desktop-${previewKey}`}
                  src={`/${cleanHandle}`}
                  title="Live Desktop Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* 2. TABLET VIEWPORT FRAME (768px) */}
          {deviceType === 'tablet' && (
            <div className="w-[768px] h-[640px] bg-[#0F0F11] rounded-[38px] p-3 shadow-2xl border-[8px] border-zinc-800 relative overflow-hidden flex flex-col shrink-0">
              <div className="w-full h-full rounded-[26px] overflow-hidden bg-white relative">
                <iframe
                  key={`tablet-${previewKey}`}
                  src={`/${cleanHandle}`}
                  title="Live Tablet Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* 3. MOBILE VIEWPORT FRAME (375px) */}
          {deviceType === 'mobile' && (
            <div className="w-[375px] h-[680px] bg-[#0F0F11] rounded-[48px] p-3 shadow-2xl border-[8px] border-zinc-800 relative overflow-hidden flex flex-col shrink-0">
              {/* Dynamic Island Notch */}
              <div className="w-24 h-4 bg-zinc-900 rounded-full mx-auto mb-1.5 shrink-0 flex items-center justify-end px-2 z-30">
                <span className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-700"></span>
              </div>

              <div className="w-full flex-1 rounded-[36px] overflow-hidden bg-white relative">
                <iframe
                  key={`mobile-${previewKey}`}
                  src={`/${cleanHandle}`}
                  title="Live Mobile Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PENGATURAN & KUSTOMISASI AI SCAN ENGINE                           */}
      {/* ========================================================================= */}
      {activeTab === 'ai-engine' && (
        <Card className="p-6 space-y-6 border-zinc-200 max-w-3xl">
          <div className="border-b border-zinc-100 pb-4">
            <h3 className="text-base font-bold text-zinc-900">Kustomisasi & Pengaturan AI Scanner</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Atur metode input selfie, alur kuesioner preferensi, dan optimasi kecerdasan AI untuk followers Anda.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Section 1: Input Foto Selfie */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                1. Metode Pengambilan Foto Selfie Follower
              </h4>

              {/* Live Camera Scan Toggle */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[var(--primary)]" />
                    <h5 className="text-xs font-bold text-zinc-900">Live Webcam / Kamera HP Langsung</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Mengizinkan follower mengambil foto selfie secara langsung via kamera perangkat browser mereka.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowCamera}
                  onChange={(e) => setAllowCamera(e.target.checked)}
                  className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Gallery Upload Toggle */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--primary)]" />
                    <h5 className="text-xs font-bold text-zinc-900">Upload Foto dari Galeri</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Mengizinkan follower mengunggah foto selfie yang sudah ada di galeri ponsel atau laptop mereka.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={allowGallery}
                  onChange={(e) => setAllowGallery(e.target.checked)}
                  className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                />
              </div>
            </div>

            {/* Section 2: Alur Kuesioner & Preferensi */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                2. Alur Kuesioner & Preferensi
              </h4>

              {/* Preference Questionnaire Toggle */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[var(--primary)]" />
                    <h5 className="text-xs font-bold text-zinc-900">Kuesioner Preferensi Makeup & Budget</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Menanyakan preferensi Budget, Finish Look (Matte / Dewy), dan Acara sebelum hasil rekomendasi produk keluar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={enablePreferences}
                  onChange={(e) => setEnablePreferences(e.target.checked)}
                  className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                />
              </div>
            </div>

            {/* Section 3: AI Intelligence & Engine Safeguard */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
                3. Kecerdasan Engine AI
              </h4>

              {/* Quality & Lighting Notice */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-purple-900">Automatic Lighting & Skin Tone Normalization</h5>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Aura AI secara otomatis menormalkan pencahayaan foto untuk mencegah kesalahan shade match yang disebabkan oleh lampu ruangan kekuningan atau backlight.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="text-xs text-zinc-400">
              Pengaturan ini akan langsung tersinkronkan ke live scanner follower Anda.
            </span>
            <Button 
              onClick={handleSaveAIScanSettings} 
              variant="primary" 
              size="md"
              icon={isSaved ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            >
              {isSaved ? 'Berhasil Disimpan!' : 'Simpan Pengaturan AI'}
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SHARE, QR CODE & MEDIA KIT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'share' && (
        <Card className="p-6 space-y-6 border-zinc-200 max-w-3xl">
          <div className="border-b border-zinc-100 pb-4">
            <h3 className="text-base font-bold text-zinc-900">Share, QR Code & Media Kit</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gunakan link dan QR code ini untuk dipasang di Bio Instagram, TikTok Stories, dan YouTube Shorts.
            </p>
          </div>

          {/* Bio Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
              Link Publik Creator
            </label>
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 text-xs bg-transparent font-mono text-zinc-800 outline-none select-all"
              />
              <Button
                onClick={handleCopyBioLink}
                size="sm"
                variant={copiedBio ? 'primary' : 'outline'}
              >
                {copiedBio ? 'Tersalin!' : 'Salin Link'}
              </Button>
            </div>
          </div>

          {/* QR Code Story Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/80 border border-pink-100 flex flex-col sm:flex-row items-center gap-5">
            <div className="p-3.5 bg-white rounded-2xl border border-pink-200/80 shadow-md flex items-center justify-center shrink-0">
              <QrCode className="w-20 h-20 text-zinc-900" />
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-xs font-extrabold text-zinc-900">QR Code untuk Instagram & TikTok Stories</h4>
              <p className="text-xs text-zinc-600">
                Follower Anda cukup scan QR code ini dengan kamera HP mereka untuk langsung masuk ke halaman pencocokan shade Anda.
              </p>
              <Button
                onClick={handleCopyBioLink}
                variant="outline"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Salin Link Bio
              </Button>
            </div>
          </div>

          {/* Bio Caption Templates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Template Caption Bio Siap Pakai
            </h4>

            {[
              {
                key: 'ig',
                label: 'Format Bio Instagram',
                text: `✨ Temukan shade foundation & makeup yang 100% cocok buat undertone kulitmu!\n👉 Scan wajahmu gratis di sini: ${publicUrl}`
              },
              {
                key: 'tiktok',
                label: 'Format Bio TikTok',
                text: `Bingung pilih shade makeup? Scan wajahmu pakai AI di bio aku ya! 👇✨\n${publicUrl}`
              }
            ].map((tpl) => (
              <div key={tpl.key} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-700">{tpl.label}</span>
                  <button
                    onClick={() => handleCopyCaption(tpl.text, tpl.key)}
                    className="text-[11px] font-bold text-[var(--primary)] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {copiedTemplate === tpl.key ? (
                      <>
                        <Check className="w-3 h-3" /> Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Salin Teks
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-600 font-mono whitespace-pre-line bg-white p-2.5 rounded-xl border border-zinc-200/60">
                  {tpl.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};
