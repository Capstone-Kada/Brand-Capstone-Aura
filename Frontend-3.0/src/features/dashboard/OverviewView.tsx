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
  const publicLink = `https://beauty.ai/${user.handle.replace('@', '')}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white text-zinc-900 shadow-sm relative overflow-hidden border border-black/[0.06]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F26CA7]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-xl z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
            Hello, {user.name} ✨
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Your AI recommendation page has driven <span className="text-zinc-900 font-bold">{analytics.totalClicks.toLocaleString()}</span> affiliate link clicks from followers this month!
          </p>
        </div>

        {/* Quick Link Share Widget */}
        <div className="z-10 bg-zinc-50 border border-black/[0.06] p-4 rounded-2xl sm:max-w-xs w-full space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Your Live AI Bio Link</p>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/[0.06] text-xs shadow-xs">
            <span className="text-[#F26CA7] font-semibold font-mono truncate">{publicLink}</span>
            <button
              onClick={() => onCopyLink(publicLink)}
              className="text-zinc-400 hover:text-zinc-800 p-1 rounded hover:bg-zinc-100 transition-colors shrink-0"
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onNavigate('internal-preview')}
              variant="primary"
              size="sm"
              className="w-full text-[11px]"
              icon={<ExternalLink className="w-3 h-3" />}
            >
              Preview Page
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid (3 Columns without Revenue Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Page Visitors</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{analytics.totalVisitors.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +{analytics.visitorsTrend}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Unique follower visits</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Selfie Scans</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-zinc-900">{analytics.totalScans.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +{analytics.scansTrend}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Completed diagnostic scans</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Affiliate Clicks (CTR)</span>
            <div className="p-2 bg-pink-50 text-[#F26CA7] rounded-xl">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#F26CA7]">{analytics.totalClicks.toLocaleString()} ({analytics.ctr}%)</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +{analytics.ctrTrend}%
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">Scan to Affiliate link click conversion</p>
        </Card>

      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Scans Lead Feed & Top Performing Products */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Recent Follower Scan Activity */}
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">Recent Follower AI Scans</h3>
                <p className="text-xs text-zinc-500">Real-time selfie diagnostic matches and product clicks</p>
              </div>
              <Button
                onClick={() => onNavigate('customers')}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                View All →
              </Button>
            </div>

            {/* Mobile View: Vertical Card Stack */}
            <div className="sm:hidden space-y-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span>Recent Customer Scans ({leads.length})</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {leads.slice(0, 5).map((lead) => (
                  <div 
                    key={lead.id}
                    onClick={() => onNavigate('customers')}
                    className="w-full bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col justify-between space-y-3"
                  >
                    {/* Header: Customer & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">
                          {lead.followerName || 'Customer'}
                        </h4>
                        <span className="text-[10px] text-zinc-400">{lead.scanDate}</span>
                      </div>
                      
                      <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                        lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {lead.clickedAffiliate ? 'Click link affiliate' : 'Scanned'}
                      </span>
                    </div>

                    {/* Body: Skin Tone & Matched Product */}
                    <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Skin Match</span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                          {lead.detectedSkinTone} / {lead.detectedUndertone}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-zinc-700 font-semibold truncate flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#F26CA7] shrink-0" />
                        <span className="truncate">{lead.topMatchedProduct}</span>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#F26CA7]">
                      <span>View Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View: Clean Table List View */}
            <div className="hidden sm:block divide-y divide-zinc-100">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/60 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-900 truncate">
                          {lead.followerName || 'Customer'}
                        </h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {lead.detectedSkinTone} / {lead.detectedUndertone}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        Matched: <span className="font-semibold text-zinc-800">{lead.topMatchedProduct}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {lead.clickedAffiliate ? 'Click link affiliate' : 'Scanned'}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1">{lead.scanDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Column: Top Products */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Top Products */}
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-zinc-900">Top Clicked Products</h3>
              <button onClick={() => onNavigate('products')} className="text-xs text-[#F26CA7] font-semibold hover:underline cursor-pointer">
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {products.slice(0, 3).map((prod) => (
                <div key={prod.id} className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/60 flex items-center gap-3">
                  <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">{prod.name}</h4>
                    <p className="text-[10px] text-zinc-500">{prod.brand} • {formatCurrency(prod.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-[#F26CA7]">{prod.clicks || 142} Clicks</span>
                      <span className="text-[10px] font-semibold text-emerald-600">({prod.conversions || 38} Conversions)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => onNavigate('products')}
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="w-full"
            >
              Add New Affiliate Product
            </Button>
          </Card>

        </div>

      </div>

    </div>
  );
};
