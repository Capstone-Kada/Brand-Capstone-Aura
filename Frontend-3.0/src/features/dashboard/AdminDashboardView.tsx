import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  ShoppingBag, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  MousePointerClick, 
  Layers,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Camera,
  Link2,
  Upload
} from 'lucide-react';
import { Product, AffiliatorAccount, SkinTone, Undertone, SkinType, SkinConcern } from '../../types';
import { Card, Button, Input, Badge, Avatar, Modal } from '../../components/ui/UIComponents';

const ProductThumb: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-zinc-100 shrink-0 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

interface AdminDashboardViewProps {
  products: Product[];
  affiliators: AffiliatorAccount[];
  onAddProduct: (prod: Omit<Product, 'id' | 'clicks' | 'conversions' | 'revenueGenerated'>) => void;
  onUpdateProduct: (id: string, prod: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateAffiliatorStatus: (id: string, status: AffiliatorAccount['status']) => void;
  onUpdateAffiliator?: (id: string, updated: Partial<AffiliatorAccount>) => void;
  onDeleteAffiliator?: (id: string) => void;
  onUpdateProductApproval?: (id: string, status: 'Approved' | 'Rejected') => void;
  activeTab?: 'overview' | 'products' | 'affiliators' | 'analytics';
  onNavigateTab?: (tab: 'overview' | 'products' | 'affiliators' | 'analytics') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  affiliators,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateAffiliatorStatus,
  onUpdateAffiliator,
  onDeleteAffiliator,
  onUpdateProductApproval,
  activeTab = 'overview',
  onNavigateTab
}) => {
  // Local active tab control if props not controlling
  const [currentTab, setCurrentTab] = useState<'overview' | 'products' | 'affiliators' | 'analytics'>(activeTab);
  
  React.useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  
  const setTab = (t: 'overview' | 'products' | 'affiliators' | 'analytics') => {
    setCurrentTab(t);
    if (onNavigateTab) onNavigateTab(t);
  };

  // Product modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(null);
  const [productSubTab, setProductSubTab] = useState<'active' | 'requests'>('active');
  const [adminImageUploadType, setAdminImageUploadType] = useState<'url' | 'file'>('url');
  
  // Product Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form states for product CRUD
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Product['category']>('Foundation');
  const [price, setPrice] = useState('35.00');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600');
  const [affiliateUrl, setAffiliateUrl] = useState('https://amzn.to/example_master');
  const [shade, setShade] = useState('Universal');

  const handleAdminFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Affiliator Search & Filter
  const [affiliatorSearch, setAffiliatorSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Affiliator Modal states
  const [editingAffiliator, setEditingAffiliator] = useState<AffiliatorAccount | null>(null);
  const [previewAffiliator, setPreviewAffiliator] = useState<AffiliatorAccount | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form state for editing affiliator
  const [editAffName, setEditAffName] = useState('');
  const [editAffHandle, setEditAffHandle] = useState('');
  const [editAffEmail, setEditAffEmail] = useState('');
  const [editAffNiche, setEditAffNiche] = useState('');
  const [editAffTier, setEditAffTier] = useState<'Starter' | 'Pro' | 'Elite'>('Starter');
  const [editAffFollowers, setEditAffFollowers] = useState('');
  const [editAffScans, setEditAffScans] = useState('0');
  const [editAffClicks, setEditAffClicks] = useState('0');
  const [editAffStatus, setEditAffStatus] = useState<AffiliatorAccount['status']>('Approved');

  const handleOpenEditAffiliator = (aff: AffiliatorAccount) => {
    setEditingAffiliator(aff);
    setEditAffName(aff.name);
    setEditAffHandle(aff.handle);
    setEditAffEmail(aff.email);
    setEditAffNiche(aff.niche);
    setEditAffTier(aff.tier || 'Starter');
    setEditAffFollowers(aff.followersCount || '0');
    setEditAffScans(aff.totalScansGenerated.toString());
    setEditAffClicks(aff.totalClicksGenerated.toString());
    setEditAffStatus(aff.status);
  };

  const handleSaveAffiliator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAffiliator) return;
    
    if (onUpdateAffiliator) {
      onUpdateAffiliator(editingAffiliator.id, {
        name: editAffName,
        handle: editAffHandle,
        email: editAffEmail,
        niche: editAffNiche,
        tier: editAffTier,
        followersCount: editAffFollowers,
        totalScansGenerated: parseInt(editAffScans) || 0,
        totalClicksGenerated: parseInt(editAffClicks) || 0,
        status: editAffStatus,
      });
    } else {
      onUpdateAffiliatorStatus(editingAffiliator.id, editAffStatus);
    }
    setEditingAffiliator(null);
  };

  const handleCopyPreviewLink = (handle: string) => {
    const url = `${window.location.origin}/?page=${handle.replace('@', '')}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Stats
  const pendingApprovals = affiliators.filter(a => a.status === 'Pending Approval');
  const approvedAffiliators = affiliators.filter(a => a.status === 'Approved');
  const totalSystemClicks = affiliators.reduce((acc, curr) => acc + curr.totalClicksGenerated, 0);

  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setName('');
    setBrand('');
    setCategory('Foundation');
    setPrice('35.00');
    setImageUrl('https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600');
    setAffiliateUrl('https://sephora.com/aff/master_brand');
    setShade('Universal Shade');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setBrand(prod.brand);
    setCategory(prod.category);
    setPrice(prod.price.toString());
    setImageUrl(prod.imageUrl);
    setAffiliateUrl(prod.affiliateUrl);
    setShade(prod.shade || 'Universal');
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      onUpdateProduct(editingProductId, {
        name,
        brand,
        category,
        price: parseFloat(price) || 0,
        imageUrl,
        affiliateUrl,
        shade
      });
    } else {
      onAddProduct({
        name,
        brand,
        category,
        price: parseFloat(price) || 0,
        imageUrl,
        affiliateUrl,
        shade,
        suitableSkinTones: ['Light', 'Medium', 'Tan'],
        suitableUndertones: ['Warm', 'Neutral'],
        suitableSkinTypes: ['Combination', 'Normal'],
        targetsConcerns: ['Dullness', 'Dryness & Flaking'],
        matchScoreWeight: 95,
        status: 'Active'
      });
    }
    setIsAddModalOpen(false);
  };

  const pendingProducts = products.filter((p) => p.approvalStatus === 'Pending');
  const activeProducts = products.filter((p) => p.approvalStatus !== 'Pending' && p.approvalStatus !== 'Rejected');

  const filteredProducts = activeProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredAffiliators = affiliators.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(affiliatorSearch.toLowerCase()) || a.handle.toLowerCase().includes(affiliatorSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Platform Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="p-5 space-y-2 border-zinc-200">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Affiliator</span>
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">{affiliators.length} Creator</div>
              <p className="text-[11px] text-zinc-500 font-normal">{approvedAffiliators.length} Akun Aktif</p>
            </Card>

            <Card className="p-5 space-y-2 border-zinc-200">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Master Katalog</span>
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">{products.length} Produk</div>
              <p className="text-[11px] text-zinc-500 font-normal">Siap diimpor oleh affiliator</p>
            </Card>

            <Card className="p-5 space-y-2 border-zinc-200">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total AI Scan</span>
                <Sparkles className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">
                {affiliators.reduce((acc, a) => acc + a.totalScansGenerated, 0).toLocaleString()} Scans
              </div>
              <p className="text-[11px] text-zinc-500 font-normal">Dari seluruh link AI creator</p>
            </Card>

            <Card className="p-5 space-y-2 border-transparent bg-gradient-to-br from-pink-50 to-purple-50/60 shadow-sm">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Outbound Link Clicks</span>
                <MousePointerClick className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="text-2xl font-black text-[var(--primary)]">{totalSystemClicks.toLocaleString()} Clicks</div>
              <p className="text-[11px] text-zinc-500 font-normal">Total akumulasi klik affiliate</p>
            </Card>
          </div>

          {/* Grafik Tren Performa (Platform Activity Trend) */}
          <Card className="p-6 space-y-4 border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900">Grafik Tren Performa (Platform Activity Trend)</h3>
                  <Badge variant="primary" size="sm">Real-time 7 Hari Terakhir</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pertumbuhan akumulasi aktivitas AI Scan selfie dan Outbound Affiliate Link Clicks di seluruh platform.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
                  <span>AI Scans</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[var(--primary)]"></span>
                  <span>Outbound Clicks</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { date: '1 Agu', scans: 1420, clicks: 890 },
                    { date: '2 Agu', scans: 1850, clicks: 1120 },
                    { date: '3 Agu', scans: 2300, clicks: 1440 },
                    { date: '4 Agu', scans: 2980, clicks: 1820 },
                    { date: '5 Agu', scans: 3600, clicks: 2250 },
                    { date: '6 Agu', scans: 4250, clicks: 2710 },
                    { date: '7 Agu', scans: 5120, clicks: 3180 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="scans" name="AI Scans" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#scansGradient)" />
                  <Area type="monotone" dataKey="clicks" name="Outbound Clicks" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#clicksGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Affiliators Leaderboard Section */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Affiliator Teratas (Top Performer)</h3>
                <p className="text-xs text-zinc-500">Beauty creator dengan kontribusi AI Scan dan Outbound Clicks tertinggi.</p>
              </div>
              <Button onClick={() => setTab('affiliators')} variant="outline" size="sm">
                Lihat Direktori ({affiliators.length})
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Peringkat</th>
                    <th className="py-3 px-4">Beauty Creator</th>
                    <th className="py-3 px-4">Scans Driven</th>
                    <th className="py-3 px-4">Outbound Clicks</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[...affiliators]
                    .sort((a, b) => b.totalClicksGenerated - a.totalClicksGenerated)
                    .slice(0, 4)
                    .map((aff, idx) => (
                      <tr key={aff.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' :
                            idx === 1 ? 'bg-zinc-200 text-zinc-700' :
                            idx === 2 ? 'bg-amber-800/10 text-amber-900' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={aff.avatarUrl} name={aff.name} size="sm" />
                            <div>
                              <h4 className="font-bold text-zinc-900">{aff.name}</h4>
                              <p className="text-[11px] text-zinc-400">{aff.handle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-zinc-900">
                          {aff.totalScansGenerated.toLocaleString()} Scans
                        </td>
                        <td className="py-3 px-4 font-bold text-[var(--primary)]">
                          {aff.totalClicksGenerated.toLocaleString()} Clicks
                        </td>
                        <td className="py-3 px-4">
                          {aff.status === 'Approved' ? (
                            <Badge variant="success">Aktif</Badge>
                          ) : (
                            <Badge variant="danger">Non-Aktif</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setPreviewAffiliator(aff)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-pink-50 hover:border-pink-200 text-[var(--primary)] text-[11px] font-semibold transition-colors cursor-pointer active:scale-95"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Approvals Alert */}
          {products.filter((p) => p.approvalStatus === 'Pending').length > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50/60">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="text-sm font-bold text-amber-900">
                      {products.filter((p) => p.approvalStatus === 'Pending').length} Product(s) Awaiting Approval
                    </p>
                    <p className="text-xs text-amber-700">Affiliators have submitted custom products that need your review.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setProductSubTab('requests');
                    setTab('products');
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  Review Now →
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Master Product Overview */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-zinc-900">Katalog Produk Master Terpopuler</h3>
                <p className="text-xs text-zinc-500">Produk-produk kecantikan yang tersedia dalam katalog utama platform.</p>
              </div>
              <Button onClick={() => setTab('products')} variant="outline" size="sm">
                Kelola Semua ({products.length})
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 3).map((prod) => (
                <div key={prod.id} className="p-3.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 flex gap-3 items-center">
                  <ProductThumb src={prod.imageUrl} alt={prod.name} className="w-14 h-14 rounded-xl border border-zinc-200" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{prod.brand}</span>
                    <h4 className="text-xs font-bold text-zinc-900 truncate">{prod.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-[var(--primary)]">Rp {prod.price.toLocaleString('id-ID')}</span>
                      <Badge variant="outline" size="sm">{prod.category}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      )}

      {/* PRODUCTS TAB - MASTER CRUD */}
      {currentTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Master Products</h2>
              <p className="text-xs text-zinc-500">Kelola katalog master dan review pengajuan produk manual dari affiliator.</p>
            </div>

            {productSubTab === 'active' && (
              <Button onClick={handleOpenAddModal} variant="primary" icon={<Plus className="w-4 h-4" />}>
                Add Product to Master Database
              </Button>
            )}
          </div>

          {/* Sub-Tab Navigation Switcher */}
          <div className="flex items-center gap-1 p-1 bg-zinc-200/50 rounded-2xl w-fit border border-black/[0.04]">
            <button
              onClick={() => setProductSubTab('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                productSubTab === 'active'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs border border-black/[0.04]'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-800 font-medium hover:bg-white/40 border-none'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Active Products</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                productSubTab === 'active' ? 'bg-zinc-100 text-zinc-800' : 'bg-black/[0.05] text-zinc-500'
              }`}>
                {activeProducts.length}
              </span>
            </button>

            <button
              onClick={() => setProductSubTab('requests')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                productSubTab === 'requests'
                  ? 'bg-white text-zinc-900 font-bold shadow-xs border border-black/[0.04]'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-800 font-medium hover:bg-white/40 border-none'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Request Products</span>
              {pendingProducts.length > 0 ? (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  productSubTab === 'requests' ? 'bg-[#F26CA7] text-white shadow-xs' : 'bg-[#F26CA7]/20 text-[#F26CA7]'
                }`}>
                  {pendingProducts.length}
                </span>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  productSubTab === 'requests' ? 'bg-zinc-100 text-zinc-800' : 'bg-black/[0.05] text-zinc-500'
                }`}>
                  0
                </span>
              )}
            </button>
          </div>

          {/* ── SUB-TAB: REQUEST PRODUCTS ── */}
          {productSubTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                    <span>Pengajuan Produk Affiliator</span>
                    <Badge variant={pendingProducts.length > 0 ? "warning" : "success"}>
                      {pendingProducts.length > 0 ? `${pendingProducts.length} Menunggu Review` : 'Semua Sudah Ditinjau'}
                    </Badge>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Produk yang diinput mandiri oleh affiliator membutuhkan persetujuan Admin agar dapat aktif dan direkomendasikan di scanner AI.
                  </p>
                </div>
              </div>

              {pendingProducts.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-zinc-200 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900">Tidak Ada Pengajuan Produk Pending</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Seluruh produk manual dari affiliator telah diproses. Pengajuan baru akan otomatis masuk ke tab ini.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingProducts.map((prod) => (
                    <Card key={prod.id} className="p-4 border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/50 transition-colors">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <ProductThumb src={prod.imageUrl} alt={prod.name} className="w-16 h-16 rounded-2xl border border-amber-200" />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{prod.brand}</span>
                              <Badge variant="outline" size="sm">{prod.category}</Badge>
                              {prod.shade && <span className="text-[11px] text-zinc-500 font-medium">• {prod.shade}</span>}
                            </div>
                            <h4 className="text-sm font-bold text-zinc-900 truncate">{prod.name}</h4>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-extrabold text-[var(--primary)]">Rp {prod.price.toLocaleString('id-ID')}</span>
                              {prod.affiliateUrl && (
                                <a
                                  href={prod.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-zinc-500 hover:text-zinc-900 underline flex items-center gap-1 text-[11px]"
                                >
                                  <span>Link Affiliate</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {prod.affiliatorNote && (
                              <p className="text-[11px] text-zinc-500 italic">
                                Catatan / Ingredients: {prod.affiliatorNote}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                          <button
                            onClick={() => onUpdateProductApproval?.(prod.id, 'Approved')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            ✓ Setujui (Approve)
                          </button>
                          <button
                            onClick={() => setRejectingProductId(prod.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
                          >
                            ✗ Tolak (Reject)
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUB-TAB: ACTIVE PRODUCTS ── */}
          {productSubTab === 'active' && (
            <div className="space-y-4">
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search master products by name or brand..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Concealer">Concealer</option>
                  <option value="Blush">Blush</option>
                  <option value="Lipstick">Lipstick</option>
                  <option value="Mascara">Mascara</option>
                  <option value="Powder">Powder</option>
                  <option value="Primer">Primer</option>
                  <option value="Serum">Serum</option>
                  <option value="Moisturizer">Moisturizer</option>
                  <option value="Sunscreen">Sunscreen</option>
                </select>
              </div>

          {/* Products Table */}
          <Card className="overflow-hidden border-zinc-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Product Info</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Default Master Link</th>
                    <th className="py-3.5 px-4">Shade / Variant</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ProductThumb src={prod.imageUrl} alt={prod.name} className="w-10 h-10 rounded-lg border border-zinc-200" />
                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{prod.brand}</span>
                            <h4 className="font-bold text-zinc-900 max-w-xs truncate">{prod.name}</h4>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline">{prod.category}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={prod.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] font-semibold hover:underline flex items-center gap-1 max-w-[160px] truncate"
                        >
                          <span className="truncate">{prod.affiliateUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-600 font-medium">
                        {prod.shade || 'Universal'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer active:scale-90"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-90"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )}

  {/* AFFILIATORS TAB */}
      {currentTab === 'affiliators' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Daftar Affiliator Terdaftar</h2>
              <p className="text-xs text-zinc-500">Direktori seluruh beauty creator yang aktif di platform beserta performa follower scan dan affiliate clicks.</p>
            </div>
            <div className="bg-pink-50 border border-pink-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[var(--primary)]">
              Total {affiliators.length} Affiliators
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari affiliator berdasarkan nama, handle, atau email..."
                value={affiliatorSearch}
                onChange={(e) => setAffiliatorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="Approved">Aktif</option>
              <option value="Rejected">Non-Aktif / Suspended</option>
            </select>
          </div>

          {/* Affiliators List Card */}
          <Card className="overflow-hidden border-zinc-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Beauty Creator</th>
                    <th className="py-3.5 px-4">Scans Driven</th>
                    <th className="py-3.5 px-4">Outbound Clicks</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4">Link Preview</th>
                    <th className="py-3.5 px-4 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredAffiliators.map((aff) => (
                    <tr key={aff.id} className="hover:bg-zinc-50/80 transition-colors">
                      {/* 1. Beauty Creator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={aff.avatarUrl} name={aff.name} size="md" />
                          <div>
                            <h4 className="font-bold text-zinc-900">{aff.name}</h4>
                            <p className="text-[11px] text-zinc-400">{aff.handle} • {aff.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Scans Driven */}
                      <td className="py-3.5 px-4 font-bold text-zinc-900">
                        <span>{aff.totalScansGenerated.toLocaleString()} Scans</span>
                      </td>

                      {/* 3. Outbound Clicks */}
                      <td className="py-3.5 px-4 font-bold text-[var(--primary)]">
                        <span>{aff.totalClicksGenerated.toLocaleString()} Clicks</span>
                      </td>

                      {/* 4. Status Akun */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onUpdateAffiliatorStatus(aff.id, aff.status === 'Approved' ? 'Rejected' : 'Approved')}
                          title="Klik untuk ubah status"
                          className="cursor-pointer group inline-flex items-center gap-1.5 active:scale-95 transition-transform"
                        >
                          {aff.status === 'Approved' ? (
                            <Badge variant="success">
                              <Check className="w-3 h-3 mr-1 inline" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="danger">
                              <XCircle className="w-3 h-3 mr-1 inline" />
                              Non-Aktif
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* 5. Link Preview */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setPreviewAffiliator(aff)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-pink-50 hover:border-pink-200 text-[var(--primary)] text-xs font-semibold transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Link Preview
                        </button>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditAffiliator(aff)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Yakin ingin menghapus akun ${aff.name}?`)) {
                                onDeleteAffiliator?.(aff.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium transition-colors cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ANALYTICS RECOMMENDATION TAB */}
      {currentTab === 'analytics' && (
        <div className="space-y-8">
          
          {/* Header & Metric Cards */}
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Platform Analytics & Intelligence</h2>
            <p className="text-xs text-zinc-500">Performa AI scan, analisis produk & kategori makeup terfavorit, serta leaderboard affiliator teratas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 space-y-2 border-transparent bg-gradient-to-br from-pink-50 to-purple-50/60 shadow-sm">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Jumlah AI Scan</span>
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              </div>
              <div className="text-2xl font-black text-[var(--primary)]">30,640 Scans</div>
              <p className="text-[11px] text-emerald-600 font-semibold">+31.5% vs bulan lalu</p>
            </Card>

            <Card className="p-5 space-y-2 border-zinc-200">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Jumlah Affiliator</span>
                <Users className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">{affiliators.length} Creators</div>
              <p className="text-[11px] text-zinc-500 font-normal">{approvedAffiliators.length} Disetujui • {pendingApprovals.length} Pending</p>
            </Card>

            <Card className="p-5 space-y-2 border-zinc-200">
              <div className="flex justify-between items-center text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Click Link</span>
                <MousePointerClick className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-xl font-bold text-zinc-900">20,590 Clicks</div>
              <p className="text-[11px] text-emerald-600 font-semibold">+28.4% Outbound CTR</p>
            </Card>
          </div>

          {/* Section 1: Analisis Kategori & Produk Makeup Terfavorit (Base on Click Link Terbanyak) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Kategori Makeup Terfavorit */}
            <Card className="lg:col-span-5 p-6 space-y-5 border-zinc-200">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-900">Analisis Kategori Makeup Terfavorit</h3>
                  <Badge variant="primary" size="sm">Base on Click Link</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Kategori makeup yang paling banyak diklik link affiliate-nya oleh follower setelah hasil AI scan.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {[
                  { category: 'Foundation & Cushion', clicks: 4280, share: 28.5, color: 'var(--primary)' },
                  { category: 'Blush & Cheek Tint', clicks: 3890, share: 25.9, color: '#EC4899' },
                  { category: 'Concealer', clicks: 3120, share: 20.8, color: '#8B5CF6' },
                  { category: 'Primer & Setting Spray', clicks: 2850, share: 19.0, color: '#3B82F6' },
                  { category: 'Lipstick & Lip Tint', clicks: 2410, share: 16.1, color: '#10B981' },
                  { category: 'Mascara & Eyewear', clicks: 1980, share: 13.2, color: '#F59E0B' },
                ].map((item, idx) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-zinc-800">{idx + 1}. {item.category}</span>
                      <span className="text-zinc-900">{item.clicks.toLocaleString()} clicks <span className="text-zinc-400 font-normal">({item.share}%)</span></span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full w-full rounded-full origin-left"
                        style={{ backgroundColor: item.color }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: Math.min(item.share * 2.5, 100) / 100 }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right: Produk Makeup Terfavorit (Ranked by Clicks) */}
            <Card className="lg:col-span-7 p-6 space-y-4 border-zinc-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Produk Makeup Terfavorit (Top Clicks)</h3>
                  <p className="text-xs text-zinc-500">Ranking produk makeup berdasarkan jumlah click link affiliate terbanyak.</p>
                </div>
                <span className="text-xs font-bold text-[var(--primary)] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
                  Top Performing
                </span>
              </div>

              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-500 uppercase tracking-wider text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Produk Makeup</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Harga</th>
                      <th className="py-3 px-3 text-right">Click Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-medium">
                    {products.slice().sort((a, b) => b.clicks - a.clicks).map((prod, idx) => (
                      <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' :
                            idx === 1 ? 'bg-zinc-200 text-zinc-700' :
                            idx === 2 ? 'bg-amber-800/10 text-amber-900' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <ProductThumb src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg border border-zinc-200" />
                            <div className="min-w-0 max-w-[180px]">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase block">{prod.brand}</span>
                              <p className="font-bold text-zinc-900 truncate">{prod.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" size="sm">{prod.category}</Badge>
                        </td>
                        <td className="py-3 px-3 font-bold text-zinc-900">
                          Rp {prod.price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-[var(--primary)] text-sm">{prod.clicks.toLocaleString()}</span>
                          <span className="text-[10px] text-zinc-400 block font-normal">clicks</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          {/* Section 2: Leaderboard Affiliator / Beauty Creator Teratas (Base on Jumlah AI Scan & Click Link Terbanyak) */}
          <Card className="p-6 space-y-5 border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-zinc-900">Leaderboard Affiliator / Beauty Creator Teratas</h3>
                  <Badge variant="success" size="sm">Real-time Ranking</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Peringkat creator teratas berdasarkan <span className="font-bold text-zinc-800">Jumlah AI Scan</span> yang dihasilkan & <span className="font-bold text-[var(--primary)]">Click Link Terbanyak</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                Total Scan: 30,640 • Total Clicks: 20,590
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Peringkat</th>
                    <th className="py-3.5 px-4">Beauty Creator</th>
                    <th className="py-3.5 px-4">Niche & Tier</th>
                    <th className="py-3.5 px-4">Jumlah AI Scan</th>
                    <th className="py-3.5 px-4">Click Link Terbanyak</th>
                    <th className="py-3.5 px-4">Scan-to-Click Rate</th>
                    <th className="py-3.5 px-4 text-right">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {affiliators.slice().sort((a, b) => (b.totalScansGenerated + b.totalClicksGenerated) - (a.totalScansGenerated + a.totalClicksGenerated)).map((aff, idx) => {
                    const scanToClickRate = aff.totalScansGenerated > 0 
                      ? ((aff.totalClicksGenerated / aff.totalScansGenerated) * 100).toFixed(1) 
                      : '0.0';

                    return (
                      <tr key={aff.id} className="hover:bg-zinc-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            idx === 0 ? 'bg-amber-100 text-amber-800' :
                            idx === 1 ? 'bg-zinc-200 text-zinc-700' :
                            idx === 2 ? 'bg-amber-800/10 text-amber-900' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={aff.avatarUrl} name={aff.name} size="md" />
                            <div>
                              <h4 className="font-bold text-zinc-900">{aff.name}</h4>
                              <p className="text-[11px] text-zinc-400">{aff.handle} • {aff.followersCount} followers</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-zinc-800">{aff.niche}</p>
                          <span className="text-[10px] text-purple-600 font-semibold uppercase">{aff.tier} Tier</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-black text-zinc-900 text-sm">
                            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {aff.totalScansGenerated.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-zinc-400">Total Scan Followers</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-black text-[var(--primary)] text-sm">
                            <MousePointerClick className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {aff.totalClicksGenerated.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-zinc-400">Outbound Clicks</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {scanToClickRate}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {aff.status === 'Approved' && (
                            <Badge variant="success">Approved</Badge>
                          )}
                          {aff.status === 'Pending Approval' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* ADD/EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-lg"
          >
          <Card className="p-6 space-y-4 bg-white border-zinc-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-bold text-zinc-900">
                {editingProductId ? 'Edit Master Product' : 'Add New Master Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 cursor-pointer active:scale-90 transition-transform"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Luminous Silk Foundation"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Armani Beauty"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none cursor-pointer"
                  >
                    <option value="Foundation">Foundation</option>
                    <option value="Concealer">Concealer</option>
                    <option value="Blush">Blush</option>
                    <option value="Lipstick">Lipstick</option>
                    <option value="Mascara">Mascara</option>
                    <option value="Powder">Powder</option>
                    <option value="Primer">Primer</option>
                    <option value="Serum">Serum</option>
                    <option value="Moisturizer">Moisturizer</option>
                    <option value="Sunscreen">Sunscreen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Price ($)</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Default Shade / Variant</label>
                  <input
                    type="text"
                    value={shade}
                    onChange={(e) => setShade(e.target.value)}
                    placeholder="e.g. 5.25 Medium Peach"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Section with Upload File vs Paste URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-zinc-700 font-bold">Product Photo</label>
                  <div className="flex items-center p-0.5 bg-zinc-100 rounded-lg border border-black/[0.04] text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAdminImageUploadType('file')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        adminImageUploadType === 'file'
                          ? 'bg-white text-zinc-900 shadow-xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminImageUploadType('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        adminImageUploadType === 'url'
                          ? 'bg-white text-zinc-900 shadow-xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      🔗 Gunakan URL
                    </button>
                  </div>
                </div>

                {adminImageUploadType === 'file' ? (
                  <div className="flex gap-3 items-center">
                    {imageUrl ? (
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0 group">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold transition-opacity"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : null}

                    <label className="flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed border-zinc-200 hover:border-[#F26CA7]/50 rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-pink-50/20 transition-all text-center">
                      <Upload className="w-4 h-4 text-zinc-400 mb-1" />
                      <span className="text-xs font-bold text-zinc-700">Pilih Foto dari Perangkat</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG, WEBP hingga 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAdminFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2.5 items-center">
                    {imageUrl ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 shrink-0">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <div className="flex-1">
                      <input
                        type="url"
                        required
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Default Master Product Link</label>
                <input
                  type="url"
                  required
                  value={affiliateUrl}
                  onChange={(e) => setAffiliateUrl(e.target.value)}
                  placeholder="https://amzn.to/..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs focus:ring-2 focus:ring-[var(--primary)]/30 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" onClick={() => setIsAddModalOpen(false)} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingProductId ? 'Update Master Product' : 'Add to Catalog'}
                </Button>
              </div>
            </form>
          </Card>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINK PREVIEW MODAL */}
      <AnimatePresence>
        {previewAffiliator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-zinc-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <Avatar src={previewAffiliator.avatarUrl} name={previewAffiliator.name} size="md" />
                <div>
                  <h3 className="text-base font-bold text-zinc-900">{previewAffiliator.name}</h3>
                  <p className="text-xs text-zinc-500">{previewAffiliator.handle} • {previewAffiliator.niche}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewAffiliator(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer active:scale-90"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">
                Link Bio / Portal Affiliator
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?page=${previewAffiliator.handle.replace('@', '')}`}
                  className="flex-1 text-xs bg-transparent font-mono text-zinc-700 outline-none select-all"
                />
                <Button
                  onClick={() => handleCopyPreviewLink(previewAffiliator.handle)}
                  size="sm"
                  variant={copiedLink ? 'success' : 'primary'}
                  className="text-xs whitespace-nowrap"
                >
                  {copiedLink ? 'Tersalin!' : 'Salin Link'}
                </Button>
              </div>
            </div>

            {/* Mini Card Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/80 border border-pink-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-700">Aura AI Recommendation Card</span>
                <span className="text-[10px] bg-pink-100 text-[var(--primary)] px-2 py-0.5 rounded-full font-bold">Live Preview</span>
              </div>
              <p className="text-xs text-zinc-600">
                Halaman AI Shade Matcher milik <strong>{previewAffiliator.name}</strong> memungkinkan pengikutnya melakukan scan selfie untuk rekomendasi makeup personal.
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[var(--primary)]" />
                  {previewAffiliator.totalScansGenerated.toLocaleString()} Total Scan
                </div>
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                  {previewAffiliator.totalClicksGenerated.toLocaleString()} Total Click
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button
                onClick={() => setPreviewAffiliator(null)}
                variant="secondary"
                size="md"
              >
                Tutup
              </Button>
              <Button
                onClick={() => {
                  window.open(`${window.location.origin}/?page=${previewAffiliator.handle.replace('@', '')}`, '_blank');
                }}
                variant="primary"
                size="md"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Buka di Tab Baru
              </Button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT AFFILIATOR MODAL */}
      <AnimatePresence>
        {editingAffiliator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Edit Data Affiliator</h3>
                <p className="text-xs text-zinc-500">Perbarui profil dan statistik affiliator</p>
              </div>
              <button
                onClick={() => setEditingAffiliator(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer active:scale-90"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAffiliator} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1 block">Nama Beauty Creator</label>
                <Input
                  value={editAffName}
                  onChange={(e) => setEditAffName(e.target.value)}
                  placeholder="Masukkan nama creator"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Username / Handle</label>
                  <Input
                    value={editAffHandle}
                    onChange={(e) => setEditAffHandle(e.target.value)}
                    placeholder="@username"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={editAffEmail}
                    onChange={(e) => setEditAffEmail(e.target.value)}
                    placeholder="email@domain.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1 block">Niche Content</label>
                <Input
                  value={editAffNiche}
                  onChange={(e) => setEditAffNiche(e.target.value)}
                  placeholder="Contoh: Warm Skin Tones & Drugstore Foundation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Tier Plan</label>
                  <select
                    value={editAffTier}
                    onChange={(e) => setEditAffTier(e.target.value as 'Starter' | 'Pro' | 'Elite')}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 font-medium cursor-pointer"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Jumlah Followers</label>
                  <Input
                    value={editAffFollowers}
                    onChange={(e) => setEditAffFollowers(e.target.value)}
                    placeholder="Contoh: 125K"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Scans Driven</label>
                  <Input
                    type="number"
                    value={editAffScans}
                    onChange={(e) => setEditAffScans(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Outbound Clicks</label>
                  <Input
                    type="number"
                    value={editAffClicks}
                    onChange={(e) => setEditAffClicks(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1 block">Status Akun</label>
                <select
                  value={editAffStatus}
                  onChange={(e) => setEditAffStatus(e.target.value as AffiliatorAccount['status'])}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 font-bold text-zinc-800 cursor-pointer"
                >
                  <option value="Approved">Aktif (Approved)</option>
                  <option value="Rejected">Non-Aktif (Suspended)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  onClick={() => setEditingAffiliator(null)}
                  variant="secondary"
                  size="md"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* REJECT CONFIRM MODAL */}
      <Modal
        isOpen={rejectingProductId !== null}
        onClose={() => setRejectingProductId(null)}
        title="Tolak Pengajuan Produk"
        description="Apakah Anda yakin ingin menolak pengajuan produk ini? Produk tidak akan tampil di rekomendasi AI."
      >
        <div className="pt-4 flex justify-end gap-3">
          <Button onClick={() => setRejectingProductId(null)} variant="ghost">
            Batal
          </Button>
          <Button
            onClick={() => {
              if (rejectingProductId) onUpdateProductApproval?.(rejectingProductId, 'Rejected');
              setRejectingProductId(null);
            }}
            variant="danger"
          >
            Tolak Produk
          </Button>
        </div>
      </Modal>

    </div>
  );
};
