import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RouteView } from '../../types';
import { Button, Input, Card, Badge } from '../../components/ui/UIComponents';

const heroBgImage = '/image/Background.png';

interface AuthPagesProps {
  initialView: 'login' | 'register' | 'forgot-password';
  onNavigate: (route: RouteView) => void;
  onSuccess?: () => void;
  onLoginAs?: (email: string, password: string) => void;
  onRegister?: (email: string, password: string, name: string) => void;
  onGoogleLogin?: (idToken: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ initialView, onNavigate, onSuccess, onLoginAs, onRegister, onGoogleLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(initialView);
  const [email, setEmail] = useState('kate@auraai.local');
  const [password, setPassword] = useState('Affiliator123!');
  const [name, setName] = useState('Kate Jenkins');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const passwordRules = [
    { label: 'Minimal 8 karakter', ok: password.length >= 8 },
    { label: 'Huruf besar (A-Z)', ok: /[A-Z]/.test(password) },
    { label: 'Huruf kecil (a-z)', ok: /[a-z]/.test(password) },
    { label: 'Angka (0-9)', ok: /[0-9]/.test(password) },
    { label: 'Simbol (!@#$%)', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const isPasswordValid = passwordRules.every((rule) => rule.ok);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = (import.meta as unknown as { env: Record<string, string> }).env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (authMode === 'forgot-password' || !googleClientId || !onGoogleLogin) return;

    let cancelled = false;
    const tryRender = () => {
      if (cancelled) return;
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => onGoogleLogin(response.credential),
        });
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 336,
        });
      } else {
        setTimeout(tryRender, 200);
      }
    };
    tryRender();

    return () => {
      cancelled = true;
    };
  }, [authMode, googleClientId, onGoogleLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (authMode === 'forgot-password') {
        setResetSent(true);
      } else if (authMode === 'register') {
        if (onRegister) {
          onRegister(email, password, name);
        } else {
          if (onSuccess) onSuccess();
          onNavigate('dashboard');
        }
      } else {
        if (onLoginAs) {
          onLoginAs(email, password);
        } else {
          if (onSuccess) onSuccess();
          onNavigate('dashboard');
        }
      }
    }, 800);
  };

  const handleQuickAdminLogin = () => {
    setEmail('admin@auraai.local');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onLoginAs) {
        onLoginAs('admin@auraai.local', 'Admin123!');
      } else {
        onNavigate('admin-dashboard');
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#FFF8FC] overflow-hidden">
      {/* Soft Dreamy Pastel Cloud Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={heroBgImage}
          alt="Bright dreamy pastel cloud background"
          className="w-full h-full object-cover object-center opacity-100 scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/30 to-[#FFF8FC]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        
        {/* Auth Card */}
        <Card className="p-8 shadow-xl border-zinc-200">
          
          {/* Header titles */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">
              {authMode === 'login' && 'Welcome Back'}
              {authMode === 'register' && 'Start Your 14-Day Free Trial'}
              {authMode === 'forgot-password' && 'Reset Your Password'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {authMode === 'login' && 'Sign in to access your BeautyAI Affiliator dashboard.'}
              {authMode === 'register' && 'Create your account to start converting followers with AI.'}
              {authMode === 'forgot-password' && 'Enter your registered email address.'}
            </p>
          </div>

          {resetSent && authMode === 'forgot-password' ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-800">Password Reset Link Sent!</h3>
              <p className="text-xs text-emerald-600">Check your inbox ({email}) for instructions to reset your password.</p>
              <Button
                onClick={() => { setResetSent(false); setAuthMode('login'); }}
                variant="outline"
                className="w-full mt-2"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <Input
                  label="Full Name"
                  placeholder="e.g. Kate Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4 text-zinc-400" />}
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="kate@auraai.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-zinc-400" />}
                required
              />

              {authMode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-4 h-4 text-zinc-400" />}
                    required
                  />
                  {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                      {passwordRules.map((rule) => (
                        <div
                          key={rule.label}
                          className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                            rule.ok ? 'text-emerald-600' : 'text-zinc-400'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${rule.ok ? 'text-emerald-500' : 'text-zinc-300'}`} />
                          <span>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-600">
                    <input type="checkbox" defaultChecked className="rounded border-zinc-300 text-[#F26CA7]" />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-[#F26CA7] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={authMode === 'register' && !isPasswordValid}
                className="w-full mt-2"
              >
                {authMode === 'login' && 'Sign In to Dashboard'}
                {authMode === 'register' && 'Create Account & Launch'}
                {authMode === 'forgot-password' && 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Quick Demo Credentials Switcher */}
          {authMode === 'login' && (
            <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Quick Demo Login Selector</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setEmail('kate@auraai.local'); setPassword('Affiliator123!'); }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    email === 'kate@auraai.local'
                      ? 'bg-[#F26CA7] text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Affiliator Demo
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail('admin@auraai.local'); setPassword('Admin123!'); }}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    email === 'admin@auraai.local'
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  Admin Demo
                </button>
              </div>
            </div>
          )}

          {/* Social Sign-In */}
          {authMode !== 'forgot-password' && (
            <div className="mt-5 pt-5 border-t border-zinc-100 text-center space-y-3">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Or continue with</p>

              {googleClientId && onGoogleLogin ? (
                <div ref={googleButtonRef} className="flex justify-center" />
              ) : (
                <button
                  type="button"
                  disabled
                  title="Google sign-in is not configured"
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-400 flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <span className="font-bold">G</span>
                  <span>Google (not configured)</span>
                </button>
              )}
            </div>
          )}

          {/* Mode Switcher Footer */}
          <div className="mt-6 text-center text-xs text-zinc-500">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-[#F26CA7] font-bold hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-[#F26CA7] font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

        </Card>

        <p className="text-[11px] text-zinc-400 text-center">
          By signing in, you agree to BeautyAI's Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
};
