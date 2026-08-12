import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  RotateCcw, 
  ShoppingBag,
  Loader2,
  ChevronLeft,
  User,
  Check,
  Video,
  X,
  ArrowRight,
  Sun,
  Palette,
  Award,
  RefreshCw,
  GitCompare,
  Plus,
  Minus,
  Heart,
  ShieldCheck,
  Zap,
  Scan,
  Info
} from 'lucide-react';
import { RouteView, Product, AIAnalysisResult, UserProfile } from '../../types';
import { Button, Card, Badge, Progress } from '../../components/ui/UIComponents';
import { api, mapListingToProduct, type PublicAIPageDto } from '../../services/api';
import confetti from 'canvas-confetti';

interface PublicAIExperienceProps {
  user: UserProfile;
  products: Product[];
  pageSlug?: string;
  scannedImage: string | null;
  isAnalyzing: boolean;
  analysisStep: number;
  scanResult: AIAnalysisResult | null;
  isPublicView?: boolean;
  onStartScan: (img: string) => void;
  onResetScan: () => void;
  onNavigate: (route: RouteView) => void;
  onToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  onRecordClick?: (listingId: string) => void;
}

type ScanFlowStep = 'gateway' | 'camera-guide' | 'camera' | 'scanning' | 'select-area' | 'enter-name' | 'result' | 'recommendations';
type AnalysisArea = 'bibir' | 'shade';

