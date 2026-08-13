import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Settings, 
  ExternalLink,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { RouteView, UserProfile } from '../../types';
import { Avatar, Button, Modal } from '../ui/UIComponents';

interface SidebarProps {
  currentRoute: RouteView;
  onNavigate: (route: RouteView) => void;
  user: UserProfile;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentRoute, 
  onNavigate, 
  user,
  isMobileOpen = false,
  onCloseMobile,
  onLogout
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = React.useState(false);
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
    { id: 'customers', label: 'Audience', icon: Users },
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
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between'} border-b border-black/[0.06]`}>
        <div 
          onClick={() => handleNav('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
          title="Home"
        >
          {/* Black Framed Logo Container */}
          <div className="w-9 h-9 rounded-2xl bg-black border border-black shadow-xs flex items-center justify-center p-1.5 shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/image/logo.png"
              alt="Aura Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && <span className="text-[20px] text-zinc-900 font-logo whitespace-nowrap overflow-hidden">aura</span>}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>

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
        {!isCollapsed && <p className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Main Menu</p>}

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#F8EEFF] to-[#FFF8FE] text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F26CA7]' : 'text-zinc-400'}`} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-bold shrink-0 ${
                    isActive ? 'bg-white text-[#F26CA7]' : 'bg-zinc-100 text-[#F26CA7]'
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
      <div className="p-4 border-t border-black/[0.06] bg-zinc-50/50 flex flex-col gap-2">
        <div 
          onClick={() => handleNav('settings')}
          title={isCollapsed ? "Settings" : undefined}
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-xl hover:bg-zinc-100 cursor-pointer transition-colors`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={user.avatarUrl} name={user.name} size="sm" />
            {!isCollapsed && (
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-900 truncate">{user.name}</h4>
                <p className="text-[10px] text-zinc-500 truncate">{user.handle}</p>
              </div>
            )}
          </div>
          {!isCollapsed && <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />}
        </div>

        <button
          onClick={() => setIsSignOutModalOpen(true)}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-colors cursor-pointer`}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white/90 backdrop-blur-md text-zinc-900 flex-col h-[calc(100vh-32px)] sticky top-4 z-30 shrink-0 my-4 ml-4 rounded-3xl overflow-hidden border border-zinc-200/80 shadow-sm`}>
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
              className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white/90 backdrop-blur-md shadow-2xl z-50 flex flex-col h-full border-r border-zinc-200/80 rounded-r-[32px]"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        title="Konfirmasi Sign Out"
        description="Apakah kamu yakin ingin keluar dari akun ini?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
            <Avatar src={user.avatarUrl} name={user.name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email || user.handle}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsSignOutModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsSignOutModalOpen(false);
                onLogout();
              }}
              icon={<LogOut className="w-4 h-4" />}
            >
              Ya, Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
