import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Camera,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  BarChart,
  Share2,
  Smartphone,
  HelpCircle,
  DollarSign,
  RefreshCw,
  Sliders,
  Play,
  Quote,
  ChevronLeft,
  ChevronRight,
  Target,
  Check,
  Wand2,
  Flame,
  Palette,
  Microscope,
  BarChart3,
  Globe,
  Lock,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { RouteView } from '../../types';
import { Button, Card, Badge, Accordion } from '../../components/ui/UIComponents';
import { ScrollTextReveal } from '../../components/ui/TextReveal';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { MOCK_TESTIMONIALS, MOCK_FAQS } from '../../services/mockData';

const heroBgImage = '/image/Background.png';
const iphoneScanImg = '/image/Iphone-AI-Scann.png';
interface LandingPageProps {
  onNavigate: (route: RouteView) => void;
}

const PLATFORMS_TICKER = [
  {
    name: 'TikTok Shop',
    logo: (
      <div className="flex items-center gap-2.5 h-8 select-none">
        <svg className="h-6 w-6 text-zinc-900 shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.888 2.896 2.896 0 0 1-2.888-2.901 2.896 2.896 0 0 1 2.888-2.888c.34 0 .662.062.96.175V9.41a6.34 6.34 0 0 0-.96-.073A6.333 6.333 0 0 0 3.15 15.67a6.333 6.333 0 0 0 6.333 6.333 6.333 6.333 0 0 0 6.333-6.333V8.892a8.17 8.17 0 0 0 4.773 1.522V7.008a4.84 4.84 0 0 1-1.000-.322z" />
        </svg>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xl tracking-tight text-zinc-900">TikTok</span>
          <span className="font-semibold text-xs text-zinc-700 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md">Shop</span>
        </div>
      </div>
    ),
  },
  {
    name: 'ShopMy',
    logo: (
      <div className="flex items-center gap-2.5 h-8 select-none">
        <div className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
          S
        </div>
        <span className="font-bold text-xl tracking-tight font-serif text-zinc-950">ShopMy</span>
      </div>
    ),
  },
  {
    name: 'LTK',
    logo: (
      <div className="flex items-center gap-2.5 h-8 select-none">
        <div className="w-7 h-7 rounded-lg bg-[#F26CA7] text-white flex items-center justify-center shadow-2xs">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <span className="font-black text-2xl tracking-tighter text-zinc-900">LTK</span>
      </div>
    ),
  },
  {
    name: 'Amazon Affiliate',
    logo: (
      <div className="flex flex-col justify-center h-8 select-none pt-1">
        <span className="font-black text-xl tracking-tight text-zinc-900 leading-none">
          amazon
        </span>
        <svg className="w-16 h-3 text-amber-500 -mt-0.5" viewBox="0 0 80 20" fill="none">
          <path d="M5 6 Q 40 22 75 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M68 3 L 77 6 L 71 12 Z" fill="currentColor" />
        </svg>
      </div>
    ),
  },
  {
    name: 'Sephora',
    logo: (
      <div className="flex items-center gap-2.5 h-8 select-none">
        <svg className="h-6 w-5 text-zinc-900 fill-current" viewBox="0 0 24 32">
          <path d="M12 0C7 8 2 12 2 18c0 5.5 4.5 10 10 10s10-4.5 10-10c0-6-5-10-10-18zm0 24c-3.3 0-6-2.7-6-6 0-3.5 3-6.5 6-11.5 3 5 6 8 6 11.5 0 3.3-2.7 6-6 6z" />
        </svg>
        <span className="font-semibold text-lg tracking-[0.22em] font-serif text-zinc-950 uppercase">SEPHORA</span>
      </div>
    ),
  },
  {
    name: 'Shopee',
    logo: (
      <div className="flex items-center gap-2.5 h-8 select-none">
        <div className="w-7 h-7 rounded-lg bg-[#EE4D2D] text-white flex items-center justify-center shadow-2xs">
          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
            <path d="M19 6h-3c0-2.21-1.79-4-4-4S8 3.79 8 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 13.5c-2.21 0-4-1.79-4-4 0-.55.45-1 1-1s1 .45 1 1c0 1.1.9 2 2 2s2-.9 2-2c0-1.1-.9-2-2-2H9.5c-1.93 0-3.5-1.57-3.5-3.5S7.57 6.5 9.5 6.5h.5c.55 0 1 .45 1 1s-.45 1-1 1h-.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5H12c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5z" />
          </svg>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-[#EE4D2D]">Shopee</span>
      </div>
    ),
  },
];

const DEMO_SKIN_PROFILES = [
  {
    id: 'medium-warm',
    name: 'Medium Peach',
    label: '✨ Medium Warm',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    shade: 'Shade #220 (Peach Warm)',
    matchConfidence: '98.8%',
    product: 'Luminous Silk Foundation',
    productImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200',
    brand: 'Armani Beauty',
    price: '$69',
    commission: '$10.35 (15%)',
    undertone: 'Golden Peach',
    skinType: 'Combination / Normal',
  },
  {
    id: 'fair-cool',
    name: 'Fair Rosy',
    label: '🌸 Fair Cool',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    shade: 'Shade #110 (Porcelain Pink)',
    matchConfidence: '99.4%',
    product: "Soft'Lit Luminous Foundation",
    productImage: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=200',
    brand: 'Fenty Beauty',
    price: '$40',
    commission: '$8.00 (20%)',
    undertone: 'Cool Rosy',
    skinType: 'Dry & Sensitive',
  },
  {
    id: 'deep-rich',
    name: 'Deep Espresso',
    label: '🍯 Deep Rich',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600',
    shade: 'Shade #450 (Espresso Warm)',
    matchConfidence: '97.9%',
    product: 'Soft Matte Longwear Foundation',
    productImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
    brand: 'NARS Beauty',
    price: '$50',
    commission: '$9.00 (18%)',
    undertone: 'Deep Neutral-Warm',
    skinType: 'Oily & Blemish Prone',
  },
];

const FEATURED_TESTIMONIALS = [
  {
    id: 'elena',
    name: 'Elena Rostova',
    handle: '@elena_skin',
    brand: 'Bloom Skincare',
    followers: '185K Followers on Instagram',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    signatureText: 'Bloom',
    quoteStart: 'They took social media & shade matching off our plate completely and our audience has never been ',
    quoteHighlight: 'more engaged.',
    quoteEnd: '',
    growth: '+330% Revenue Growth',
    subtitle: 'Elena Rostova • Bloom Skincare'
  },
  {
    id: 'sarah',
    name: 'Sarah Jenkins',
    handle: '@sarah.glam',
    brand: 'Glam & Glow Beauty',
    followers: '420K Followers on TikTok',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
    signatureText: 'sarah.glam',
    quoteStart: 'Before Aura, my bio link CTR was 1.8%. Setting up my AI Selfie Scan tripled my affiliate earnings overnight to ',
    quoteHighlight: '$7.8k per month.',
    quoteEnd: '',
    growth: '41.2% Conversion Rate',
    subtitle: 'Sarah Jenkins • @sarah.glam'
  },
  {
    id: 'marcus',
    name: 'Marcus Chen',
    handle: '@marcusmakeup',
    brand: 'Studio M Beauty',
    followers: '650K Subscribers on YouTube',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    signatureText: 'Studio M',
    quoteStart: 'The AI algorithm matches products with eerie precision. It feels like having a 24/7 personal beauty consultant that ',
    quoteHighlight: 'recommends my picks non-stop.',
    quoteEnd: '',
    growth: '$14.2k Earned Last Month',
    subtitle: 'Marcus Chen • Studio M Beauty'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeProfileId, setActiveProfileId] = useState<string>('medium-warm');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [testimonialIdx, setTestimonialIdx] = useState<number>(0);

  const { scrollY } = useScroll();
  const leftParallax = useTransform(scrollY, [0, 600], [0, -45]);
  const rightParallax = useTransform(scrollY, [0, 600], [0, 35]);

  const aboutContainerRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress: aboutScrollY } = useScroll({
    target: aboutContainerRef,
    offset: ['start start', 'end end']
  });
  
  // The word "showcase" is word 9 out of 30. (8/30 = ~0.26)
  const cardsOpacity = useTransform(aboutScrollY, [0.23, 0.28], [0, 1]);
  const cardsScale = useTransform(aboutScrollY, [0.23, 0.28], [0.95, 1]);

  const activeTestimonial = FEATURED_TESTIMONIALS[testimonialIdx];

  const activeProfile = DEMO_SKIN_PROFILES.find(p => p.id === activeProfileId) || DEMO_SKIN_PROFILES[0];

  const triggerScan = (profileId: string) => {
    setActiveProfileId(profileId);
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  // Auto rotate testimonials every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % FEATURED_TESTIMONIALS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 overflow-x-clip">
      <PremiumLoader isVisible={isInitialLoading} theme="light" />

      {/* HIGH-END LUXURY HERO SECTION */}
      <section className="relative pt-24 pb-24 lg:pt-32 lg:pb-36 overflow-hidden border-b border-pink-100/40 bg-[#FFF8FC]">

        {/* Soft Dreamy Pastel Cloud Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Bright dreamy pastel cloud background"
            className="w-full h-full object-cover object-center opacity-100 scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Light white & pastel overlay for maximum brightness */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-[#FFF8FC]" />
        </div>




        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* TOP EDITORIAL HEADER CONTENT */}
          <div className="text-center max-w-[850px] mx-auto flex flex-col items-center gap-4">

            {/* FLOATING CAPSULE BADGE */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#FF73B6]/60 text-xs font-semibold text-[#27272A] shadow-[0_4px_7px_rgba(0,0,0,0.08)] tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF73B6]" />
              <span>AI-Powered Beauty Recommendation</span>
            </motion.div>

            {/* EDITORIAL HEADLINE */}
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-[#111111] tracking-[-0.03em] leading-[1.12] font-sans"
            >
              Discover Your Perfect <br className="hidden sm:inline" />
              Beauty Match{' '}
              <span className="bg-gradient-to-r from-[#FF73B6] via-[#d66df2] to-[#C786FF] bg-clip-text text-transparent font-semibold">
                in Seconds.
              </span>
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-[#6B7280] max-w-[700px] mx-auto font-normal leading-[1.7]"
            >
              AI scans your face, understands your unique skin profile, and recommends beauty products tailored specifically to you using advanced facial intelligence.
            </motion.p>

            {/* CTA BUTTONS */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={() => onNavigate('public-recommendation')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#27272A] hover:bg-zinc-800 text-white font-medium text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Scan My Face</span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#111111] font-medium text-sm border border-zinc-200/90 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Play className="w-2 h-2 text-zinc-900 fill-zinc-900 ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* SOCIAL PROOF */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-2 flex items-center justify-center gap-3 text-xs sm:text-sm font-medium text-[#6B7280]"
            >
              <div className="flex -space-x-2 overflow-hidden p-0.5">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt="Beauty enthusiast"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
                  alt="Beauty enthusiast"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs"
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120"
                  alt="Beauty enthusiast"
                />
              </div>
              <span>Trusted by <strong className="font-semibold text-[#111111]">250,000+</strong> beauty enthusiasts worldwide</span>
            </motion.div>

          </div>

          {/* MAIN VISUAL STAGE - FLOATING IPHONE PRO + GLASS FLOATING CARDS */}
          <div className="mt-14 sm:mt-18 lg:mt-22 relative max-w-[1050px] mx-auto">

            <div className="relative flex items-center justify-center">

              {/* LEFT FLOATING GLASS CARDS WITH PARALLAX & AMBIENT FLOAT */}
              <motion.div
                style={{ y: leftParallax }}
                className="hidden lg:flex flex-col gap-5 absolute left-0 lg:left-4 xl:left-8 top-4 z-30"
              >
                {/* LEFT CARD: Skin Analysis */}
                <motion.div
                  initial={{ opacity: 0, x: -40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                  transition={{
                    opacity: { delay: 0.5, duration: 0.8 },
                    x: { delay: 0.5, duration: 0.8 },
                    y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[24px] p-4.5 shadow-[0_20px_50px_rgba(199,134,255,0.12)] max-w-[220px] space-y-3"
                >
                  <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100/80">
                    <div className="w-7 h-7 rounded-xl bg-[#FF73B6]/10 text-[#FF73B6] flex items-center justify-center shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#111111]">Skin Analysis</span>
                  </div>

                  <div className="space-y-2 text-xs font-medium text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-zinc-800">Warm Undertone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-zinc-800">Combination Skin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="text-zinc-800">Medium Tone</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100/80 flex items-center justify-between">
                    <span className="text-[11px] text-[#6B7280] font-medium">Confidence</span>
                    <span className="text-base font-black bg-gradient-to-r from-[#FF73B6] to-[#C786FF] bg-clip-text text-transparent">96%</span>
                  </div>
                </motion.div>

                {/* BOTTOM LEFT CARD: 98% AI Accuracy */}
                <motion.div
                  initial={{ opacity: 0, x: -40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.7, duration: 0.8 },
                    x: { delay: 0.7, duration: 0.8 },
                    y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }
                  }}
                  className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[24px] p-4 shadow-[0_20px_50px_rgba(199,134,255,0.12)] max-w-[200px] flex items-center gap-3.5"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#C786FF]/10 text-[#C786FF] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#111111] leading-none">98%</p>
                    <p className="text-[11px] font-bold text-[#FF73B6] pt-0.5">AI Accuracy</p>
                    <p className="text-[9px] text-[#6B7280]">Precision Match</p>
                  </div>
                </motion.div>

                {/* AI READY BADGE (PLACED BELOW 98% AI ACCURACY CARD) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
                  transition={{
                    opacity: { delay: 0.8, duration: 0.8 },
                    x: { delay: 0.8, duration: 0.8 },
                    y: { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }
                  }}
                  className="self-start ml-1"
                >
                  <div className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_15px_35px_rgba(199,134,255,0.15)] text-xs font-semibold text-[#C786FF] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C786FF]" />
                    <span>AI Ready</span>
                  </div>
                </motion.div>

              </motion.div>

              {/* CENTER IPHONE SCAN IMAGE */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative z-20 flex justify-center"
              >
                <img
                  src={iphoneScanImg}
                  alt="iPhone AI Skin Scan Preview"
                  className="w-[365px] max-w-full h-auto object-contain drop-shadow-2xl mx-auto"
                />
              </motion.div>

              {/* RIGHT FLOATING GLASS CARDS WITH PARALLAX & AMBIENT FLOAT */}
              <motion.div
                style={{ y: rightParallax }}
                className="hidden lg:flex flex-col gap-6 absolute right-0 lg:right-4 xl:right-8 top-6 z-30"
              >
                {/* TOP RIGHT FLOATING BADGE: BEST MATCH */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
                  transition={{
                    opacity: { delay: 0.8, duration: 0.8 },
                    x: { delay: 0.8, duration: 0.8 },
                    y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                  }}
                  className="self-end mr-2"
                >
                  <div className="px-4 py-1.5 rounded-full bg-white/80 border border-white/90 shadow-[0_15px_35px_rgba(199,134,255,0.15)] backdrop-blur-2xl text-xs font-semibold text-[#FF73B6] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF73B6]" />
                    <span>Best Match</span>
                  </div>
                </motion.div>

                {/* RIGHT CARD: Recommended Product */}
                <motion.div
                  initial={{ opacity: 0, x: 40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
                  transition={{
                    opacity: { delay: 0.6, duration: 0.8 },
                    x: { delay: 0.6, duration: 0.8 },
                    y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
                  }}
                  className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[24px] p-4.5 shadow-[0_20px_50px_rgba(199,134,255,0.12)] max-w-[230px] space-y-3"
                >
                  <div className="flex items-center gap-2 pb-1 border-b border-zinc-100/80">
                    <Wand2 className="w-4 h-4 text-[#FF73B6]" />
                    <span className="text-xs font-bold text-[#111111]">Recommended Product</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200"
                      alt="Maybelline Fit Me Foundation"
                      className="w-12 h-14 object-cover rounded-xl border border-zinc-100 shrink-0 bg-zinc-50"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[#111111] leading-tight">Maybelline Fit Me Foundation</p>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FF73B6]/10 text-[#FF73B6] text-[10px] font-bold">
                        97% Match
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('public-recommendation')}
                    className="w-full text-center text-xs font-semibold text-[#FF73B6] hover:underline flex items-center justify-center gap-1 pt-0.5 cursor-pointer"
                  >
                    <span>View Product</span>
                    <span>→</span>
                  </button>
                </motion.div>

                {/* BOTTOM RIGHT CARD: Recommended by Sarah Beauty */}
                <motion.div
                  initial={{ opacity: 0, x: 40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: [0, -7, 0] }}
                  transition={{
                    opacity: { delay: 0.7, duration: 0.8 },
                    x: { delay: 0.7, duration: 0.8 },
                    y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
                  }}
                  className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-[24px] p-4 shadow-[0_20px_50px_rgba(199,134,255,0.12)] max-w-[220px] flex items-center gap-3"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                    alt="Sarah Beauty"
                    className="w-10 h-10 rounded-full object-cover border border-pink-200 shrink-0 shadow-xs"
                  />
                  <div>
                    <p className="text-[10px] text-[#6B7280] font-medium leading-none">Recommended by</p>
                    <div className="flex items-center gap-1 pt-0.5">
                      <p className="text-xs font-bold text-[#111111]">Sarah Beauty</p>
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
                    </div>
                    <p className="text-[10px] text-[#6B7280] pt-0.5"><strong className="text-emerald-600 font-semibold">Verified Creator</strong> · 2,431 Purchases</p>
                  </div>
                </motion.div>

              </motion.div>

            </div>

          </div>

        </div>
      </section>

      {/* ABOUT US SECTION - STICKY SCROLL-TRIGGERED TEXT REVEAL */}
      <section id="about" ref={aboutContainerRef} className="scroll-mt-20 relative bg-gradient-to-b from-white via-zinc-50/50 to-white">
        
        {/* Absolute wrapper allows sticky child to stick across the full height of the section without pushing content */}
        <motion.div 
          style={{ opacity: cardsOpacity, scale: cardsScale }}
          className="absolute inset-0 pointer-events-none z-10"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden hidden sm:block">
            <div className="relative max-w-7xl mx-auto w-full h-full">
              
              <motion.div 
                animate={{ y: [0, -20, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                className="absolute top-[25%] left-[8%]"
              >
                <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-base font-bold text-zinc-700">
                  <span className="text-[#C786FF] drop-shadow-sm">🌸</span> Beautiful
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -15, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[20%] right-[8%]"
              >
                <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-base font-bold text-zinc-700">
                  <span className="text-[#FF73B6] drop-shadow-sm">💖</span> Healthy
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -25, 0] }} 
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[55%] left-[4%]"
              >
                <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-base font-bold text-zinc-700">
                  <span className="text-emerald-500 drop-shadow-sm">⭐</span> Confident
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -18, 0] }} 
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-[20%] left-[12%]"
              >
                <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-base font-bold text-zinc-700">
                  <span className="text-blue-400 drop-shadow-sm">✨</span> Glowing
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -22, 0] }} 
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-[25%] right-[10%]"
              >
                <div className="px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-base font-bold text-zinc-700">
                  <span className="text-amber-500 drop-shadow-sm">😊</span> Happy
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>

        <ScrollTextReveal 
          badgeText="ABOUT US"
          text="AURA AI is crafted to elevate how creators showcase their AI beauty solutions. With a focus on clean design, it helps brands engage and convert. Our intuitive platform empowers teams to deliver personalized interactive experiences effortlessly."
        />
      </section>

      {/* Floating UI Showcase Mockup - INTERACTIVE DEMO SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div>
              <Badge variant="primary">INTERACTIVE DEMO</Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-zinc-950 tracking-tight leading-tight">
              Try The AI Scanner Live
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Experience how your followers upload a selfie, get instant AI skin tone & undertone diagnostics, and get matched to your exact affiliate product links.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-white border border-zinc-200 shadow-xl relative"
          >
            <div className="bg-[#0F0F11] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F26CA7]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F26CA7]" />
                    <span className="text-xs font-bold text-[#FFB6D9] uppercase tracking-wider">Shade & Undertone Matcher</span>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-[24px] font-semibold tracking-tight leading-snug">AI Foundation & Skincare Diagnostics</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Followers capture or upload a selfie. Aura measures facial undertones, skin depth, and hydration parameters in seconds to recommend the exact shade.
                  </p>

                  {/* Skin Profile Selector Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                      Select Demo Profile:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_SKIN_PROFILES.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => triggerScan(profile.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeProfileId === profile.id
                              ? 'bg-[#F26CA7] text-white shadow-md scale-102 ring-2 ring-[#FFB6D9]/50'
                              : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                            }`}
                        >
                          <span>{profile.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Analysis Card */}
                  <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 relative overflow-hidden">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Detected Skin Tone:</span>
                      <span className="font-bold text-[#FFB6D9]">{activeProfile.name} ({activeProfile.undertone})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Match Precision:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {activeProfile.matchConfidence}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {isScanning && (
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                          <span>AI Scanning Facial Geometry...</span>
                          <span>{scanProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#F26CA7] to-[#FFB6D9]"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>


                </div>

                {/* Right Interactive Phone Preview */}
                <div className="md:col-span-7 flex justify-center">
                  <motion.div
                    key={activeProfile.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-sm rounded-2xl bg-white text-zinc-900 p-5 shadow-2xl border border-zinc-200 space-y-4 relative"
                  >
                    {/* Floating Match Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-[#F26CA7] to-[#e05593] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeProfile.matchConfidence} Match!</span>
                    </motion.div>

                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                        alt="Creator"
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#F26CA7]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900">@katebeautyglow</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Kate's AI Shade Matcher ✨</p>
                      </div>
                    </div>

                    {/* Selfie Preview + Animated Laser Line */}
                    <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-4/3 flex items-center justify-center group shadow-inner">
                      <img
                        src={activeProfile.image}
                        alt="Selfie scan"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Continuous Slow Laser Scanner Animation Line */}
                      <motion.div
                        className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#F26CA7] to-transparent shadow-[0_0_22px_#F26CA7] z-20 pointer-events-none"
                        initial={{ top: '0%' }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                      />
                      <div className="absolute inset-0 border-2 border-[#F26CA7]/50 rounded-xl pointer-events-none" />
                    </div>

                    {/* Dynamic Matched Product Card */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeProfile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center justify-between gap-3 shadow-2xs hover:border-[#F26CA7]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={activeProfile.productImage}
                            alt={activeProfile.product}
                            className="w-11 h-11 rounded-lg object-cover border border-zinc-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[9px] text-[#F26CA7] font-bold uppercase tracking-wider">Top Matched Product</p>
                            <p className="text-xs font-bold text-zinc-900 truncate">{activeProfile.product}</p>
                            <p className="text-[10px] text-zinc-500">{activeProfile.brand}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 text-xs font-bold bg-[#F26CA7] text-white rounded-xl shadow-xs shrink-0 flex items-center gap-1 hover:bg-[#e05593] transition-colors cursor-pointer">
                          Buy {activeProfile.price} →
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUSTED BY AFFILIATORS TICKER */}
      <section className="py-10 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            TRUSTED BY 12,400+ BEAUTY CREATORS INTEGRATING WITH TOP PLATFORMS
          </p>
        </div>

        {/* Ticker Container with gradient edge masks */}
        <div className="relative w-full overflow-hidden py-3">
          {/* Edge gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Infinite Moving Track */}
          <div
            className="animate-ticker flex items-center gap-8 sm:gap-14"
            style={{ animationDuration: '60s' }}
          >
            {[...PLATFORMS_TICKER, ...PLATFORMS_TICKER, ...PLATFORMS_TICKER, ...PLATFORMS_TICKER].map((platform, idx) => (
              <div
                key={idx}
                className="flex items-center gap-8 sm:gap-14 whitespace-nowrap shrink-0 group cursor-default"
              >
                <div className="opacity-80 hover:opacity-100 transition-opacity flex items-center">
                  {platform.logo}
                </div>
                <span className="text-zinc-300 text-sm font-bold select-none">•</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - REDESIGNED WITH SVG PATH ANIMATION & CLEAN WHITE AESTHETIC */}
      <section id="how-it-works" className="scroll-mt-20 py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3.5">
            <Badge variant="primary">How Aura Works</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-zinc-950 tracking-tight leading-tight">
              4 Steps to Launch Your AI Beauty Hub
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-medium">
              Zero technical skills required. Turn your follower recommendations into high-converting AI diagnostics in minutes.
            </p>
          </div>

          {/* Interactive Steps Layout with Animated Connecting SVG Line */}
          <div className="relative">
            {/* SVG Connecting Path with Animated Stroke Dashoffset (Desktop View) */}
            <div className="hidden md:block absolute top-0 left-0 right-0 h-20 sm:h-22 pointer-events-none z-0">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" fill="none" preserveAspectRatio="none">
                {/* Background faint guide curve */}
                <path
                  d="M 100 50 C 220 75, 280 75, 375 50 C 470 25, 530 25, 625 50 C 720 75, 780 75, 900 50"
                  stroke="#E4E4E7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                
                {/* Animated Looping Energy Beam (Forward & Reverse Ping-Pong Path Animation) */}
                <motion.path
                  d="M 100 50 C 220 75, 280 75, 375 50 C 470 25, 530 25, 625 50 C 720 75, 780 75, 900 50"
                  stroke="url(#aura-glow-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="140 380"
                  animate={{
                    strokeDashoffset: [520, -520],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />

                {/* Gradient Definition for Energy Beam */}
                <defs>
                  <linearGradient id="aura-glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F26CA7" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#F26CA7" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FFB6D9" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Step Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-6 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Add Products',
                  desc: 'Paste Sephora, ShopMy, or Amazon affiliate links. Aura extracts product images and shade details.',
                  icon: (
                    <div className="grid grid-cols-2 gap-1 w-6 h-6 text-zinc-900">
                      <div className="bg-zinc-900 rounded-xs" />
                      <div className="bg-zinc-900 rounded-xs" />
                      <div className="bg-zinc-900 rounded-xs" />
                      <div className="bg-zinc-900 rounded-xs" />
                    </div>
                  ),
                },
                {
                  step: '02',
                  title: 'Customize AI Theme',
                  desc: 'Match your page colors, avatar, and greeting message to your personal brand aesthetic.',
                  icon: <Sliders className="w-6 h-6 text-zinc-900" />,
                },
                {
                  step: '03',
                  title: 'Share Bio Link',
                  desc: 'Add your custom beauty.ai/yourhandle link to your TikTok or IG bio for followers to scan selfies.',
                  icon: <Smartphone className="w-6 h-6 text-zinc-900" />,
                },
                {
                  step: '04',
                  title: 'Convert & Earn',
                  desc: 'Followers get instant AI shade matches and buy directly through your active affiliate links.',
                  icon: <Sparkles className="w-6 h-6 text-[#F26CA7]" />,
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Soft Rounded Icon Card Container */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[24px] bg-zinc-50 border border-zinc-200/80 shadow-xs group-hover:shadow-[0_12px_30px_rgba(242,108,167,0.18)] group-hover:border-[#F26CA7]/40 group-hover:bg-white transition-all duration-300 flex items-center justify-center relative">
                      {item.icon}
                      
                      {/* Step Number Badge */}
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-black tracking-wider shadow-xs border border-white/20">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2 group-hover:text-[#F26CA7] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-[240px]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EVERYTHING A CREATOR NEEDS - FEATURES SECTION (MATCHES REFERENCE IMAGE) */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-[#FAFAFC] relative overflow-hidden border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="flex justify-center">
              <Badge variant="primary">
                Feature
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-zinc-900 tracking-tight leading-tight">
              Everything a creator needs
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 font-medium">
              From scan to sale — the full stack for beauty affiliate marketing.
            </p>
          </div>

          {/* Grid Layout: Left 3 Cards | Center Phone | Right 3 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* Left 3 Feature Cards */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5">
              
              {/* Card 1: Shade Matching */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100/70 text-[#F26CA7] flex items-center justify-center shrink-0">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Shade Matching</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    AI-powered color analysis maps your exact undertone and skin depth to find foundation and concealer shades within milliseconds.
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Skin Diagnostics */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/70 text-indigo-500 flex items-center justify-center shrink-0">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Skin Diagnostics</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    Detects pores, hydration levels, texture, and pigmentation to recommend targeted skincare routines and active ingredients.
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Affiliate Revenue */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Affiliate Revenue</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    Each recommendation includes a trackable affiliate link. Creators earn on every product their audience purchases through AURA.
                  </p>
                </div>
              </motion.div>

            </div>

            {/* Middle: Center Phone Mockup */}
            <div className="lg:col-span-4 flex justify-center py-4 lg:py-0">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] transform hover:scale-[1.02] transition-transform duration-500 flex justify-center">
                <img
                  src={iphoneScanImg}
                  alt="Aura AI Phone Scan"
                  className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(242,108,167,0.25)]"
                />
              </div>
            </div>

            {/* Right 3 Feature Cards */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-5">
              
              {/* Card 4: Creator Analytics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-500 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Creator Analytics</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    Real-time dashboard with conversion rates, top-performing products, and audience skin-profile breakdowns.
                  </p>
                </div>
              </motion.div>

              {/* Card 5: Embed Anywhere */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100/70 text-sky-500 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Embed Anywhere</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    Drop the AURA scanner onto any website, Shopify store, or landing page with a single line of code.
                  </p>
                </div>
              </motion.div>

              {/* Card 6: Privacy First */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-zinc-200/70 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 mb-1">Privacy First</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-normal">
                    All facial analysis happens on-device. No photos are stored or transmitted to any server.
                  </p>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </section>

      {/* TESTIMONIALS - REDESIGNED */}
      <section id="testimonials" className="py-[120px] bg-[#0F0F11] text-white relative overflow-hidden">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#F26CA7]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFB6D9]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4">
            <div className="space-y-3">
              <Badge variant="primary">Creator Revenue Proof</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-white tracking-tight leading-tight">
                Loved by Top Beauty Influencers
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Real creators transforming static bio links into high-converting AI beauty recommendation hubs.
              </p>
            </div>

            {/* Selector Prev/Next Controls */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => setTestimonialIdx((prev) => (prev === 0 ? FEATURED_TESTIMONIALS.length - 1 : prev - 1))}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                {FEATURED_TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setTestimonialIdx(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${testimonialIdx === idx ? 'w-8 bg-[#F26CA7]' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setTestimonialIdx((prev) => (prev === FEATURED_TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
                aria-label="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Split Testimonial Showcase Card (Matches Reference Image Layout) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left Side: Quote Box */}
              <div className="lg:col-span-7 bg-[#17171A] border border-zinc-800/90 rounded-3xl p-8 sm:p-12 flex flex-col justify-between space-y-8 relative overflow-hidden shadow-2xl">

                {/* Auto-play progress indicator line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800/80 overflow-hidden">
                  <motion.div
                    key={`testimonial-progress-${testimonialIdx}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 10, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-[#F26CA7] to-[#FFB6D9]"
                  />
                </div>

                {/* Top Left Floating Black Quote Badge */}
                <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800/90 text-white flex items-center justify-center shadow-lg">
                  <Quote className="w-7 h-7 text-[#FFB6D9] fill-current" />
                </div>

                {/* Main Headline Quote */}
                <div className="space-y-4 py-2">
                  <blockquote className="text-2xl sm:text-3xl md:text-4xl font-normal text-white leading-tight tracking-tight">
                    "{activeTestimonial.quoteStart}
                    <span className="font-serif italic font-medium text-[#FFB6D9] pl-1">
                      {activeTestimonial.quoteHighlight}
                    </span>"
                  </blockquote>
                </div>

                {/* Author Meta Footer */}
                <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wide">
                      {activeTestimonial.subtitle}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                      {activeTestimonial.followers}
                    </p>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-[#F26CA7]/15 border border-[#F26CA7]/30 text-[#FFB6D9] text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F26CA7]" />
                    <span>{activeTestimonial.growth}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Photo Visual Box with Overlay Signature (Desktop Only) */}
              <div className="hidden lg:flex lg:col-span-5 relative rounded-3xl overflow-hidden border border-zinc-800/90 min-h-[320px] sm:min-h-[400px] shadow-2xl group items-center justify-center">
                <img
                  src={activeTestimonial.coverImage}
                  alt={activeTestimonial.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

                {/* Overlay Handwriting Signature / Brand Name */}
                <div className="relative z-10 text-center px-6">
                  <span className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-white/95 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-wide font-light select-none">
                    {activeTestimonial.signatureText}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>



        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-[120px] overflow-hidden border-b border-pink-100/40 bg-[#FFF8FC]">
        {/* Soft Dreamy Pastel Cloud Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Bright dreamy pastel cloud background"
            className="w-full h-full object-cover object-center opacity-100 scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Light white & pastel overlay for maximum brightness */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-[#FFF8FC]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge variant="primary">Pricing</Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-zinc-950 tracking-tight leading-tight">
            Simple Plans That Pay for Themselves in Days
          </h2>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center gap-3 p-[3px] bg-zinc-200/80 rounded-[32px] border border-zinc-300/60">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-[32px] transition-all ${billingCycle === 'monthly' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
                }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 text-xs font-bold rounded-[32px] transition-all ${billingCycle === 'yearly' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600'
                }`}
            >
              Yearly (Save 20%) 🎉
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">

          {/* Starter */}
          <Card className="group relative p-8 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-[#F26CA7] h-full">
            {/* Smooth background gradient crossfade on hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#330821] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none rounded-2xl z-0" />

            <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-white transition-colors duration-300">Starter</h3>
                <p className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors duration-300">For emerging beauty creators starting affiliate monetization.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-zinc-900 group-hover:text-white transition-colors duration-300">
                    Rp 0
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"> / Free Forever</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-600 group-hover:text-zinc-300 transition-colors duration-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Up to 1,000 AI Selfie Scans / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Standard Product Catalog</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Affiliate Link & Bio Page</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Basic Performance Analytics</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => onNavigate('register')} variant="outline" className="w-full group-hover:bg-white group-hover:text-zinc-900 group-hover:border-white transition-all duration-300">
                Get Started Free
              </Button>
            </div>
          </Card>

          {/* Pro - Popular */}
          <Card className="group relative p-8 flex flex-col justify-between border-2 border-[#F26CA7] shadow-xl bg-gradient-to-b from-white to-[#FFB6D9]/10 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#F26CA7]/30 h-full">
            {/* Smooth background gradient crossfade on hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#420a2b] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none rounded-2xl z-0" />

            <div className="absolute -top-3.5 right-6 px-3 py-1 bg-[#F26CA7] text-white text-[10px] font-extrabold uppercase rounded-full shadow-sm z-20">
              MOST POPULAR
            </div>

            <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-white transition-colors duration-300">Pro Affiliator</h3>
                <p className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-300 transition-colors duration-300">For active beauty creators on TikTok & Instagram.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-zinc-900 group-hover:text-white transition-colors duration-300">
                    {billingCycle === 'monthly' ? 'Rp 99.000' : 'Rp 79.000'}
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-700 group-hover:text-zinc-200 transition-colors duration-300">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#F26CA7] shrink-0" />
                    <span>10,000 AI Selfie Scans / mo</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#F26CA7] shrink-0" />
                    <span>Full Custom Brand Theme & Colors</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#F26CA7] shrink-0" />
                    <span>Audience Undertone Analytics & Leads</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#F26CA7] shrink-0" />
                    <span>Priority AI Shade Recommendation</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => onNavigate('register')} variant="tertiary" className="w-full group-hover:shadow-lg transition-all duration-300">
                Start 14-Day Trial
              </Button>
            </div>
          </Card>

          {/* Elite */}
          <Card className="group relative p-8 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-[#F26CA7] h-full">
            {/* Smooth background gradient crossfade on hover */}
            <div className="absolute -inset-px bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#330821] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none rounded-2xl z-0" />

            <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 group-hover:text-white transition-colors duration-300">Agency / Elite</h3>
                <p className="text-xs text-zinc-500 mt-1 group-hover:text-zinc-400 transition-colors duration-300">For top-tier talent management, brands & high volume creators.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-zinc-900 group-hover:text-white transition-colors duration-300">
                    {billingCycle === 'monthly' ? 'Rp 299.000' : 'Rp 239.000'}
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-600 group-hover:text-zinc-300 transition-colors duration-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>50,000 AI Selfie Scans / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Custom Domain Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Verified Creator Badge</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-[#F26CA7] shrink-0 transition-colors duration-300" />
                    <span>Dedicated Priority AI Engine & VIP Support</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => onNavigate('register')} variant="outline" className="w-full group-hover:bg-white group-hover:text-zinc-900 group-hover:border-white transition-all duration-300">
                Contact VIP Sales
              </Button>
            </div>
          </Card>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-[120px] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="primary">Frequently Asked Questions</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-zinc-950 tracking-tight leading-tight">Got Questions? We Have Answers</h2>
          </div>

          <Accordion
            items={MOCK_FAQS.map((faq, i) => ({
              id: `faq_${i}`,
              title: faq.q,
              content: faq.a
            }))}
          />
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative py-16 sm:py-24 lg:py-28 border-t border-pink-100/40 bg-[#FFF8FC]">
        {/* Soft Dreamy Pastel Cloud Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={heroBgImage}
            alt="Bright dreamy pastel cloud background"
            className="w-full h-full object-cover object-center opacity-100 scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Light white & pastel overlay for maximum legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-[#FFF8FC]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Subtitle & CTA Button */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-zinc-900 tracking-tight leading-[1.15]">
                Ready to Multiply Your Beauty Affiliate Earnings?
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 font-medium max-w-xl leading-relaxed">
                Join 12,000+ affiliators leveraging AI personalization today. Set up takes less than 3 minutes.
              </p>
              <div className="pt-2">
                <Button
                  onClick={() => onNavigate('register')}
                  variant="primary"
                  size="lg"
                  icon={<Sparkles className="w-5 h-5 text-white" />}
                  className="bg-[#F26CA7] hover:bg-[#E05B96] text-white font-semibold px-8 py-4 text-base rounded-2xl shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Launch Your AI Page Now
                </Button>
              </div>
            </div>

            {/* Right Column: Phone Mockup with Upward Negative Margin Overlap */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[300px] sm:max-w-[340px] -mt-16 sm:-mt-24 lg:-mt-48 transform hover:scale-[1.02] transition-transform duration-500 flex justify-center z-20">
                <img
                  src={iphoneScanImg}
                  alt="Aura AI Phone Scan"
                  className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(242,108,167,0.3)]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER - REDESIGNED MATCHING REFERENCE IMAGE */}
      <footer className="relative bg-[#050507] text-zinc-400 pt-16 sm:pt-20 pb-10 overflow-hidden">
        {/* Pink Glow Light Effect on Bottom Right */}
        <div className="absolute right-0 bottom-0 w-[500px] h-[350px] bg-gradient-to-tl from-[#F26CA7]/30 via-pink-600/15 to-transparent blur-3xl pointer-events-none z-0" />

        {/* Faint Pink "aura" Watermark Text in Bottom Right Corner */}
        <div className="absolute right-[-20px] bottom-[-20px] pointer-events-none select-none z-0 opacity-15">
          <span className="text-[140px] sm:text-[180px] md:text-[220px] text-[#F26CA7] font-logo leading-none block transform translate-y-6">
            aura
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-16">
            
            {/* Left Column: Brand Logo, Tagline, Description & Social Icons (5 cols) */}
            <div className="md:col-span-6 lg:col-span-5 space-y-4">
              {/* Brand Logo */}
              <div className="flex items-center">
                <span className="text-3xl sm:text-4xl text-white font-logo">
                  aura
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm font-normal">
                AI-powered beauty scanning and personalized recommendations that help your audience find their perfect match.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#instagram"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-zinc-800 text-zinc-300 flex items-center justify-center hover:border-pink-500 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="#tiktok"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full border border-zinc-800 text-zinc-300 flex items-center justify-center hover:border-pink-500 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.11V9.4a6.33 6.33 0 00-.82-.05A6.34 6.34 0 003.15 15.7a6.34 6.34 0 0010.83 4.47V11.5a8.28 8.28 0 005.61 2.13v-3.56a4.83 4.83 0 01-3-.9a4.8 4.8 0 01-1.2-2.48z"/>
                  </svg>
                </a>

                <a
                  href="#youtube"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full border border-zinc-800 text-zinc-300 flex items-center justify-center hover:border-pink-500 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href="#linkedin"
                  aria-label="LinkedIn"
                  className="w-10 h-10 rounded-full border border-zinc-800 text-zinc-300 flex items-center justify-center hover:border-pink-500 hover:text-white hover:bg-zinc-900/80 transition-all cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Spacer (1 col on lg) */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Middle Column: Use Link (3 cols) */}
            <div className="md:col-span-3 lg:col-span-3 space-y-4">
              <h4 className="text-base font-bold text-white tracking-wide">
                Use Link
              </h4>
              <ul className="space-y-2.5 text-sm text-zinc-400 font-normal">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">Feature</a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">About</a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white transition-colors">Testimonial</a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </li>
                <li>
                  <a href="#blog" className="hover:text-white transition-colors">Blog</a>
                </li>
                <li>
                  <a href="#404" className="hover:text-white transition-colors">404</a>
                </li>
              </ul>
            </div>

            {/* Right Column: Company (3 cols) */}
            <div className="md:col-span-3 lg:col-span-3 space-y-4">
              <h4 className="text-base font-bold text-white tracking-wide">
                Company
              </h4>
              <div className="space-y-1 text-sm text-zinc-400 font-normal leading-relaxed">
                <p>105 North 1st Street, #2E</p>
                <p>San Jose, CA 94748</p>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-zinc-800/80 flex items-center justify-start text-xs text-zinc-400">
            <p>
              © 2025 <span className="text-[#F26CA7] font-logo">aura</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
