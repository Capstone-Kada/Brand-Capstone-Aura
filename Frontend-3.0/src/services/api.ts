import axios from 'axios';
import type {
  AffiliatorAccount,
  AIPageConfig,
  AIAnalysisResult,
  AnalyticsSummary,
  CustomerLead,
  Product,
  ProductCategory,
  UserProfile,
} from '../types';

const API_URL = '/api';

const TOKEN_KEY = 'aura_access_token';
const REFRESH_TOKEN_KEY = 'aura_refresh_token';

/** Fired on window when a stored session could not be refreshed — the store listens for this to reset to a logged-out state. */
export const SESSION_EXPIRED_EVENT = 'aura:session-expired';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string | null, refreshToken?: string | null): void {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  else localStorage.removeItem(TOKEN_KEY);

  if (refreshToken !== undefined) {
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

const http = axios.create({ baseURL: API_URL });

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Access tokens expire quickly (15m) — transparently refresh once on a 401
// using the stored refresh token, then retry the original request. If the
// refresh token is missing/invalid, the session is over: clear storage and
// let the rest of the app know via a DOM event (no import of the store here
// to avoid a circular dependency between api.ts and useBeautyStore.ts).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const storedRefreshToken = getRefreshToken();
  if (!storedRefreshToken) return null;

  try {
    const response = await axios.post<ApiSuccess<{ accessToken: string; refreshToken: string }>>(
      `${API_URL}/auth/refresh`,
      { refreshToken: storedRefreshToken },
    );
    const tokens = response.data.data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config) & { _retried?: boolean };
    const isAuthEndpoint = typeof originalRequest?.url === 'string' && originalRequest.url.includes('/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isAuthEndpoint) {
      originalRequest._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return http(originalRequest);
      }

      const hadToken = Boolean(getAccessToken() || getRefreshToken());
      setTokens(null, null);
      if (hadToken) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  },
);

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

