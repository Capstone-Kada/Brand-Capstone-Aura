import { Product, AIPageConfig, CustomerLead, AnalyticsSummary, UserProfile, AIAnalysisResult, AffiliatorAccount } from '../types';

export const MOCK_USER: UserProfile = {
  id: 'usr_01',
  name: 'Kate Jenkins',
  handle: '@katebeautyglow',
  email: 'kate@beautyglow.co',
  role: 'affiliator',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  bio: 'Certified Skincare & Foundation Specialist | Testing 500+ formulas so you don\'t have to ✨',
  niche: 'K-Beauty & Clean Skincare',
  socialPlatforms: {
    tiktok: '@katebeautyglow',
    instagram: '@kate.glow',
    youtube: 'KateGlowBeauty',
    ltk: 'katejenkins'
  },
  apiKey: 'bai_live_sk_99a8b1c2d3e4f5g6h7i8j9k0',
  currentPlan: 'Pro',
  planStatus: 'Active',
  monthlyScanUsage: 4820,
  monthlyScanLimit: 10000,
  notifications: {
    emailDigest: true,
    conversionAlerts: true,
    weeklyReport: true,
    newFeatures: false
  }
};

export const MOCK_ADMIN: UserProfile = {
  id: 'usr_admin_01',
  name: 'Aura Platform Director',
  handle: '@aurahq',
  email: 'admin@aura.ai',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  bio: 'Aura Master Control & Product Catalog Operations Administrator',
  niche: 'Platform Administration',
  socialPlatforms: {},
  apiKey: 'bai_admin_sk_88x99z11a22b33c44d55e66f',
  currentPlan: 'Elite',
  planStatus: 'Active',
  monthlyScanUsage: 0,
  monthlyScanLimit: 1000000,
  notifications: {
    emailDigest: true,
    conversionAlerts: true,
    weeklyReport: true,
    newFeatures: true
  }
};

