import React from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Download, Zap } from 'lucide-react';
import { UserProfile } from '../../types';
import { Card, Button, Badge, Progress } from '../../components/ui/UIComponents';

interface SubscriptionViewProps {
  user: UserProfile;
  onToast: (title: string, desc?: string) => void;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({ user, onToast }) => {
  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Subscription & Billing</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your Aura plan tiers, scan quotas, and invoices</p>
      </div>

      {/* Current Plan Overview */}
      <Card className="p-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#0F0F11] text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary">CURRENT PLAN</Badge>
              <span className="text-xs text-emerald-400 font-bold">• Active</span>
            </div>
            <h2 className="text-2xl font-bold">Pro Affiliator Plan</h2>
            <p className="text-xs text-zinc-400">$79.00 / month • Renews on August 15, 2026</p>
          </div>

          <Button
            onClick={() => onToast('Plan Updated', 'You are on the optimal Pro Affiliator plan.')}
            variant="primary"
            icon={<Zap className="w-4 h-4" />}
          >
            Manage Subscription
          </Button>
        </div>

        {/* Quota Progress */}
        <div className="p-4 bg-zinc-900/90 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-400">Monthly AI Selfie Scans Quota</span>
            <span className="text-[#FFB6D9]">4,820 / 10,000 Scans Used (48.2%)</span>
          </div>
          <Progress value={48.2} barColor="bg-[#F26CA7]" showPercent={false} />
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-zinc-900">Payment Method</h3>
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-zinc-200 rounded-xl">
              <CreditCard className="w-6 h-6 text-zinc-800" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Visa ending in •••• 4242</p>
              <p className="text-[10px] text-zinc-500">Expires 12/28</p>
            </div>
          </div>
          <Button onClick={() => onToast('Payment Method', 'Card updated successfully.')} variant="outline" size="sm">
            Update Card
          </Button>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-zinc-900">Billing Invoice History</h3>
        <div className="divide-y divide-zinc-100 text-xs">
          {[
            { date: 'Jul 15, 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-007' },
            { date: 'Jun 15, 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-006' },
            { date: 'May 15, 2026', amount: '$79.00', status: 'Paid', invoice: 'INV-2026-005' },
          ].map((inv) => (
            <div key={inv.invoice} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-zinc-900">{inv.invoice}</p>
                <p className="text-[10px] text-zinc-400">{inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-zinc-900">{inv.amount}</span>
                <Badge variant="success">{inv.status}</Badge>
                <button
                  onClick={() => onToast('Invoice Downloaded', `PDF invoice ${inv.invoice} downloaded.`)}
                  className="p-1 text-zinc-400 hover:text-zinc-900"
                  title="Download Invoice PDF"
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
