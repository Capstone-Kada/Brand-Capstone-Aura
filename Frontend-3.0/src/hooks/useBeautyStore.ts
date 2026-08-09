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

export function useBeautyStore() {
  const [currentRoute, setCurrentRoute] = useState<RouteView>('landing');
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
  const [activePageSlug, setActivePageSlug] = useState<string>('kate-glow');

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
    setProducts(listings.map(mapListingToProduct));
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
    setProducts(masterProducts.map(mapMasterProductToProduct));
    setAffiliators(affiliatorRows.map(mapAffiliatorToAccount));
  }, []);

  // Restore session (data + route) on page refresh if a token is already stored.
  useEffect(() => {
    if (!getAccessToken()) return;
    setIsLoadingWorkspace(true);
    loadAffiliatorWorkspace()
      .then(() => setCurrentRoute((prev) => (prev === 'landing' ? 'dashboard' : prev)))
      .catch(() => {
        loadAdminWorkspace()
          .then(() => setCurrentRoute((prev) => (prev === 'landing' ? 'admin-dashboard' : prev)))
          .catch(() => api.auth.logout());
      })
      .finally(() => setIsLoadingWorkspace(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setCurrentRoute('landing');
      addToast('Sesi Berakhir', 'Silakan login kembali untuk melanjutkan.', 'error');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [addToast]);

  const loginAs = useCallback(
    async (email: string, password: string) => {
      setIsLoadingWorkspace(true);
      try {
        const { user: authUser } = await api.auth.login(email, password);
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
        addToast('Sign In Failed', errorMessage(err), 'error');
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAdminWorkspace, loadAffiliatorWorkspace],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      setIsLoadingWorkspace(true);
      try {
        const { user: authUser } = await api.auth.google(idToken);
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
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAdminWorkspace, loadAffiliatorWorkspace],
  );

  const registerAffiliator = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoadingWorkspace(true);
      try {
        await api.auth.register({ email, password, name, accountType: 'AFFILIATOR' });
        await loadAffiliatorWorkspace();
        setCurrentRoute('dashboard');
        addToast('Account Created', 'Your affiliator dashboard is ready — pending admin approval.', 'success');
      } catch (err) {
        addToast('Registration Failed', errorMessage(err), 'error');
      } finally {
        setIsLoadingWorkspace(false);
      }
    },
    [addToast, loadAffiliatorWorkspace],
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
  }, []);

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
      if (!productData.productId) {
        addToast(
          'Pilih Produk dari Master Catalog',
          'Menambah produk custom di luar master catalog belum didukung — pilih salah satu dari "Auto-Fill dari Master Product Catalog" dulu.',
          'error',
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

  // AI Page Config update
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
    (imageSrc: string) => {
      setScannedImage(imageSrc);
      setIsAnalyzing(true);
      setAnalysisStep(1);
      setScanResult(null);

      void (async () => {
        try {
          const blob = await (await fetch(imageSrc)).blob();
          const form = new FormData();
          form.append('slug', activePageSlug);
          form.append('image', blob, 'scan.jpg');

          const result = await api.leads.submit(form);
          setScanResult(mapScanResultDto(result));
          setAnalysisStep(4);

          const leadRows = await api.leads.list().catch(() => null);
          if (leadRows) setLeads(leadRows.map(mapCustomerLeadDto));
        } catch (err) {
          addToast('Scan Failed', errorMessage(err), 'error');
        } finally {
          setIsAnalyzing(false);
        }
      })();
    },
    [activePageSlug, addToast],
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
    loginWithGoogle,
    registerAffiliator,
    affiliators,
    updateAffiliatorStatus,
    updateAffiliator,
    updateProfile,
    regenerateApiKey,
    products,
    masterCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
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
    resetScan,
    recordAffiliateClick,
  };
}
