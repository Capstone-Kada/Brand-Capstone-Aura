import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumLoaderProps {
  isVisible: boolean;
  theme?: 'dark' | 'light';
  message?: string;
  children?: React.ReactNode;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ 
  isVisible, 
  theme = 'dark',
  message = 'Initializing',
  children
}) => {
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="beauty-minimal-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[200] flex flex-col items-center justify-center select-none overflow-hidden ${isDark ? 'bg-[#080810]' : 'bg-[#FAFAFC]'}`}
        >
          {/* Subtle top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F26CA7]/40 to-transparent" />

          {/* Main centered content */}
          <div className="relative z-10 flex flex-col items-center gap-10 text-center px-8 max-w-sm">

            {/* 1. Logo mark */}
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <div
                className={`w-[60px] h-[60px] flex items-center justify-center p-2 rounded-2xl ${isDark ? 'bg-transparent' : 'bg-black shadow-lg'}`}
              >
                <img
                  src="/image/logo.png"
                  alt="Aura Logo"
                  className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(242,108,167,0.3)]"
                  style={{ animation: 'spinLogo 6s linear infinite' }}
                />
              </div>
            </motion.div>

            {/* 2. Divider line */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
              className="w-12 h-px bg-[#F26CA7]/30 origin-center"
            />

            {/* 3. Children (Optional) */}
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                className="w-full"
              >
                {children}
              </motion.div>
            )}

            {/* 4. Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85, ease: 'easeOut' }}
              className="w-full space-y-3"
            >
              <div className={`w-full h-px overflow-hidden ${isDark ? 'bg-white/8' : 'bg-black/10'}`}>
                <div
                  className="h-full bg-gradient-to-r from-[#F26CA7]/0 via-[#F26CA7] to-[#F26CA7]/0"
                  style={{ animation: 'shimmerBar 2s ease-in-out infinite' }}
                />
              </div>
              <p className={`text-[10px] tracking-[0.25em] font-bold uppercase ${isDark ? 'text-white/20' : 'text-zinc-500'}`}>
                {message}
              </p>
            </motion.div>

          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F26CA7]/20 to-transparent" />

          <style>{`
            @keyframes spinLogo {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes shimmerBar {
              0% { transform: translateX(-100%); width: 60%; }
              50% { width: 80%; }
              100% { transform: translateX(200%); width: 60%; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
