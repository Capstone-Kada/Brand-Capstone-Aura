import React, { useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useBeautyStore } from './hooks/useBeautyStore';
import { ToastContainer } from './components/ui/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Avatar } from './components/ui/UIComponents';

// Views
import { LandingPage } from './features/landing/LandingPage';
import { AuthPages } from './features/auth/AuthPages';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { OverviewView } from './features/dashboard/OverviewView';
import { AnalyticsView } from './features/dashboard/AnalyticsView';
import { ProductsView } from './features/dashboard/ProductsView';
import { AIPagesView } from './features/dashboard/AIPagesView';
import { CustomersView } from './features/dashboard/CustomersView';
import { SubscriptionView } from './features/dashboard/SubscriptionView';
import { SettingsView } from './features/dashboard/SettingsView';
import { AdminDashboardView } from './features/dashboard/AdminDashboardView';
import { PublicAIExperience } from './features/ai-recommendation/PublicAIExperience';

export default function App() {
  const {
    currentRoute,
    navigateTo,
    user,
    loginAs,
    verify2FA,
    loginWithGoogle,
    registerAffiliator,
    emailVerifyToken,
    verifyEmailToken,
    resendVerification,
    activePageSlug,
    affiliators,
    updateAffiliatorStatus,
    updateAffiliator,
    deleteAffiliator,
    updateProfile,
    regenerateApiKey,
    products,
    masterCatalog,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductApproval,
    aiPages,
    updateAIPage,
    leads,
    analytics,
    chartData,
    undertoneStats,
    concernStats,
    toasts,
    addToast,
    removeToast,
    // Scan states
    scannedImage,
    isAnalyzing,
    analysisStep,
    scanResult,
    startSelfieScan,
    resetScan,
    recordAffiliateClick,
    isLoadingWorkspace,
    logout,
    reloadWorkspace
  } = useBeautyStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Link Copied!', 'Copied to clipboard. Paste into your TikTok or Instagram bio.');
  };

  const isDashboardRoute = [
    'dashboard',
    'analytics',
    'products',
    'ai-pages',
    'customers',
    'subscription',
    'settings',
    'admin-dashboard',
    'admin-products',
    'admin-affiliators',
    'admin-analytics'
  ].includes(currentRoute);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-[#0F0F11] font-sans selection:bg-[#FFB6D9] selection:text-[#0F0F11]">
      
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* WORKSPACE LOADING OVERLAY (login / session restore / register) */}
      {isLoadingWorkspace && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#F26CA7]/30 border-t-[#F26CA7] rounded-full animate-spin" />
          <p className="text-xs font-semibold text-zinc-500">Memuat dashboard kamu...</p>
        </div>
      )}

      {/* LANDING PAGE ROUTE */}
      {currentRoute === 'landing' && (
        <>
          <Navbar currentRoute={currentRoute} onNavigate={navigateTo} />
          <LandingPage onNavigate={navigateTo} />
        </>
      )}

      {/* AUTHENTICATION ROUTES */}
      {['login', 'register', 'forgot-password'].includes(currentRoute) && (
        <AuthPages
          initialView={currentRoute as 'login' | 'register' | 'forgot-password'}
          onNavigate={navigateTo}
          onLoginAs={loginAs}
          onVerify2FA={verify2FA}
          onRegister={registerAffiliator}
          onGoogleLogin={loginWithGoogle}
          onResendVerification={resendVerification}
          onSuccess={() => addToast('Welcome to Aura!', 'Portal is ready.', 'success')}
        />
      )}

      {/* EMAIL VERIFICATION LANDING PAGE (from the link in the verification email) */}
      {currentRoute === 'verify-email' && (
        <VerifyEmailPage
          token={emailVerifyToken}
          onVerify={verifyEmailToken}
          onNavigate={navigateTo}
        />
      )}

      {/* PUBLIC AI RECOMMENDATION PAGE EXPERIENCE (Live Follower View) */}
      {currentRoute === 'public-recommendation' && (
        <PublicAIExperience
          user={user}
          products={products}
          pageSlug={activePageSlug}
          scannedImage={scannedImage}
          isAnalyzing={isAnalyzing}
          analysisStep={analysisStep}
          scanResult={scanResult}
          isPublicView={true}
          onStartScan={startSelfieScan}
          onResetScan={resetScan}
          onNavigate={navigateTo}
          onToast={(title, desc) => addToast(title, desc, 'info')}
          onRecordClick={recordAffiliateClick}
        />
      )}

      {/* INTERNAL CREATOR PREVIEW EXPERIENCE (Dashboard Preview Page) */}
      {currentRoute === 'internal-preview' && (
        <PublicAIExperience
          user={user}
          products={products}
          pageSlug={activePageSlug}
          scannedImage={scannedImage}
          isAnalyzing={isAnalyzing}
          analysisStep={analysisStep}
          scanResult={scanResult}
          isPublicView={false}
          onStartScan={startSelfieScan}
          onResetScan={resetScan}
          onNavigate={navigateTo}
          onToast={(title, desc) => addToast(title, desc, 'info')}
          onRecordClick={recordAffiliateClick}
        />
      )}

      {/* AFFILIATOR DASHBOARD LAYOUT & VIEWS */}
      {isDashboardRoute && (
        <div 
          className="flex flex-col lg:flex-row min-h-screen relative"
          style={{
            backgroundImage: `url('/image/Background-2.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0 pointer-events-none" />

          {/* Wrapper to contain layout above the overlay */}
          <div className="relative z-10 flex flex-col lg:flex-row w-full min-h-screen">
            {/* Mobile Navigation Header Bar */}
            <header className="lg:hidden bg-[#0F0F11]/90 backdrop-blur-md text-white px-4 py-3 border-b border-zinc-800/80 sticky top-0 z-30 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div 
                  onClick={() => navigateTo('landing')} 
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-black border border-black shadow-xs flex items-center justify-center p-1 shrink-0">
                    <img
                      src="/image/logo.png"
                      alt="Aura Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[20px] text-white font-logo tracking-tight">aura</span>
                </div>
              </div>

              <button 
                onClick={() => navigateTo('settings')}
                className="p-1 rounded-full hover:ring-2 hover:ring-[#F26CA7]/50 transition-all cursor-pointer"
              >
                <Avatar src={user.avatarUrl} name={user.name} size="sm" />
              </button>
            </header>

            {/* Sidebar Navigation */}
            <Sidebar 
              currentRoute={currentRoute} 
              onNavigate={navigateTo} 
              user={user} 
              isMobileOpen={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              onLogout={logout}
            />

            {/* Main Dashboard Workspace */}
            <main className="flex-1 min-w-0 p-4 overflow-y-auto">
              {currentRoute === 'dashboard' && (
              <OverviewView
                user={user}
                products={products}
                leads={leads}
                analytics={analytics}
                onNavigate={navigateTo}
                onCopyLink={handleCopyLink}
              />
            )}

            {currentRoute === 'analytics' && (
              <AnalyticsView
                analytics={analytics}
                products={products}
                chartData={chartData}
                undertoneStats={undertoneStats}
                concernStats={concernStats}
                onToast={(title, desc) => addToast(title, desc, 'info')}
              />
            )}

            {currentRoute === 'products' && (
              <ProductsView
                products={products}
                masterCatalog={masterCatalog}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
                onCopyLink={handleCopyLink}
              />
            )}

            {currentRoute === 'ai-pages' && (
              <AIPagesView
                user={user}
                aiPages={aiPages}
                products={products}
                onUpdateAIPage={updateAIPage}
                onCopyLink={handleCopyLink}
                onPreviewPublic={() => navigateTo('internal-preview')}
              />
            )}

            {currentRoute === 'customers' && (
              <CustomersView leads={leads} />
            )}

            {currentRoute === 'subscription' && (
              <SubscriptionView
                user={user}
                onToast={(title, desc) => addToast(title, desc, 'info')}
                onRefreshUser={reloadWorkspace}
              />
            )}

            {currentRoute === 'settings' && (
              <SettingsView
                user={user}
                onUpdateProfile={updateProfile}
                onRegenerateKey={regenerateApiKey}
                onCopyLink={handleCopyLink}
                onToast={(title, desc) => addToast(title, desc, 'info')}
              />
            )}

            {['admin-dashboard', 'admin-products', 'admin-affiliators', 'admin-analytics'].includes(currentRoute) && (
              <AdminDashboardView
                key={currentRoute}
                products={products}
                affiliators={affiliators}
                onAddProduct={addProduct}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
                onUpdateAffiliatorStatus={updateAffiliatorStatus}
                onUpdateAffiliator={updateAffiliator}
                onDeleteAffiliator={deleteAffiliator}
                onUpdateProductApproval={updateProductApproval}
                activeTab={
                  currentRoute === 'admin-products'
                    ? 'products'
                    : currentRoute === 'admin-affiliators'
                    ? 'affiliators'
                    : currentRoute === 'admin-analytics'
                    ? 'analytics'
                    : 'overview'
                }
                onNavigateTab={(tab) => {
                  if (tab === 'products') navigateTo('admin-products');
                  else if (tab === 'affiliators') navigateTo('admin-affiliators');
                  else if (tab === 'analytics') navigateTo('admin-analytics');
                  else navigateTo('admin-dashboard');
                }}
              />
            )}
          </main>
          </div>
        </div>
      )}

    </div>
  );
}
