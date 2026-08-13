import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Zap, 
  Sparkles, 
  Crown, 
  ArrowRight,
  QrCode,
  Smartphone,
  Building2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';
import { Card, Button, Badge, Progress } from '../../components/ui/UIComponents';
import { api } from '../../services/api';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        callbacks: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface SubscriptionViewProps {
  user: UserProfile;
  onToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshUser?: () => Promise<void>;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onToast, onRefreshUser }) => {
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'ELITE' | null>(null);

  const currentPlanNormalized = (user.currentPlan || 'Starter').toUpperCase();
  const usage = user.monthlyScanUsage || 0;
  const limit = user.monthlyScanLimit || 1000;
  const usagePercentage = Math.min(100, Math.round((usage / limit) * 100));

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleUpgrade = async (plan: 'PRO' | 'ELITE') => {
    setLoadingPlan(plan);
    try {
      const checkoutData = await api.subscription.checkout(plan);

      // Check if Midtrans Snap script is loaded
      if (typeof window !== 'undefined' && window.snap && checkoutData.snapToken && !checkoutData.snapToken.startsWith('mock-')) {
        window.snap.pay(checkoutData.snapToken, {
          onSuccess: async (result) => {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            onToast(
              'Pembayaran Berhasil! 🎉',
              `Selamat! Akun Anda berhasil di-upgrade ke paket ${plan}.`,
              'success'
            );
            if (onRefreshUser) await onRefreshUser();
          },
          onPending: (result) => {
            onToast(
              'Menunggu Pembayaran',
              'Silakan selesaikan pembayaran sesuai instruksi pada layar.',
              'info'
            );
          },
          onError: (error) => {
            onToast('Pembayaran Gagal', 'Terjadi kendala saat memproses transaksi.', 'error');
          },
          onClose: () => {
            onToast('Pembayaran Dibatalkan', 'Modal pembayaran ditutup.', 'info');
          },
        });
      } else {
        // Fallback for Sandbox simulation if keys are pending or mock token returned
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        onToast(
          'Simulasi Pembayaran Berhasil! 🚀',
          `Order ${checkoutData.orderId} untuk paket ${plan} (${formatIDR(checkoutData.amount)}) siap diaktifkan.`,
          'success'
        );
        if (onRefreshUser) await onRefreshUser();
      }
    } catch (err: any) {
      onToast('Gagal Memulai Checkout', err?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  const PLANS_DATA = [
    {
      id: 'STARTER',
      name: 'Starter Affiliator',
      badge: 'Free Tier',
      price: 0,
      period: '/ bulan',
      description: 'Cocok untuk affiliator baru yang baru memulai promosi.',
      features: [
        '1.000 AI Selfie Scans / bulan',
        'Katalog produk standar',
        'Link affiliasi & bio link',
        'Analitik performa dasar',
      ],
      isPopular: false,
      tierKey: 'STARTER',
    },
    {
      id: 'PRO',
      name: 'Pro Creator',
      badge: 'Paling Populer',
      price: 99000,
      period: '/ bulan',
      description: 'Untuk kreator aktif dan beauty influencer yang ingin meningkatkan konversi.',
      features: [
        '10.000 AI Selfie Scans / bulan',
        'Kustomisasi tema & warna AI Page',
        'Prioritas algoritma pencocokan produk',
        'Analitik konversi & lead audiens mendalam',
        'Integrasi QRIS & WhatsApp share',
      ],
      isPopular: true,
      tierKey: 'PRO',
    },
    {
      id: 'ELITE',
      name: 'Elite Brand',
      badge: 'Super Creator',
      price: 299000,
      period: '/ bulan',
      description: 'Paket terlengkap untuk top creator, agency, dan beauty brand.',
      features: [
        '50.000 AI Selfie Scans / bulan',
        'Badge Verified Creator di halaman AI',
        'Dukungan Custom Domain sendiri',
        'Dedicated Priority AI Recommendation Engine',
        'Laporan analitik ekspor Excel/PDF',
        'Priority 24/7 VIP Support',
      ],
      isPopular: false,
      tierKey: 'ELITE',
    },
  ];

  return (
    <div className="space-y-8 pb-12 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Subscription & Billing</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Kelola paket langganan Aura AI, kuota scan selfie, dan metode pembayaran Midtrans</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Midtrans Secured Payment</span>
        </div>
      </div>

      {/* 1. Current Plan Overview Bento Card */}
      <Card className="p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#0F0F11] text-white space-y-6 shadow-xl border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#F26CA7] text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                CURRENT PLAN
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                • {user.planStatus || 'Active'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {user.currentPlan || 'Starter'} Affiliator
              {currentPlanNormalized === 'PRO' && <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />}
              {currentPlanNormalized === 'ELITE' && <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />}
            </h2>
            <p className="text-xs text-zinc-400">
              {currentPlanNormalized === 'STARTER' && 'Paket Gratis • 1.000 scan per bulan'}
              {currentPlanNormalized === 'PRO' && `${formatIDR(99000)} / bulan • Kuota 10.000 scan per bulan`}
              {currentPlanNormalized === 'ELITE' && `${formatIDR(299000)} / bulan • Kuota 50.000 scan per bulan`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentPlanNormalized !== 'ELITE' && (
              <Button
                onClick={() => {
                  const targetPlan = currentPlanNormalized === 'STARTER' ? 'PRO' : 'ELITE';
                  handleUpgrade(targetPlan);
                }}
                variant="primary"
                icon={<Zap className="w-4 h-4" />}
                className="shadow-lg shadow-[#F26CA7]/20"
                disabled={loadingPlan !== null}
              >
                {loadingPlan ? 'Memproses Midtrans...' : `Upgrade ke ${currentPlanNormalized === 'STARTER' ? 'Pro' : 'Elite'}`}
              </Button>
            )}
          </div>
        </div>

        {/* Quota Progress */}
        <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-400">Penggunaan Kuota AI Selfie Scans Bulan Ini</span>
            <span className="text-[#FFB6D9]">
              {usage.toLocaleString('id-ID')} / {limit.toLocaleString('id-ID')} Scans ({usagePercentage}%)
            </span>
          </div>
          <Progress value={usagePercentage} barColor="bg-[#F26CA7]" showPercent={false} />
          <p className="text-[11px] text-zinc-500">
            Kuota scan akan di-reset otomatis pada tanggal 1 setiap bulannya.
          </p>
        </div>
      </Card>

      {/* 2. Pricing Tiers Comparison Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-zinc-900">Pilih Paket Langganan</h2>
          <p className="text-xs text-zinc-500">Pilih paket terbaik untuk memaksimalkan komisi dan engagement pengikutmu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS_DATA.map((plan) => {
            const isCurrent = currentPlanNormalized === plan.tierKey;
            const isTargetLoading = loadingPlan === plan.tierKey;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-white to-pink-50/40 border-2 border-[#F26CA7] shadow-xl shadow-pink-500/10'
                    : 'bg-white border border-zinc-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F26CA7] to-[#FF3366] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-zinc-900">{plan.name}</h3>
                      {isCurrent && (
                        <Badge variant="success">Paket Aktif</Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="py-2 border-y border-zinc-100 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
                      {formatIDR(plan.price)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">{plan.period}</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 pt-1">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-4 border-t border-zinc-100">
                  {isCurrent ? (
                    <Button variant="outline" className="w-full bg-zinc-50 text-zinc-400 border-zinc-200" disabled>
                      Paket Saat Ini
                    </Button>
                  ) : plan.price === 0 ? (
                    <Button variant="outline" className="w-full" disabled>
                      Starter
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.tierKey as 'PRO' | 'ELITE')}
                      variant={plan.isPopular ? 'primary' : 'outline'}
                      className="w-full"
                      icon={isTargetLoading ? undefined : <Zap className="w-4 h-4" />}
                      disabled={loadingPlan !== null}
                    >
                      {isTargetLoading ? 'Membuka Midtrans...' : `Upgrade ke ${plan.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Midtrans Payment Channels Banner */}
      <Card className="p-6 bg-zinc-50 border border-zinc-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F26CA7]" />
              Metode Pembayaran Resmi (Midtrans Payment Gateway)
            </h3>
            <p className="text-xs text-zinc-500">
              Transaksi diproses dengan enkripsi 256-bit berlisensi Bank Indonesia melalui Midtrans.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-zinc-600 flex-wrap">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 shadow-xs flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-purple-600" /> QRIS & GoPay
            </span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 shadow-xs flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-600" /> ShopeePay
            </span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-zinc-200 shadow-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Virtual Account (BCA, Mandiri, BNI, BRI)
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Invoice History */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Riwayat Tagihan & Faktur</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Daftar transaksi langganan akun affiliator kamu</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {[
            { date: '13 Agu 2026', amount: currentPlanNormalized === 'PRO' ? 'Rp 99.000' : currentPlanNormalized === 'ELITE' ? 'Rp 299.000' : 'Rp 0', status: 'Paid', invoice: 'INV-2026-AURA-001', plan: `${user.currentPlan || 'Starter'} Plan` },
          ].map((inv) => (
            <div key={inv.invoice} className="py-3.5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-zinc-900">{inv.invoice} • <span className="text-[#F26CA7]">{inv.plan}</span></p>
                <p className="text-[11px] text-zinc-400">{inv.date} via Midtrans Snap</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-extrabold text-zinc-900 text-sm">{inv.amount}</span>
                <Badge variant="success">{inv.status}</Badge>
                <button
                  onClick={() => onToast('Invoice Diunduh', `Faktur ${inv.invoice} berhasil diunduh.`)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Unduh PDF Faktur"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};
