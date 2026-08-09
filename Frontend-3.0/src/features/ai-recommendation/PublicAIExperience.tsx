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
  ShieldAlert,
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
  Heart
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

type ScanFlowStep = 'upload' | 'camera-guide' | 'camera' | 'scanning' | 'select-area' | 'enter-name' | 'result' | 'recommendations';
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

  const [currentStep, setCurrentStep] = useState<ScanFlowStep>('upload');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AnalysisArea>('shade');
  const [customerName, setCustomerName] = useState<string>('');
  
  // Beauty Preference Questionnaire State (AURA PRD Feature 2)
  const [budgetPref, setBudgetPref] = useState<string>('Rp150K - Rp300K');
  const [finishPref, setFinishPref] = useState<string>('Natural Satin');
  const [occasionPref, setOccasionPref] = useState<string>('Daily Wear');
  
  // Product Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

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
    setSelectedArea('shade');
    setCurrentStep('upload');
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
    'upload': 1,
    'camera-guide': 1,
    'camera': 1,
    'scanning': 1,
    'select-area': 2,
    'enter-name': 3,
    'result': 4,
    'recommendations': 5
  }[currentStep];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0F11] pb-16 pt-6 px-4 sm:px-6 lg:px-8 relative selection:bg-[#FF73B6] selection:text-white">
      
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
                <p className="text-sm sm:text-base font-normal tracking-[0.1em] text-[#6d4d73]">
                  Wardah
                </p>
                <h1 className="text-lg sm:text-xl font-normal tracking-[0.25em] text-[#5e3e65] uppercase">
                  VIRTUAL TRY ON
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

      {/* TOP NAVBAR HEADER FOR DESKTOP & MOBILE */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-zinc-200/80 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
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
            ) : (
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
            )}
          </div>

          {/* Stepper Navigation Indicator */}
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

          {!isPublicView && (
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

      {/* CONDITIONAL LAYOUT: FULL WIDTH FOR SCANNING STEP vs 2-COLUMN GRID FOR OTHER STEPS */}
      {currentStep === 'scanning' ? (
        /* FULL WIDTH SCANNING CONTAINER (MATCHING DESIGN REFERENCE) */
        <div className="max-w-md mx-auto py-2 px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
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
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  Real-Time AI Analysis
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 font-medium h-5">
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
                    details: 'Menghasilkan panduan kecantikan Wardah tersuai',
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

            {/* Step Timeline Indicator Nodes (1 - 5) */}
            <div className="pt-2">
              <div className="flex items-center justify-between max-w-xs mx-auto relative px-2">
                {/* Connecting Line Background */}
                <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-zinc-200 -z-0" />
                <div
                  className="absolute top-3.5 left-6 h-0.5 bg-[#FF73B6] -z-0 transition-all duration-300"
                  style={{
                    width: `${
                      scanProgress < 20
                        ? '0%'
                        : scanProgress < 45
                        ? '25%'
                        : scanProgress < 70
                        ? '50%'
                        : scanProgress < 90
                        ? '75%'
                        : '100%'
                    }`,
                  }}
                />

                {[
                  { num: 1, title: 'Face', threshold: 20 },
                  { num: 2, title: 'Tone', threshold: 45 },
                  { num: 3, title: 'Undertone', threshold: 70 },
                  { num: 4, title: 'Products', threshold: 90 },
                  { num: 5, title: 'Result', threshold: 100 },
                ].map((st, i) => {
                  const isCompleted = scanProgress >= st.threshold;
                  const prevThreshold = i === 0 ? 0 : [20, 45, 70, 90][i - 1];
                  const isActive = !isCompleted && scanProgress >= prevThreshold;

                  return (
                    <div key={st.num} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs scale-100'
                            : isActive
                            ? 'bg-[#FF73B6] text-white ring-4 ring-[#FF73B6]/20 scale-110 shadow-md'
                            : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          st.num
                        )}
                      </div>
                      <span
                        className={`text-[9px] mt-1 font-semibold ${
                          isActive
                            ? 'text-[#FF73B6]'
                            : isCompleted
                            ? 'text-emerald-600'
                            : 'text-zinc-400'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                  );
                })}
              </div>
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

          </motion.div>
        </div>
      ) : (
        /* MAIN DESKTOP 2-COLUMN GRID LAYOUT FOR ALL OTHER STEPS */
        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CONDITIONAL CREATOR PROFILE (BEFORE SCAN) */}
          {currentStep === 'upload' && (
            <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              
              <Card className="p-6 bg-white relative overflow-hidden space-y-5 border border-zinc-200/80">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF73B6]/20 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-[#FF73B6] via-[#C786FF] to-[#FFB6D9] shadow-md">
                      <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full rounded-xl object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs" title="Affiliator Terverifikasi">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h1 className="text-lg font-black text-zinc-950 truncate">{creator.name}</h1>
                      <Badge variant="primary" className="text-[9px] px-2 py-0.2">
                        PRO CREATOR
                      </Badge>
                    </div>
                    <p className="text-xs font-bold text-[#FF73B6]">{creator.handle}</p>
                    <p className="text-[11px] text-zinc-500 font-medium line-clamp-2">
                      "{creator.bio}"
                    </p>
                  </div>
                </div>

                {/* Creator Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 rounded-2xl text-center">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Match AI</span>
                    <span className="text-xs font-black text-zinc-900">98.8%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Koleksi</span>
                    <span className="text-xs font-black text-[#FF73B6]">{products.length} Produk</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Scan Wajah</span>
                    <span className="text-xs font-black text-emerald-600">12.4k+</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#FF73B6]" />
                    <span>Rekomendasi Terkurasi</span>
                  </span>
                  <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
                    Official Affiliator
                  </span>
                </div>
              </Card>

            </aside>
          )}

          {/* RIGHT COLUMN: INTERACTIVE WORKSPACE */}
          <section className={`${currentStep !== 'upload' ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
            
            {/* STEP 1: INITIAL CHOICE (UPLOAD OR LIVE CAMERA) */}
            {currentStep === 'upload' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="p-6 sm:p-8 space-y-8 bg-white border border-zinc-200/80">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" className="text-[10px]">
                          LANGKAH 1 DARI 3
                        </Badge>
                        <span className="text-xs text-zinc-400 font-semibold">• AI Scan Studio</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                        Analisis Kulit & Rekomendasi Kecantikan
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
                        Pilih metode pemindaian untuk menganalisis tone kulit & mendapatkan kurasi produk terkompatibel.
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Live Camera Option Card */}
                    <button
                      onClick={() => setCurrentStep('camera-guide')}
                      className="group p-6 rounded-3xl bg-[#FF73B6]/10 hover:bg-[#FF73B6]/15 text-zinc-900 shadow-2xs text-left transition-all cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#FF73B6] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5 z-10">
                        <span className="text-[10px] font-bold text-[#FF73B6] uppercase tracking-wider block">Kamera Langsung</span>
                        <h3 className="text-lg font-extrabold text-zinc-950">Scan Kamera Langsung</h3>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          Gunakan kamera web/perangkat Anda secara real-time dengan panduan posisi ideal.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#FF73B6] group-hover:translate-x-1 transition-transform">
                        <span>Buka Panduan Kamera</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Upload Photo Option Card */}
                    <label className="group p-6 rounded-3xl bg-zinc-50 hover:bg-zinc-100/80 text-zinc-900 shadow-2xs text-left transition-all cursor-pointer flex flex-col justify-between space-y-6 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      <div className="w-12 h-12 rounded-2xl bg-white text-zinc-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Galeri Perangkat</span>
                        <h3 className="text-lg font-extrabold text-zinc-900">Unggah Foto Selfie</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Pilih foto selfie resolusi baik dengan pencahayaan terang dari galeri Anda.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-zinc-800 group-hover:translate-x-1 transition-transform">
                        <span>Pilih File Foto</span>
                        <ArrowRight className="w-4 h-4 text-[#FF73B6]" />
                      </div>
                    </label>

                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-100">
                    <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>Privat & Aman. Foto tidak disimpan secara permanen di server publik.</span>
                  </div>

                </Card>
              </motion.div>
            )}

            {/* STEP 1.2: CAMERA POSITIONING GUIDE PAGE (WARDAH / AURA COLOR EXPERT STYLE) */}
            {currentStep === 'camera-guide' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-3xl mx-auto"
              >
                <div className="relative rounded-[36px] bg-gradient-to-br from-[#f8d4b8] via-[#f7ebd9] to-[#d0eee3] p-6 sm:p-10 shadow-xl overflow-hidden border border-white/60 min-h-[600px] flex flex-col justify-between items-center text-[#1c6071]">
                  
                  {/* Background Soft Glows */}
                  <div className="absolute top-0 left-0 w-40 h-40 bg-white/30 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Header Row */}
                  <div className="w-full flex items-center justify-between z-10">
                    <button
                      onClick={() => setCurrentStep('upload')}
                      className="w-10 h-10 rounded-full bg-white/70 hover:bg-white text-[#1c6071] flex items-center justify-center shadow-xs transition-all cursor-pointer hover:scale-105"
                      title="Kembali"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                    </button>

                    <div className="text-center">
                      <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#1c6071] uppercase block opacity-80">
                        Aura Beauty
                      </span>
                      <span className="text-[11px] sm:text-xs font-extrabold tracking-[0.2em] text-[#1c6071] uppercase block">
                        COLOR EXPERT
                      </span>
                    </div>

                    <div className="w-10" />
                  </div>

                  {/* Center Title & Guide Badges */}
                  <div className="text-center space-y-4 my-2 z-10 max-w-md mx-auto">
                    <div className="space-y-0.5">
                      <p className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#2c7283] uppercase">
                        TIPS FOR IDEAL
                      </p>
                      <h2 className="text-xl sm:text-2xl font-black tracking-wider text-[#1c6071] uppercase">
                        CAMERA POSITION
                      </h2>
                    </div>

                    {/* 3 Status Badges */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap pt-1">
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#2c7283] uppercase">LIGHTING CHECK</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#1c6071] text-[#1c6071] text-[10px] font-extrabold uppercase tracking-wider bg-white/50 shadow-2xs">
                          GOOD
                        </span>
                      </div>
                      
                      <div className="hidden sm:block text-[#2c7283]/40 text-xs">|</div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#2c7283] uppercase">LOOK STRAIGHT</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#1c6071] text-[#1c6071] text-[10px] font-extrabold uppercase tracking-wider bg-white/50 shadow-2xs">
                          GOOD
                        </span>
                      </div>

                      <div className="hidden sm:block text-[#2c7283]/40 text-xs">|</div>

                      <div className="text-center space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-bold tracking-wider text-[#2c7283] uppercase">POSITION FACE</p>
                        <span className="inline-block px-3 py-0.5 rounded-full border border-[#1c6071] text-[#1c6071] text-[10px] font-extrabold uppercase tracking-wider bg-white/50 shadow-2xs">
                          GOOD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model Face Image with Dashed Oval Guide Overlay */}
                  <div className="relative my-2 z-10">
                    <div className="w-64 h-72 sm:w-72 sm:h-80 rounded-[32px] bg-white/30 backdrop-blur-md border border-white/70 p-2.5 shadow-lg overflow-hidden relative flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                        alt="Face position model guide"
                        className="w-full h-full object-cover rounded-[24px]"
                      />
                      {/* Dashed Oval Frame */}
                      <div className="absolute inset-0 m-auto w-44 h-56 sm:w-52 sm:h-64 border-2 border-dashed border-white/90 rounded-[50%] shadow-md pointer-events-none z-20" />
                    </div>
                  </div>

                  {/* Action Button: Scan / Open Camera */}
                  <div className="my-2 z-10 text-center w-full">
                    <button
                      onClick={startCamera}
                      className="bg-zinc-900 hover:bg-black text-white font-black px-14 py-3 rounded-full text-sm tracking-wide shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      Scan
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 1.5: LIVE CAMERA SCANNER VIEW (REDESIGNED BASED ON USER FEEDBACK) */}
            {currentStep === 'camera' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-6 sm:p-8 bg-white text-zinc-950 relative overflow-hidden space-y-5 rounded-[32px] border border-zinc-200/80">
                  
                  {/* Top Header Row */}
                  <div className="flex items-center justify-end border-b border-zinc-100 pb-4">
                    <button
                      onClick={() => {
                        stopCamera();
                        setCurrentStep('upload');
                      }}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 cursor-pointer transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 2. COMPACT FIT-CONTENT DIAGNOSTIC BAR AT THE TOP (NO WRAP) */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 flex-nowrap overflow-x-auto max-w-full mx-auto w-fit bg-zinc-50 border border-zinc-200/80 p-2 rounded-2xl whitespace-nowrap">
                    <div className="px-3 py-1 rounded-xl bg-white border border-zinc-100 flex items-center gap-1.5 shadow-2xs shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Pencahayaan:</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> Optimal
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-white border border-zinc-100 flex items-center gap-1.5 shadow-2xs shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Posisi Wajah:</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> Terdeteksi
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-white border border-zinc-100 flex items-center gap-1.5 shadow-2xs shrink-0">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Pandangan:</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3.5 h-3.5" /> Fokus Lurus
                      </span>
                    </div>
                  </div>

                  {/* CAMERA SCANNER VIEWPORT WITH WHITE CORNER RETICLES & ANIMATED SCANNING LINE */}
                  <div className="relative w-full max-w-[500px] aspect-[3/4] sm:aspect-[4/5] mx-auto rounded-[32px] overflow-hidden bg-zinc-950 shadow-2xl flex items-center justify-center group">
                    
                    {isCameraActive && !cameraError && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    )}

                    {/* Fallback if camera permission fails */}
                    {cameraError && (
                      <div className="p-8 text-center space-y-4 text-white z-20">
                        <p className="text-xs text-zinc-300 leading-relaxed">{cameraError}</p>
                        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF73B6] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#e05593] transition-all shadow-md">
                          <Upload className="w-4 h-4" />
                          <span>Unggah Foto Dari Perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* WHITE CORNER RETICLES (BRACKET TARGET FRAMES) */}
                    <div className="absolute inset-6 sm:inset-10 pointer-events-none flex flex-col justify-between z-10">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 border-l-[4px] border-t-[4px] border-white rounded-tl-2xl shadow-md" />
                        <div className="w-12 h-12 border-r-[4px] border-t-[4px] border-white rounded-tr-2xl shadow-md" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-12 h-12 border-l-[4px] border-b-[4px] border-white rounded-bl-2xl shadow-md" />
                        <div className="w-12 h-12 border-r-[4px] border-b-[4px] border-white rounded-br-2xl shadow-md" />
                      </div>
                    </div>

                    {/* 1. ANIMATED MOVING WHITE SCANNING LINE */}
                    <motion.div
                      animate={{ top: ['15%', '85%', '15%'] }}
                      transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                      className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#ffffff] z-20 pointer-events-none"
                    />

                    {/* OPTICAL VIGNETTE & BOTTOM GRADIENT */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  </div>

                  {/* 3. SNAP BUTTON WITH VARIANT PRIMARY (FIT CONTENT) */}
                  <div className="flex justify-center pt-1">
                    <Button
                      onClick={takeSnapshot}
                      variant="primary"
                      size="lg"
                      icon={<Camera className="w-5 h-5" />}
                      className="w-fit px-8 py-3.5 text-sm sm:text-base font-extrabold shadow-md rounded-2xl"
                    >
                      Ambil Foto & Mulai Pemindaian AI
                    </Button>
                  </div>

                </Card>
              </motion.div>
            )}

          {/* STEP 3: SELECT ANALYSIS AREA (BIBIR, SHADE, MATA) */}
          {currentStep === 'select-area' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 sm:p-8 space-y-8 bg-white border border-zinc-200/80">
                
                <div className="space-y-2">
                  <Badge variant="primary" className="text-[10px]">
                    LANGKAH 2 DARI 3
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                    Pilih Fokus Area Analisis
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
                    Pilih area wajah spesifik yang ingin Anda ketahui shade dan rekomendasi produk terkompatibelnya.
                  </p>
                </div>

                {/* Selection Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* 1. Lips Option */}
                  <div
                    onClick={() => setSelectedArea('bibir')}
                    className={`p-5 rounded-3xl transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                      selectedArea === 'bibir'
                        ? 'bg-[#FF73B6]/10 ring-2 ring-[#FF73B6] shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                        selectedArea === 'bibir' ? 'bg-[#FF73B6] text-white shadow-sm' : 'bg-white text-zinc-600 shadow-xs'
                      }`}>
                        💋
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedArea === 'bibir' ? 'bg-[#FF73B6] text-white' : 'bg-zinc-200'
                      }`}>
                        {selectedArea === 'bibir' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-zinc-900">Lips Focus</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Analisis warna bibir alami, kelembapan, & rekomendasi Lipstik, Lip Tint, Lip Cream, & Lip Velvet.
                      </p>
                    </div>
                  </div>

                  {/* 2. Fade & Shade Option */}
                  <div
                    onClick={() => setSelectedArea('shade')}
                    className={`p-5 rounded-3xl transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                      selectedArea === 'shade'
                        ? 'bg-[#FF73B6]/10 ring-2 ring-[#FF73B6] shadow-md'
                        : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                        selectedArea === 'shade' ? 'bg-[#FF73B6] text-white shadow-sm' : 'bg-white text-zinc-600 shadow-xs'
                      }`}>
                        ✨
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        selectedArea === 'shade' ? 'bg-[#FF73B6] text-white' : 'bg-zinc-200'
                      }`}>
                        {selectedArea === 'shade' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-zinc-900">Fade & Shade Focus</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Analisis Tone Kulit & Undertone untuk Cushion, Foundation, Blush & Cheek Tint, Powder, & Concealer.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToNameStep}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FF73B6] hover:bg-[#e05593] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Lanjutkan ke Personalisasi Profile</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

              </Card>
            </motion.div>
          )}

          {/* STEP 3: QUESTIONNAIRE & PERSONALIZATION */}
          {currentStep === 'enter-name' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 sm:p-10 space-y-8 bg-white text-left border border-zinc-200/80 rounded-[32px]">
                
                <div className="space-y-2">
                  <Badge variant="primary" className="text-[10px]">
                    LANGKAH 3 DARI 3
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                    Kuesioner Presisi & Personalisasi Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed">
                    Lengkapi preferensi kecantikan Anda agar rekomendasi AI memprioritaskan produk & budget yang paling sesuai.
                  </p>
                </div>

                <form onSubmit={handleFinalizeResult} className="space-y-6 max-w-xl">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800 block uppercase tracking-wider">Nama Lengkap / Panggilan:</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Amanda / Siti / Bunga"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#FF73B6]/20 text-sm font-semibold outline-hidden transition-all border border-zinc-200/60"
                      />
                    </div>
                  </div>

                  {/* Questionnaire: Budget Range */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800 block uppercase tracking-wider">Target Budget Produk:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Di bawah Rp150K', 'Rp150K - Rp300K', 'Di atas Rp300K'].map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBudgetPref(b)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            budgetPref === b
                              ? 'bg-[#FF73B6] text-white border-[#FF73B6] shadow-2xs'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200/80 hover:bg-zinc-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Questionnaire: Finish Preference */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800 block uppercase tracking-wider">Efek Finish Diharapkan:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Dewy Glow', 'Natural Satin', 'Velvet Matte'].map((f) => (
                        <button
                          type="button"
                          key={f}
                          onClick={() => setFinishPref(f)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            finishPref === f
                              ? 'bg-[#FF73B6] text-white border-[#FF73B6] shadow-2xs'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200/80 hover:bg-zinc-100'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Questionnaire: Occasion */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-800 block uppercase tracking-wider">Kebutuhan Penggunaan:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Daily Wear', 'Office & Casual', 'Special Event'].map((o) => (
                        <button
                          type="button"
                          key={o}
                          onClick={() => setOccasionPref(o)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            occasionPref === o
                              ? 'bg-[#FF73B6] text-white border-[#FF73B6] shadow-2xs'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200/80 hover:bg-zinc-100'
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-[#FF73B6] hover:bg-[#e05593] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] mt-4"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Laporan Hasil AI & Rekomendasi →</span>
                  </button>
                </form>

              </Card>
            </motion.div>
          )}

          {/* STEP 4: FINALIZED PERSONALIZED RESULT ANALYSIS PAGE */}
          {currentStep === 'result' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* LEFT COLUMN: SCAN RESULT SELFIE CARD MATCHING USER REFERENCE IMAGE */}
                <div className="lg:col-span-5 flex flex-col h-full">
                  <div className="relative w-full h-full min-h-[380px] rounded-[32px] overflow-hidden shadow-xl border border-zinc-200 bg-zinc-900 group flex flex-col justify-end">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Uploaded selfie"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-zinc-500 font-semibold text-xs">
                        Foto Pemindaian Wajah
                      </div>
                    )}

                    {/* Dark Bottom Gradient Overlay matching user's reference image */}
                    <div className="relative z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-7 text-left pointer-events-none pt-24">
                      <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-xs">
                        Uploaded selfie
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300/90 font-medium mt-0.5">
                        Analyzed in under 10 seconds
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: AI DIAGNOSTIC REPORT BREAKDOWN */}
                <div className="lg:col-span-7 flex flex-col h-full">
                  <Card className="p-6 sm:p-8 bg-white border border-zinc-200/80 text-zinc-900 space-y-6 h-full flex flex-col justify-between rounded-[32px]">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-black text-zinc-950">
                            Hasil AI Scan: {customerName || 'Customer'} ✨
                          </h3>
                        </div>
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>AI Confidence: {scanResult ? `${scanResult.confidence.toFixed(1)}%` : '—'}</span>
                        </p>
                      </div>

                      <Badge variant="primary" className="text-xs px-3.5 py-1.5 uppercase tracking-wider shadow-2xs shrink-0">
                        {selectedArea === 'bibir' ? '💋 LIPS MATCH REPORT' : '✨ FADE & SHADE REPORT'}
                      </Badge>
                    </div>

                    {!scanResult ? (
                      <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-zinc-600 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin text-[#FF73B6]" />
                        <span>{isAnalyzing ? 'AI masih menyelesaikan analisis wajah Anda...' : 'Hasil analisis tidak tersedia. Silakan scan ulang.'}</span>
                      </div>
                    ) : (
                      <>
                        {/* Standardized Diagnostic Metrics */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-100/80">
                            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🎨 Personal Color</span>
                            <span className="text-base font-black text-pink-700">{scanResult.personalColor}</span>
                          </div>
                          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100/80">
                            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🌡️ Undertone</span>
                            <span className="text-base font-black text-blue-700">{scanResult.undertone}</span>
                          </div>
                          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100/80">
                            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🧑 Skin Tone</span>
                            <span className="text-base font-black text-amber-800">{scanResult.skinTone}</span>
                          </div>
                          <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100/80">
                            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">😊 Face Shape</span>
                            <span className="text-base font-black text-purple-700">{scanResult.faceShape}</span>
                          </div>
                        </div>

                        {/* Best Color Palette */}
                        {scanResult.bestColorPalette.length > 0 && (
                          <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-2.5">
                            <span className="text-xs font-extrabold text-zinc-900 block flex items-center gap-1.5">
                              🎨 Best Color Palette
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {scanResult.bestColorPalette.map((swatch) => (
                                <div key={swatch.name} className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-zinc-200/80 text-xs font-bold text-zinc-800">
                                  <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: swatch.colorHex }}></span>
                                  <span>{swatch.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Analysis Summary Text */}
                        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                          <p>
                            Berdasarkan pemindaian AI, kulit <strong className="text-zinc-950 font-bold">{customerName || 'Anda'}</strong> tergolong <strong className="text-pink-600 font-bold">{scanResult.personalColor} {scanResult.undertone}</strong> dengan kontur wajah {scanResult.faceShape}. {scanResult.matchSummary || `Rekomendasi produk telah disesuaikan dengan skin tone ${scanResult.skinTone} Anda.`}
                          </p>
                        </div>
                      </>
                    )}

                  </Card>
                </div>

              </div>

              {/* Step 4 CTA Actions Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    className="bg-white text-xs font-bold py-3"
                  >
                    Scan Ulang
                  </Button>
                  <Button
                    onClick={triggerShare}
                    variant="dark"
                    size="md"
                    icon={<Share2 className="w-4 h-4" />}
                    className="text-xs font-bold py-3"
                  >
                    Bagikan Hasil
                  </Button>
                </div>

                <button
                  onClick={() => setCurrentStep('recommendations')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FF73B6] hover:bg-[#e05593] text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Lihat Rekomendasi Produk Fit →</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
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
