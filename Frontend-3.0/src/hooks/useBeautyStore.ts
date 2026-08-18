import { useState, useCallback, useEffect } from 'react';
import { RouteView, Product, AIPageConfig, CustomerLead, UserProfile, AIAnalysisResult, AffiliatorAccount, AnalyticsSummary } from '../types';
import { MOCK_ANALYTICS } from '../services/mockData';
import {
  api,
  getAccessToken,
  mapAffiliatorToAccount,
  mapAffiliatorToUserProfile,
  mapAIPageDto,
  mapCustomerLeadDto,
  mapListingToProduct,
  mapMasterProductToProduct,
  mapScanResultDto,
  SESSION_EXPIRED_EVENT,
} from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

/** Used only before login / for anonymous public-page visitors so `user.*` never throws. */
const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Aura Beauty AI',
  handle: 'aura',
  email: '',
  avatarUrl: '',
  bio: '',
  niche: '',
  socialPlatforms: {},
  apiKey: '',
  currentPlan: 'Starter',
  planStatus: 'Active',
  monthlyScanUsage: 0,
  monthlyScanLimit: 0,
  notifications: { emailDigest: false, conversionAlerts: false, weeklyReport: false, newFeatures: false },
};

function errorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
    if (response?.data?.error?.message) return response.data.error.message;
  }
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function errorCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { code?: string } } } }).response;
    return response?.data?.error?.code;
  }
  return undefined;
}

const PENDING_PRODUCTS_STORAGE_KEY = 'aura_pending_products';

const DEFAULT_PENDING_PRODUCTS: Product[] = [
  {
    id: 'custom-demo-1',
    name: 'Skin Tint Serum SPF 35 (Custom Affiliator Submission)',
    brand: 'Rose All Day',
    category: 'Foundation',
    price: 159000,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    affiliateUrl: 'https://shopee.co.id/roseallday/skintint',
    shade: 'Light Warm',
    suitableSkinTones: ['Fair', 'Light', 'Medium'],
    suitableUndertones: ['Warm', 'Neutral'],
    suitableSkinTypes: ['Combination', 'Normal'],
    targetsConcerns: ['Dullness'],
    matchScoreWeight: 90,
    status: 'Active',
    approvalStatus: 'Pending',
    affiliatorNote: 'Niacinamide, Hyaluronic Acid (Pending admin approval)',
    clicks: 0,
    conversions: 0,
    revenueGenerated: 0,
  }
];

const getStoredCustomProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PENDING_PRODUCTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(PENDING_PRODUCTS_STORAGE_KEY, JSON.stringify(DEFAULT_PENDING_PRODUCTS));
    return DEFAULT_PENDING_PRODUCTS;
  } catch {
    return DEFAULT_PENDING_PRODUCTS;
  }
};

