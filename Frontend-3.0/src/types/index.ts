export type RouteView = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'forgot-password' 
  | 'dashboard' 
  | 'analytics' 
  | 'products' 
  | 'ai-pages' 
  | 'customers' 
  | 'subscription' 
  | 'settings' 
  | 'public-recommendation'
  | 'internal-preview'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-affiliators'
  | 'admin-analytics';

export type SkinTone = 'Fair' | 'Light' | 'Medium' | 'Tan' | 'Deep' | 'Rich Deep';
export type Undertone = 'Cool' | 'Warm' | 'Neutral' | 'Olive';
export type PersonalColor = 'Winter' | 'Spring' | 'Summer' | 'Autumn';
export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond';
export type MainCategory = 'Lips' | 'Face & Shade';
export type ProductCategory =
  | 'Lipstick'
  | 'Lip Tint'
  | 'Lip Cream'
  | 'Lip Velvet'
  | 'Lip Gloss'
  | 'Lip Balm'
  | 'Cushion'
  | 'Foundation'
  | 'Concealer'
  | 'Blush & Cheek Tint'
  | 'Powder'
  | 'Contour & Bronzer'
  | 'Eyeshadow';

export type SkinType = 'Oily' | 'Dry' | 'Combination' | 'Normal' | 'Sensitive';
export type SkinConcern = 'Acne & Blemishes' | 'Hyperpigmentation' | 'Dryness & Flaking' | 'Fine Lines' | 'Redness' | 'Dullness' | 'Large Pores';

export interface Product {
  id: string;
  /** Master-catalog product this listing is linked to (present for affiliator listings; a master-catalog row's own id otherwise). */
  productId?: string;
  name: string;
  brand: string;
  category: ProductCategory;
  mainCategory?: MainCategory;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  affiliateUrl: string;
  shade?: string;
  suitableSkinTones: SkinTone[];
  suitableUndertones: Undertone[];
  suitableSkinTypes: SkinType[];
  targetsConcerns: SkinConcern[];
  matchScoreWeight: number; // 0-100
  status: 'Active' | 'Draft' | 'Out of Stock';
  approvalStatus?: 'Approved' | 'Pending' | 'Rejected'; // Only used for custom products added by affiliators
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  affiliatorNote?: string;
}

export interface AIPageConfig {
  id: string;
  slug: string;
  title: string;
  creatorName: string;
  creatorHandle: string;
  avatarUrl: string;
  bio: string;
  primaryColor: string;
  accentColor: string;
  welcomeMessage: string;
  allowCameraUpload: boolean;
  featuredProductIds: string[];
  customDomain?: string;
  totalViews: number;
  totalScans: number;
  conversionRate: number;
  status: 'Published' | 'Draft';
  createdAt: string;
}

export interface CustomerLead {
  id: string;
  scanDate: string;
  followerName?: string;
  followerHandle?: string;
  email?: string;
  selfieUrl?: string;
  detectedSkinTone: SkinTone;
  detectedUndertone: Undertone;
  detectedSkinType?: SkinType;
  personalColor?: PersonalColor;
  confidence?: number;
  faceShape?: FaceShape;
  bestColorPalette?: { name: string; colorHex: string }[];
  topConcerns: SkinConcern[];
  matchedProductCount: number;
  topMatchedProduct: string;
  clickedAffiliate: boolean;
  estimatedCommission: number;
  location: string;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalScans: number;
  totalClicks: number;
  ctr: number; // %
  conversionRate: number; // %
  estimatedRevenue: number;
  visitorsTrend: number; // % change
  scansTrend: number;
  ctrTrend: number;
  revenueTrend: number;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  bio: string;
  niche: string;
  role?: 'admin' | 'affiliator';
  socialPlatforms: {
    tiktok?: string;
    instagram?: string;
    youtube?: string;
    ltk?: string;
  };
  apiKey: string;
  currentPlan: 'Starter' | 'Pro' | 'Elite';
  planStatus: 'Active' | 'Trialing' | 'Past Due';
  monthlyScanUsage: number;
  monthlyScanLimit: number;
  notifications: {
    emailDigest: boolean;
    conversionAlerts: boolean;
    weeklyReport: boolean;
    newFeatures: boolean;
  };
  isTwoFactorEnabled?: boolean;
}

export interface AffiliatorAccount {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string;
  niche: string;
  joinedDate: string;
  status: 'Approved' | 'Pending Approval' | 'Rejected' | 'Suspended';
  tier: 'Starter' | 'Pro' | 'Elite';
  totalProductsInCatalog: number;
  totalScansGenerated: number;
  totalClicksGenerated: number;
  followersCount: string;
}

export interface AIAnalysisResult {
  confidence: number; // e.g. 98.6
  personalColor: PersonalColor; // Winter, Spring, Summer, Autumn
  undertone: Undertone; // Cool, Warm, Neutral
  skinTone: SkinTone; // Medium, Fair, etc.
  faceShape: FaceShape; // Oval, Round, etc.
  bestColorPalette: { name: string; colorHex: string; iconEmoji?: string }[];
  toneConfidence?: number; // 0-100
  skinType?: SkinType;
  concerns?: SkinConcern[];
  matchSummary?: string;
  recommendedProducts: {
    product: Product;
    matchScore: number;
    recommendedShade?: string;
    aiReason: string;
  }[];
}