export const MOCK_AFFILIATORS: AffiliatorAccount[] = [
  {
    id: 'aff_1',
    name: 'Kate Jenkins',
    handle: '@katebeautyglow',
    email: 'kate@beautyglow.co',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    niche: 'K-Beauty & Clean Skincare',
    joinedDate: '2025-11-12',
    status: 'Approved',
    tier: 'Pro',
    totalProductsInCatalog: 6,
    totalScansGenerated: 6890,
    totalClicksGenerated: 3450,
    followersCount: '420K'
  },
  {
    id: 'aff_2',
    name: 'Elena Rostova',
    handle: '@elena_skin',
    email: 'elena@skincareglam.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    niche: 'Anti-aging & Luxury Serums',
    joinedDate: '2026-01-05',
    status: 'Approved',
    tier: 'Elite',
    totalProductsInCatalog: 12,
    totalScansGenerated: 14200,
    totalClicksGenerated: 6810,
    followersCount: '185K'
  },
  {
    id: 'aff_3',
    name: 'Marcus Chen',
    handle: '@marcusmakeup',
    email: 'marcus@makeupchen.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    niche: 'Male Grooming & Foundation Matches',
    joinedDate: '2026-02-18',
    status: 'Approved',
    tier: 'Pro',
    totalProductsInCatalog: 8,
    totalScansGenerated: 9410,
    totalClicksGenerated: 4200,
    followersCount: '650K'
  },
  {
    id: 'aff_4',
    name: 'Sophia Martinez',
    handle: '@sophia_glowup',
    email: 'sophia@glowupbeauty.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    niche: 'Drugstore Beauty Dupes & Teen Skincare',
    joinedDate: '2026-03-28',
    status: 'Approved',
    tier: 'Pro',
    totalProductsInCatalog: 5,
    totalScansGenerated: 1420,
    totalClicksGenerated: 680,
    followersCount: '89K'
  },
  {
    id: 'aff_5',
    name: 'Aaliyah Reed',
    handle: '@aaliyah_skin',
    email: 'aaliyah@reedbeauty.com',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400',
    niche: 'Melanin Rich Skincare & Sunscreens',
    joinedDate: '2026-04-10',
    status: 'Approved',
    tier: 'Elite',
    totalProductsInCatalog: 7,
    totalScansGenerated: 3820,
    totalClicksGenerated: 1910,
    followersCount: '112K'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  // LIPS CATEGORY
  {
    id: 'prod_1',
    name: 'Glasting Liquid Lip Tint',
    brand: 'Wardah',
    category: 'Lip Tint',
    mainCategory: 'Lips',
    price: 8.50,
    originalPrice: 9.50,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/wardah_glasting_lip',
    shade: '04 Rose Opal - Cool Berry',
    suitableSkinTones: ['Fair', 'Light', 'Medium'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Normal', 'Dry', 'Combination'],
    targetsConcerns: ['Dullness'],
    matchScoreWeight: 98,
    status: 'Active',
    clicks: 4280,
    conversions: 1120,
    revenueGenerated: 9520.00,
    affiliatorNote: 'Lip tint viral dengan glass-shine finish, sangat pas untuk undertone cool & winter palette!'
  },
  {
    id: 'prod_2',
    name: 'Powerstay Transferproof Matte Lip Cream',
    brand: 'Make Over',
    category: 'Lip Cream',
    mainCategory: 'Lips',
    price: 9.50,
    originalPrice: 11.00,
    imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://tokopedia.com/makeover_powerstay_lip',
    shade: 'B01 Deep Plum - Berry Winter',
    suitableSkinTones: ['Light', 'Medium', 'Tan'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Oily', 'Dry', 'Combination', 'Normal'],
    targetsConcerns: [],
    matchScoreWeight: 96,
    status: 'Active',
    clicks: 3890,
    conversions: 940,
    revenueGenerated: 8930.00,
    affiliatorNote: 'Lip cream transferproof tahan 14 jam. Warna deep plum sangat stand out pada personal color Winter!'
  },
  {
    id: 'prod_3',
    name: 'Idol Blurring Soft Lip Matte',
    brand: 'Somethinc',
    category: 'Lipstick',
    mainCategory: 'Lips',
    price: 7.90,
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/somethinc_idol_lip',
    shade: 'Poker Face - Rosy Berry',
    suitableSkinTones: ['Fair', 'Light', 'Medium', 'Tan'],
    suitableUndertones: ['Cool', 'Warm', 'Neutral'],
    suitableSkinTypes: ['Oily', 'Dry', 'Combination', 'Normal'],
    targetsConcerns: [],
    matchScoreWeight: 95,
    status: 'Active',
    clicks: 3120,
    conversions: 780,
    revenueGenerated: 6162.00,
    affiliatorNote: 'Tekstur powdery blurring yang sangat nyaman di bibir tanpa garis halus.'
  },
  {
    id: 'prod_4',
    name: 'Plush Lip Tint Berry Sorbet',
    brand: 'Rosé All Day',
    category: 'Lip Tint',
    mainCategory: 'Lips',
    price: 8.00,
    imageUrl: 'https://images.unsplash.com/photo-1599733589046-9b8308b5b50d?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/roseallday_plush_tint',
    shade: 'Berry Sorbet - Deep Berry',
    suitableSkinTones: ['Light', 'Medium', 'Tan'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Dry', 'Normal', 'Combination'],
    targetsConcerns: ['Dryness & Flaking'],
    matchScoreWeight: 94,
    status: 'Active',
    clicks: 2850,
    conversions: 670,
    revenueGenerated: 5360.00,
    affiliatorNote: 'Pigmentasi tinggi dengan kandungan vitamin E & squalane untuk menutrisi bibir.'
  },

  // FACE & SHADE CATEGORY
  {
    id: 'prod_5',
    name: 'Colorfit Perfect Glow Cushion SPF 33 PA+++',
    brand: 'Wardah',
    category: 'Cushion',
    mainCategory: 'Face & Shade',
    price: 12.00,
    originalPrice: 13.50,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/wardah_colorfit_cushion',
    shade: '22N Light Ivory - Neutral Cool',
    suitableSkinTones: ['Light', 'Medium'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Normal', 'Dry', 'Combination'],
    targetsConcerns: ['Dullness', 'Hyperpigmentation'],
    matchScoreWeight: 98,
    status: 'Active',
    clicks: 5120,
    conversions: 1380,
    revenueGenerated: 16560.00,
    affiliatorNote: 'Cushion favorit dengan SkinMatch Technology yang langsung menyatu dengan warna kulit Medium Cool!'
  },
  {
    id: 'prod_6',
    name: 'Hydrastay Lite Glow Cushion SPF 50',
    brand: 'Make Over',
    category: 'Cushion',
    mainCategory: 'Face & Shade',
    price: 14.50,
    imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://tokopedia.com/makeover_hydrastay_cushion',
    shade: 'N10 Silk - Cool Medium',
    suitableSkinTones: ['Light', 'Medium', 'Tan'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Dry', 'Normal', 'Combination'],
    targetsConcerns: ['Dryness & Flaking', 'Fine Lines'],
    matchScoreWeight: 97,
    status: 'Active',
    clicks: 4320,
    conversions: 1050,
    revenueGenerated: 15225.00,
    affiliatorNote: 'Hydration serum cushion khusus kulit kombinasi/kering. Memberikan tampilan healthy glass skin.'
  },
  {
    id: 'prod_7',
    name: 'Copy Paste Breathable Mesh Cushion SPF 33 PA++',
    brand: 'Somethinc',
    category: 'Cushion',
    mainCategory: 'Face & Shade',
    price: 13.00,
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/somethinc_copy_paste_cushion',
    shade: 'Bijoux - Medium Neutral Cool',
    suitableSkinTones: ['Medium', 'Tan'],
    suitableUndertones: ['Cool', 'Neutral', 'Olive'],
    suitableSkinTypes: ['Oily', 'Combination', 'Sensitive'],
    targetsConcerns: ['Acne & Blemishes', 'Large Pores'],
    matchScoreWeight: 95,
    status: 'Active',
    clicks: 3410,
    conversions: 890,
    revenueGenerated: 11570.00,
    affiliatorNote: 'Non-comedogenic mesh cushion buatan lokal yang sangat breathable untuk iklim tropis.'
  },
  {
    id: 'prod_8',
    name: 'Cover Tight Liquid Foundation High Coverage',
    brand: 'Motherofpearl',
    category: 'Foundation',
    mainCategory: 'Face & Shade',
    price: 15.00,
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://tokopedia.com/mop_foundation',
    shade: '02 Medium Peach - Cool Undertone',
    suitableSkinTones: ['Light', 'Medium'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Oily', 'Combination', 'Normal'],
    targetsConcerns: ['Hyperpigmentation', 'Redness'],
    matchScoreWeight: 96,
    status: 'Active',
    clicks: 2980,
    conversions: 720,
    revenueGenerated: 10800.00,
    affiliatorNote: 'Foundation buatan Tasya Farasya dengan coverage maksimal yang tidak oxidized sepanjang hari.'
  },
  {
    id: 'prod_9',
    name: 'Colorfit Cream Blush Cheek Tint',
    brand: 'Wardah',
    category: 'Blush & Cheek Tint',
    mainCategory: 'Face & Shade',
    price: 6.50,
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/wardah_cream_blush',
    shade: '03 Lady Rose - Cool Pink',
    suitableSkinTones: ['Fair', 'Light', 'Medium'],
    suitableUndertones: ['Cool', 'Neutral'],
    suitableSkinTypes: ['Oily', 'Dry', 'Combination', 'Normal'],
    targetsConcerns: ['Dullness'],
    matchScoreWeight: 94,
    status: 'Active',
    clicks: 2450,
    conversions: 610,
    revenueGenerated: 3965.00,
    affiliatorNote: 'Blush on creamy dengan hasil akhir powdery yang memberi efek pipi merona alami.'
  },
  {
    id: 'prod_10',
    name: 'Everyday Shine Free Loose Setting Powder',
    brand: 'Wardah',
    category: 'Powder',
    mainCategory: 'Face & Shade',
    price: 5.50,
    imageUrl: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?auto=format&fit=crop&q=80&w=600',
    affiliateUrl: 'https://shopee.co.id/wardah_loose_powder',
    shade: '02 Light Beige',
    suitableSkinTones: ['Light', 'Medium'],
    suitableUndertones: ['Cool', 'Warm', 'Neutral'],
    suitableSkinTypes: ['Oily', 'Combination'],
    targetsConcerns: ['Large Pores'],
    matchScoreWeight: 92,
    status: 'Active',
    clicks: 1890,
    conversions: 480,
    revenueGenerated: 2640.00,
    affiliatorNote: 'Bedak tabur pengontrol minyak berlebih dengan butiran halus pembias cahaya.'
  }
];

export const MOCK_AI_PAGES: AIPageConfig[] = [
  {
    id: 'page_1',
    slug: 'kate-glow',
    title: 'Kate\'s AI Skin Matchmaker & Foundation Finder',
    creatorName: 'Kate Jenkins',
    creatorHandle: '@katebeautyglow',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: 'Upload a quick selfie to discover your exact undertone, skin type, and my personalized top 3 product recommendations!',
    primaryColor: '#F26CA7',
    accentColor: '#FFB6D9',
    welcomeMessage: 'Hey gorgeous! Let\'s scan your skin & find your holy-grail beauty matches in 5 seconds ✨',
    allowCameraUpload: true,
    featuredProductIds: ['prod_1', 'prod_2', 'prod_3', 'prod_5'],
    customDomain: 'glow.katejenkins.com',
    totalViews: 18420,
    totalScans: 6890,
    conversionRate: 28.6,
    status: 'Published',
    createdAt: '2026-01-15'
  },
  {
    id: 'page_2',
    slug: 'acne-routine-match',
    title: 'Clean Beauty & Barrier Repair AI Diagnostic',
    creatorName: 'Kate Jenkins',
    creatorHandle: '@katebeautyglow',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: 'Struggling with breakouts, redness, or peeling? Scan your skin for a targeted non-comedogenic routine.',
    primaryColor: '#10B981',
    accentColor: '#A7F3D0',
    welcomeMessage: 'Take or upload a clear selfie in natural light for instant acne & barrier analysis!',
    allowCameraUpload: true,
    featuredProductIds: ['prod_3', 'prod_5'],
    totalViews: 6100,
    totalScans: 2340,
    conversionRate: 31.2,
    status: 'Published',
    createdAt: '2026-03-10'
  }
];

export const MOCK_CUSTOMER_LEADS: CustomerLead[] = [
  {
    id: 'lead_101',
    scanDate: '2026-08-07 10:14 AM',
    followerName: 'Siti Rahma',
    followerHandle: '@sitirahma_beauty',
    email: 'siti.rahma@gmail.com',
    selfieUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    confidence: 98.6,
    personalColor: 'Winter',
    detectedSkinTone: 'Medium',
    detectedUndertone: 'Cool',
    detectedSkinType: 'Combination',
    faceShape: 'Oval',
    bestColorPalette: [
      { name: 'Berry', colorHex: '#701a75' },
      { name: 'Navy', colorHex: '#1e3a8a' },
      { name: 'Emerald', colorHex: '#065f46' },
      { name: 'Silver', colorHex: '#94a3b8' }
    ],
    topConcerns: ['Dullness'],
    matchedProductCount: 4,
    topMatchedProduct: 'Wardah Glasting Liquid Lip Tint - 04 Rose Opal',
    clickedAffiliate: true,
    estimatedCommission: 1.20,
    location: 'Jakarta, Indonesia'
  },
  {
    id: 'lead_102',
    scanDate: '2026-08-07 09:42 AM',
    followerName: 'Annisa Putri',
    followerHandle: '@annisa_p',
    email: 'annisa.p@gmail.com',
    selfieUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
    confidence: 98.6,
    personalColor: 'Winter',
    detectedSkinTone: 'Medium',
    detectedUndertone: 'Cool',
    detectedSkinType: 'Normal',
    faceShape: 'Oval',
    bestColorPalette: [
      { name: 'Berry', colorHex: '#701a75' },
      { name: 'Navy', colorHex: '#1e3a8a' },
      { name: 'Emerald', colorHex: '#065f46' },
      { name: 'Silver', colorHex: '#94a3b8' }
    ],
    topConcerns: [],
    matchedProductCount: 5,
    topMatchedProduct: 'Make Over Powerstay Matte Lip Cream - B01 Deep Plum',
    clickedAffiliate: true,
    estimatedCommission: 1.45,
    location: 'Bandung, Indonesia'
  },
  {
    id: 'lead_103',
    scanDate: '2026-08-06 08:15 AM',
    followerName: 'Nadia Utami',
    followerHandle: '@nadia_glow',
    selfieUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
    confidence: 98.6,
    personalColor: 'Winter',
    detectedSkinTone: 'Medium',
    detectedUndertone: 'Cool',
    detectedSkinType: 'Oily',
    faceShape: 'Oval',
    bestColorPalette: [
      { name: 'Berry', colorHex: '#701a75' },
      { name: 'Navy', colorHex: '#1e3a8a' },
      { name: 'Emerald', colorHex: '#065f46' },
      { name: 'Silver', colorHex: '#94a3b8' }
    ],
    topConcerns: ['Large Pores'],
    matchedProductCount: 3,
    topMatchedProduct: 'Wardah Colorfit Perfect Glow Cushion SPF 33',
    clickedAffiliate: true,
    estimatedCommission: 1.80,
    location: 'Surabaya, Indonesia'
  },
  {
    id: 'lead_104',
    scanDate: '2026-08-06 11:20 PM',
    followerName: 'Dewi Lestari',
    email: 'dewi.lestari@yahoo.com',
    selfieUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300',
    confidence: 98.6,
    personalColor: 'Winter',
    detectedSkinTone: 'Medium',
    detectedUndertone: 'Cool',
    detectedSkinType: 'Dry',
    faceShape: 'Oval',
    bestColorPalette: [
      { name: 'Berry', colorHex: '#701a75' },
      { name: 'Navy', colorHex: '#1e3a8a' },
      { name: 'Emerald', colorHex: '#065f46' },
      { name: 'Silver', colorHex: '#94a3b8' }
    ],
    topConcerns: ['Dryness & Flaking'],
    matchedProductCount: 3,
    topMatchedProduct: 'Somethinc Copy Paste Breathable Mesh Cushion',
    clickedAffiliate: false,
    estimatedCommission: 0.00,
    location: 'Yogyakarta, Indonesia'
  }
];

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalVisitors: 24520,
  totalScans: 9230,
  totalClicks: 3450,
  ctr: 37.4,
  conversionRate: 28.6,
  estimatedRevenue: 84250.00,
  visitorsTrend: 24.8,
  scansTrend: 31.5,
  ctrTrend: 12.2,
  revenueTrend: 38.4
};

export const MOCK_CHART_DATA = [
  { day: 'Mon', visitors: 2800, scans: 1100, clicks: 420, revenue: 1850 },
  { day: 'Tue', visitors: 3200, scans: 1350, clicks: 510, revenue: 2240 },
  { day: 'Wed', visitors: 3900, scans: 1620, clicks: 640, revenue: 2980 },
  { day: 'Thu', visitors: 4100, scans: 1780, clicks: 710, revenue: 3420 },
  { day: 'Fri', visitors: 4800, scans: 2100, clicks: 890, revenue: 4120 },
  { day: 'Sat', visitors: 5600, scans: 2450, clicks: 1020, revenue: 4950 },
  { day: 'Sun', visitors: 6200, scans: 2800, clicks: 1180, revenue: 5800 }
];

export const MOCK_UNDERTONE_STATS = [
  { name: 'Warm Undertone', percentage: 42, color: '#F59E0B' },
  { name: 'Cool Undertone', percentage: 28, color: '#3B82F6' },
  { name: 'Neutral Undertone', percentage: 22, color: '#EC4899' },
  { name: 'Olive Undertone', percentage: 8, color: '#10B981' }
];

export const MOCK_CONCERN_STATS = [
  { concern: 'Dullness & Radiance', percentage: 38 },
  { concern: 'Acne & Breakouts', percentage: 29 },
  { concern: 'Redness & Sensitivity', percentage: 18 },
  { concern: 'Fine Lines & Firmness', percentage: 15 }
];

export const MOCK_TESTIMONIALS = [
  {
    name: 'Sarah Jenkins',
    handle: '@sarah.glam',
    followers: '420K Followers on TikTok',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    quote: 'Before Aura, my Linktree CTR was 1.8%. After setting up my AI Selfie Scan, my followers instantly buy the exact foundation shade match. My monthly affiliate earnings tripled from $2.1k to $7.8k!',
    growth: '+330% Revenue Growth'
  },
  {
    name: 'Elena Rostova',
    handle: '@elena_skin',
    followers: '185K Followers on Instagram',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    quote: 'My audience constantly DM me asking "What shade am I?". Aura automates shade matching completely. Followers love the instant personalized scan!',
    growth: '41.2% Conversion Rate'
  },
  {
    name: 'Marcus Chen',
    handle: '@marcusmakeup',
    followers: '650K Subscribers on YouTube',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    quote: 'Setting up my products took under 10 minutes. The AI algorithm matches products with eerie precision. It\'s like having a 24/7 beauty consultant for my community.',
    growth: '$14.2k Earned Last Month'
  }
];

export const MOCK_FAQS = [
  {
    q: 'How does Aura differ from a standard Linktree or Bio link?',
    a: 'Traditional link-in-bio tools display a static, generic list of links. Aura turns your bio link into an interactive AI Beauty Consultant. Customers upload a selfie, receive instant skin tone, undertone, and concern analysis, and get matched to YOUR specific affiliate products with shade suggestions.'
  },
  {
    q: 'Which affiliate networks and links can I use with Aura?',
    a: 'Aura works with ALL affiliate platforms, including Amazon Associates, ShopMy, LTK (RewardStyle), Sephora Affiliate Program, TikTok Shop links, Shopee, Rakuten, and custom brand discount codes.'
  },
  {
    q: 'Do my followers need to download an app?',
    a: 'No app download needed! Aura recommendation pages load instantly in any web browser or inside TikTok/Instagram built-in webview. It takes less than 5 seconds for a user to scan their selfie.'
  },
  {
    q: 'Is selfie data stored securely and privately?',
    a: 'Yes, privacy is paramount. User selfie uploads are processed ephemerally for instant facial feature extraction and are never sold or exposed. Users can also select sample photos if they prefer.'
  },
  {
    q: 'How fast can I set up my Aura page?',
    a: 'You can launch your personalized AI Page in under 3 minutes. Simply add your favorite products with your affiliate links, select your primary page theme, and paste your Aura link into your social bios.'
  }
];
