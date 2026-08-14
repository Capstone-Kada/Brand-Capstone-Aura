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
import { 
  UserIcon as UserIconSolid,
  SwatchIcon as SwatchIconSolid,
  SunIcon as SunIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  SparklesIcon as SparklesIconSolid,
  ViewfinderCircleIcon as ViewfinderCircleIconSolid,
  LockClosedIcon as LockClosedIconSolid
} from '@heroicons/react/24/solid';
import { RouteView, Product, AIAnalysisResult, UserProfile } from '../../types';
import { Button, Card, Badge, Progress } from '../../components/ui/UIComponents';
import { Modal } from '../../components/ui/Modal';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { api, mapListingToProduct, type PublicAIPageDto } from '../../services/api';
import confetti from 'canvas-confetti';
import { MOCK_PRODUCTS } from '../../services/mockData';

interface PublicAIExperienceProps {
  user: UserProfile;
  products: Product[];
  pageSlug?: string;
  scannedImage: string | null;
  isAnalyzing: boolean;
  analysisStep: number;
  scanResult: AIAnalysisResult | null;
  isPublicView?: boolean;
  onStartScan: (img: string, skinPref?: string, finishPref?: string, budgetPref?: string, isUpload?: boolean) => Promise<boolean> | void;
  onResetScan: () => void;
  onNavigate: (route: RouteView) => void;
  onToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  onRecordClick?: (listingId: string) => void;
}

type ScanFlowStep = 'gateway' | 'camera-guide' | 'camera' | 'scanning' | 'select-area' | 'enter-name' | 'result' | 'recommendations';
type AnalysisArea = 'bibir' | 'shade';

// Cycling status text for the scanner loading screen
const SCAN_STEPS = [
  'Initializing AI engine...',
  'Calibrating skin detector...',
  'Loading beauty model...',
  'Preparing analysis tools...',
  'Almost ready...',
];
const ScanStepText: React.FC = () => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCAN_STEPS.length), 1200);
    return () => clearInterval(t);
  }, []);
  return <span className="text-xs font-mono text-[#F26CA7]/80 tracking-wider">{SCAN_STEPS[idx]}</span>;
};

