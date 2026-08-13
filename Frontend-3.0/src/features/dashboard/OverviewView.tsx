import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Camera, 
  MousePointerClick, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  Copy, 
  ExternalLink,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { RouteView, UserProfile, Product, CustomerLead, AnalyticsSummary } from '../../types';
import { Card, Button, Badge, Avatar, Progress } from '../../components/ui/UIComponents';

interface OverviewViewProps {
  user: UserProfile;
  products: Product[];
  leads: CustomerLead[];
  analytics: AnalyticsSummary;
  onNavigate: (route: RouteView) => void;
  onCopyLink: (link: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  products,
  leads,
  analytics,
  onNavigate,
  onCopyLink
}) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://beauty.ai';
  const publicLink = `${baseUrl}/${user.handle.replace('@', '')}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* 1. Glassmorphic Welcome Banner Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-white/[0.85] backdrop-blur-md text-zinc-900 p-6 sm:p-8 relative overflow-hidden shadow-sm border border-zinc-200/80 flex flex-col justify-between">
          
          <div className="relative z-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md leading-relaxed">
              Your AI recommendation page has driven <span className="text-zinc-900 font-bold">{analytics.totalClicks.toLocaleString()}</span> affiliate link clicks this month!
            </p>
          </div>

          <div className="relative z-10 mt-6 flex flex-col sm:flex-row gap-3">
             <Button
                onClick={() => onNavigate('internal-preview')}
                variant="primary"
                className="rounded-xl px-5 py-2 text-sm font-bold shadow-md shadow-[#F26CA7]/20 border-0"
              >
                Preview Your AI Page
             </Button>
          </div>
        </div>

        {/* Floating Quick Link Pill */}
        <div className="lg:col-span-1 bg-white/[0.85] backdrop-blur-md rounded-3xl p-8 border border-zinc-200/80 shadow-md flex flex-col justify-center space-y-5 relative overflow-hidden group hover:border-[#F26CA7]/30 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-[#F26CA7]/10 flex items-center justify-center text-[#F26CA7] mb-2 group-hover:scale-110 transition-transform">
             <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900">Your Live Link</h3>
            <p className="text-xs text-zinc-500 mt-1">Share this in your bio</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200/80 group-hover:bg-[#F26CA7]/5 transition-colors">
            <span className="text-[#F26CA7] font-bold font-mono text-xs truncate flex-1">{publicLink}</span>
            <button
              onClick={() => onCopyLink(publicLink)}
              className="bg-white p-2 rounded-xl shadow-sm text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Page Visitors', value: analytics.totalVisitors, trend: analytics.visitorsTrend, icon: Users, color: 'blue' },
          { label: 'AI Selfie Scans', value: analytics.totalScans, trend: analytics.scansTrend, icon: Camera, color: 'purple' },
          { label: 'Affiliate Clicks', value: analytics.totalClicks, trend: analytics.ctrTrend, icon: MousePointerClick, color: 'pink', extra: `(${analytics.ctr}%)` }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white/[0.85] backdrop-blur-md rounded-3xl p-6 border border-zinc-200/80 shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-[#F26CA7]'}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> +{stat.trend}%
              </span>
            </div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
              {stat.value.toLocaleString()} {stat.extra && <span className="text-lg text-zinc-400 font-bold ml-1">{stat.extra}</span>}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Recent Scans */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/[0.85] backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-zinc-900">Recent Scans</h3>
                <p className="text-sm text-zinc-500 mt-1">Real-time follower matches</p>
              </div>
              <Button onClick={() => onNavigate('customers')} variant="secondary" size="sm" className="rounded-full">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {leads.slice(0, 4).map((lead, i) => (
                <div key={lead.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all cursor-pointer">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs shrink-0">
                      {(lead.followerName || 'C')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 truncate">{lead.followerName || 'Customer'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full shrink-0">{lead.detectedSkinTone}</span>
                        <span className="text-[10px] text-zinc-400 truncate">• {lead.topMatchedProduct}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full inline-block mb-1 ${
                      lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {lead.clickedAffiliate ? 'Clicked' : 'Scanned'}
                    </span>
                    <p className="text-[10px] text-zinc-400">{lead.scanDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Top Products */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/[0.85] backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-md">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-zinc-900">Top Products</h3>
              <button onClick={() => onNavigate('products')} className="text-sm font-bold text-[#F26CA7] hover:underline">
                Manage
              </button>
            </div>

            <div className="space-y-5">
              {products.slice(0, 3).map((prod) => (
                <div key={prod.id} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-[#F26CA7]/30 transition-colors cursor-pointer group">
                  <img src={prod.imageUrl} alt={prod.name} className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-[#F26CA7] transition-colors">{prod.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatCurrency(prod.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-xs">
                        <MousePointerClick className="w-3 h-3 text-[#F26CA7]" /> {prod.clicks || 142}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-xs">
                        <TrendingUp className="w-3 h-3" /> {prod.conversions || 38}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onNavigate('products')}
              variant="outline"
              className="w-full mt-6 rounded-2xl border-dashed border-2 hover:border-[#F26CA7] hover:bg-[#F26CA7]/5 transition-all text-zinc-500 font-bold"
              icon={<Plus className="w-4 h-4" />}
            >
              Add New Product
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
