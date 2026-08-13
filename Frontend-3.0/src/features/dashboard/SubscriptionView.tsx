import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Zap, 
  Crown, 
  QrCode,
  Smartphone,
  Building2,
  Check,
  ExternalLink,
  Lock,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';
import { Card, Button, Badge, Progress, Modal } from '../../components/ui/UIComponents';
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

interface PaymentOption {
  id: string;
  category: 'E-Wallet & QRIS' | 'Virtual Account' | 'Kartu Debit/Kredit';
  name: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'qris',
    category: 'E-Wallet & QRIS',
    name: 'QRIS (Semua Bank & E-Wallet)',
    badge: 'Paling Praktis',
    description: 'Scan otomatis dengan BCA Mobile, GoPay, OVO, DANA, ShopeePay, LinkAja, dll.',
    icon: <QrCode className="w-5 h-5 text-[#F26CA7]" />,
  },
  {
    id: 'gopay',
    category: 'E-Wallet & QRIS',
    name: 'GoPay & GoPay Later',
    description: 'Pembayaran instan langsung terhubung ke aplikasi Gojek.',
    icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: 'shopeepay',
    category: 'E-Wallet & QRIS',
    name: 'ShopeePay',
    description: 'Buka aplikasi Shopee dan konfirmasi pembayaran seketika.',
    icon: <Smartphone className="w-5 h-5 text-amber-600" />,
  },
  {
    id: 'bca_va',
    category: 'Virtual Account',
    name: 'BCA Virtual Account',
    badge: 'Otomatis 24 Jam',
    description: 'Transfer via BCA Mobile, KlikBCA, atau ATM tanpa konfirmasi manual.',
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
  },
  {
    id: 'mandiri_va',
    category: 'Virtual Account',
    name: 'Mandiri Virtual Account (Livin\')',
    description: 'Bayar mudah melalui aplikasi Livin\' by Mandiri atau ATM.',
    icon: <Building2 className="w-5 h-5 text-blue-700" />,
  },
  {
    id: 'bni_va',
    category: 'Virtual Account',
    name: 'BNI Virtual Account',
    description: 'Transfer instan via BNI Mobile Banking atau ATM BNI.',
    icon: <Building2 className="w-5 h-5 text-teal-600" />,
  },
  {
    id: 'bri_va',
    category: 'Virtual Account',
    name: 'BRI Virtual Account (BRIVA)',
    description: 'Bayar via BRImo atau ATM BRI dengan verifikasi otomatis.',
    icon: <Building2 className="w-5 h-5 text-blue-800" />,
  },
  {
    id: 'card',
    category: 'Kartu Debit/Kredit',
    name: 'Kartu Debit / Kredit (Visa / Mastercard / JCB)',
    badge: '3D Secure',
    description: 'Pembayaran kartu dengan enkripsi keamanan OTP resmi bank penerbit.',
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
  },
];

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onToast, onRefreshUser }) => {
  const [loadingPlan, setLoadingPlan] = useState<'PRO' | 'ELITE' | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(() => {
    return localStorage.getItem('aura_preferred_payment_method') || 'qris';
  });

  const activePaymentOption = PAYMENT_OPTIONS.find((p) => p.id === selectedPaymentMethodId) || PAYMENT_OPTIONS[0];

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

  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethodId(id);
    localStorage.setItem('aura_preferred_payment_method', id);
    const method = PAYMENT_OPTIONS.find((p) => p.id === id);
    onToast('Metode Pembayaran Dipilih', `${method?.name || 'Metode'} siap digunakan untuk transaksi.`, 'success');
    setIsPaymentModalOpen(false);
  };

  const handleUpgrade = async (plan: 'PRO' | 'ELITE') => {
    setLoadingPlan(plan);
    try {
      const checkoutData = await api.subscription.checkout(plan);

      // Check if Midtrans Snap script is loaded
      if (typeof window !== 'undefined' && window.snap && checkoutData.snapToken && !checkoutData.snapToken.startsWith('mock-')) {
        window.snap.pay(checkoutData.snapToken, {
          onSuccess: async () => {
            setIsPlanModalOpen(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            onToast(
              'Pembayaran Berhasil! 🎉',
              `Selamat! Akun Anda berhasil di-upgrade ke paket ${plan}.`,
              'success'
            );
            if (onRefreshUser) await onRefreshUser();
          },
          onPending: () => {
            onToast(
              'Menunggu Pembayaran',
              'Silakan selesaikan pembayaran sesuai instruksi pada layar.',
              'info'
            );
          },
          onError: () => {
            onToast('Pembayaran Gagal', 'Terjadi kendala saat memproses transaksi.', 'error');
          },
          onClose: () => {
            onToast('Pembayaran Dibatalkan', 'Modal pembayaran ditutup.', 'info');
          },
        });
      } else {
        // Fallback for Sandbox simulation if keys are pending or mock token returned
        setIsPlanModalOpen(false);
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
          <p className="text-xs text-zinc-500 mt-0.5">Kelola paket langganan Aura AI, kuota scan selfie, dan metode pembayaran</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Midtrans Secured Payment</span>
        </div>
      </div>

      {/* 1. Current Plan Overview Bento Card (LIGHT MODE) */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-zinc-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#F26CA7] text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                CURRENT PLAN
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user.planStatus || 'Active'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                {user.currentPlan || 'Starter'} Affiliator
              </h2>
              {currentPlanNormalized === 'PRO' && (
                <div className="p-1 bg-amber-100 rounded-lg text-amber-600">
                  <Zap className="w-4 h-4 fill-amber-500" />
                </div>
              )}
              {currentPlanNormalized === 'ELITE' && (
                <div className="p-1 bg-amber-100 rounded-lg text-amber-600">
                  <Crown className="w-4 h-4 fill-amber-500" />
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              {currentPlanNormalized === 'STARTER' && 'Paket Dasar Gratis • Kuota 1.000 scan per bulan'}
              {currentPlanNormalized === 'PRO' && `${formatIDR(99000)} / bulan • Kuota 10.000 scan per bulan`}
              {currentPlanNormalized === 'ELITE' && `${formatIDR(299000)} / bulan • Kuota 50.000 scan per bulan`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsPlanModalOpen(true)}
              variant="primary"
              icon={<Zap className="w-4 h-4" />}
              className="shadow-md shadow-[#F26CA7]/20 font-bold"
            >
              {currentPlanNormalized === 'STARTER' ? 'Upgrade ke Pro' : 'Lihat Pilihan Plan'}
            </Button>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-600">Penggunaan Kuota AI Selfie Scans Bulan Ini</span>
            <span className="text-[#F26CA7] font-extrabold">
              {usage.toLocaleString('id-ID')} / {limit.toLocaleString('id-ID')} Scans ({usagePercentage}%)
            </span>
          </div>
          <Progress value={usagePercentage} barColor="bg-[#F26CA7]" showPercent={false} />
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Sisa kuota: {Math.max(0, limit - usage).toLocaleString('id-ID')} scan</span>
            <span>Reset otomatis setiap tanggal 1</span>
          </div>
        </div>
      </div>

      {/* 2. Payment Method Card with Single Button & Active Selection Display */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-800 shrink-0 mt-0.5">
              {activePaymentOption.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">
                  {activePaymentOption.name}
                </h3>
                {activePaymentOption.badge && (
                  <Badge variant="primary">{activePaymentOption.badge}</Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                {activePaymentOption.description}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold pt-0.5">
                <Check className="w-3.5 h-3.5" />
                <span>Metode Utama Dipilih via Midtrans Snap</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setIsPaymentModalOpen(true)}
            variant="outline"
            size="sm"
            icon={<ExternalLink className="w-4 h-4" />}
          >
            Ganti Opsi Pembayaran
          </Button>
        </div>
      </Card>

      {/* 3. Invoice History */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Riwayat Tagihan & Faktur</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Daftar transaksi langganan akun affiliator kamu</p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          {[
            { 
              date: '13 Agu 2026', 
              amount: currentPlanNormalized === 'PRO' ? 'Rp 99.000' : currentPlanNormalized === 'ELITE' ? 'Rp 299.000' : 'Rp 0', 
              status: 'Paid', 
              invoice: 'INV-2026-AURA-001', 
              plan: `${user.currentPlan || 'Starter'} Plan`,
              paymentMethod: activePaymentOption.name
            },
          ].map((inv) => (
            <div key={inv.invoice} className="py-3.5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-zinc-900">{inv.invoice} • <span className="text-[#F26CA7]">{inv.plan}</span></p>
                <p className="text-[11px] text-zinc-400">{inv.date} via {inv.paymentMethod}</p>
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

      {/* ================= MODAL 1: PLAN TIERS ================= */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Pilih Paket Langganan Aura AI"
        description="Tingkatkan kuota scan dan maksimalkan komisi penjualan produk Anda"
        maxWidth="5xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 pb-2">
          {PLANS_DATA.map((plan) => {
            const isCurrent = currentPlanNormalized === plan.tierKey;
            const isTargetLoading = loadingPlan === plan.tierKey;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-white to-pink-50/40 border-2 border-[#F26CA7] shadow-lg shadow-pink-500/10'
                    : 'bg-white border border-zinc-200 shadow-xs'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F26CA7] to-[#FF3366] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-zinc-900">{plan.name}</h3>
                      {isCurrent && <Badge variant="success">Aktif</Badge>}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="py-2.5 border-y border-zinc-100 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-zinc-900">
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

                <div className="pt-5 mt-4 border-t border-zinc-100">
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
                      className="w-full font-bold"
                      icon={isTargetLoading ? undefined : <Zap className="w-4 h-4" />}
                      disabled={loadingPlan !== null}
                    >
                      {isTargetLoading ? 'Membuka Midtrans...' : `Upgrade Sekarang`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* ================= MODAL 2: SELECTABLE PAYMENT METHODS ================= */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pilih Metode Pembayaran"
        description="Pilih metode pembayaran utama yang ingin Anda gunakan di Midtrans Snap"
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2 pb-2">
          
          <div className="space-y-3">
            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedPaymentMethodId === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectPaymentMethod(option.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-pink-50/40 border-[#F26CA7] shadow-sm ring-2 ring-[#F26CA7]/20'
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${
                      isSelected ? 'bg-white border-[#F26CA7]/30 text-[#F26CA7]' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                    }`}>
                      {option.icon}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-900">{option.name}</h4>
                        {option.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-[#F26CA7] text-white' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {option.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 leading-snug">{option.description}</p>
                    </div>
                  </div>

                  {/* Radio / Selection Indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#F26CA7] bg-[#F26CA7] text-white'
                        : 'border-zinc-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security footnote */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-2 text-[11px] text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Enkripsi 256-bit SSL berlisensi resmi Bank Indonesia melalui Midtrans.</span>
          </div>

        </div>
      </Modal>

    </div>
  );
};
