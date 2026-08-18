import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { RouteView } from '../../types';
import { Button, Card } from '../../components/ui/UIComponents';

const heroBgImage = '/image/Background.png';

interface VerifyEmailPageProps {
  token: string;
  onVerify: (token: string) => Promise<boolean>;
  onNavigate: (route: RouteView) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ token, onVerify, onNavigate }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(token ? 'verifying' : 'error');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    onVerify(token).then((ok) => {
      if (!cancelled) setStatus(ok ? 'success' : 'error');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#FFF8FC] overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={heroBgImage}
          alt="Bright dreamy pastel cloud background"
          className="w-full h-full object-cover object-center opacity-100 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-[#FFF8FC]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="p-8 shadow-xl border-zinc-200 text-center space-y-4">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#F26CA7]" />
              <h2 className="text-xl font-bold text-zinc-900">Verifying your email...</h2>
              <p className="text-xs text-zinc-500">Hang tight, this only takes a moment.</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
              <h2 className="text-xl font-bold text-zinc-900">Email verified!</h2>
              <p className="text-xs text-zinc-500">Your account is active — you can sign in now.</p>
              <Button className="w-full mt-2" onClick={() => onNavigate('login')}>
                Go to Sign In
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-10 h-10 mx-auto text-red-500" />
              <h2 className="text-xl font-bold text-zinc-900">Link invalid or expired</h2>
              <p className="text-xs text-zinc-500">
                This verification link no longer works. Sign in and use "Resend Verification Email" to get a new one.
              </p>
              <Button className="w-full mt-2" variant="outline" onClick={() => onNavigate('login')}>
                Go to Sign In
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
