import React, { useState } from 'react';
import { Sparkles, Menu, X, UserCheck, ChevronRight, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RouteView } from '../../types';
import { Button } from '../ui/UIComponents';

interface NavbarProps {
  currentRoute: RouteView;
  onNavigate: (route: RouteView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (callback?: () => void) => {
    setMobileMenuOpen(false);
    if (callback) callback();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/35 backdrop-blur-md border-b border-zinc-200/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F26CA7] via-[#f788b9] to-[#FFB6D9] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <span className="text-[28px] text-zinc-900 font-logo">aura</span>
        </div>

        {/* Desktop Navigation Links (Visible on Large Screens lg+) */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <a href="#about" className="hover:text-[#F26CA7] transition-colors">
            About Us
          </a>
          <button onClick={() => onNavigate('landing')} className="hover:text-[#F26CA7] transition-colors cursor-pointer">
            Features
          </button>
          <a href="#how-it-works" className="hover:text-[#F26CA7] transition-colors">
            How It Works
          </a>
        </nav>

        {/* Desktop Action Buttons (Visible on Large Screens lg+) */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => onNavigate('register')}
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 px-3 py-2 cursor-pointer transition-colors"
          >
            Sign Up
          </button>
          
          <Button
            onClick={() => onNavigate('login')}
            variant="primary"
            size="md"
            icon={<LogIn className="w-4 h-4" />}
          >
            Log In
          </Button>
        </div>

        {/* Tablet & Mobile Hamburger Toggle (Visible on lg:hidden) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2.5 rounded-xl bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-800 transition-colors border border-zinc-200/80"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#F26CA7]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Tablet & Mobile Hamburger Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4 divide-y divide-zinc-100">
              
              {/* Navigation Links */}
              <div className="space-y-1.5 pb-2">
                <a
                  href="#about"
                  onClick={() => handleNavClick()}
                  className="flex items-center justify-between w-full text-left font-semibold text-zinc-800 hover:text-[#F26CA7] p-2.5 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
                <button
                  onClick={() => handleNavClick(() => onNavigate('landing'))}
                  className="flex items-center justify-between w-full text-left font-semibold text-zinc-800 hover:text-[#F26CA7] p-2.5 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <span>Features</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                <a
                  href="#how-it-works"
                  onClick={() => handleNavClick()}
                  className="flex items-center justify-between w-full text-left font-semibold text-zinc-800 hover:text-[#F26CA7] p-2.5 rounded-xl hover:bg-zinc-50 transition-colors"
                >
                  <span>How It Works</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2.5">
                <Button
                  onClick={() => handleNavClick(() => onNavigate('login'))}
                  variant="primary"
                  size="md"
                  icon={<LogIn className="w-4 h-4" />}
                  className="w-full justify-center shadow-md py-3"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => handleNavClick(() => onNavigate('register'))}
                  variant="outline"
                  size="md"
                  icon={<UserCheck className="w-4 h-4" />}
                  className="w-full justify-center bg-zinc-50 py-3"
                >
                  Sign Up
                </Button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
