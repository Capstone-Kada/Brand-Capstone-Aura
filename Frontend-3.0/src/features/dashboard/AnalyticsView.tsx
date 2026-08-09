import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download } from 'lucide-react';
import { AnalyticsSummary, Product } from '../../types';
import { Card, Button, Badge } from '../../components/ui/UIComponents';

interface ChartPoint {
  day: string;
  visitors: number;
  scans: number;
  clicks: number;
  revenue: number;
}

interface UndertoneStat {
  name: string;
  percentage: number;
}

interface ConcernStat {
  concern: string;
  percentage: number;
}

interface AnalyticsViewProps {
  analytics: AnalyticsSummary;
  products: Product[];
  chartData: ChartPoint[];
  undertoneStats: UndertoneStat[];
  concernStats: ConcernStat[];
  onToast: (title: string, desc?: string) => void;
}

const PIE_COLORS = ['#F26CA7', '#18181b', '#a1a1aa', '#FFB6D9', '#701a75'];

function formatTrend(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}% vs 7 hari sebelumnya`;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, products, chartData, undertoneStats, concernStats, onToast }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const exportReport = () => {
    onToast('Exporting Analytics CSV', 'Download starting for beauty affiliate performance metrics.');
  };

  return (
    <div className="space-y-8 pb-12">

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Analytics Intelligence</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Deep audience skin insights & affiliate conversion metrics</p>
        </div>

        <Button onClick={exportReport} variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
          Export CSV
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Page Visitors</span>
          <p className="text-3xl font-black text-zinc-900">{analytics.totalVisitors.toLocaleString()}</p>
          <p className={`text-[11px] font-bold ${analytics.visitorsTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatTrend(analytics.visitorsTrend)}
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed AI Scans</span>
          <p className="text-3xl font-black text-[#F26CA7]">{analytics.totalScans.toLocaleString()}</p>
          <p className={`text-[11px] font-bold ${analytics.scansTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatTrend(analytics.scansTrend)}
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Average CTR</span>
          <p className="text-3xl font-black text-zinc-900">{analytics.ctr}%</p>
          <p className={`text-[11px] font-bold ${analytics.ctrTrend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {formatTrend(analytics.ctrTrend)}
          </p>
        </Card>
      </div>

      {/* Main Trends Chart — real last-7-days data from the backend */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Traffic & AI Scan Conversion Trends</h3>
            <p className="text-xs text-zinc-500">Follower page views vs completed selfie scans (7 hari terakhir)</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-zinc-800">
              <span className="w-3 h-3 rounded-full bg-zinc-800" /> Page Visitors
            </span>
            <span className="flex items-center gap-1.5 text-[#F26CA7]">
              <span className="w-3 h-3 rounded-full bg-[#F26CA7]" /> AI Selfie Scans
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400 font-medium">
              Belum ada data traffic untuk 7 hari terakhir.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                <YAxis stroke="#a1a1aa" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F0F11', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Line type="monotone" dataKey="visitors" stroke="#18181b" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="scans" stroke="#F26CA7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Audience Undertone & Concern Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-900">Distribusi Undertone Audiens</h3>
          {undertoneStats.length === 0 ? (
            <p className="text-xs text-zinc-400 font-medium py-8 text-center">Belum ada data scan untuk ditampilkan.</p>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={undertoneStats}
                    dataKey="percentage"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name} ${entry.percentage}%`}
                  >
                    {undertoneStats.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F0F11', borderRadius: '12px', border: 'none', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-900">Top Skin Concerns Audiens</h3>
          {concernStats.length === 0 ? (
            <p className="text-xs text-zinc-400 font-medium py-8 text-center">Belum ada data concern untuk ditampilkan.</p>
          ) : (
            <div className="space-y-3">
              {concernStats.map((stat) => (
                <div key={stat.concern} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                    <span>{stat.concern}</span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F26CA7] rounded-full" style={{ width: `${stat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Top Performing Product Performance Table */}
      <Card className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-zinc-900">Product Level Affiliate Conversion Table</h3>
          <Badge variant="primary" className="text-[10px]">
            {products.length} Products
          </Badge>
        </div>

        {/* Mobile & Tablet Responsive Cards View (< lg breakpoint) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-zinc-50/80 rounded-2xl p-4 border border-zinc-200/80 space-y-3 flex flex-col justify-between hover:border-zinc-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-200" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium text-zinc-500 bg-white px-2 py-0.5 rounded-md border border-zinc-200">{prod.category}</span>
                    <span className="text-xs font-bold text-zinc-900">{formatCurrency(prod.price)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 text-center">
                <div className="bg-white p-2 rounded-xl border border-zinc-200/60">
                  <span className="text-[9px] text-zinc-400 font-bold block uppercase">AI Clicks</span>
                  <span className="text-xs font-bold text-zinc-800">{prod.clicks}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-zinc-200/60">
                  <span className="text-[9px] text-zinc-400 font-bold block uppercase">Click Share</span>
                  <span className="text-xs font-extrabold text-[#F26CA7]">
                    {analytics.totalClicks > 0 ? ((prod.clicks / analytics.totalClicks) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (>= lg breakpoint) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">AI Clicks</th>
                <th className="pb-3 text-right">Click Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {products.map((prod) => {
                const clickShare = analytics.totalClicks > 0 ? ((prod.clicks / analytics.totalClicks) * 100).toFixed(1) : 0;
                return (
                  <tr key={prod.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-zinc-900 flex items-center gap-3">
                      <img src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border border-zinc-200" />
                      <span className="truncate max-w-[220px]">{prod.name}</span>
                    </td>
                    <td className="py-3.5 text-zinc-600">{prod.category}</td>
                    <td className="py-3.5 font-semibold text-zinc-900">{formatCurrency(prod.price)}</td>
                    <td className="py-3.5 font-medium text-zinc-800">{prod.clicks} clicks</td>
                    <td className="py-3.5 text-right font-bold text-[#F26CA7]">
                      {clickShare}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};
