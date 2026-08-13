import React, { useState } from 'react';
import { Menu, X, ChevronRight, LogIn, UserCheck } from 'lucide-react';
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
    <header className="fixed top-3 sm:top-5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none">
      {/* Floating Glassmorphic Island Capsule (20% opacity with heavy blur) */}
      <div className="pointer-events-auto max-w-5xl mx-auto rounded-full bg-white/20 backdrop-blur-[32px] border border-white/25 px-4 sm:px-6 py-2.5 sm:py-3 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all duration-300">
        
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          {/* Black Framed Logo Container */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black border border-black shadow-xs flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform">
            <img
              src="/image/logo.png"
              alt="Aura Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[20px] text-zinc-900 font-logo tracking-tight">aura</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-medium text-zinc-700">
          <a
            href="#about"
            className="px-3.5 py-1.5 rounded-full hover:text-[#F26CA7] hover:bg-black/5 transition-all"
          >
            About Us
          </a>
          <a
            href="#features"
            className="px-3.5 py-1.5 rounded-full hover:text-[#F26CA7] hover:bg-black/5 transition-all"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-3.5 py-1.5 rounded-full hover:text-[#F26CA7] hover:bg-black/5 transition-all"
          >
            How It Works
          </a>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigate('register')}
            className="text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-950 px-4 py-2 rounded-xl hover:bg-black/5 transition-all cursor-pointer"
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#F26CA7]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Floating Dropdown Card */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto md:hidden mt-2 max-w-5xl mx-auto rounded-3xl bg-white/80 backdrop-blur-[32px] border border-white/20 shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-5 overflow-hidden"
          >
            <div className="space-y-3">
              
              {/* Navigation Links */}
              <div className="space-y-1">
                <a
                  href="#about"
                  onClick={() => handleNavClick()}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-zinc-800 hover:text-[#F26CA7] p-3 rounded-2xl hover:bg-black/5 transition-colors"
                >
                  <span>About Us</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
                <a
                  href="#features"
                  onClick={() => handleNavClick()}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-zinc-800 hover:text-[#F26CA7] p-3 rounded-2xl hover:bg-black/5 transition-colors"
                >
                  <span>Features</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => handleNavClick()}
                  className="flex items-center justify-between w-full text-left text-sm font-semibold text-zinc-800 hover:text-[#F26CA7] p-3 rounded-2xl hover:bg-black/5 transition-colors"
                >
                  <span>How It Works</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
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
                  className="w-full justify-center bg-zinc-50/80 py-3"
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