const saveStoredCustomProducts = (items: Product[]) => {
  try {
    localStorage.setItem(PENDING_PRODUCTS_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error(e);
  }
};

export function useBeautyStore() {
  const [currentRoute, setCurrentRoute] = useState<RouteView>(() => {
    const path = window.location.pathname.replace('/', '');
    if (path === 'verify-email') {
      return 'verify-email';
    }
    const knownRoutes: RouteView[] = [
      'landing',
      'login',
      'register',
      'forgot-password',
      'dashboard',
      'analytics',
      'products',
      'ai-pages',
      'customers',
      'subscription',
      'settings',
      'admin-dashboard',
      'admin-products',
      'admin-affiliators',
      'admin-analytics',
    ];
    if (knownRoutes.includes(path as RouteView)) {
      return path as RouteView;
    }
    // If the path looks like a username/slug (not empty), default to public-recommendation
    if (path && path.length > 2) {
      return 'public-recommendation';
    }
    return 'landing';
  });
  const [emailVerifyToken] = useState<string>(
    () => new URLSearchParams(window.location.search).get('token') || '',
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [affiliators, setAffiliators] = useState<AffiliatorAccount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [masterCatalog, setMasterCatalog] = useState<Product[]>([]);
  const [aiPages, setAiPages] = useState<AIPageConfig[]>([]);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(MOCK_ANALYTICS);
  const [chartData, setChartData] = useState<{ day: string; visitors: number; scans: number; clicks: number; revenue: number }[]>([]);
  const [undertoneStats, setUndertoneStats] = useState<{ name: string; percentage: number }[]>([]);
  const [concernStats, setConcernStats] = useState<{ concern: string; percentage: number }[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Selected AI page for public view
  const [activePageSlug, setActivePageSlug] = useState<string>(() => {
    const path = window.location.pathname.replace('/', '');
    const knownRoutes = [
      'landing', 'login', 'register', 'forgot-password', 'dashboard', 'analytics', 
      'products', 'ai-pages', 'customers', 'subscription', 'settings', 'verify-email',
      'admin-dashboard', 'admin-products', 'admin-affiliators', 'admin-analytics'
    ];
    if (path && path.length > 2 && !knownRoutes.includes(path)) return path;
    return 'kate-glow';
  });

  const loadAffiliatorWorkspace = useCallback(async () => {
    const [profile, listings, pages, leadRows, summary, catalog, chart, undertones, concerns] = await Promise.all([
      api.affiliator.me(),
      api.listings.list(),
      api.aiPages.list(),
      api.leads.list(),
      api.analytics.summary(),
      api.products.masterList({ limit: 200 }),
      api.analytics.chart(),
      api.analytics.undertoneStats(),
      api.analytics.concernStats(),
    ]);
    setUser(mapAffiliatorToUserProfile(profile, 'affiliator'));
    const customProds = getStoredCustomProducts();
    setProducts([...customProds, ...listings.map(mapListingToProduct)]);
    setAiPages(pages.map(mapAIPageDto));
    setLeads(leadRows.map(mapCustomerLeadDto));
    setAnalytics(summary);
    setMasterCatalog(catalog.map(mapMasterProductToProduct));
    setChartData(chart);
    setUndertoneStats(undertones);
    setConcernStats(concerns);
  }, []);

  const loadAdminWorkspace = useCallback(async () => {
    const [masterProducts, affiliatorRows] = await Promise.all([
      api.products.masterList({ limit: 200 }),
      api.affiliator.adminList(),
    ]);
    setUser({
      id: 'admin',
      name: 'Aura Admin',
      handle: 'admin',
      email: 'admin@auraai.local',
      avatarUrl: '',
      bio: '',
      niche: '',
      role: 'admin',
      socialPlatforms: {},
      apiKey: '',
      currentPlan: 'Elite',
      planStatus: 'Active',
      monthlyScanUsage: 0,
      monthlyScanLimit: 0,
      notifications: { emailDigest: false, conversionAlerts: false, weeklyReport: false, newFeatures: false },
    });
    const customProds = getStoredCustomProducts();
    setProducts([...customProds, ...masterProducts.map(mapMasterProductToProduct)]);
    setAffiliators(affiliatorRows.map(mapAffiliatorToAccount));
  }, []);

  // Restore session (data + route) on page refresh if a token is already stored.
  useEffect(() => {
    if (!getAccessToken()) return;
    setIsLoadingWorkspace(true);
    loadAffiliatorWorkspace()
      .then(() => {
        setCurrentRoute((prev) => {
          if (prev === 'public-recommendation') return prev;
          return prev === 'landing' ? 'dashboard' : prev;
        });
      })
      .catch(() => {
        loadAdminWorkspace()
          .then(() => {
            setCurrentRoute((prev) => {
              if (prev === 'public-recommendation') return prev;
              return prev === 'landing' ? 'admin-dashboard' : prev;
            });
          })
          .catch(() => api.auth.logout());
      })
      .finally(() => setIsLoadingWorkspace(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time Dashboard Auto-Sync:
  // 1. Silent periodic background polling every 5s while on dashboard
  // 2. Immediate refetch on window focus / tab visibility change
  useEffect(() => {
    if (!user || !getAccessToken()) return;

    const isDashboard = ![
      'landing',
      'login',
      'register',
      'forgot-password',
      'verify-email',
      'public-recommendation',
    ].includes(currentRoute);

    if (!isDashboard) return;

    const syncWorkspace = () => {
      if (document.hidden) return;
      if (user.role === 'admin') {
        loadAdminWorkspace().catch(() => {});
      } else {
        loadAffiliatorWorkspace().catch(() => {});
      }
    };

    // Polling interval: every 2.5 seconds for true live realtime experience
    const intervalId = setInterval(syncWorkspace, 2500);

    // Sync immediately when user switches back to this tab
    const handleFocus = () => syncWorkspace();
    const handleVisibilityChange = () => {
      if (!document.hidden) syncWorkspace();
    };

    // Instant cross-tab sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('aura_realtime_channel');
        channel.onmessage = (e) => {
          if (e.data?.type === 'LEAD_SCANNED' || e.data?.type === 'LEAD_FINALIZED') {
            syncWorkspace();
          }
        };
      } catch {}
    }

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, [user, currentRoute, loadAdminWorkspace, loadAffiliatorWorkspace]);

  // Session expired (refresh token missing/invalid) — reset to a logged-out state.
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setAffiliators([]);
      setProducts([]);
      setMasterCatalog([]);
      setAiPages([]);
      setLeads([]);
      setChartData([]);
      setUndertoneStats([]);
      setConcernStats([]);
      setCurrentRoute((prev) => {
        if (prev === 'public-recommendation' || prev === 'internal-preview') {
          return prev;
        }
        return 'landing';
      });
      addToast('Sesi Berakhir', 'Silakan login kembali untuk melanjutkan.', 'error');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [addToast]);

  const loginAs = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ requires2FA?: boolean; userId?: string; requiresEmailVerification?: boolean } | void> => {
      setIsLoadingWorkspace(true);
      try {
        const response = await api.auth.login(email, password);
        if (response.requires2FA) {
          return { requires2FA: true, userId: response.userId };
        }

        const authUser = response.user!;
        if (authUser.role === 'ADMIN') {
          await loadAdminWorkspace();
          setCurrentRoute('admin-dashboard');
          addToast('Admin Signed In', 'Welcome to Aura Platform Master Dashboard.', 'success');
        } else {
          await loadAffiliatorWorkspace();
          setCurrentRoute('dashboard');
          addToast('Affiliator Signed In', 'Welcome back to your creator dashboard.', 'success');
        }
      } catch (err) {
        if (errorCode(err) === 'EMAIL_NOT_VERIFIED') {
          return { requiresEmailVerification: true };
        }
        addToast('Sign In Failed', errorMessage(err), 'error');
        throw err;
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAdminWorkspace, loadAffiliatorWorkspace],
  );

  const verify2FA = useCallback(
    async (userId: string, token: string) => {
      setIsLoadingWorkspace(true);
      try {
        const { user: authUser } = await api.auth.verify2FA(userId, token);
        if (authUser!.role === 'ADMIN') {
          await loadAdminWorkspace();
          setCurrentRoute('admin-dashboard');
          addToast('Admin Signed In', 'Welcome to Aura Platform Master Dashboard.', 'success');
        } else {
          await loadAffiliatorWorkspace();
          setCurrentRoute('dashboard');
          addToast('Affiliator Signed In', 'Welcome back to your creator dashboard.', 'success');
        }
      } catch (err) {
        addToast('2FA Verification Failed', errorMessage(err), 'error');
        throw err;
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAdminWorkspace, loadAffiliatorWorkspace],
  );

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    setAffiliators([]);
    setProducts([]);
    setMasterCatalog([]);
    setAiPages([]);
    setLeads([]);
    setChartData([]);
    setUndertoneStats([]);
    setConcernStats([]);
    setCurrentRoute('landing');
    addToast('Signed Out', 'You have been successfully logged out.', 'success');
  }, [addToast]);

  const disable2FA = useCallback(async () => {
    try {
      await api.auth.disable2FA();
      addToast('2FA Disabled', 'Two-factor authentication has been turned off.', 'success');
      setUser((prev) => (prev ? { ...prev, isTwoFactorEnabled: false } : prev));
    } catch (err) {
      addToast('Failed to Disable 2FA', errorMessage(err), 'error');
      throw err;
    }
  }, [addToast]);

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<{ requires2FA?: boolean; userId?: string } | void> => {
      setIsLoadingWorkspace(true);
      try {
        const response = await api.auth.google(idToken);
        if (response.requires2FA) {
          return { requires2FA: true, userId: response.userId };
        }

        const authUser = response.user!;
        if (authUser.role === 'ADMIN') {
          await loadAdminWorkspace();
          setCurrentRoute('admin-dashboard');
          addToast('Admin Signed In', 'Welcome to Aura Platform Master Dashboard.', 'success');
        } else {
          await loadAffiliatorWorkspace();
          setCurrentRoute('dashboard');
          addToast('Signed In with Google', 'Welcome to your creator dashboard.', 'success');
        }
      } catch (err) {
        addToast('Google Sign-In Failed', errorMessage(err), 'error');
        throw err;
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAdminWorkspace, loadAffiliatorWorkspace],
  );

  const registerAffiliator = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<{ requiresEmailVerification?: boolean; email?: string; retryAfterSeconds?: number } | void> => {
      setIsLoadingWorkspace(true);
      try {
        const result = await api.auth.register({ email, password, name, accountType: 'AFFILIATOR' });
        if (result.requiresEmailVerification) {
          addToast('Verify Your Email', 'We sent a verification link to your inbox.', 'success');
          return {
            requiresEmailVerification: true,
            email: result.email ?? email,
            retryAfterSeconds: result.retryAfterSeconds,
          };
        }
      } catch (err) {
        addToast('Registration Failed', errorMessage(err), 'error');
        throw err;
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast],
  );

  const verifyEmailToken = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        await api.auth.verifyEmail(token);
        addToast('Email Verified', 'You can now sign in to your account.', 'success');
        return true;
      } catch (err) {
        addToast('Verification Failed', errorMessage(err), 'error');
        return false;
      }
    },
    [addToast],
  );

  const resendVerification = useCallback(
    async (email: string): Promise<{ retryAfterSeconds?: number } | void> => {
      try {
        const result = await api.auth.resendVerification(email);
        addToast('Email Sent', result.message, 'success');
        return { retryAfterSeconds: result.retryAfterSeconds };
      } catch (err) {
        addToast('Failed to Resend', errorMessage(err), 'error');
      }
    },
    [addToast],
  );

  const updateAffiliatorStatus = useCallback(
    async (affiliatorId: string, newStatus: AffiliatorAccount['status']) => {
      try {
        await api.affiliator.adminUpdateStatus(affiliatorId, newStatus);
        setAffiliators((prev) => prev.map((a) => (a.id === affiliatorId ? { ...a, status: newStatus } : a)));
        addToast('Affiliator Status Updated', `Account status set to ${newStatus}.`, 'info');
      } catch (err) {
        addToast('Update Failed', errorMessage(err), 'error');
      }
    },
    [addToast],
  );

  const updateAffiliator = useCallback(
    async (affiliatorId: string, updated: Partial<AffiliatorAccount>) => {
      try {
        await api.affiliator.adminUpdate(affiliatorId, updated);
        setAffiliators((prev) => prev.map((a) => (a.id === affiliatorId ? { ...a, ...updated } : a)));
        addToast('Affiliator Updated', 'Data affiliator berhasil disimpan.', 'success');
      } catch (err) {
        addToast('Update Failed', errorMessage(err), 'error');
      }
    },
    [addToast],
  );

  const deleteAffiliator = useCallback(
    async (affiliatorId: string) => {
      try {
        await api.affiliator.adminDelete(affiliatorId);
        setAffiliators((prev) => prev.filter((a) => a.id !== affiliatorId));
        addToast('Affiliator Deleted', 'Akun affiliator berhasil dihapus.', 'success');
      } catch (err) {
        addToast('Delete Failed', errorMessage(err), 'error');
      }
    },
    [addToast],
  );

  // Public AI Scan state
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [scanResult, setScanResult] = useState<AIAnalysisResult | null>(null);

  const navigateTo = useCallback((route: RouteView, pageSlug?: string) => {
    if (pageSlug) {
      setActivePageSlug(pageSlug);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (getAccessToken()) {
      if ((route === 'dashboard' || route === 'analytics') && user?.role === 'affiliator') {
        loadAffiliatorWorkspace().catch(() => {});
      } else if (route === 'customers') {
        api.leads.list().then((rows) => setLeads(rows.map(mapCustomerLeadDto))).catch(() => {});
      }
    }
  }, [user, loadAffiliatorWorkspace]);

  // Product CRUD — admin writes to the master catalog (/products), affiliators write to their own catalog (/listings).
  const addProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'clicks' | 'conversions' | 'revenueGenerated'>) => {
      if (user?.role === 'admin') {
        try {
          const product = await api.products.adminCreate({
            brand: productData.brand,
            name: productData.name,
            category: productData.category,
            mainCategory: productData.mainCategory,
            price: productData.price,
            originalPrice: productData.originalPrice,
            imageUrl: productData.imageUrl,
            affiliateUrl: productData.affiliateUrl,
            shade: productData.shade,
            suitableSkinTones: productData.suitableSkinTones,
            suitableUndertones: productData.suitableUndertones,
            suitableSkinTypes: productData.suitableSkinTypes,
            targetsConcerns: productData.targetsConcerns,
            matchScoreWeight: productData.matchScoreWeight,
          });
          setProducts((prev) => [mapMasterProductToProduct(product), ...prev]);
          addToast('Product Added!', `"${product.name}" is now in the master catalog.`, 'success');
        } catch (err) {
          addToast('Add Failed', errorMessage(err), 'error');
        }
        return;
      }
      // Manual (custom) product — requires admin approval before going live
      if (!productData.productId) {
        const newCustomProduct: Product = {
          id: `custom-${Date.now()}`,
          ...productData,
          productId: undefined,
          approvalStatus: 'Pending',
          clicks: 0,
          conversions: 0,
          revenueGenerated: 0,
        };
        const currentCustom = getStoredCustomProducts();
        saveStoredCustomProducts([newCustomProduct, ...currentCustom]);
        setProducts((prev) => [newCustomProduct, ...prev]);
        addToast(
          'Product Submitted for Approval',
          `"${newCustomProduct.name}" has been submitted. It will be visible after admin approval.`,
          'info',
        );
        return;
      }

      try {
        const listing = await api.listings.create({
          productId: productData.productId,
          affiliateUrl: productData.affiliateUrl,
        });
        setProducts((prev) => [mapListingToProduct(listing), ...prev]);
        addToast('Product Added!', `"${listing.name}" is now ready for AI matching.`, 'success');
      } catch (err) {
        addToast('Add Failed', errorMessage(err), 'error');
      }
    },
    [addToast, user],
  );

  const updateProduct = useCallback(
    async (id: string, updated: Partial<Product>) => {
      if (id.startsWith('custom-')) {
        const currentCustom = getStoredCustomProducts();
        const updatedCustom = currentCustom.map((p) => (p.id === id ? { ...p, ...updated } : p));
        saveStoredCustomProducts(updatedCustom);
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        addToast('Product Updated', 'Changes saved successfully.', 'info');
        return;
      }
      if (user?.role === 'admin') {
        try {
          const product = await api.products.adminUpdate(id, {
            brand: updated.brand,
            name: updated.name,
            category: updated.category,
            mainCategory: updated.mainCategory,
            price: updated.price,
            originalPrice: updated.originalPrice,
            imageUrl: updated.imageUrl,
            affiliateUrl: updated.affiliateUrl,
            shade: updated.shade,
            suitableSkinTones: updated.suitableSkinTones,
            suitableUndertones: updated.suitableUndertones,
            suitableSkinTypes: updated.suitableSkinTypes,
            targetsConcerns: updated.targetsConcerns,
            matchScoreWeight: updated.matchScoreWeight,
          });
          setProducts((prev) => prev.map((p) => (p.id === id ? mapMasterProductToProduct(product) : p)));
          addToast('Product Updated', 'Changes saved successfully.', 'info');
        } catch (err) {
          addToast('Update Failed', errorMessage(err), 'error');
        }
        return;
      }
      try {
        const body: Record<string, unknown> = {};
        if (updated.affiliateUrl !== undefined) body.affiliateUrl = updated.affiliateUrl;
        if (updated.price !== undefined) body.priceOverride = updated.price;
        if (updated.shade !== undefined) body.shadeOverride = updated.shade;
        if (updated.matchScoreWeight !== undefined) body.matchScoreWeight = updated.matchScoreWeight;
        if (updated.affiliatorNote !== undefined) body.affiliatorNote = updated.affiliatorNote;
        if (updated.status !== undefined) {
          body.status = updated.status === 'Active' ? 'ACTIVE' : updated.status === 'Draft' ? 'DRAFT' : 'OUT_OF_STOCK';
        }

        const listing = await api.listings.update(id, body);
        setProducts((prev) => prev.map((p) => (p.id === id ? mapListingToProduct(listing) : p)));
        addToast('Product Updated', 'Changes saved successfully.', 'info');
      } catch (err) {
        addToast('Update Failed', errorMessage(err), 'error');
      }
    },
    [addToast, user],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const prod = products.find((p) => p.id === id);
      if (id.startsWith('custom-')) {
        const currentCustom = getStoredCustomProducts();
        saveStoredCustomProducts(currentCustom.filter(p => p.id !== id));
        setProducts((prev) => prev.filter((p) => p.id !== id));
        addToast('Product Removed', prod ? `"${prod.name}" was deleted.` : 'Product deleted.', 'info');
        return;
      }

      if (user?.role === 'admin') {
        try {
          await api.products.adminDelete(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          addToast('Product Removed', prod ? `"${prod.name}" was deactivated.` : 'Product deactivated.', 'info');
        } catch (err) {
          addToast('Delete Failed', errorMessage(err), 'error');
        }
        return;
      }
      try {
        await api.listings.remove(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        addToast('Product Removed', prod ? `"${prod.name}" was deleted.` : 'Product removed.', 'info');
      } catch (err) {
        addToast('Delete Failed', errorMessage(err), 'error');
      }
    },
    [products, addToast, user],
  );

  // Update approval status for a custom product (admin only)
  const updateProductApproval = useCallback(
    async (id: string, approvalStatus: 'Approved' | 'Rejected') => {
      if (user?.role !== 'admin') return;
      
      // Update state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, approvalStatus } : p))
      );

      // Persist in localStorage
      const currentCustom = getStoredCustomProducts();
      const updatedCustom = currentCustom.map((p) =>
        p.id === id ? { ...p, approvalStatus } : p
      );
      saveStoredCustomProducts(updatedCustom);

      const prod = products.find((p) => p.id === id);
      const statusLabel = approvalStatus === 'Approved' ? 'approved' : 'rejected';
      addToast(
        `Product ${approvalStatus}`,
        `"${prod?.name ?? 'Product'}" has been ${statusLabel}.`,
        approvalStatus === 'Approved' ? 'success' : 'error',
      );
    },
    [products, addToast, user],
  );

  const updateAIPage = useCallback(
    async (pageId: string, updated: Partial<AIPageConfig>) => {
      try {
        const body: Record<string, unknown> = { ...updated };
        if (updated.status) body.status = updated.status === 'Published' ? 'PUBLISHED' : 'DRAFT';
        if (updated.featuredProductIds) body.featuredListingIds = updated.featuredProductIds;
        const page = await api.aiPages.update(pageId, body);
        setAiPages((prev) => prev.map((p) => (p.id === pageId ? mapAIPageDto(page) : p)));
        addToast('AI Page Saved', 'Your custom branding and preferences are live.', 'success');
      } catch (err) {
        addToast('Save Failed', errorMessage(err), 'error');
      }
    },
    [addToast],
  );

  // Profile Update
  const updateProfile = useCallback(
    async (updated: Partial<UserProfile>) => {
      if (user?.role === 'admin') {
        setUser((prev) => (prev ? { ...prev, ...updated } : prev));
        addToast('Profile Updated', 'Admin profile changes are local-only in this demo.', 'info');
        return;
      }
      try {
        const profile = await api.affiliator.update(updated as Record<string, unknown>);
        setUser(mapAffiliatorToUserProfile(profile, 'affiliator'));
        addToast('Profile Updated', 'Your settings have been saved.', 'success');
      } catch (err) {
        addToast('Update Failed', errorMessage(err), 'error');
      }
    },
    [addToast, user],
  );

  // Avatar Upload — uploads to storage and persists avatarUrl in one request.
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (user?.role === 'admin') {
        addToast('Not Available', 'Admin avatar changes are local-only in this demo.', 'info');
        return;
      }
      try {
        const profile = await api.affiliator.uploadAvatar(file);
        setUser(mapAffiliatorToUserProfile(profile, 'affiliator'));
        addToast('Avatar Updated', 'Your new profile photo is live.', 'success');
      } catch (err) {
        addToast('Upload Failed', errorMessage(err), 'error');
      }
    },
    [addToast, user],
  );

  // Generate new API Key
  const regenerateApiKey = useCallback(async () => {
    if (user?.role === 'admin') {
      addToast('Not Available', 'Admin accounts do not have an API key.', 'error');
      return;
    }
    try {
      const profile = await api.affiliator.regenerateApiKey();
      setUser(mapAffiliatorToUserProfile(profile, 'affiliator'));
      addToast('API Key Re-generated', 'Make sure to update your integrations with the new key.', 'info');
    } catch (err) {
      addToast('Regenerate Failed', errorMessage(err), 'error');
    }
  }, [addToast, user]);

  // Public Selfie Scan — real AI scan via POST /leads for the active AIPage slug.
  const startSelfieScan = useCallback(
    async (
      imageSrc: string,
      skinPref?: string,
      finishPref?: string,
      budgetPref?: string,
      isUpload: boolean = false,
      currentSlug?: string,
    ): Promise<boolean> => {
      setScannedImage(imageSrc);
      setIsAnalyzing(true);
      setAnalysisStep(1);
      setScanResult(null);

      const targetSlug = (currentSlug || activePageSlug || 'kate-glow').replace(/^\/+/, '');

      try {
        const blob = await (await fetch(imageSrc)).blob();
        const form = new FormData();
        form.append('slug', targetSlug);
        form.append('image', blob, 'scan.jpg');
        if (skinPref) form.append('skinPref', skinPref);
        if (finishPref) form.append('finishPref', finishPref);
        if (budgetPref) form.append('budgetPref', budgetPref);

        const result = await api.leads.submit(form);
        setScanResult(mapScanResultDto(result));
        setAnalysisStep(4);

        if (getAccessToken()) {
          const leadRows = await api.leads.list().catch(() => null);
          if (leadRows) setLeads(leadRows.map(mapCustomerLeadDto));
        }

        // Notify other tabs in realtime
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const ch = new BroadcastChannel('aura_realtime_channel');
            ch.postMessage({ type: 'LEAD_SCANNED' });
            ch.close();
          } catch {}
        }
        return true;
      } catch (err: unknown) {
        // Cek jika error validasi wajah / warna kulit dari Backend (HTTP 422 atau pesan penolakan)
        const axiosErr = err as { response?: { status?: number; data?: { error?: { message?: string }; message?: string } }; message?: string };
        const status = axiosErr?.response?.status;
        const errMsg = axiosErr?.response?.data?.error?.message || axiosErr?.response?.data?.message || axiosErr?.message || '';
        const isFaceValidationError = status === 422 || /wajah|face|kulit|pigmen|proporsi|alien|anomali|skintone|undertone/i.test(errMsg);

        // Any scan failure is a real rejection — never fabricate a fake successful
        // result, otherwise scans that were actually rejected (or never persisted)
        // would look "detected" to the user and dashboard counts would be wrong.
        console.warn('Scan rejected or failed:', errMsg || err);
        setScanResult(null);
        setScannedImage(null);
        setAnalysisStep(0);
        addToast(
          isFaceValidationError ? 'Wajah Tidak Terdeteksi' : 'Scan Gagal',
          isFaceValidationError
            ? (errMsg || 'Foto yang Anda unggah bukan wajah manusia yang valid. Mohon unggah foto selfie yang jelas.')
            : 'Terjadi kesalahan saat memproses scan. Silakan coba lagi.',
          'error'
        );
        return false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [activePageSlug, addToast],
  );

  const finalizeLeadProfile = useCallback(
    async (data: { followerName: string; age?: number | string; followerHandle?: string; email?: string; leadId?: string }): Promise<void> => {
      try {
        const activeLeadId = data.leadId || scanResult?.leadId;
        if (activeLeadId) {
          await api.leads.updateProfile(activeLeadId, {
            followerName: data.followerName,
            followerHandle: data.followerHandle,
            email: data.email,
            age: data.age,
          });
        }
        if (getAccessToken()) {
          const leadRows = await api.leads.list().catch(() => null);
          if (leadRows) setLeads(leadRows.map(mapCustomerLeadDto));
        }

        // Notify other tabs in realtime
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          try {
            const ch = new BroadcastChannel('aura_realtime_channel');
            ch.postMessage({ type: 'LEAD_FINALIZED' });
            ch.close();
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to finalize lead profile:', err);
      }
    },
    [scanResult?.leadId],
  );

  const resetScan = useCallback(() => {
    setScannedImage(null);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    setScanResult(null);
  }, []);

  const recordAffiliateClick = useCallback(
    async (listingId: string, leadId?: string) => {
      try {
        await api.leads.recordClick(listingId, leadId);
      } catch {
        // best-effort — clicking through to the affiliate link should not be blocked by tracking failures
      }
    },
    [],
  );

  return {
    currentRoute,
    navigateTo,
    user: user ?? GUEST_USER,
    loginAs,
    verify2FA,
    logout,
    disable2FA,
    loginWithGoogle,
    registerAffiliator,
    emailVerifyToken,
    verifyEmailToken,
    resendVerification,
    affiliators,
    updateAffiliatorStatus,
    updateAffiliator,
    deleteAffiliator,
    updateProfile,
    uploadAvatar,
    regenerateApiKey,
    products,
    masterCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductApproval,
    aiPages,
    activePageSlug,
    updateAIPage,
    leads,
    analytics,
    chartData,
    undertoneStats,
    concernStats,
    toasts,
    addToast,
    removeToast,
    isLoadingWorkspace,
    // Scan states
    scannedImage,
    isAnalyzing,
    analysisStep,
    scanResult,
    startSelfieScan,
    finalizeLeadProfile,
    resetScan,
    recordAffiliateClick,
    reloadWorkspace: loadAffiliatorWorkspace,
  };
}
