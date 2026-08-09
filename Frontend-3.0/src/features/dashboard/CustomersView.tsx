import React, { useState } from 'react';
import { Search, Filter, Eye, Sparkles, CheckCircle2, User, MapPin, Calendar, ExternalLink, ArrowUpRight } from 'lucide-react';
import { CustomerLead } from '../../types';
import { Card, Button, Input, Select, Badge, Drawer, Avatar } from '../../components/ui/UIComponents';

interface CustomersViewProps {
  leads: CustomerLead[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ leads }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const name = lead.followerName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900">Customers & Leads</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Data customer yang melakukan AI Scan dan mengklik link affiliate produk rekomendasi</p>
      </div>

      {/* Filter */}
      <Card className="p-3 sm:p-4">
        <Input
          placeholder="Search by customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-zinc-400" />}
        />
      </Card>

      {/* Mobile Card List View (< sm breakpoint) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-semibold">
          <span>Results ({filteredLeads.length})</span>
          <span className="text-[11px] font-normal text-zinc-400">Tap card to view report</span>
        </div>

        {filteredLeads.length === 0 ? (
          <Card className="p-6 text-center text-xs text-zinc-400">
            No customers match your search criteria.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredLeads.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="w-full bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] flex flex-col space-y-3"
              >
                {/* Header: Customer Info & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      {lead.followerName || 'Customer'}
                    </h4>
                  </div>

                  <span className={`shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full ${
                    lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {lead.clickedAffiliate ? 'Click link affiliate' : 'Scanned'}
                  </span>
                </div>

                {/* Body: Skin Tone & Top Matched Product */}
                <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">AI Scan Result</span>
                    <Badge variant="primary" className="text-[10px] px-2 py-0.5">
                      {lead.personalColor || 'Winter'} {lead.detectedUndertone} • {lead.detectedSkinTone}
                    </Badge>
                  </div>

                  <div className="pt-1 border-t border-zinc-200/50">
                    <span className="text-[10px] text-zinc-400 font-medium block mb-0.5">Top Recommendation</span>
                    <div className="text-xs text-zinc-800 font-bold truncate flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F26CA7] shrink-0" />
                      <span className="truncate">{lead.topMatchedProduct}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Meta & Action */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-zinc-400 font-medium">{lead.scanDate} • {lead.location}</span>
                  <div className="flex items-center gap-1 font-bold text-[#F26CA7]">
                    <span>View AI Report</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View (>= sm breakpoint) */}
      <Card className="hidden sm:block p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Customer Name</th>
                <th className="pb-3">Scan Date</th>
                <th className="pb-3">Detected Skin Profile</th>
                <th className="pb-3">Top Matched Product</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3 font-bold text-zinc-900">
                    <span className="block text-xs font-bold text-zinc-900">{lead.followerName || 'Customer'}</span>
                  </td>

                  <td className="py-3 text-zinc-600 font-medium">{lead.scanDate}</td>

                  <td className="py-3">
                    <Badge variant="primary">
                      {lead.personalColor || 'Winter'} {lead.detectedUndertone} • {lead.detectedSkinTone}
                    </Badge>
                  </td>

                  <td className="py-3 font-bold text-zinc-800">{lead.topMatchedProduct}</td>

                  <td className="py-3 text-zinc-500 font-medium">{lead.location}</td>

                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      lead.clickedAffiliate ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {lead.clickedAffiliate ? 'Click link affiliate' : 'Scanned'}
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="p-1.5 text-zinc-400 hover:text-[#F26CA7] hover:bg-[#FFB6D9]/20 rounded-lg transition-colors cursor-pointer"
                      title="View AI Scan Report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LEAD DETAIL DRAWER */}
      <Drawer
        isOpen={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        title="Laporan AI Diagnostic Customer"
      >
        {selectedLead && (
          <div className="space-y-5">
            {/* Header profile */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-zinc-900 text-sm">{selectedLead.followerName || 'Customer'}</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{selectedLead.scanDate} • {selectedLead.location}</p>
              </div>
              <Badge variant="success" className="px-2.5 py-1 text-[11px] font-bold">
                AI Confidence: {selectedLead.confidence || 98.6}%
              </Badge>
            </div>

            {/* AI Diagnostics 4-Box Grid */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Laporan Diagnosis AI</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🎨 Personal Color</span>
                  <span className="text-sm font-black text-pink-700">{selectedLead.personalColor || 'Winter'}</span>
                </div>
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🌡️ Undertone</span>
                  <span className="text-sm font-black text-blue-700">{selectedLead.detectedUndertone || 'Cool'}</span>
                </div>
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">🧑 Skin Tone</span>
                  <span className="text-sm font-black text-amber-800">{selectedLead.detectedSkinTone || 'Medium'}</span>
                </div>
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                  <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">😊 Face Shape</span>
                  <span className="text-sm font-black text-purple-700">{selectedLead.faceShape || 'Oval'}</span>
                </div>
              </div>
            </div>

            {/* Best Color Palette */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-2">
              <span className="text-xs font-extrabold text-zinc-900 block">
                🎨 Best Color Palette
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
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-zinc-200 text-xs font-bold text-zinc-800">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: palette.colorHex }}
                    ></span>
                    <span>{palette.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Product & Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Produk Teratas Rekomendasi AI</h4>
              <div className="p-3 bg-white border border-zinc-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#F26CA7] shrink-0" />
                  <span className="text-xs font-bold text-zinc-900 truncate">{selectedLead.topMatchedProduct}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${
              selectedLead.clickedAffiliate ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <h4 className={`text-xs font-bold ${selectedLead.clickedAffiliate ? 'text-emerald-800' : 'text-zinc-700'}`}>
                Status
              </h4>
              <p className={`text-xs ${selectedLead.clickedAffiliate ? 'text-emerald-700' : 'text-zinc-600'}`}>
                {selectedLead.clickedAffiliate 
                  ? `Customer melakukan scan selfie & mengklik link affiliate untuk produk "${selectedLead.topMatchedProduct}".` 
                  : 'Customer melakukan scan selfie (belum mengklik link affiliate).'}
              </p>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};