export const PublicAIExperience: React.FC<PublicAIExperienceProps> = ({
  user,
  products: productsProp,
  pageSlug,
  scanResult,
  isAnalyzing,
  isPublicView = false,
  onStartScan,
  onResetScan,
  onNavigate,
  onToast,
  onRecordClick
}) => {
  // Public/anonymous visitors have no logged-in `user`/`products` in the store — resolve the
  // page owner's branding + featured catalog independently from the URL slug instead.
  const [publicPageData, setPublicPageData] = useState<PublicAIPageDto | null>(null);

  useEffect(() => {
    if (!pageSlug) return;
    let cancelled = false;
    api.aiPages
      .publicBySlug(pageSlug)
      .then((page) => {
        if (!cancelled) setPublicPageData(page);
      })
      .catch(() => {
        // Page not found/unpublished — fall back to whatever user/products props were passed in.
      });
    return () => {
      cancelled = true;
    };
  }, [pageSlug]);

  const products = publicPageData ? publicPageData.featuredListings.map(mapListingToProduct) : productsProp;
  const creator = publicPageData
    ? {
        name: publicPageData.creatorName || publicPageData.title,
        avatarUrl: publicPageData.avatarUrl || '',
        handle: publicPageData.creatorHandle,
        bio: publicPageData.bio || '',
      }
    : { name: user.name, avatarUrl: user.avatarUrl, handle: user.handle, bio: user.bio };

  // Local Flow Control State
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [initialLoadProgress, setInitialLoadProgress] = useState<number>(0);
  const [loadingStageText, setLoadingStageText] = useState<string>('Memulai Aura AI Beauty Engine...');

  const [currentStep, setCurrentStep] = useState<ScanFlowStep>('gateway');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AnalysisArea | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [subQuestionIndex, setSubQuestionIndex] = useState<number>(0);
  
  // Beauty Preference Questionnaire State (AURA PRD Feature 2) - Mandatory selections
  const [budgetPref, setBudgetPref] = useState<string>('');
  const [finishPref, setFinishPref] = useState<string>('');
  const [occasionPref, setOccasionPref] = useState<string>('');
  
  // Product Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  const [animatedScore, setAnimatedScore] = useState<number>(0);

  // Result step score count-up animation with 1.2s delay
  useEffect(() => {
    if (currentStep === 'result') {
      const targetScore = scanResult ? Math.min(100, Math.max(0, Math.round(scanResult.confidence))) : 87;
      setAnimatedScore(0);
      let startTime: number | null = null;
      const delayMs = 1200; // 1.2s delay
      const duration = 1400;
      let animId: number;

      const timer = setTimeout(() => {
        const animateCounter = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setAnimatedScore(Math.round(eased * targetScore));
          if (progress < 1) {
            animId = requestAnimationFrame(animateCounter);
          }
        };

        animId = requestAnimationFrame(animateCounter);
      }, delayMs);

      return () => {
        clearTimeout(timer);
        if (animId) cancelAnimationFrame(animId);
      };
    }
  }, [currentStep, scanResult]);

  // Pre-select top products for comparison when reaching result step
  useEffect(() => {
    if (currentStep === 'result' && compareIds.length === 0) {
      const rels = getRelevantProducts();
      if (rels.length >= 2) {
        setCompareIds([rels[0].id, rels[1].id]);
      } else if (rels.length === 1) {
        setCompareIds([rels[0].id]);
      }
    }
  }, [currentStep]);

  const toggleCompareProduct = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pId) => pId !== id);
      }
      if (prev.length >= 3) {
        onToast('Maksimal 3 Produk', 'Anda dapat membandingkan hingga 3 produk sekaligus.', 'info');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Initial Page Loading Animation Simulation
  useEffect(() => {
    if (!isInitialLoading) return;
    setInitialLoadProgress(0);
    setLoadingStageText('Memuat AI Beauty Engine...');
    
    const interval = setInterval(() => {
      setInitialLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsInitialLoading(false), 400);
          return 100;
        }
        const next = prev + 10;
        if (next >= 30 && next < 65) {
          setLoadingStageText('Memuat model AI & spektrum warna...');
        } else if (next >= 65 && next < 90) {
          setLoadingStageText('Menyiapkan ruang analisis personal Anda...');
        } else if (next >= 90) {
          setLoadingStageText('Siap! Mengalihkan ke Halaman AI...');
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isInitialLoading]);

  const triggerReplayLoading = () => {
    setIsInitialLoading(true);
  };
  
  // Scanning Animation Progress State
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Memulai deteksi sensor AI...');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Live Camera Handlers
  const startCamera = async () => {
    setCurrentStep('camera');
    setIsCameraActive(true);
    setCameraError(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Kamera tidak didukung di perangkat ini. Anda dapat mengunggah foto.');
      }
    } catch (err) {
      console.warn('Camera access prevented or unavailable:', err);
      setCameraError('Akses kamera tidak diizinkan. Silakan pilih foto dari perangkat Anda.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        stopCamera();
        initiateScanProcess(dataUrl);
        return;
      }
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          initiateScanProcess(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Scanning Process Animation (Configured to 8 Seconds total)
  // Real AI analysis is kicked off in parallel via onStartScan — the cosmetic
  // progress bar below is independent of when the API call actually resolves;
  // the 'result' step (several steps later) reads the live `scanResult` prop.
  const initiateScanProcess = (imgUrl: string) => {
    setCapturedImage(imgUrl);
    onStartScan(imgUrl);
    setCurrentStep('scanning');
    setScanProgress(0);
    setSelectedArea(null);
    setBudgetPref('');
    setFinishPref('');
    setOccasionPref('');
    setSubQuestionIndex(0);
    setScanStatusText('Mendeteksi pola kontur & fitur wajah...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep('select-area');
          }, 800);
          return 100;
        }
        const next = prev + 1;
        if (next >= 25 && next < 50) {
          setScanStatusText('Menganalisis tingkat pigmentasi & kelembapan...');
        } else if (next >= 50 && next < 75) {
          setScanStatusText('Menganalisis spektrum undertone & skin tone...');
        } else if (next >= 75 && next < 95) {
          setScanStatusText('Mengomparasi spektrum warna dengan database AI...');
        } else if (next >= 95) {
          setScanStatusText('Pemindaian AI Selesai!');
        }
        return next;
      });
    }, 80); // 80ms * 100 ticks = 8000ms (8 detik)
  };

  const handleProceedToNameStep = () => {
    setCurrentStep('enter-name');
  };

  const handleFinalizeResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      onToast('Masukkan Nama', 'Silakan isi nama Anda terlebih dahulu.', 'error');
      return;
    }
    setCurrentStep('result');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
  };

  const handleReset = () => {
    stopCamera();
    setCapturedImage(null);
    setCustomerName('');
    setSelectedArea(null);
    setBudgetPref('');
    setFinishPref('');
    setOccasionPref('');
    setSubQuestionIndex(0);
    setCurrentStep('gateway');
    onResetScan();
  };

  const triggerShare = () => {
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    const shareText = `Halo! Saya ${customerName || 'Customer'} baru saja melakukan AI Skin Scan bersama ${creator.name} di Aura!`;
    if (navigator.share) {
      navigator.share({
        title: `${creator.name} - AI Skin Recommendation`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onToast('Link Disalin!', 'Bagikan link ini kepada teman-teman Anda.', 'success');
    }
  };

  const handleAffiliateClick = (prod: Product) => {
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    onRecordClick?.(prod.id);
    window.open(prod.affiliateUrl, '_blank');
    onToast('Mengalihkan ke Produk', `Membuka produk ${prod.name} di toko mitra.`, 'info');
  };

  // Filter products based on selected area (Lips vs Face & Shade)
  const getRelevantProducts = () => {
    if (scanResult && scanResult.recommendedProducts.length > 0) {
      const aiMatched = scanResult.recommendedProducts.map((m) => m.product);
      const areaFiltered =
        selectedArea === 'bibir'
          ? aiMatched.filter((p) => p.mainCategory === 'Lips' || ['Lipstick', 'Lip Tint', 'Lip Cream', 'Lip Velvet', 'Lip Gloss', 'Lip Balm'].includes(p.category))
          : aiMatched.filter((p) => p.mainCategory === 'Face & Shade' || ['Cushion', 'Foundation', 'Concealer', 'Blush & Cheek Tint', 'Powder', 'Contour & Bronzer', 'Eyeshadow'].includes(p.category));
      if (areaFiltered.length > 0) return areaFiltered;
      if (aiMatched.length > 0) return aiMatched;
    }
    if (selectedArea === 'bibir') {
      const lipProds = products.filter(p => p.mainCategory === 'Lips' || ['Lipstick', 'Lip Tint', 'Lip Cream', 'Lip Velvet', 'Lip Gloss', 'Lip Balm'].includes(p.category));
      return lipProds.length > 0 ? lipProds : products.filter(p => ['Lipstick', 'Lip Tint', 'Lip Cream'].includes(p.category));
    }
    const shadeProds = products.filter(p => p.mainCategory === 'Face & Shade' || ['Cushion', 'Foundation', 'Concealer', 'Blush & Cheek Tint', 'Powder', 'Contour & Bronzer'].includes(p.category));
    return shadeProds.length > 0 ? shadeProds : products;
  };

  // Steps map for top progress bar
  const stepNumber = {
    'gateway': 1,
    'camera-guide': 1,
    'camera': 1,
    'scanning': 1,
    'select-area': 2,
    'enter-name': 3,
    'result': 4,
    'recommendations': 5
  }[currentStep];

  const gatewayCenterContent = (
    <>
      {isPublicView && creator.name && (
        <p className="text-xs font-semibold text-zinc-400">
          Dipersembahkan oleh <span className="text-zinc-700">{creator.name}</span>
        </p>
      )}

      <div className="space-y-3">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-balance leading-[1.1]">
          <span className="text-zinc-950">What's your</span>
          <br />
          <span className="text-[#F26CA7]">beauty match?</span>
        </h1>

        <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md mx-auto">
          Get personalized product recommendations based on your unique skin, tone, and features.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
        {[
          { icon: ShieldCheck, title: 'Secure & Private', desc: 'Your data is safe with us.' },
          { icon: Sparkles, title: 'AI-Powered', desc: 'Advanced AI for accurate results.' },
          { icon: Zap, title: 'Instant Results', desc: 'Get your match in seconds.' },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-2 px-4 py-2.5 sm:py-0 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#F26CA7]/10 text-[#F26CA7] flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 leading-tight">{item.title}</p>
              <p className="text-[11px] text-zinc-500 leading-snug">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6">
        <Button
          variant="tertiary"
          size="lg"
          onClick={() => setCurrentStep('camera-guide')}
          className="group mx-auto"
        >
          <Scan className="w-4 h-4" />
          <span>Start AI Scan</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>

        <label className="flex w-fit mx-auto items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-[#F26CA7] cursor-pointer transition-colors">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <Upload className="w-3.5 h-3.5" />
          <span>or upload a photo from your gallery</span>
        </label>
      </div>
    </>
  );

  return (
    <div
      className={`${currentStep === 'camera-guide' || currentStep === 'camera' || currentStep === 'scanning' || currentStep === 'select-area' || currentStep === 'enter-name' || currentStep === 'result' ? 'h-dvh overflow-hidden p-0 bg-cover bg-center bg-no-repeat' : currentStep === 'gateway' ? 'min-h-screen lg:h-screen overflow-hidden p-0 bg-cover bg-center' : 'min-h-screen bg-[#FAFAFA] pb-16 pt-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden'} text-[#0F0F11] relative selection:bg-[#FF73B6] selection:text-white`}
      style={{
        backgroundImage: (currentStep === 'camera-guide' || currentStep === 'camera' || currentStep === 'scanning' || currentStep === 'select-area' || currentStep === 'enter-name' || currentStep === 'result' || currentStep === 'gateway')
          ? "url('/image/Background-2.png')"
          : undefined,
      }}
    >
      
      {/* ELEGANT MINIMALIST LOADING OVERLAY */}
      <AnimatePresence>
        {isInitialLoading && (
          <motion.div
            key="minimalist-loading-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-[#f3ebf5] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[650px] max-h-[650px] rounded-full bg-[#cca6d9]/30 blur-[130px] pointer-events-none" />
            <div className="absolute top-[0%] right-[-10%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-[#fbe2f3]/45 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[55vw] h-[55vw] max-w-[600px] max-h-[600px] rounded-full bg-[#e6c2ed]/25 blur-[130px] pointer-events-none" />

            {/* Centered Content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-7 max-w-sm px-4">
              
              {/* Brand & Main Title */}
              <div className="space-y-1.5">
                <h1 className="text-lg sm:text-xl font-medium tracking-[0.05em] text-[#5e3e65] font-['Outfit']">
                  Virtual Scan Analysis
                </h1>
              </div>

              {/* Radial Spoke Spinner */}
              <div className="py-2 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#6d4d73] animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="1.0"/>
                  <path d="M17 3.5L15 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                  <path d="M20.5 7L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
                  <path d="M22 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                  <path d="M20.5 17L17 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                  <path d="M17 20.5L15 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  <path d="M12 22V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
                  <path d="M7 20.5L9 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                  <path d="M3.5 17L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.1"/>
                  <path d="M3.5 7L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.1"/>
                  <path d="M7 3.5L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.15"/>
                </svg>
              </div>

              {/* Status Text */}
              <p className="text-xs sm:text-sm font-light text-[#7a5880]/85 tracking-wider lowercase">
                please wait a moment
              </p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Canvas for Camera Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP NAVBAR HEADER FOR DESKTOP & MOBILE (omitted on gateway, camera-guide, camera, scanning, select-area, enter-name, result, and recommendations steps) */}
      {currentStep !== 'gateway' && currentStep !== 'camera-guide' && currentStep !== 'camera' && currentStep !== 'scanning' && currentStep !== 'select-area' && currentStep !== 'enter-name' && currentStep !== 'result' && currentStep !== 'recommendations' && (
      <header className={`${currentStep === 'camera' ? 'w-full mb-0' : 'max-w-7xl mx-auto mb-8'} relative z-10 lg:shrink-0`}>
        <div className={`${currentStep === 'camera' ? 'p-4 sm:p-5 flex items-center justify-center' : 'p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4'}`}>
          
          {currentStep !== 'camera' && <div className="flex items-center gap-3">
            {!isPublicView ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    stopCamera();
                    onNavigate('dashboard');
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200/80 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali ke Dashboard</span>
                </button>
              </div>
            ) : currentStep !== 'gateway' ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F26CA7] to-[#FFB6D9] text-white flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-zinc-900 leading-tight">Aura Beauty AI</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold uppercase tracking-wide">
                      Live Follower Mode
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-medium">Personal Shade Finder</span>
                </div>
              </div>
            ) : null}
          </div>}

          {/* Stepper Navigation Indicator (hidden on the gateway welcome screen) */}
          {currentStep !== 'gateway' && (
            <div className="hidden md:flex items-center gap-2 bg-zinc-50 px-4 py-1.5 rounded-full text-xs font-semibold">
              <span className={`px-2.5 py-0.5 rounded-full ${stepNumber >= 1 ? 'bg-[#FF73B6] text-white font-bold' : 'text-zinc-400'}`}>
                1. Foto
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${stepNumber >= 2 ? 'bg-[#FF73B6] text-white font-bold' : 'text-zinc-400'}`}>
                2. Area
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${stepNumber >= 3 ? 'bg-[#FF73B6] text-white font-bold' : 'text-zinc-400'}`}>
                3. Profil
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${stepNumber >= 4 ? 'bg-[#FF73B6] text-white font-bold' : 'text-zinc-400'}`}>
                4. Hasil
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-2.5 py-0.5 rounded-full ${stepNumber >= 5 ? 'bg-[#FF73B6] text-white font-bold' : 'text-zinc-400'}`}>
                5. Produk
              </span>
            </div>
          )}

          {!isPublicView && currentStep !== 'camera' && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={triggerReplayLoading}
                className="text-[11px] font-bold text-[#FF73B6] hover:text-white bg-[#FF73B6]/10 hover:bg-[#FF73B6] px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tes Loading Screen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tes Loading</span>
              </button>
            </div>
          )}

        </div>
      </header>
      )}
      {/* CONDITIONAL LAYOUT: NEW REDESIGNED GATEWAY SCREEN MATCHING SPECIFICATION */}
      {currentStep === 'gateway' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative min-h-screen lg:h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col justify-between m-0 p-0"
          style={{
            backgroundImage: "url('/image/Background-2.png')",
          }}
        >
          {/* FLOATING TOP DASHBOARD CONTROLS (FOR NON-PUBLIC / ADMIN PREVIEW) */}
          {!isPublicView && (
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
              <button
                onClick={() => {
                  stopCamera();
                  onNavigate('dashboard');
                }}
                className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs border border-white/60"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke Dashboard</span>
              </button>
              <button
                onClick={triggerReplayLoading}
                className="text-[11px] font-bold text-[#FF73B6] hover:text-white bg-white/80 hover:bg-[#FF73B6] backdrop-blur-md px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/60"
                title="Tes Loading Screen"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tes Loading</span>
              </button>
            </div>
          )}
          {/* TOP SECTION: TITLE & RESPONSIVE CTA BUTTON SHIFTED DOWN TOWARDS MIDDLE */}
          {/* TOP SECTION: TITLE */}
          <div className="pt-6 sm:pt-8 lg:pt-10 pb-1 text-center z-20 space-y-1 px-4 flex flex-col items-center shrink-0">
            {isPublicView && creator.name && (
              <p className="text-xs font-medium text-[#545459]/80 mb-1">
                Dipersembahkan oleh <span className="font-semibold text-[#545459]">{creator.name}</span>
              </p>
            )}
            <h1 className="text-2xl sm:text-4xl lg:text-[38px] font-medium font-['Satoshi'] text-center tracking-[-0.05em] leading-[1.05] sm:leading-[44px]" style={{ fontSize: '38px' }}>
              <span style={{ color: '#545459' }}>Find Your Perfect</span>
              <br />
              <span style={{ color: '#545459' }}>Beauty </span>
              <span style={{ color: '#F6559C' }}>Match</span>
            </h1>
          </div>

          {/* MAIN CENTER COMPOSITION WITH CARDS CLOSER TO WOMEN-PORTAL */}
          <div className="relative flex-1 w-full max-w-7xl mx-auto flex items-end justify-center px-2 sm:px-6 lg:px-8 pb-2 sm:pb-6 overflow-visible">
            
            {/* LEFT FLOATING CARDS (BALANCED OPTIMAL SIZE) */}
            {/* Top Left Card: More.png */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
              className="absolute top-[-2%] sm:top-[0%] lg:top-[1%] left-[2%] sm:left-[6%] lg:left-[10%] z-20 hover:scale-105 transition-transform duration-300 pointer-events-none"
            >
              <img
                src="/image/More.png"
                alt="More - Confident You"
                className="w-28 sm:w-44 lg:w-56 h-auto drop-shadow-xl rounded-2xl select-none"
              />
            </motion.div>

            {/* Bottom Left Card: Personalized.png */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute bottom-[10%] sm:bottom-[12%] lg:bottom-[15%] left-[2%] sm:left-[6%] lg:left-[10%] z-20 hover:scale-105 transition-transform duration-300 pointer-events-none"
            >
              <img
                src="/image/Personalized.png"
                alt="Personalized for You"
                className="w-32 sm:w-48 lg:w-60 h-auto drop-shadow-xl rounded-2xl select-none"
              />
            </motion.div>

            {/* RIGHT FLOATING CARDS (BALANCED OPTIMAL SIZE) */}
            {/* Top Right Card: real result.png */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="absolute top-[0%] sm:top-[2%] lg:top-[3%] right-[2%] sm:right-[6%] lg:right-[10%] z-20 hover:scale-105 transition-transform duration-300 pointer-events-none"
            >
              <img
                src="/image/real%20result.png"
                alt="Real Results - For Real You"
                className="w-32 sm:w-48 lg:w-60 h-auto drop-shadow-xl rounded-2xl select-none"
              />
            </motion.div>

            {/* Bottom Right Card: More.png */}
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute bottom-[9%] sm:bottom-[11%] lg:bottom-[13%] right-[2%] sm:right-[6%] lg:right-[10%] z-20 hover:scale-105 transition-transform duration-300 pointer-events-none"
            >
              <img
                src="/image/More.png"
                alt="More - Confident You"
                className="w-28 sm:w-44 lg:w-56 h-auto drop-shadow-xl rounded-2xl select-none"
              />
            </motion.div>

            {/* CENTER MODEL IMAGE (-MT-[20PX]) & RESPONSIVE BUTTON AT BOTTOM */}
            <div className="relative z-10 w-[86vw] max-w-[340px] sm:max-w-[460px] lg:max-w-[400px] flex flex-col items-center -mt-[20px] pb-0">
              <div className="relative w-full flex flex-col items-center">
                <img
                  src="/image/women-portal.png"
                  alt="Beauty AI Match Model"
                  className="w-full h-auto object-contain select-none pointer-events-none block"
                />

                {/* Primary Button "Start Ai Scan" at bottom (Raised by total 45px) */}
                <div className="absolute inset-x-0 bottom-[2%] sm:bottom-[4%] -translate-y-[45px] flex flex-col items-center justify-center z-30 pointer-events-auto px-4">
                  <Button
                    variant="primary"
                    onClick={() => setCurrentStep('camera-guide')}
                    className="rounded-full shadow-xl hover:shadow-2xl hover:scale-108 active:scale-95 transition-all duration-300 font-medium tracking-wide cursor-pointer text-xs sm:text-sm whitespace-nowrap"
                    style={{ padding: '10px 30px' }}
                  >
                    <span>Start Ai Scan</span>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      ) : currentStep === 'scanning' ? (
        /* FULL WIDTH SCANNING CONTAINER WITH BACKGROUND-2 & HERO OVERLAY */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <div
            className="relative h-dvh bg-cover bg-center bg-no-repeat p-6 sm:p-10 overflow-hidden flex flex-col justify-between items-center text-[#545459] font-['Satoshi']"
            style={{ backgroundImage: "url('/image/Background-2.png')" }}
          >
            {/* HERO SECTION STYLE GLASS OVERLAY */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

            {/* Top Header Row */}
            <div className="absolute top-6 left-0 w-full flex items-center justify-start z-30 px-6 sm:px-10 pointer-events-auto">
              <button
                onClick={() => setCurrentStep('camera')}
                className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="relative z-10 w-full max-w-xl sm:max-w-2xl mx-auto mt-10 sm:mt-14 mb-auto space-y-6 px-4">
              {/* Top Scanned Face Avatar with Title */}
              <div className="text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto">
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Pemindaian Wajah"
                      className="w-full h-full object-cover rounded-3xl shadow-md border-2 border-white"
                    />
                  )}
                  {/* Glowing Overlay Badge */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF73B6] to-[#C786FF] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Sparkles className="w-4 h-4 stroke-[2.2] animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                    Real-Time AI Analysis
                  </h2>
                  <p className="text-base font-medium tracking-[-0.05em] text-[#545459] h-5" style={{ fontSize: '16px' }}>
                    {scanStatusText}
                  </p>
                </div>
              </div>

            {/* 3D STACKED CARDS ANIMATION CONTAINER */}
            <div className="relative w-full h-[190px] pt-2 flex items-center justify-center">
              {(() => {
                const SCAN_STEPS = [
                  {
                    id: 1,
                    stepNum: '01',
                    title: 'Analyzing Face',
                    subtitle: 'Mendeteksi fitur & kontur wajah',
                    details: 'Melakukan pemetaan facial landmarks & simetri',
                    icon: User,
                    minProgress: 0,
                    maxProgress: 20,
                  },
                  {
                    id: 2,
                    stepNum: '02',
                    title: 'Detecting Skin Tone',
                    subtitle: 'Menganalisis warna & tekstur kulit',
                    details: 'Mengukur pigmentasi, kelembapan & kejernihan',
                    icon: Palette,
                    minProgress: 20,
                    maxProgress: 45,
                  },
                  {
                    id: 3,
                    stepNum: '03',
                    title: 'Finding Undertone',
                    subtitle: 'Menganalisis spektrum undertone alami',
                    details: 'Mendeteksi spektrum undertone (Cool, Neutral, Warm)',
                    icon: Sun,
                    minProgress: 45,
                    maxProgress: 70,
                  },
                  {
                    id: 4,
                    stepNum: '04',
                    title: 'Matching Products',
                    subtitle: 'Mengomparasi spektrum dengan database AI',
                    details: 'Mencocokkan shade foundation, lipstick & blush',
                    icon: ShoppingBag,
                    minProgress: 70,
                    maxProgress: 90,
                  },
                  {
                    id: 5,
                    stepNum: '05',
                    title: 'Preparing Recommendation',
                    subtitle: 'Menyusun rekomendasi kecantikan personal',
                    details: 'Menghasilkan panduan kecantikan tersuai',
                    icon: Sparkles,
                    minProgress: 90,
                    maxProgress: 100,
                  },
                ];

                const activeIdx = (() => {
                  if (scanProgress < 20) return 0;
                  if (scanProgress < 45) return 1;
                  if (scanProgress < 70) return 2;
                  if (scanProgress < 90) return 3;
                  return 4;
                })();

                const nextStep1 = activeIdx + 1 < SCAN_STEPS.length ? SCAN_STEPS[activeIdx + 1] : null;
                const nextStep2 = activeIdx + 2 < SCAN_STEPS.length ? SCAN_STEPS[activeIdx + 2] : null;
                const activeStep = SCAN_STEPS[activeIdx];
                const IconComp = activeStep.icon;

                // Step progress % inside active step range
                const stepRange = activeStep.maxProgress - activeStep.minProgress;
                const stepProgress = Math.min(
                  100,
                  Math.max(0, Math.round(((scanProgress - activeStep.minProgress) / stepRange) * 100))
                );

                return (
                  <div className="relative w-full max-w-sm h-full flex items-center justify-center">
                    
                    {/* Layer 3: Backmost Card in Stack with gentle float */}
                    {nextStep2 && (
                      <motion.div
                        animate={{
                          y: [-18, -22, -18],
                          scale: [0.86, 0.88, 0.86],
                          opacity: [0.45, 0.6, 0.45]
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-0 w-[86%] h-[160px] rounded-[28px] bg-gradient-to-b from-[#F2EBF5] to-[#E8DCED] border border-white/80 shadow-xs pointer-events-none"
                      />
                    )}

                    {/* Layer 2: Middle Card in Stack with synced float */}
                    {nextStep1 && (
                      <motion.div
                        animate={{
                          y: [-9, -12, -9],
                          scale: [0.93, 0.95, 0.93],
                          opacity: [0.75, 0.88, 0.75]
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                        className="absolute top-0 w-[93%] h-[160px] rounded-[30px] bg-white/90 border border-purple-100/80 shadow-md pointer-events-none"
                      />
                    )}

                    {/* Layer 1: Top Active Card with floating idle + spring card transition */}
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, y: 30, scale: 0.92, rotate: 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, y: -35, scale: 0.9, rotate: -2, transition: { duration: 0.22 } }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        className="relative w-full h-[160px] rounded-[32px] bg-white border-2 border-[#FF73B6]/30 shadow-xl shadow-purple-500/10 p-5 flex flex-col justify-center overflow-hidden"
                      >
                        {/* Continuous subtle breathing float inside card frame */}
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-full h-full flex flex-col justify-center"
                        >
                          {/* Background Soft Radial Glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-tr from-[#FF73B6]/20 to-[#C786FF]/20 rounded-full blur-xl pointer-events-none animate-pulse" />

                          {/* Top Right Processing Loader */}
                          <div className="absolute top-4 right-5 flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
                            <Loader2 className="w-3.5 h-3.5 text-[#FF73B6] animate-spin" />
                            <span className="text-[#FF73B6]">Memproses</span>
                          </div>

                          {/* Card Body - Animated Icon, Title & Subtitle */}
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {/* Pulsing ring behind icon */}
                              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-[#FF73B6] to-[#C786FF] opacity-40 blur-xs animate-pulse" />
                              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF73B6] to-[#C786FF] text-white flex items-center justify-center shrink-0 shadow-md">
                                <IconComp className="w-7 h-7 stroke-[2.2] animate-bounce-subtle" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-snug">
                                {activeStep.title}
                              </h3>
                              <p className="text-xs text-[#C83B75] font-semibold mt-0.5 leading-snug line-clamp-2">
                                {activeStep.subtitle}
                              </p>
                            </div>
                          </div>
                        </motion.div>

                      </motion.div>
                    </AnimatePresence>

                  </div>
                );
              })()}
            </div>



            {/* Overall Progress Footer */}
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-500">Total Analisis AI</span>
                <span className="text-[#FF73B6] font-extrabold text-sm">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF73B6] via-[#C786FF] to-[#A855F7] rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
      ) : (
        /* MAIN DESKTOP 2-COLUMN GRID LAYOUT FOR ALL OTHER STEPS */
        <main className={`${currentStep === 'camera-guide' || currentStep === 'camera' || currentStep === 'select-area' || currentStep === 'enter-name' || currentStep === 'result' ? 'w-full p-0' : 'max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'}`}>

          {/* RIGHT COLUMN: INTERACTIVE WORKSPACE */}
          <section className="lg:col-span-12 space-y-6">

            {/* STEP 1.2: CAMERA POSITIONING GUIDE PAGE (WARDAH / AURA COLOR EXPERT STYLE) */}
            {currentStep === 'camera-guide' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
              <div
                className="relative h-dvh bg-cover bg-center bg-no-repeat p-6 sm:p-10 overflow-hidden flex flex-col justify-between items-center text-[#545459] font-['Satoshi']"
                style={{ backgroundImage: "url('/image/Background-2.png')" }}
              >
                {/* HERO SECTION STYLE GLASS OVERLAY */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                  {/* Top Header Row */}
                  <div className="absolute top-6 left-0 w-full flex items-center justify-start z-30 px-6 sm:px-10 pointer-events-auto">
                    <button
                      onClick={() => setCurrentStep('gateway')}
                      className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                      title="Kembali"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Center Title & Guide Badges */}
                  <div className="text-center space-y-4 my-2 z-10 max-w-md mx-auto">
                    <div className="space-y-0.5">
                      <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                        Tips for ideal
                      </p>
                      <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                        Camera position
                      </h2>
                    </div>

                    {/* 3 Status Badges */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap pt-1">
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Lighting check</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>
                      
                      <div className="hidden sm:block text-[#545459]/30 text-xs">|</div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Look straight</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>

                      <div className="hidden sm:block text-[#545459]/30 text-xs">|</div>

                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Position face</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model Face Image with Dashed Oval Guide Overlay */}
                  <div className="relative my-2 z-10">
                    <div className="w-64 h-72 sm:w-72 sm:h-80 rounded-[32px] bg-white/40 backdrop-blur-md border border-white/80 p-[4px] shadow-lg overflow-hidden relative flex items-center justify-center">
                      <img
                        src="/image/women.png"
                        alt="Face position model guide"
                        className="w-full h-full object-cover rounded-[28px]"
                      />
                      {/* Dashed Oval Frame */}
                      <div className="absolute inset-0 m-auto w-44 h-56 sm:w-52 sm:h-64 border-2 border-dashed border-white/90 rounded-[50%] shadow-md pointer-events-none z-20" />
                    </div>
                  </div>

                  {/* Action Button: Scan / Open Camera */}
                  <div className="my-2 z-10 text-center w-full">
                    <button
                      onClick={startCamera}
                      className="bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                      style={{ padding: '10px 30px' }}
                    >
                      Scan Your Face
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 1.5: LIVE CAMERA SCANNER VIEW (WITH MATCHING 288PX X 320PX GLASS FRAME) */}
            {currentStep === 'camera' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  className="relative h-dvh bg-cover bg-center bg-no-repeat p-6 sm:p-10 overflow-hidden flex flex-col justify-between items-center text-[#545459] font-['Satoshi']"
                  style={{ backgroundImage: "url('/image/Background-2.png')" }}
                >
                  {/* HERO SECTION STYLE GLASS OVERLAY */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                  {/* Top Header Row */}
                  <div className="absolute top-6 left-0 w-full flex items-center justify-start z-30 px-6 sm:px-10 pointer-events-auto">
                    <button
                      onClick={() => setCurrentStep('camera-guide')}
                      className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                      title="Kembali"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Header Title & 3 Status Badges */}
                  <div className="text-center space-y-3 my-2 z-10 max-w-md mx-auto">
                    <div className="space-y-0.5">
                      <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                        AI Facial Analysis
                      </p>
                      <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                        Position Your Face
                      </h2>
                    </div>

                    {/* 3 Status Badges */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap pt-1">
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Lighting check</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>
                      
                      <div className="hidden sm:block text-[#545459]/30 text-xs">|</div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Look straight</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>

                      <div className="hidden sm:block text-[#545459]/30 text-xs">|</div>

                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-medium tracking-[-0.05em] text-[#545459]">Position face</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#545459]/40 text-[#545459] text-[10px] font-medium tracking-[-0.05em] bg-white/60 shadow-2xs">
                          Good
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Camera Viewport inside 288px x 320px Frame (Matching Camera Guide) */}
                  <div className="relative my-2 z-10">
                    <div className="w-64 h-72 sm:w-72 sm:h-80 rounded-[32px] bg-white/40 backdrop-blur-md border border-white/80 p-[4px] shadow-lg overflow-hidden relative flex items-center justify-center">
                      
                      {isCameraActive && !cameraError && (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover rounded-[28px] transform -scale-x-100 bg-zinc-950"
                        />
                      )}

                      {/* Fallback if camera permission fails */}
                      {cameraError && (
                        <div className="p-6 text-center space-y-3 text-zinc-800 z-20">
                          <p className="text-xs text-zinc-600 leading-relaxed font-medium">{cameraError}</p>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181B] text-white rounded-full text-xs font-medium cursor-pointer hover:bg-zinc-800 transition-all shadow-md">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Unggah Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}

                      {/* Dashed Oval Overlay Frame */}
                      <div className="absolute inset-0 m-auto w-44 h-56 sm:w-52 sm:h-64 border-2 border-dashed border-white/90 rounded-[50%] shadow-md pointer-events-none z-20" />

                      {/* ANIMATED MOVING WHITE SCANNING LINE */}
                      <motion.div
                        animate={{ top: ['15%', '85%', '15%'] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                        className="absolute inset-x-6 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff] z-20 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* SNAP BUTTON */}
                  <div className="my-2 z-10 text-center w-full">
                    <button
                      onClick={takeSnapshot}
                      className="bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                      style={{ padding: '10px 30px' }}
                    >
                      <Camera className="w-4 h-4 stroke-[2.2]" />
                      <span>Ambil Foto</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          {/* STEP 3: SELECT ANALYSIS AREA (BIBIR, SHADE, MATA) */}
          {currentStep === 'select-area' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div
                className="relative h-dvh bg-cover bg-center bg-no-repeat p-6 sm:p-10 overflow-hidden flex flex-col justify-between items-center text-[#545459] font-['Satoshi']"
                style={{ backgroundImage: "url('/image/Background-2.png')" }}
              >
                {/* HERO SECTION STYLE GLASS OVERLAY */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                {/* Top Header Row with Stepper */}
                <div className="absolute top-6 left-0 w-full flex items-center justify-between z-30 px-6 sm:px-10 pointer-events-auto">
                  <button
                    onClick={() => {
                      if (subQuestionIndex > 0) {
                        setSubQuestionIndex((prev) => prev - 1);
                      } else {
                        setCurrentStep('scanning');
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                    title="Kembali"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Top Stepper Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-medium border border-white/80 shadow-xs font-['Satoshi'] tracking-[-0.03em] text-[#545459]">
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 1 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Photo
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 2 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Needs
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 3 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Profile
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 4 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Results
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 5 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Products
                    </span>
                  </div>

                  <div className="w-10 hidden sm:block" />
                </div>

                <div className="relative z-10 w-full max-w-5xl mx-auto my-auto space-y-10 sm:space-y-12 px-4 sm:px-8">

                  {/* QUESTION 1: SELECT FOCUS AREA */}
                  {subQuestionIndex === 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
                      <div className="text-center space-y-1">
                        <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                          Question 1 of 4
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Select Focus Area
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
                        {[
                          { key: 'bibir', title: 'Lips Focus', subtitle: 'Natural lip tone & lipstick shade match', icon: '💄' },
                          { key: 'shade', title: 'Base / Skin', subtitle: 'Skin Tone & Undertone match for Cushion', icon: '🧴' },
                        ].map((item) => {
                          const isSelected = selectedArea === item.key;
                          return (
                            <div
                              key={item.key}
                              onClick={() => setSelectedArea(item.key)}
                              className={`relative py-7 px-6 rounded-[24px] bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm ${
                                isSelected
                                  ? 'border-2 border-[#F6559C] scale-[1.02] shadow-md'
                                  : 'border border-[#F6559C]/30 hover:border-[#F6559C]/70 hover:shadow-xs'
                              }`}
                            >
                              {/* Overlapping Top-Right Pink Circle Badge */}
                              {isSelected && (
                                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#F6559C] text-white flex items-center justify-center shadow-md z-20">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              )}
                              <span className="text-4xl sm:text-5xl">{item.icon}</span>
                              <div className="space-y-1">
                                <h3 className="text-lg sm:text-xl font-semibold font-['Satoshi'] tracking-[-0.03em] text-[#27272A]">
                                  {item.title}
                                </h3>
                                <p className="text-xs font-normal text-[#545459]/75 leading-relaxed">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Next Question Button - Enabled only after Question 1 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!selectedArea}
                          onClick={() => setSubQuestionIndex(1)}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            selectedArea
                              ? 'bg-[#18181B] hover:bg-[#27272A] text-white cursor-pointer hover:scale-105 active:scale-95'
                              : 'bg-[#545459]/20 text-[#545459]/50 cursor-not-allowed pointer-events-none'
                          }`}
                          style={{ padding: '10px 30px' }}
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* QUESTION 2: TARGET BUDGET */}
                  {subQuestionIndex === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
                      <div className="text-center space-y-1">
                        <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                          Question 2 of 4
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Target Product Budget
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                          { title: 'Di bawah Rp150K', subtitle: 'Affordable everyday beauty essentials', icon: '🏷️' },
                          { title: 'Rp150K - Rp300K', subtitle: 'Popular mid-range favorites & bestsellers', icon: '💎' },
                          { title: 'Di atas Rp300K', subtitle: 'Premium formulas & high-end luxury products', icon: '👑' },
                        ].map((item) => {
                          const isSelected = budgetPref === item.title;
                          return (
                            <div
                              key={item.title}
                              onClick={() => setBudgetPref(item.title)}
                              className={`relative py-7 px-5 rounded-[24px] bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm ${
                                isSelected
                                  ? 'border-2 border-[#F6559C] scale-[1.02] shadow-md'
                                  : 'border border-[#F6559C]/30 hover:border-[#F6559C]/70 hover:shadow-xs'
                              }`}
                            >
                              {/* Overlapping Top-Right Pink Circle Badge */}
                              {isSelected && (
                                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#F6559C] text-white flex items-center justify-center shadow-md z-20">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              )}
                              <span className="text-3xl sm:text-4xl">{item.icon}</span>
                              <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-semibold font-['Satoshi'] tracking-[-0.03em] text-[#27272A]">
                                  {item.title}
                                </h3>
                                <p className="text-xs font-normal text-[#545459]/75 leading-relaxed">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Next Question Button - Enabled only after Question 2 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!budgetPref}
                          onClick={() => setSubQuestionIndex(2)}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            budgetPref
                              ? 'bg-[#18181B] hover:bg-[#27272A] text-white cursor-pointer hover:scale-105 active:scale-95'
                              : 'bg-[#545459]/20 text-[#545459]/50 cursor-not-allowed pointer-events-none'
                          }`}
                          style={{ padding: '10px 30px' }}
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* QUESTION 3: DESIRED FINISH EFFECT */}
                  {subQuestionIndex === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
                      <div className="text-center space-y-1">
                        <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                          Question 3 of 4
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Desired Finish Effect
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                          { title: 'Dewy & Glowing', subtitle: 'Moisturizing, radiant shine & glass skin finish', icon: '🌟' },
                          { title: 'Matte & Velvet', subtitle: 'Smooth oil-control & long-lasting matte look', icon: '🪵' },
                          { title: 'Natural Satin', subtitle: 'Lightweight, subtle sheen & everyday natural look', icon: '🌿' },
                        ].map((item) => {
                          const isSelected = finishPref === item.title;
                          return (
                            <div
                              key={item.title}
                              onClick={() => setFinishPref(item.title)}
                              className={`relative py-7 px-5 rounded-[24px] bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm ${
                                isSelected
                                  ? 'border-2 border-[#F6559C] scale-[1.02] shadow-md'
                                  : 'border border-[#F6559C]/30 hover:border-[#F6559C]/70 hover:shadow-xs'
                              }`}
                            >
                              {/* Overlapping Top-Right Pink Circle Badge */}
                              {isSelected && (
                                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#F6559C] text-white flex items-center justify-center shadow-md z-20">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              )}
                              <span className="text-3xl sm:text-4xl">{item.icon}</span>
                              <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-semibold font-['Satoshi'] tracking-[-0.03em] text-[#27272A]">
                                  {item.title}
                                </h3>
                                <p className="text-xs font-normal text-[#545459]/75 leading-relaxed">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Next Question Button - Enabled only after Question 3 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!finishPref}
                          onClick={() => setSubQuestionIndex(3)}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            finishPref
                              ? 'bg-[#18181B] hover:bg-[#27272A] text-white cursor-pointer hover:scale-105 active:scale-95'
                              : 'bg-[#545459]/20 text-[#545459]/50 cursor-not-allowed pointer-events-none'
                          }`}
                          style={{ padding: '10px 30px' }}
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* QUESTION 4: USAGE OCCASION */}
                  {subQuestionIndex === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
                      <div className="text-center space-y-1">
                        <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                          Question 4 of 4
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Usage Occasion
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                          { title: 'Daily Wear', subtitle: 'Lightweight everyday makeup & natural feel', icon: '☀️' },
                          { title: 'Office & Casual', subtitle: 'Polished, neat & professional look', icon: '💼' },
                          { title: 'Special Event', subtitle: 'High-coverage, long-lasting glam', icon: '💃' },
                        ].map((item) => {
                          const isSelected = occasionPref === item.title;
                          return (
                            <div
                              key={item.title}
                              onClick={() => setOccasionPref(item.title)}
                              className={`relative py-7 px-5 rounded-[24px] bg-white transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm ${
                                isSelected
                                  ? 'border-2 border-[#F6559C] scale-[1.02] shadow-md'
                                  : 'border border-[#F6559C]/30 hover:border-[#F6559C]/70 hover:shadow-xs'
                              }`}
                            >
                              {/* Overlapping Top-Right Pink Circle Badge */}
                              {isSelected && (
                                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#F6559C] text-white flex items-center justify-center shadow-md z-20">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              )}
                              <span className="text-3xl sm:text-4xl">{item.icon}</span>
                              <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-semibold font-['Satoshi'] tracking-[-0.03em] text-[#27272A]">
                                  {item.title}
                                </h3>
                                <p className="text-xs font-normal text-[#545459]/75 leading-relaxed">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Continue to Profile Button - Enabled only after Question 4 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!occasionPref}
                          onClick={() => setCurrentStep('enter-name')}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            occasionPref
                              ? 'bg-[#18181B] hover:bg-[#27272A] text-white cursor-pointer hover:scale-105 active:scale-95'
                              : 'bg-[#545459]/20 text-[#545459]/50 cursor-not-allowed pointer-events-none'
                          }`}
                          style={{ padding: '10px 30px' }}
                        >
                          <span>Continue to Profile</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 3: DEDICATED PROFILE PAGE */}
          {currentStep === 'enter-name' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div
                className="relative h-dvh bg-cover bg-center bg-no-repeat p-6 sm:p-10 overflow-hidden flex flex-col justify-between items-center text-[#545459] font-['Satoshi']"
                style={{ backgroundImage: "url('/image/Background-2.png')" }}
              >
                {/* HERO SECTION STYLE GLASS OVERLAY */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                {/* Top Header Row with Stepper */}
                <div className="absolute top-6 left-0 w-full flex items-center justify-between z-30 px-6 sm:px-10 pointer-events-auto">
                  <button
                    onClick={() => setCurrentStep('select-area')}
                    className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                    title="Kembali"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Top Stepper Pill */}
                  <div className="hidden sm:flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-medium border border-white/80 shadow-xs font-['Satoshi'] tracking-[-0.03em] text-[#545459]">
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 1 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Photo
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 2 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Needs
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 3 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Profile
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 4 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Results
                    </span>
                    <span className="text-[#545459]/40">→</span>
                    <span className={`px-2.5 py-0.5 rounded-full transition-all ${stepNumber >= 5 ? 'bg-[#18181B] text-white font-semibold shadow-xs' : 'text-[#545459]/60'}`}>
                      Products
                    </span>
                  </div>

                  <div className="w-10 hidden sm:block" />
                </div>

                {/* Profile Form Content */}
                <div className="relative z-10 w-full max-w-md mx-auto my-auto space-y-6 px-4">
                  {/* Title Section */}
                  <div className="text-center space-y-1">
                    <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                      Step 3 of 3
                    </p>
                    <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                      Personalize Profile
                    </h2>
                  </div>

                  {/* Glassmorphism Profile Card */}
                  <form onSubmit={handleFinalizeResult} className="p-6 sm:p-8 rounded-[28px] backdrop-blur-md bg-white/75 border border-white/80 shadow-xl space-y-6 text-left">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#545459] block tracking-tight">Your Name / Nickname</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#545459]/50 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. Amanda / Bunga"
                          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/60 focus:bg-white text-sm font-medium outline-none transition-all border border-[#545459]/20 focus:border-[#F6559C] focus:ring-2 focus:ring-[#F6559C]/20 text-[#545459]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>Reveal AI Results</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* STEP 4: RESULT PAGE — GLASSMORPHISM REDESIGN */}
          {currentStep === 'result' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <div
                className="relative h-dvh bg-cover bg-center bg-no-repeat overflow-y-auto flex flex-col font-['Satoshi'] text-[#545459]"
                style={{ backgroundImage: "url('/image/Background-2.png')" }}
              >
                {/* Glass overlay - fixed to cover full viewport during scroll */}
                <div className="fixed inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                {/* Header */}
                <div className="sticky top-0 left-0 w-full flex items-center justify-between z-30 px-6 sm:px-10 pt-4 pb-1 pointer-events-auto">
                  <button
                    onClick={() => setCurrentStep('enter-name')}
                    className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                    title="Kembali"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => setCurrentStep('recommendations')}
                    className="flex items-center gap-2 bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-[#F6559C]" />
                    <span>Lihat Rekomendasi Produk</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-0 pb-8 space-y-4 sm:space-y-5">

                  {/* Page Title with Animated Entrance */}
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center space-y-0.5"
                  >
                    <p className="text-sm font-medium tracking-[-0.05em] text-[#545459]/70">AI Analysis Complete ✨</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight">
                      Hi, <span className="text-[#F6559C]">{customerName || 'Beauty'}</span> — Here's Your Result
                    </h2>
                  </motion.div>

                  {/* Two-column layout with tight gap */}
                  <div className="grid grid-cols-1 lg:grid-cols-[378px_1fr] gap-6 items-start">

                    {/* LEFT COLUMN: Selfie Card + Action Buttons with Animated Entrance */}
                    <motion.div
                      initial={{ opacity: 0, x: -24, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
                      className="lg:sticky lg:top-16 flex flex-col items-center space-y-3 shrink-0"
                    >
                      <div className="relative w-full max-w-[378px] h-[378px] rounded-[32px] overflow-hidden shadow-sm">
                        {capturedImage ? (
                          <img
                            src={capturedImage}
                            alt="Selfie Scan"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                            <div className="text-center space-y-2 text-[#545459]/50">
                              <User className="w-12 h-12 mx-auto" />
                              <p className="text-sm font-medium">No photo captured</p>
                            </div>
                          </div>
                        )}
                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#F6559C] animate-pulse" />
                            <p className="text-white text-xs font-medium">Analyzed in under 10 seconds</p>
                          </div>
                          <p className="text-white/70 text-[11px] mt-0.5">
                            {selectedArea === 'bibir' ? '💋 Lips Focus Analysis' : '✨ Base & Skin Analysis'}
                          </p>
                        </div>
                      </div>

                      {/* Scan Ulang & Share Buttons (Positioned right near the photo) */}
                      <div className="flex items-center gap-2.5 w-full max-w-[378px]">
                        <button
                          onClick={handleReset}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/80 text-[#545459] text-xs font-medium shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Scan Ulang</span>
                        </button>
                        <button
                          onClick={triggerShare}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/80 text-[#545459] text-xs font-medium shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </motion.div>

                    {/* RIGHT COLUMN: AI Diagnostic Stats with Staggered Animations */}
                    <div className="space-y-4 min-w-0">
                      {!scanResult ? (
                        <div className="h-full flex items-center justify-center p-8 rounded-[28px] bg-white/50 backdrop-blur-md border border-white/80 shadow-xs">
                          <div className="text-center space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-[#F6559C] mx-auto" />
                            <p className="text-sm font-medium text-[#545459]">
                              {isAnalyzing ? 'AI sedang menganalisis wajah Anda...' : 'Hasil tidak tersedia. Silakan scan ulang.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* 1. Overall Skin Score (Animated Gauge & Counter with 1.2s delay) */}
                          {(() => {
                            const score = animatedScore || (scanResult ? Math.min(100, Math.max(0, Math.round(scanResult.confidence))) : 87);
                            const pct = score / 100;
                            const radius = 62;
                            const cx = 85;
                            const cy = 82;
                            const arcLength = Math.PI * radius; // ~194.78
                            const dashOffset = arcLength * (1 - pct);
                            const knobX = cx - radius * Math.cos(pct * Math.PI);
                            const knobY = cy - radius * Math.sin(pct * Math.PI);
                            const targetVal = scanResult ? Math.round(scanResult.confidence) : 87;
                            const topPercentile = Math.max(5, 100 - targetVal);

                            return (
                              <motion.div
                                initial={{ opacity: 0, y: 22, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.6, delay: 1.2, ease: [0.23, 1, 0.32, 1] }}
                                className="p-6 sm:p-7 rounded-[26px] bg-white/50 backdrop-blur-md border border-white/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6"
                              >
                                {/* Left Text & Big Score */}
                                <div className="space-y-1.5 text-left w-full sm:w-auto">
                                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm tracking-tight">
                                    <span>Your Overall Skin Score</span>
                                    <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
                                  </div>

                                  <div className="flex items-baseline gap-1 my-0.5">
                                    <span className="text-5xl sm:text-6xl font-black text-[#F6559C] tracking-tight font-['Satoshi'] leading-none">
                                      {score}
                                    </span>
                                    <span className="text-lg sm:text-xl font-bold text-slate-400">
                                      /100
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                    Great! Your skin is in good condition.
                                  </p>
                                </div>

                                {/* Right Semi-Circular Gauge & Ranking Badge */}
                                <div className="relative flex items-center justify-center shrink-0 w-[180px] h-[105px]">
                                  <svg className="w-full h-full overflow-visible" viewBox="0 0 170 95">
                                    <defs>
                                      <linearGradient id="skinScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#F6559C" />
                                        <stop offset="100%" stopColor="#FF6EA7" />
                                      </linearGradient>
                                    </defs>

                                    {/* Background Arc */}
                                    <path
                                      d="M 23 82 A 62 62 0 0 1 147 82"
                                      fill="none"
                                      stroke="#F1F5F9"
                                      strokeWidth="11"
                                      strokeLinecap="round"
                                    />

                                    {/* Foreground Progress Arc */}
                                    <path
                                      d="M 23 82 A 62 62 0 0 1 147 82"
                                      fill="none"
                                      stroke="url(#skinScoreGradient)"
                                      strokeWidth="11"
                                      strokeLinecap="round"
                                      strokeDasharray={arcLength}
                                      strokeDashoffset={dashOffset}
                                      className="transition-all duration-300 ease-out"
                                    />

                                    {/* Glowing Indicator Knob */}
                                    <circle
                                      cx={knobX}
                                      cy={knobY}
                                      r="8"
                                      fill="#FFA7CC"
                                      stroke="#FFFFFF"
                                      strokeWidth="2.5"
                                      className="drop-shadow-xs transition-all duration-300 ease-out"
                                    />
                                  </svg>

                                  {/* Center Content (Heart Badge + Ranking Text) */}
                                  <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center pointer-events-none">
                                    <div className="w-6 h-6 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#F6559C] shadow-2xs">
                                      <Heart className="w-3 h-3 fill-[#F6559C] text-[#F6559C]" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight mt-0.5 leading-none">
                                      Top {topPercentile}%
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                      of users
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })()}

                          {/* 2. 4 Diagnostic Stat Cards with Staggered Entrance */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Personal Color', value: scanResult.personalColor, emoji: '🎨' },
                              { label: 'Undertone', value: scanResult.undertone, emoji: '🌡️' },
                              { label: 'Skin Tone', value: scanResult.skinTone, emoji: '🧑' },
                              { label: 'Face Shape', value: scanResult.faceShape, emoji: '😊' },
                            ].map((stat, idx) => (
                              <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.45 + idx * 0.12, ease: 'easeOut' }}
                                className="p-4 rounded-[22px] bg-white/50 backdrop-blur-md border border-white/80 shadow-xs flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
                              >
                                <p className="text-[10px] font-semibold text-[#545459]/60 uppercase tracking-wider mb-1.5">
                                  {stat.emoji} {stat.label}
                                </p>
                                <p className="text-base sm:text-lg font-bold text-[#18181B] font-['Satoshi'] tracking-[-0.03em]">
                                  {stat.value}
                                </p>
                              </motion.div>
                            ))}
                          </div>

                          {/* 3. Color Palette Card with Animated Entrance */}
                          {scanResult.bestColorPalette.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1.95, ease: 'easeOut' }}
                              className="p-5 rounded-[22px] bg-white/50 backdrop-blur-md border border-white/80 shadow-xs space-y-3"
                            >
                              <p className="text-xs font-bold text-[#545459] flex items-center gap-1.5 uppercase tracking-wider">
                                🎨 <span>Best Color Palette for You</span>
                              </p>
                              <div className="flex flex-wrap gap-2.5">
                                {scanResult.bestColorPalette.map((swatch) => (
                                  <div
                                    key={swatch.name}
                                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 border border-white/80 text-xs font-medium text-[#545459] shadow-2xs"
                                  >
                                    <span
                                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                                      style={{ backgroundColor: swatch.colorHex }}
                                    />
                                    <span>{swatch.name}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* 4. AI Summary Text with Animated Entrance */}
                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 2.15, ease: 'easeOut' }}
                            className="p-5 rounded-[22px] bg-white/50 backdrop-blur-md border border-white/80 shadow-xs"
                          >
                            <p className="text-xs sm:text-sm text-[#545459] leading-relaxed">
                              Kulit <strong className="text-[#18181B]">{customerName || 'Anda'}</strong> tergolong <strong className="text-[#F6559C]">{scanResult.personalColor} {scanResult.undertone}</strong> dengan kontur wajah {scanResult.faceShape}. {scanResult.matchSummary || `Rekomendasi produk telah disesuaikan dengan skin tone ${scanResult.skinTone} Anda.`}
                            </p>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: CURATED RECOMMENDED PRODUCTS & COMPARISON PAGE */}
          {currentStep === 'recommendations' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Header Bar for Recommendations */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-zinc-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentStep('result')}
                    className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 cursor-pointer transition-all flex items-center gap-1.5 text-xs font-bold"
                    title="Kembali ke Hasil Analisis"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kembali ke Hasil</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-zinc-950">
                        Rekomendasi Produk Kurasi {creator.name}
                      </h2>
                      <Badge variant="primary" className="text-[10px]">
                        STEP 5
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      Dipersonalisasi khusus untuk <strong className="text-zinc-900">{customerName || 'Anda'}</strong> berdasarkan pemindaian AI.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="success" className="text-xs px-3.5 py-1.5 font-bold">
                    {getRelevantProducts().length} Produk Rekomendasi Fit
                  </Badge>
                  {compareIds.length > 0 && (
                    <button
                      onClick={() => setIsCompareModalOpen(true)}
                      className="text-xs font-bold bg-[#FF73B6]/10 text-[#FF73B6] hover:bg-[#FF73B6]/20 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Komparasi ({compareIds.length})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CURATED RECOMMENDED AFFILIATE PRODUCTS - DESIGN MATCHING USER REFERENCE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {getRelevantProducts().map((prod, idx) => (
                  <Card key={prod.id} className="p-3 bg-white flex flex-col justify-between rounded-[28px] border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                    
                    <div>
                      {/* TOP SECTION: IMAGE CONTAINER WITH TIGHT COMPACT PADDING & MATCHING RADIUS */}
                      <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-[22px] overflow-hidden bg-zinc-50 border border-zinc-100/80 shrink-0">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        
                        {/* Top-Left: AI Match Badge */}
                        <div className="absolute top-2.5 left-2.5 bg-zinc-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3 text-[#FF73B6]" />
                          <span>{96 + (idx % 4)}% MATCH</span>
                        </div>

                        {/* Top-Right: Wishlist / Heart Icon Button */}
                        <button
                          onClick={() => toggleCompareProduct(prod.id)}
                          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                            compareIds.includes(prod.id) 
                              ? 'text-rose-500 bg-white' 
                              : 'text-zinc-600 hover:bg-white hover:text-rose-500'
                          }`}
                          title={compareIds.includes(prod.id) ? 'Dihapus dari komparasi' : 'Tambah ke wishlist / komparasi'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${compareIds.includes(prod.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      </div>

                      {/* MIDDLE CONTENT: PRODUCT INFORMATION WITH MATCHING COMPACT ALIGNMENT */}
                      <div className="mt-3 px-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{prod.brand}</span>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            ★ 4.9
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-zinc-900 leading-snug line-clamp-1 group-hover:text-[#FF73B6] transition-colors">
                          {prod.name}
                        </h4>
                        
                        <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed">
                          {prod.affiliatorNote ? `"${prod.affiliatorNote}"` : 'Produk formula terbaik untuk rekomendasi warna kulit dan bibir Anda.'}
                        </p>

                        {/* Shade & Fit Pill */}
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-lg text-[11px] font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#E88880] shrink-0" />
                            <span>Shade: {prod.shade || 'Medium Warm Nude'}</span>
                          </div>
                        </div>

                        {/* Explainable AI Match Reasons (PRD Feature 4) */}
                        <div className="pt-1.5 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100/60">
                            ✓ {selectedArea === 'bibir' ? 'Cool Lip Tone' : 'Cool Undertone'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100/60">
                            ✓ {finishPref}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[10px] font-bold border border-pink-100/60">
                            ✓ {budgetPref}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ROW: PRICE & DARK PILL BUY BUTTON */}
                    <div className="mt-4 pt-3 px-1 flex items-center justify-between border-t border-zinc-100/80 gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-zinc-900">${prod.price}</span>
                        <span className="text-xs text-zinc-400 line-through">${prod.price + 5}</span>
                      </div>

                      <Button
                        onClick={() => handleAffiliateClick(prod)}
                        variant="dark"
                        size="md"
                        className="bg-[#1D1B26] hover:bg-zinc-800 text-white rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shadow-xs border-0"
                      >
                        Buy
                      </Button>
                    </div>

                  </Card>
                ))}
              </div>

              {/* Bottom Actions: Share or Retake or Back to Analysis */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setCurrentStep('result')}
                  variant="outline"
                  size="lg"
                  icon={<ChevronLeft className="w-5 h-5" />}
                  className="bg-white py-4 text-sm font-bold"
                >
                  Kembali ke Hasil Analisis
                </Button>

                <Button
                  onClick={triggerShare}
                  variant="dark"
                  size="lg"
                  icon={<Share2 className="w-5 h-5" />}
                  className="flex-1 py-4 text-sm font-bold shadow-lg"
                >
                  Bagikan Rekomendasi
                </Button>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  icon={<RotateCcw className="w-5 h-5" />}
                  className="bg-white py-4 text-sm font-bold"
                >
                  Pemindaian Baru
                </Button>
              </div>

            </motion.div>
          )}

      {/* FLOATING COMPARE BAR (BOTTOM DOCK) */}
      {currentStep === 'recommendations' && compareIds.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-zinc-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-800 flex items-center gap-4 max-w-md w-[92%]"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FF73B6] text-white flex items-center justify-center shrink-0 shadow-md">
              <GitCompare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Komparasi Produk AI</p>
              <p className="text-[10px] text-zinc-400 font-medium">{compareIds.length} dari maks 3 produk dipilih</p>
            </div>
          </div>

          <Button
            onClick={() => setIsCompareModalOpen(true)}
            variant="primary"
            size="sm"
            className="text-xs font-bold py-2.5 px-4 shrink-0 shadow-md"
          >
            Buka Komparasi →
          </Button>
        </motion.div>
      )}

      {/* MODAL OVERLAY KOMPARASI PRODUK */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white text-zinc-950 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-zinc-100"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF73B6]/10 text-[#FF73B6] flex items-center justify-center shrink-0">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-zinc-950">Komparasi Produk Head-to-Head</h3>
                  <p className="text-xs text-zinc-500 font-medium">Bandingkan detail formula, finish & kecocokan tone</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Table */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {compareIds.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 border-dashed border-2 border-zinc-200 rounded-3xl space-y-2">
                  <GitCompare className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-sm font-bold text-zinc-700">Belum ada produk yang dipilih.</p>
                  <p className="text-xs text-zinc-500">Klik "+ Bandingkan" pada kartu produk rekomendasi untuk memilih produk.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[580px]">
                    {/* Header Row: Product Info */}
                    <div className="grid grid-cols-4 gap-4 pb-4 border-b border-zinc-100 items-end">
                      <div className="text-xs font-black text-zinc-400 uppercase tracking-wider">
                        Spesifikasi
                      </div>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="space-y-2 text-center relative bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                          <button
                            onClick={() => toggleCompareProduct(p.id)}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-zinc-200 hover:bg-rose-500 hover:text-white text-zinc-600 flex items-center justify-center transition-all cursor-pointer z-10 shadow-xs"
                            title="Hapus dari komparasi"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover mx-auto shadow-xs" />
                          <div>
                            <h5 className="text-xs font-bold text-zinc-900 line-clamp-1">{p.name}</h5>
                            <p className="text-[10px] text-zinc-400 font-semibold">{p.brand}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Row 1: Match AI */}
                    <div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-100 text-xs items-center">
                      <span className="font-bold text-zinc-500">Skor Match AI</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p, idx) => (
                        <div key={p.id} className="text-center font-black text-emerald-600 bg-emerald-50 py-1.5 rounded-xl border border-emerald-100">
                          {96 + idx}% MATCH FIT
                        </div>
                      ))}
                    </div>

                    {/* Row 2: Price */}
                    <div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-100 text-xs items-center">
                      <span className="font-bold text-zinc-500">Harga Resmi</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="text-center font-black text-zinc-950 text-sm">
                          ${p.price}
                        </div>
                      ))}
                    </div>

                    {/* Row 3: Category & Shade */}
                    <div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-100 text-xs items-center">
                      <span className="font-bold text-zinc-500">Kategori & Shade</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="text-center font-semibold text-zinc-700 bg-zinc-50 p-2 rounded-xl">
                          <span className="block font-bold text-[#FF73B6] text-[10px] uppercase">{p.category}</span>
                          <span>{p.shade || 'Medium Warm Nude'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Row 4: Finish & Formula */}
                    <div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-100 text-xs items-center">
                      <span className="font-bold text-zinc-500">Finish & Formulasi</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="text-center text-zinc-700 font-medium">
                          {p.category === 'Lipstick' ? 'Velvet Satin Finish • Hydrating' : p.category === 'Cushion' ? 'Dewy Glow • SPF 50+ PA++++' : 'Lightweight Longwear Formula'}
                        </div>
                      ))}
                    </div>

                    {/* Row 5: Affiliator Note */}
                    <div className="grid grid-cols-4 gap-4 py-3 border-b border-zinc-100 text-xs items-center">
                      <span className="font-bold text-zinc-500">Catatan Rekomendasi</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="text-center text-zinc-600 italic text-[11px] p-2 bg-zinc-50/60 rounded-xl">
                          "{p.affiliatorNote || 'Sangat direkomendasikan untuk pemakaian harian.'}"
                        </div>
                      ))}
                    </div>

                    {/* Row 6: Buy Action */}
                    <div className="grid grid-cols-4 gap-4 pt-4 text-xs items-center">
                      <span className="font-bold text-zinc-500">Aksi Pembelian</span>
                      {products.filter(p => compareIds.includes(p.id)).map((p) => (
                        <div key={p.id} className="text-center">
                          <Button
                            onClick={() => handleAffiliateClick(p)}
                            variant="primary"
                            size="sm"
                            className="w-full text-[11px] py-2 font-extrabold shadow-sm"
                          >
                            Beli Produk →
                          </Button>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium">Menampilkan {compareIds.length} dari max 3 produk</span>
              <Button
                onClick={() => setIsCompareModalOpen(false)}
                variant="outline"
                size="sm"
                className="bg-white font-bold"
              >
                Tutup Komparasi
              </Button>
            </div>

          </motion.div>
        </div>
      )}

        </section>

      </main>
      )}
    </div>
  );
};