// Rotating beauty quotes for the minimal loading screen
const BEAUTY_QUOTES = [
  { text: '"Your skin tells your story."', sub: 'Let AI read it beautifully.' },
  { text: '"Beauty meets intelligence."', sub: 'Personalized just for you.' },
  { text: '"Science of beauty, art of glow."', sub: 'Precision AI Skin Intelligence.' },
  { text: '"Every shade has its perfect match."', sub: 'We\'ll find yours.' },
];
const BeautyQuoteText: React.FC = () => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BEAUTY_QUOTES.length), 2500);
    return () => clearInterval(t);
  }, []);
  const q = BEAUTY_QUOTES[idx];
  return (
    <div className="space-y-2" key={idx} style={{ animation: 'fadeSlide 2.5s ease-in-out' }}>
      <p className="text-sm font-light text-white/60 italic leading-relaxed">{q.text}</p>
      <p className="text-[10px] tracking-[0.2em] text-[#F26CA7]/40 uppercase">{q.sub}</p>
    </div>
  );
};

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

  const baseProducts = publicPageData && publicPageData.featuredListings.length > 0 ? publicPageData.featuredListings.map(mapListingToProduct) : productsProp;
  const products = baseProducts.length > 0 ? baseProducts : MOCK_PRODUCTS;
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
  const [loadingStageText, setLoadingStageText] = useState<string>('Starting Aura AI Beauty Engine...');

  const [currentStep, setCurrentStep] = useState<ScanFlowStep>('gateway');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AnalysisArea | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [subQuestionIndex, setSubQuestionIndex] = useState<number>(0);
  const [showRecommendations, setShowRecommendations] = useState<boolean>(false);
  
  // Beauty Preference Questionnaire State (AURA PRD Feature 2) - Mandatory selections
  const [budgetPref, setBudgetPref] = useState<string>('');
  const [finishPref, setFinishPref] = useState<string>('');
  const [occasionPref, setOccasionPref] = useState<string>('');
  const [agePref, setAgePref] = useState<string>('');
  
  // Product Comparison State

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



  // Initial Page Loading Animation Simulation
  useEffect(() => {
    if (!isInitialLoading) return;
    setInitialLoadProgress(0);
    setLoadingStageText('Memuat AI Beauty Engine...');
    
    const interval = setInterval(() => {
      setInitialLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsInitialLoading(false), 600);
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
    }, 240);

    return () => clearInterval(interval);
  }, [isInitialLoading]);

  const triggerReplayLoading = () => {
    setIsInitialLoading(true);
  };
  
  // Scanning Animation Progress State
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Starting AI sensor detection...');

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
        setCameraError('Camera is not supported on this device. You can upload a photo.');
      }
    } catch (err) {
      console.warn('Camera access prevented or unavailable:', err);
      setCameraError('Camera access denied. Please select a photo from your device.');
    }
  };

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Client-Side Face Pre-Check (Option C): validates whether human face is present before or during submission
  const checkClientFace = async (imgSource: HTMLCanvasElement | HTMLImageElement | string): Promise<boolean | null> => {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        let target: HTMLCanvasElement | HTMLImageElement;
        if (typeof imgSource === 'string') {
          const img = new Image();
          img.src = imgSource;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          target = img;
        } else {
          target = imgSource;
        }
        const faces = await detector.detect(target);
        return Array.isArray(faces) && faces.length > 0;
      } catch (err) {
        console.warn('Browser FaceDetector check error/unsupported:', err);
        return null;
      }
    }
    return null;
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Direct Live Camera Scan: smooth flow without strict blocking
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
        initiateScanProcess(dataUrl, false); // isUpload = false (direct camera scan)
        return;
      }
    }
    stopCamera();
  };

  // Upload Flow: Strict Option C (client-side pre-check) + Option A (backend rejection)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          const imgData = reader.result;
          // Option C: Client-Side Face Pre-Check for uploaded images
          const hasFace = await checkClientFace(imgData);
          if (hasFace === false) {
            onToast('Wajah Tidak Terdeteksi', 'Foto yang diunggah tidak terdeteksi memiliki wajah manusia yang jelas. Mohon gunakan foto selfie yang jelas.', 'error');
            return;
          }
          stopCamera();
          initiateScanProcess(imgData, true); // isUpload = true (strict upload flow)
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Scanning Process Animation
  const initiateScanProcess = async (imgUrl: string, isUpload: boolean = false) => {
    setCapturedImage(imgUrl);
    setCurrentStep('scanning');
    setScanProgress(0);
    setSelectedArea(null);
    setBudgetPref('');
    setFinishPref('');
    setOccasionPref('');
    setAgePref('');
    setShowRecommendations(false);
    setSubQuestionIndex(0);
    setScanStatusText('Detecting contour patterns & facial features...');

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    // Smoothly progress up to 90% while AI analysis is actively running
    scanIntervalRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          return 90; // Wait at 90% until AI call resolves
        }
        const next = prev + 3;
        if (next >= 25 && next < 50) {
          setScanStatusText('Analyzing pigmentation levels & moisture...');
        } else if (next >= 50 && next < 75) {
          setScanStatusText('Analyzing undertone spectrum & skin tone...');
        } else if (next >= 75) {
          setScanStatusText('Mengomparasi spektrum warna dengan database AI...');
        }
        return next;
      });
    }, 35);

    // Run real AI analysis in backend
    try {
      const scanPromise = onStartScan(imgUrl, undefined, undefined, undefined, isUpload);
      const success = scanPromise instanceof Promise ? await scanPromise : true;
      
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

      if (success === false && isUpload) {
        // Upload photo rejected by validation (Option A)!
        setCapturedImage(null);
        setScanProgress(0);
        setCurrentStep('camera-guide');
        return;
      }

      // Scan succeeded! Complete animation to 100% and proceed to questionnaire
      setScanProgress(100);
      setScanStatusText('AI Scan Complete!');
      setTimeout(() => {
        setCurrentStep('select-area');
      }, 350);
    } catch {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (isUpload) {
        setCapturedImage(null);
        setScanProgress(0);
        setCurrentStep('camera-guide');
      } else {
        setScanProgress(100);
        setTimeout(() => {
          setCurrentStep('select-area');
        }, 350);
      }
    }
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
    setAgePref('');
    setShowRecommendations(false);
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
    onToast('Redirecting to Product', `Opening product ${prod.name} in partner store.`, 'info');
  };

  // Filter products based on selected area (Lips vs Face & Shade)
  const getAffiliateButtonText = (url: string) => {
    return 'Buy Product';
  };

  const getRelevantProducts = () => {
    let baseProducts = scanResult && scanResult.recommendedProducts.length > 0
      ? scanResult.recommendedProducts.map((m) => m.product)
      : products;

    if (selectedArea === 'bibir') {
      let lips = baseProducts.filter((p) => p.mainCategory === 'Lips' || ['Lipstick', 'Lip Tint', 'Lip Cream', 'Lip Velvet', 'Lip Gloss', 'Lip Balm'].includes(p.category));
      // If AI didn't return any lip products, fallback to searching the entire affiliator catalog
      if (lips.length === 0) {
        lips = products.filter((p) => p.mainCategory === 'Lips' || ['Lipstick', 'Lip Tint', 'Lip Cream', 'Lip Velvet', 'Lip Gloss', 'Lip Balm'].includes(p.category));
      }
      return lips.length > 0 ? lips : baseProducts;
    }

    let face = baseProducts.filter((p) => p.mainCategory === 'Face & Shade' || ['Cushion', 'Foundation', 'Concealer', 'Blush & Cheek Tint', 'Powder', 'Contour & Bronzer', 'Eyeshadow'].includes(p.category));
    // If AI didn't return any face products, fallback to searching the entire affiliator catalog
    if (face.length === 0) {
      face = products.filter((p) => p.mainCategory === 'Face & Shade' || ['Cushion', 'Foundation', 'Concealer', 'Blush & Cheek Tint', 'Powder', 'Contour & Bronzer', 'Eyeshadow'].includes(p.category));
    }
    return face.length > 0 ? face : baseProducts;
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
      
      {/* OPTION 3: BEAUTY TECH MINIMAL LOADING OVERLAY */}
      <PremiumLoader isVisible={isInitialLoading} theme="dark">
        <BeautyQuoteText />
      </PremiumLoader>



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
                  <span>Back to Dashboard</span>
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
                <span>Back to Dashboard</span>
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
                title="Back"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="relative z-10 w-full max-w-xl sm:max-w-2xl mx-auto mt-6 sm:mt-10 mb-auto space-y-3 px-4">
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
                    subtitle: 'Detecting facial features & contours',
                    details: 'Melakukan pemetaan facial landmarks & simetri',
                    icon: UserIconSolid,
                    minProgress: 0,
                    maxProgress: 20,
                  },
                  {
                    id: 2,
                    stepNum: '02',
                    title: 'Detecting Skin Tone',
                    subtitle: 'Analyzing skin color & texture',
                    details: 'Mengukur pigmentasi, kelembapan & kejernihan',
                    icon: SwatchIconSolid,
                    minProgress: 20,
                    maxProgress: 45,
                  },
                  {
                    id: 3,
                    stepNum: '03',
                    title: 'Finding Undertone',
                    subtitle: 'Analyzing natural undertone spectrum',
                    details: 'Detecting undertone spectrum (Cool, Neutral, Warm)',
                    icon: SunIconSolid,
                    minProgress: 45,
                    maxProgress: 70,
                  },
                  {
                    id: 4,
                    stepNum: '04',
                    title: 'Matching Products',
                    subtitle: 'Mengomparasi spektrum dengan database AI',
                    details: 'Matching foundation, lipstick & blush shades',
                    icon: ShoppingBagIconSolid,
                    minProgress: 70,
                    maxProgress: 90,
                  },
                  {
                    id: 5,
                    stepNum: '05',
                    title: 'Preparing Recommendation',
                    subtitle: 'Curating personal beauty recommendations',
                    details: 'Menghasilkan panduan kecantikan tersuai',
                    icon: SparklesIconSolid,
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
                        className="absolute top-0 w-[86%] h-[160px] rounded-[28px] bg-gradient-to-b from-[#FAF5FF] to-[#F3E8FF] border border-white/80 shadow-xs pointer-events-none"
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
                        className="absolute top-0 w-[93%] h-[160px] rounded-[30px] bg-white/90 border border-[#D8B4FE]/40 shadow-md pointer-events-none"
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
                        className="relative w-full h-[160px] rounded-[32px] bg-white border-2 border-[#D8B4FE]/30 shadow-xl shadow-[#7E22CE]/10 p-5 flex flex-col justify-center overflow-hidden"
                      >
                        {/* Continuous subtle breathing float inside card frame */}
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          className="w-full h-full flex flex-col justify-center"
                        >
                          {/* Background Soft Radial Glow */}
                          <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-tr from-[#D8B4FE]/20 to-[#9333EA]/10 rounded-full blur-xl pointer-events-none animate-pulse" />

                          {/* Card Body - Animated Icon, Title & Subtitle */}
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="relative w-14 h-14 rounded-2xl bg-[#FCE7F3] text-[#F6559C] flex items-center justify-center shrink-0 shadow-sm border border-[#F6559C]/10">
                                <IconComp className="w-7 h-7 animate-bounce-subtle" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight leading-snug">
                                {activeStep.title}
                              </h3>
                              <p className="text-xs text-zinc-700 font-semibold mt-0.5 leading-snug line-clamp-2">
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
            <div className="pt-2 border-t border-zinc-100 flex items-center gap-3">
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-[#F6559C] rounded-full shadow-[0_0_8px_#F6559C]/40"
                  initial={{ width: '0%' }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[#F6559C] font-extrabold text-sm min-w-[36px] text-right">{scanProgress}%</span>
            </div>

            {/* Security Notice */}
            <div className="pt-4 pb-2 flex flex-col items-center justify-center text-center space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-800 font-extrabold text-[13px]">
                <LockClosedIconSolid className="w-3.5 h-3.5" />
                <span>100% Private & Secure</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium tracking-wide">
                Your data is encrypted and never stored.
              </p>
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
                      title="Back"
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
                      className="bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
                      style={{ padding: '10px 32px' }}
                    >
                      <Camera className="w-4 h-4 stroke-[2.2]" />
                      <span>Scan Your Face</span>
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
                      title="Back"
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

                  {/* ACTION BUTTONS: SNAP & UPLOAD */}
                  <div className="my-2 z-10 flex items-center justify-center gap-3 flex-wrap w-full">
                    <button
                      onClick={takeSnapshot}
                      className="bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                      style={{ padding: '10px 28px' }}
                    >
                      <Camera className="w-4 h-4 stroke-[2.2]" />
                      <span>Take Photo</span>
                    </button>
                    <label
                      className="bg-white/85 hover:bg-white text-[#18181B] font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95 inline-flex items-center gap-2 border border-white/90 backdrop-blur-md"
                      style={{ padding: '10px 22px' }}
                    >
                      <Upload className="w-4 h-4 stroke-[2.2]" />
                      <span>Upload Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
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
                    title="Back"
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
                          Question 1 of 5
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Select Focus Area
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
                        {[
                          { key: 'bibir', title: 'Lips Focus', subtitle: 'Natural lip tone & lipstick shade match', icon: '/image/Lipstick.png' },
                          { key: 'shade', title: 'Base / Skin', subtitle: 'Skin Tone & Undertone match for Cushion', icon: '/image/Makeup.png' },
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
                              {item.icon.startsWith('/') ? (
                                <img src={item.icon} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
                              ) : (
                                <span className="text-4xl sm:text-5xl">{item.icon}</span>
                              )}
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
                          Question 2 of 5
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Target Product Budget
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                          { title: '< Rp 100.000', subtitle: 'Affordable everyday beauty essentials', icon: '🏷️' },
                          { title: 'Rp 101.000 - Rp 200.000', subtitle: 'Popular mid-range favorites & bestsellers', icon: '💎' },
                          { title: 'Rp 201.000 - Rp 300.000', subtitle: 'Premium formulas & high-end luxury products', icon: '👑' },
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
                              {/* Icon removed per user request */}
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
                          Question 3 of 5
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
                          Question 4 of 5
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Usage Occasion
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
                        {[
                          { title: 'Daily Wear', subtitle: 'Lightweight everyday makeup & natural feel', icon: '/image/Daily-wear.png' },
                          { title: 'Office & Casual', subtitle: 'Polished, neat & professional look', icon: '/image/office-wearing.png' },
                          { title: 'Special Event', subtitle: 'High-coverage, long-lasting glam', icon: '/image/Special-event.png' },
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
                              {item.icon.startsWith('/') ? (
                                <img src={item.icon} alt={item.title} className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
                              ) : (
                                <span className="text-3xl sm:text-4xl">{item.icon}</span>
                              )}
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

                      {/* Next Question Button - Enabled only after Question 4 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!occasionPref}
                          onClick={() => setSubQuestionIndex(4)}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            occasionPref
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

                  {/* QUESTION 5: AGE */}
                  {subQuestionIndex === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 sm:space-y-10">
                      <div className="text-center space-y-1">
                        <p className="text-base font-medium tracking-[-0.05em] text-[#545459]" style={{ fontSize: '16px' }}>
                          Question 5 of 5
                        </p>
                        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight" style={{ fontSize: '38px' }}>
                          Berapa Usia Anda?
                        </h2>
                      </div>

                      <div className="max-w-sm mx-auto space-y-6">
                        <div className="relative">
                          <User className="w-4 h-4 text-[#545459]/50 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min="10"
                            max="100"
                            required
                            value={agePref}
                            onChange={(e) => setAgePref(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && agePref) {
                                setCurrentStep('enter-name');
                              }
                            }}
                            placeholder="Contoh: 24"
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/60 focus:bg-white text-sm font-medium outline-none transition-all border border-[#545459]/20 focus:border-[#F6559C] focus:ring-2 focus:ring-[#F6559C]/20 text-[#545459]"
                          />
                        </div>
                      </div>

                      {/* Continue to Profile Button - Enabled only after Question 5 is answered */}
                      <div className="text-center w-full pt-2">
                        <button
                          disabled={!agePref}
                          onClick={() => setCurrentStep('enter-name')}
                          className={`font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-sm shadow-xl transition-all inline-flex items-center justify-center gap-2 ${
                            agePref
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
                    title="Back"
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
                className="relative h-dvh bg-cover bg-center bg-no-repeat lg:overflow-hidden overflow-y-auto flex flex-col font-['Satoshi'] text-[#545459]"
                style={{ backgroundImage: "url('/image/Background-2.png')" }}
              >
                {/* Glass overlay - fixed to cover full viewport during scroll */}
                <div className="fixed inset-0 bg-white/40 backdrop-blur-[3px] pointer-events-none z-0" />

                {/* Header */}
                <div className="sticky top-0 left-0 w-full flex items-center justify-between z-30 px-6 sm:px-10 pt-4 pb-1 pointer-events-auto">
                  <button
                    onClick={() => {
                      if (showRecommendations) {
                        setShowRecommendations(false);
                      } else {
                        setCurrentStep('enter-name');
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#545459] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                    title="Back"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {!showRecommendations && (
                    <button
                      onClick={() => setShowRecommendations(true)}
                      className="flex items-center gap-2 bg-[#18181B] hover:bg-[#27272A] text-white font-medium font-['Satoshi'] tracking-[-0.05em] rounded-full text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-[#F6559C]" />
                      <span>View Product Recommendations</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-0 pb-8 space-y-4 sm:space-y-5 lg:flex lg:flex-col lg:h-full lg:overflow-hidden">

                  {/* Page Title with Animated Entrance */}
                  <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="text-center space-y-0.5 lg:shrink-0"
                  >
                    <p className="text-sm font-medium tracking-[-0.05em] text-[#545459]/70">AI Analysis Complete ✨</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium font-['Satoshi'] tracking-[-0.05em] text-[#545459] leading-tight">
                      Hi, <span className="text-[#F6559C]">{customerName || 'Beauty'}</span> — Here's Your Result
                    </h2>
                  </motion.div>

                  {/* Two-column layout with tight gap */}
                  <div className="grid grid-cols-1 lg:grid-cols-[378px_1fr] gap-6 items-start lg:flex-1 lg:min-h-0">

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

                      {/* Scan Again & Share Buttons (Positioned right near the photo) */}
                      <div className="flex items-center gap-2.5 w-full max-w-[378px]">
                        <button
                          onClick={handleReset}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/80 text-[#545459] text-xs font-medium shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Scan Again</span>
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
                    <div className="space-y-4 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-12 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                      {showRecommendations ? (
                        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          
                          {/* AI Explanation Banner */}
                          <div className="bg-[#FFF5F8] rounded-3xl p-5 sm:p-6 pr-32 sm:pr-48 flex flex-col justify-center border border-rose-50 shadow-sm relative overflow-hidden min-h-[140px] sm:min-h-[160px]">
                            <div className="relative z-10">
                              <h4 className="text-sm sm:text-base font-bold text-[#1D1B26] flex items-center gap-1.5 mb-2">
                                <SparklesIconSolid className="w-5 h-5 text-[#F6559C]" /> Why these products?
                              </h4>
                              <p className="text-xs sm:text-sm text-[#61657A] font-medium leading-relaxed max-w-xl">
                                {scanResult?.matchSummary || 'Our AI analyzed your skin, preferences, and concerns to recommend products that will enhance your natural beauty and solve your specific needs.'}
                              </p>
                            </div>
                            
                            {/* Chatbot Image - Absolute positioned at bottom right */}
                            <div className="absolute right-0 bottom-0 w-36 h-36 sm:w-52 sm:h-52 z-10 translate-x-2 sm:translate-x-6 translate-y-2 sm:translate-y-4">
                              <img src="/image/chatbot.png" alt="AI Bot" className="w-full h-full object-contain object-bottom drop-shadow-sm" />
                            </div>
                            
                            {/* Decorative background glow for the robot */}
                            <div className="absolute -right-4 bottom-0 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
                          </div>

                          <div className="overflow-x-auto rounded-3xl border border-zinc-100 shadow-sm bg-white pt-5 pb-2 px-2">
                            <div className="min-w-[700px]">
                              <h3 className="text-xl font-black text-[#1D1B26] px-4 pb-4 font-['Satoshi'] tracking-[-0.03em]">Compare Products</h3>
                              {/* Header Row: Product Info */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 p-4 border-b border-zinc-100 items-center">
                                <div className="text-xs font-bold text-zinc-500">
                                  Product
                                </div>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="relative bg-zinc-50/50 p-3 rounded-2xl flex items-center gap-3 shadow-xs border border-zinc-50">
                                    {/* Removed X button per user request */}
                                    <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-white shadow-xs" />
                                    <div className="flex-1 pr-5">
                                      <h5 className="text-[10px] font-bold text-zinc-900 leading-tight">{p.brand}</h5>
                                      <p className="text-[10px] text-zinc-500 font-medium line-clamp-2 leading-snug">{p.name}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Row 1: Overall Match */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 items-center">
                                <span className="font-bold text-zinc-900 text-sm">Overall Match</span>
                                {getRelevantProducts().slice(0, 3).map((p, idx) => {
                                  const score = 96 - (idx * 3);
                                  return (
                                    <div key={p.id} className="space-y-1.5 px-2">
                                      <div className="text-xl font-black text-zinc-900">{score}%</div>
                                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#FF1493] h-full rounded-full" style={{ width: `${score}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Row 2: Category & Shade */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Category & Shade</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-zinc-700 font-medium px-2">
                                    <span className="font-bold text-[#FF1493] uppercase text-[10px] block">{p.category}</span>
                                    <span>{p.shade || 'Medium Warm Nude'}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Row 3: Suitable For */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Suitable For</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-zinc-700 font-medium px-2">
                                    {p.suitableSkinTypes?.length > 0 ? p.suitableSkinTypes.join(', ') : 'All Skin Types'}
                                  </div>
                                ))}
                              </div>

                              {/* Row 4: Targeted Concerns */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Targeted Concerns</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-zinc-700 font-medium px-2 line-clamp-2">
                                    {p.targetsConcerns?.length > 0 ? p.targetsConcerns.join(', ') : 'Basic Care'}
                                  </div>
                                ))}
                              </div>

                              {/* Row 5: Finish & Formulation */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Finish & Formulation</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-zinc-700 font-medium px-2">
                                    {p.category === 'Lipstick' ? 'Velvet Satin Finish • Hydrating' : p.category === 'Cushion' ? 'Dewy Glow • SPF 50+ PA++++' : 'Lightweight Longwear Formula'}
                                  </div>
                                ))}
                              </div>

                              {/* Row 6: Ingredients */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Ingredients</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="text-zinc-700 font-medium px-2 line-clamp-2">
                                    {p.affiliatorNote || (['Lipstick', 'Lip Tint', 'Lip Gloss', 'Lip Balm'].includes(p.category) ? 'Shea Butter, Vitamin E, Jojoba Oil' : 'Hyaluronic Acid, Niacinamide, Glycerin')}
                                  </div>
                                ))}
                              </div>

                              {/* Row 7: Official Price */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 border-b border-zinc-100 text-xs items-center">
                                <span className="text-zinc-500 font-medium">Official Price</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="font-black text-zinc-900 px-2 text-sm">
                                    Rp {p.price.toLocaleString('id-ID')}
                                  </div>
                                ))}
                              </div>

                              {/* Row 8: Buy Action */}
                              <div className="grid grid-cols-[140px_1fr_1fr_1fr] gap-4 px-4 py-4 text-xs items-center">
                                <span className="font-bold text-zinc-500">Action</span>
                                {getRelevantProducts().slice(0, 3).map((p) => (
                                  <div key={p.id} className="px-2">
                                    <Button
                                      onClick={() => handleAffiliateClick(p)}
                                      variant="dark"
                                      size="sm"
                                      className="w-full text-[11px] py-2 font-bold shadow-xs bg-[#1D1B26] hover:bg-zinc-800 text-white rounded-full border-0"
                                    >
                                      {getAffiliateButtonText(p.affiliateUrl)}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          {!scanResult ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 rounded-[32px] bg-white/60 backdrop-blur-xl border border-white shadow-sm relative overflow-hidden">
                              <Loader2 className="w-8 h-8 animate-spin text-[#F6559C] mb-4" />
                              <p className="text-[#545459] font-medium font-['Satoshi'] tracking-[-0.03em]">
                                Curating your personal beauty recommendations...
                              </p>
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
                              Skin <strong className="text-[#18181B]">{customerName || 'You'}</strong> is classified as <strong className="text-[#F6559C]">{scanResult.personalColor} {scanResult.undertone}</strong> with a {scanResult.faceShape} face shape. {scanResult.matchSummary || `Product recommendations have been tailored to your ${scanResult.skinTone} skin tone.`}
                            </p>
                          </motion.div>
                        </>
                      )}
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}


        </section>

      </main>
      )}
    </div>
  );
};
