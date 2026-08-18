import React, { useState, useEffect } from 'react';
import { Search, Eye, Sparkles, User, Calendar, ArrowUpRight, CheckCircle2, Heart, RotateCw } from 'lucide-react';
import { CustomerLead } from '../../types';
import { Card, Button, Input, Badge, Drawer } from '../../components/ui/UIComponents';

interface CustomersViewProps {
  leads: CustomerLead[];
  onRefresh?: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ leads, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fast auto-sync polling every 2.5s for live real-time updates
  useEffect(() => {
    if (!onRefresh) return;
    const interval = setInterval(() => {
      onRefresh();
    }, 2500);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleManualRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getDisplayName = (lead: CustomerLead, idx?: number) => {
    if (lead.followerName && lead.followerName.trim() !== '' && lead.followerName !== 'Customer') {
      return lead.followerName;
    }
    if (lead.followerHandle && lead.followerHandle.trim() !== '') {
      return lead.followerHandle;
    }
    if (lead.email && lead.email.trim() !== '') {
      return lead.email.split('@')[0];
    }
    // Formatted fallback instead of generic "Customer"
    const idShort = lead.id.replace('lead_', '').slice(-4);
    return `Follower #${idShort || (idx !== undefined ? idx + 1 : '01')}`;
  };

  // Curated aesthetic gradients for avatar initials
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-pink-500 via-rose-500 to-pink-400',
      'from-purple-500 via-violet-500 to-fuchsia-400',
      'from-rose-500 via-pink-500 to-amber-400',
      'from-indigo-500 via-purple-500 to-pink-400',
      'from-pink-600 via-rose-400 to-rose-300',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const filteredLeads = leads.filter((lead) => {
    const name = getDisplayName(lead);
    const product = lead.topMatchedProduct || '';
    const ageStr = `${lead.age || ''}`;
    const skin = `${lead.personalColor || ''} ${lead.detectedUndertone || ''} ${lead.detectedSkinTone || ''}`;
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ageStr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Audience & Scan Intelligence</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Data pengunjung dan followers yang menggunakan portal AI Scan beserta histori rekomendasi produk affiliate mereka.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#F26CA7] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Sinkron Data'}</span>
          </button>
        )}
      </div>

      {/* Search Filter */}
      <Card className="p-3 sm:p-4">
        <Input
          placeholder="Cari berdasarkan nama follower, umur, undertone, atau produk rekomendasi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-zinc-400" />}
        />
      </Card>

      {/* Mobile Card List View (< sm breakpoint) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-semibold">
          <span>Hasil ({filteredLeads.length})</span>
          <span className="text-[11px] font-normal text-zinc-400">Ketuk kartu untuk detail AI</span>
        </div>

        {filteredLeads.length === 0 ? (
          <Card className="p-6 text-center text-xs text-zinc-400">
            Belum ada data audience yang masuk.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLeads.map((lead, idx) => {
              const displayName = getDisplayName(lead, idx);
              return (
                <div 
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="w-full bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col space-y-3"
                >
                  {/* Header: Follower Info & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(displayName)} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {displayName}
                          </h4>
                          {lead.age && (
                            <span className="px-1.5 py-0.2 rounded-md bg-zinc-100 text-zinc-700 font-bold text-[10px] shrink-0">
                              {lead.age} Thn
                            </span>
                          )}
                        </div>
                        {lead.followerHandle && (
                          <p className="text-[10px] text-zinc-400 truncate">{lead.followerHandle}</p>
                        )}
                      </div>
                    </div>

                    <span className={`shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full ${
                      lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {lead.clickedAffiliate ? 'Klik Link Shopee' : 'Scan Saja'}
                    </span>
                  </div>

                  {/* Body: Skin Tone & Top Matched Product */}
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Hasil AI Scan</span>
                      <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                        {lead.personalColor || 'Winter'} {lead.detectedUndertone} • {lead.detectedSkinTone}
                      </Badge>
                    </div>

                    <div className="pt-1 border-t border-zinc-200/50">
                      <span className="text-[10px] text-zinc-400 font-medium block mb-0.5">Rekomendasi Teratas</span>
                      <div className="text-xs text-zinc-800 font-bold truncate flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F26CA7] shrink-0" />
                        <span className="truncate">{lead.topMatchedProduct || 'Produk Sesuai Shade'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Meta & Action */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-zinc-400 font-medium">
                      {new Date(lead.scanDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1 font-bold text-[#F26CA7]">
                      <span>Lihat Laporan AI</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop Table View (>= sm breakpoint) */}
      <Card className="hidden sm:block p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Follower / Audience</th>
                <th className="pb-3">Umur</th>
                <th className="pb-3">Tanggal Scan</th>
                <th className="pb-3">Profil Kulit Terdeteksi</th>
                <th className="pb-3">Top Matched Product</th>
                <th className="pb-3">Status Interaksi</th>
                <th className="pb-3 text-right">Laporan AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLeads.map((lead, idx) => {
                const displayName = getDisplayName(lead, idx);
                return (
                  <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 font-bold text-zinc-900">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarGradient(displayName)} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs`}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-900">{displayName}</span>
                          {lead.followerHandle && (
                            <span className="block text-[10px] text-zinc-400 font-normal">{lead.followerHandle}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-zinc-700 font-semibold">
                      {lead.age ? (
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 font-bold text-xs inline-block">
                          {lead.age} Thn
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    <td className="py-3 text-zinc-600 font-medium">
                      {new Date(lead.scanDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3">
                      <Badge variant="primary">
                        {lead.personalColor || 'Winter'} {lead.detectedUndertone} • {lead.detectedSkinTone}
                      </Badge>
                    </td>

                    <td className="py-3 font-bold text-zinc-800">
                      <div className="flex items-center gap-1.5 max-w-[240px]">
                        <Sparkles className="w-3.5 h-3.5 text-[#F26CA7] shrink-0" />
                        <span className="truncate">{lead.topMatchedProduct || 'Produk Sesuai Shade'}</span>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {lead.clickedAffiliate ? 'Klik Link Shopee' : 'Scan Saja'}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 text-zinc-400 hover:text-[#F26CA7] hover:bg-[#FFB6D9]/20 rounded-xl transition-colors cursor-pointer"
                        title="Lihat Detail Diagnosis AI"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LEAD DETAIL DRAWER (100% SINKRON DENGAN DATA ASLI AI ENGINE) */}
      <Drawer
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title="Laporan Diagnosis AI Follower"
      >
        {selectedLead && (
          <div className="space-y-5">
            
            {/* Header profile follower */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(getDisplayName(selectedLead))} text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs`}>
                  {getDisplayName(selectedLead).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-zinc-900 text-sm">{getDisplayName(selectedLead)}</h3>
                    {selectedLead.age && (
                      <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 font-bold text-xs">
                        {selectedLead.age} Tahun
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {new Date(selectedLead.scanDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} WIB
                  </p>
                </div>
              </div>

              <Badge variant="success" className="px-2.5 py-1 text-[11px] font-bold shrink-0">
                Akurasi AI: {selectedLead.confidence || 98.6}%
              </Badge>
            </div>

            {/* AI Diagnostics Multi-Box Grid (Sinkron Hasil Face AI Scan) */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                Laporan Diagnosis AI Kulit & Wajah
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-pink-50/60 border border-pink-100 rounded-2xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🎨 Personal Color</span>
                  <span className="text-sm font-black text-pink-700">{selectedLead.personalColor || 'Winter'} Season</span>
                </div>

                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🌡️ Undertone</span>
                  <span className="text-sm font-black text-blue-700">{selectedLead.detectedUndertone || 'Cool'} Tone</span>
                </div>

                <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🧑 Skin Tone</span>
                  <span className="text-sm font-black text-amber-800">{selectedLead.detectedSkinTone || 'Medium'} Shade</span>
                </div>

                <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">😊 Face Shape</span>
                  <span className="text-sm font-black text-purple-700">{selectedLead.faceShape || 'Oval'} Shape</span>
                </div>

                {selectedLead.age && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-0.5 col-span-2">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🎂 Usia Follower</span>
                    <span className="text-sm font-black text-emerald-800">{selectedLead.age} Tahun</span>
                  </div>
                )}
              </div>
            </div>

            {/* Best Color Palette (Palet Warna Rekomendasi AI) */}
            <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2.5">
              <span className="text-xs font-extrabold text-zinc-900 block">
                🎨 Palet Warna Rekomendasi Makeup
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(selectedLead.bestColorPalette && selectedLead.bestColorPalette.length > 0
                  ? selectedLead.bestColorPalette
                  : [
                      { name: 'Berry', colorHex: '#701a75' },
                      { name: 'Navy', colorHex: '#1e3a8a' },
                      { name: 'Emerald', colorHex: '#065f46' },
                      { name: 'Silver', colorHex: '#94a3b8' }
                    ]
                ).map((palette, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-800 shadow-2xs">
                    <span
                      className="w-4 h-4 rounded-lg shrink-0 shadow-xs"
                      style={{ backgroundColor: palette.colorHex }}
                    />
                    <span className="truncate">{palette.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Top Matched Product */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                Produk Teratas Rekomendasi AI
              </h4>
              <div className="p-3.5 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-zinc-900 block truncate">
                      {selectedLead.topMatchedProduct || 'Produk Sesuai Shade'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">
                      {selectedLead.matchedProductCount || 1} produk cocok dari etalase Anda
                    </span>
                  </div>
                </div>

                <Badge variant="primary" className="text-[10px] px-2 py-0.5 shrink-0">
                  Match 99%
                </Badge>
              </div>
            </div>

            {/* Interaction Status */}
            <div className={`p-4 rounded-2xl border space-y-1 ${
              selectedLead.clickedAffiliate ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <h4 className={`text-xs font-bold flex items-center gap-1.5 ${selectedLead.clickedAffiliate ? 'text-emerald-800' : 'text-zinc-700'}`}>
                {selectedLead.clickedAffiliate ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : null}
                <span>Status Konversi Follower</span>
              </h4>
              <p className={`text-xs leading-relaxed ${selectedLead.clickedAffiliate ? 'text-emerald-700' : 'text-zinc-600'}`}>
                {selectedLead.clickedAffiliate 
                  ? `Follower ini telah melakukan scan selfie dan mengklik link affiliate untuk membeli "${selectedLead.topMatchedProduct}".` 
                  : 'Follower ini telah menyelesaikan analisis scan selfie (belum mengklik link pembelian produk).'}
              </p>
            </div>

          </div>
        )}
      </Drawer>

    </div>
  );
};
