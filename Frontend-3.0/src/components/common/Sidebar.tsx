import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingBag, 
  Sparkles, 
  Users, 
  CreditCard, 
  Settings, 
  ExternalLink,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { RouteView, UserProfile } from '../../types';
import { Avatar } from '../ui/UIComponents';

interface SidebarProps {
  currentRoute: RouteView;
  onNavigate: (route: RouteView) => void;
  user: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  onNavigate, 
  user,
  isMobileOpen = false,
  onCloseMobile 
}) => {
  const isAdmin = user.role === 'admin';

  const menuItems: Array<{ id: RouteView; label: string; icon: any; badge?: string }> = isAdmin ? [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'admin-products', label: 'Master Products', icon: ShoppingBag },
    { id: 'admin-affiliators', label: 'Affiliator', icon: Users },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Admin Settings', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'ai-pages', label: 'AI Pages', icon: Sparkles },
    { id: 'customers', label: 'Customers & Leads', icon: Users },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (route: RouteView) => {
    onNavigate(route);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-zinc-900">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-black/[0.06]">
        <div 
          onClick={() => handleNav('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F26CA7] to-[#FFB6D9] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-lg text-zinc-900 font-logo">aura</span>
        </div>

        {/* Close button on mobile */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Main Menu</p>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#F26CA7] to-[#e05593] text-white shadow-md glow-pink'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-[#F26CA7]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-black/[0.06] bg-zinc-50/50">
        <div 
          onClick={() => handleNav('settings')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 truncate">{user.name}</h4>
              <p className="text-[10px] text-zinc-500 truncate">{user.handle}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </div>

        <button
          onClick={() => handleNav('landing')}
          className="w-full mt-3 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white text-zinc-900 flex-col h-[calc(100vh-20px)] sticky top-2.5 z-30 shrink-0 my-2.5 ml-2.5 rounded-2xl overflow-hidden border border-black/[0.06]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay & Panel with Animation */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Dark Backdrop Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onCloseMobile}
            />

            {/* Drawer Sidebar Slide-in */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl z-50 flex flex-col h-full border-r border-black/[0.06]"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