async function unwrap<T>(promise: Promise<{ data: ApiSuccess<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Backend DTO shapes (only the fields the frontend consumes)
// ---------------------------------------------------------------------------

interface AuthResponseDto {
  user?: { id: string; email: string; role: string };
  tokens?: { accessToken: string; refreshToken: string; expiresIn: string; tokenType: string };
  requires2FA?: boolean;
  userId?: string;
  requiresEmailVerification?: boolean;
  email?: string;
  retryAfterSeconds?: number;
}

interface AffiliatorProfileDto {
  id: string;
  userId: string;
  name: string | null;
  handle: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  niche: string | null;
  socialPlatforms: { tiktok?: string; instagram?: string; youtube?: string; ltk?: string };
  apiKey: string;
  status: AffiliatorAccount['status'];
  tier: 'STARTER' | 'PRO' | 'ELITE';
  planStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE';
  monthlyScanUsage: number;
  monthlyScanLimit: number;
  notifications: { emailDigest: boolean; conversionAlerts: boolean; weeklyReport: boolean; newFeatures: boolean };
  followersCount: string;
  joinedAt: string;
  totalProductsInCatalog: number;
  totalScansGenerated: number;
  totalClicksGenerated: number;
  isTwoFactorEnabled: boolean;
}

interface ListingDto {
  id: string;
  productId: string;
  name: string;
  brand: string;
  category: string;
  mainCategory: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  affiliateUrl: string;
  shade: string | null;
  suitableSkinTones: string[];
  suitableUndertones: string[];
  suitableSkinTypes: string[];
  targetsConcerns: string[];
  matchScoreWeight: number;
  status: 'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK';
  clicks: number;
  conversions: number;
  revenueGenerated: number;
  affiliatorNote: string | null;
}

interface MasterProductDto {
  id: string;
  brand: string;
  name: string;
  category: string;
  mainCategory: string | null;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  affiliateUrl: string | null;
  shade: string | null;
  suitableSkinTones: string[];
  suitableUndertones: string[];
  suitableSkinTypes: string[];
  targetsConcerns: string[];
  matchScoreWeight: number;
  isActive: boolean;
}

interface AIPageDto {
  id: string;
  slug: string;
  title: string;
  creatorName: string | null;
  creatorHandle: string;
  avatarUrl: string | null;
  bio: string | null;
  primaryColor: string;
  accentColor: string;
  welcomeMessage: string | null;
  allowCameraUpload: boolean;
  featuredProductIds: string[];
  customDomain: string | null;
  totalViews: number;
  totalScans: number;
  conversionRate: number;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
}

interface PublicAIPageDto extends AIPageDto {
  affiliatorId: string;
  featuredListings: ListingDto[];
}

interface CustomerLeadDto {
  id: string;
  scanDate: string;
  followerName: string | null;
  followerHandle: string | null;
  email: string | null;
  age?: number | string | null;
  selfieUrl: string | null;
  detectedSkinTone: string;
  detectedUndertone: string;
  personalColor: string | null;
  confidence: number;
  faceShape: string;
  bestColorPalette: { name: string; colorHex: string }[];
  matchedProductCount: number;
  topMatchedProduct: string | null;
  clickedAffiliate: boolean;
  estimatedCommission: number;
  location: string | null;
}

interface LeadScanResultDto {
  leadId?: string;
  confidence: number;
  personalColor: string;
  undertone: string;
  skinTone: string;
  faceShape: string;
  bestColorPalette: { name: string; colorHex: string }[];
  matchSummary?: string;
  recommendedProducts: { product: ListingDto; matchScore: number; recommendedShade?: string; aiReason: string }[];
}

// ---------------------------------------------------------------------------
// Mappers: backend DTO -> frontend type
// ---------------------------------------------------------------------------

export function mapListingToProduct(l: ListingDto): Product {
  return {
    id: l.id,
    productId: l.productId,
    name: l.name,
    brand: l.brand,
    category: l.category as ProductCategory,
    mainCategory: (l.mainCategory ?? undefined) as Product['mainCategory'],
    price: l.price,
    originalPrice: l.originalPrice ?? undefined,
    imageUrl: l.imageUrl ?? '',
    affiliateUrl: l.affiliateUrl,
    shade: l.shade ?? undefined,
    suitableSkinTones: l.suitableSkinTones as Product['suitableSkinTones'],
    suitableUndertones: l.suitableUndertones as Product['suitableUndertones'],
    suitableSkinTypes: l.suitableSkinTypes as Product['suitableSkinTypes'],
    targetsConcerns: l.targetsConcerns as Product['targetsConcerns'],
    matchScoreWeight: l.matchScoreWeight,
    status: l.status === 'ACTIVE' ? 'Active' : l.status === 'DRAFT' ? 'Draft' : 'Out of Stock',
    clicks: l.clicks,
    conversions: l.conversions,
    revenueGenerated: l.revenueGenerated,
    affiliatorNote: l.affiliatorNote ?? undefined,
  };
}

/** Master catalog products have no per-affiliator performance data — zeroed, not fabricated. */
export function mapMasterProductToProduct(p: MasterProductDto): Product {
  return {
    id: p.id,
    productId: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category as ProductCategory,
    mainCategory: (p.mainCategory ?? undefined) as Product['mainCategory'],
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    imageUrl: p.imageUrl ?? '',
    affiliateUrl: p.affiliateUrl ?? '',
    shade: p.shade ?? undefined,
    suitableSkinTones: p.suitableSkinTones as Product['suitableSkinTones'],
    suitableUndertones: p.suitableUndertones as Product['suitableUndertones'],
    suitableSkinTypes: p.suitableSkinTypes as Product['suitableSkinTypes'],
    targetsConcerns: p.targetsConcerns as Product['targetsConcerns'],
    matchScoreWeight: p.matchScoreWeight,
    status: p.isActive ? 'Active' : 'Draft',
    clicks: 0,
    conversions: 0,
    revenueGenerated: 0,
  };
}

export function mapAffiliatorToUserProfile(a: AffiliatorProfileDto, role: 'admin' | 'affiliator'): UserProfile {
  return {
    id: a.id,
    name: a.name ?? a.handle,
    handle: a.handle,
    email: a.email,
    avatarUrl: a.avatarUrl ?? '',
    bio: a.bio ?? '',
    niche: a.niche ?? '',
    role,
    socialPlatforms: a.socialPlatforms,
    apiKey: a.apiKey,
    currentPlan: a.tier === 'STARTER' ? 'Starter' : a.tier === 'PRO' ? 'Pro' : 'Elite',
    planStatus: a.planStatus === 'ACTIVE' ? 'Active' : a.planStatus === 'TRIALING' ? 'Trialing' : 'Past Due',
    monthlyScanUsage: a.monthlyScanUsage,
    monthlyScanLimit: a.monthlyScanLimit,
    notifications: {
      emailDigest: a.notifications.emailDigest,
      conversionAlerts: a.notifications.conversionAlerts,
      weeklyReport: a.notifications.weeklyReport,
      newFeatures: a.notifications.newFeatures,
    },
    isTwoFactorEnabled: a.isTwoFactorEnabled,
  };
}

export function mapAffiliatorToAccount(a: AffiliatorProfileDto): AffiliatorAccount {
  return {
    id: a.id,
    name: a.name ?? a.handle,
    handle: a.handle,
    email: a.email,
    avatarUrl: a.avatarUrl ?? '',
    niche: a.niche ?? '',
    joinedDate: a.joinedAt,
    status: a.status,
    tier: a.tier === 'STARTER' ? 'Starter' : a.tier === 'PRO' ? 'Pro' : 'Elite',
    totalProductsInCatalog: a.totalProductsInCatalog,
    totalScansGenerated: a.totalScansGenerated,
    totalClicksGenerated: a.totalClicksGenerated,
    followersCount: a.followersCount,
  };
}

export function mapAIPageDto(p: AIPageDto): AIPageConfig {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    creatorName: p.creatorName ?? '',
    creatorHandle: p.creatorHandle,
    avatarUrl: p.avatarUrl ?? '',
    bio: p.bio ?? '',
    primaryColor: p.primaryColor,
    accentColor: p.accentColor,
    welcomeMessage: p.welcomeMessage ?? '',
    allowCameraUpload: p.allowCameraUpload,
    featuredProductIds: p.featuredProductIds,
    customDomain: p.customDomain ?? undefined,
    totalViews: p.totalViews,
    totalScans: p.totalScans,
    conversionRate: p.conversionRate,
    status: p.status === 'PUBLISHED' ? 'Published' : 'Draft',
    createdAt: p.createdAt,
  };
}

export function mapCustomerLeadDto(l: CustomerLeadDto): CustomerLead {
  return {
    id: l.id,
    scanDate: l.scanDate,
    followerName: l.followerName ?? undefined,
    followerHandle: l.followerHandle ?? undefined,
    email: l.email ?? undefined,
    age: l.age ?? undefined,
    selfieUrl: l.selfieUrl ?? undefined,
    detectedSkinTone: l.detectedSkinTone as CustomerLead['detectedSkinTone'],
    detectedUndertone: l.detectedUndertone as CustomerLead['detectedUndertone'],
    personalColor: (l.personalColor ?? undefined) as CustomerLead['personalColor'],
    confidence: l.confidence,
    bestColorPalette: l.bestColorPalette,
    topConcerns: [],
    matchedProductCount: l.matchedProductCount,
    topMatchedProduct: l.topMatchedProduct ?? '',
    clickedAffiliate: l.clickedAffiliate,
    estimatedCommission: l.estimatedCommission,
    location: l.location ?? '',
    faceShape: l.faceShape as CustomerLead['faceShape'],
  };
}

function mapScanResultDto(r: LeadScanResultDto): AIAnalysisResult {
  return {
    leadId: r.leadId,
    confidence: r.confidence,
    personalColor: r.personalColor as AIAnalysisResult['personalColor'],
    undertone: r.undertone as AIAnalysisResult['undertone'],
    skinTone: r.skinTone as AIAnalysisResult['skinTone'],
    faceShape: r.faceShape as AIAnalysisResult['faceShape'],
    bestColorPalette: r.bestColorPalette,
    matchSummary: r.matchSummary ?? undefined,
    recommendedProducts: r.recommendedProducts.map((m) => ({
      product: mapListingToProduct(m.product),
      matchScore: m.matchScore,
      recommendedShade: m.recommendedShade,
      aiReason: m.aiReason,
    })),
  };
}

// ---------------------------------------------------------------------------
// API surface
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    async login(email: string, password: string): Promise<AuthResponseDto> {
      const result = await unwrap(http.post<ApiSuccess<AuthResponseDto>>('/auth/login', { email, password }));
      if (result.tokens) {
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      }
      return result;
    },
    async register(input: { email: string; password: string; name?: string; accountType?: 'USER' | 'AFFILIATOR' }): Promise<AuthResponseDto> {
      const result = await unwrap(http.post<ApiSuccess<AuthResponseDto>>('/auth/register', input));
      if (result.tokens) {
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      }
      return result;
    },
    async google(idToken: string): Promise<AuthResponseDto> {
      const result = await unwrap(http.post<ApiSuccess<AuthResponseDto>>('/auth/google', { idToken }));
      if (result.tokens) {
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      }
      return result;
    },
    logout(): void {
      setTokens(null, null);
    },
    generate2FA: (): Promise<{ secret: string; qrCodeDataUrl: string }> => unwrap(http.post('/auth/2fa/generate')),
    enable2FA: (token: string): Promise<void> => unwrap(http.post('/auth/2fa/enable', { token })),
    async verify2FA(userId: string, token: string): Promise<AuthResponseDto> {
      const result = await unwrap(http.post<ApiSuccess<AuthResponseDto>>('/auth/2fa/verify', { userId, token }));
      if (result.tokens) {
        setTokens(result.tokens.accessToken, result.tokens.refreshToken);
      }
      return result;
    },
    disable2FA: (): Promise<void> => unwrap(http.post('/auth/2fa/disable')),
    verifyEmail: (token: string): Promise<{ message: string }> =>
      unwrap(http.post('/auth/verify-email', { token })),
    resendVerification: (email: string): Promise<{ message: string; retryAfterSeconds?: number }> =>
      unwrap(http.post('/auth/resend-verification', { email })),
  },

  affiliator: {
    me: (): Promise<AffiliatorProfileDto> => unwrap(http.get('/affiliators/me')),
    update: (data: Partial<AffiliatorProfileDto>): Promise<AffiliatorProfileDto> => unwrap(http.patch('/affiliators/me', data)),
    regenerateApiKey: (): Promise<AffiliatorProfileDto> => unwrap(http.post('/affiliators/me/api-key/regenerate')),
    uploadAvatar: (file: File): Promise<AffiliatorProfileDto> => {
      const form = new FormData();
      form.append('image', file);
      return unwrap(http.post('/affiliators/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    adminList: (): Promise<AffiliatorProfileDto[]> => unwrap(http.get('/affiliators')),
    adminUpdateStatus: (id: string, status: AffiliatorAccount['status']): Promise<AffiliatorProfileDto> =>
      unwrap(http.patch(`/affiliators/${id}/status`, { status })),
    adminUpdate: (id: string, data: Record<string, unknown>): Promise<AffiliatorProfileDto> =>
      unwrap(http.patch(`/affiliators/${id}`, data)),
    adminDelete: (id: string): Promise<void> => unwrap(http.delete(`/affiliators/${id}`)),
  },

  listings: {
    list: (): Promise<ListingDto[]> => unwrap(http.get('/listings')),
    create: (data: { productId: string; affiliateUrl: string }): Promise<ListingDto> => unwrap(http.post('/listings', data)),
    autoFill: (productIds: string[]): Promise<ListingDto[]> => unwrap(http.post('/listings/auto-fill', { productIds })),
    update: (id: string, data: Record<string, unknown>): Promise<ListingDto> => unwrap(http.patch(`/listings/${id}`, data)),
    remove: (id: string): Promise<void> => unwrap(http.delete(`/listings/${id}`)),
  },

  products: {
    masterList: (params?: { category?: string; limit?: number }): Promise<MasterProductDto[]> =>
      unwrap(http.get('/products', { params })),
    adminCreate: (data: Record<string, unknown>): Promise<MasterProductDto> => unwrap(http.post('/products', data)),
    adminUpdate: (id: string, data: Record<string, unknown>): Promise<MasterProductDto> =>
      unwrap(http.patch(`/products/${id}`, data)),
    adminDelete: (id: string): Promise<void> => unwrap(http.delete(`/products/${id}`)),
  },

  aiPages: {
    list: (): Promise<AIPageDto[]> => unwrap(http.get('/ai-pages')),
    create: (data: Record<string, unknown>): Promise<AIPageDto> => unwrap(http.post('/ai-pages', data)),
    update: (id: string, data: Record<string, unknown>): Promise<AIPageDto> => unwrap(http.patch(`/ai-pages/${id}`, data)),
    remove: (id: string): Promise<void> => unwrap(http.delete(`/ai-pages/${id}`)),
    publicBySlug: (slug: string): Promise<PublicAIPageDto> => unwrap(http.get(`/ai-pages/public/${slug}`)),
  },

  leads: {
    list: (): Promise<CustomerLeadDto[]> => unwrap(http.get('/leads')),
    submit: (form: FormData): Promise<LeadScanResultDto> =>
      unwrap(http.post('/leads', form, { headers: { 'Content-Type': 'multipart/form-data' } })),
    updateProfile: (leadId: string, data: { followerName?: string; followerHandle?: string; email?: string; age?: number | string }): Promise<CustomerLeadDto> =>
      unwrap(http.patch(`/leads/${leadId}`, data)),
    recordClick: (listingId: string, leadId?: string): Promise<void> =>
      unwrap(http.post('/leads/clicks', { listingId, leadId })),
  },

  analytics: {
    summary: (): Promise<AnalyticsSummary> => unwrap(http.get('/analytics/summary')),
    chart: (): Promise<{ day: string; visitors: number; scans: number; clicks: number; revenue: number }[]> =>
      unwrap(http.get('/analytics/chart')),
    undertoneStats: (): Promise<{ name: string; percentage: number }[]> => unwrap(http.get('/analytics/undertone-stats')),
    concernStats: (): Promise<{ concern: string; percentage: number }[]> => unwrap(http.get('/analytics/concern-stats')),
  },

  subscription: {
    plans: (): Promise<any[]> => unwrap(http.get('/subscriptions/plans')),
    checkout: (plan: 'PRO' | 'ELITE'): Promise<{ orderId: string; snapToken: string; redirectUrl: string; amount: number; plan: 'PRO' | 'ELITE' }> =>
      unwrap(http.post('/subscriptions/checkout', { plan })),
    confirm: (plan: 'PRO' | 'ELITE', orderId?: string): Promise<any> =>
      unwrap(http.post('/subscriptions/confirm', { plan, orderId })),
    cancel: (): Promise<any> =>
      unwrap(http.post('/subscriptions/cancel')),
  },
};

export { mapScanResultDto };
export type { AffiliatorProfileDto, AIPageDto, LeadScanResultDto, ListingDto, MasterProductDto, PublicAIPageDto };
