import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  User, 
  Menu, 
  X, 
  Shield, 
  Truck,
  ChevronRight,
  Home
} from 'lucide-react';
import { CustomButtonRenderer } from '../common/CustomButtonRenderer';

interface NavbarProps {
  currentView: string;
  selectedCategory?: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  selectedCategory = '', 
  onNavigate, 
  onOpenSearch 
}) => {
  const { settings, categories } = useSiteSettings();
  const { totalItems, openCart, wishlist } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isOwnerEmail = currentUser?.email?.trim().toLowerCase() === 'chowdhuryistiak66@gmail.com';
  const isSessionUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('zarven_admin_unlocked') === 'true';
  const canAccessAdmin = isOwnerEmail || (isAdmin && isSessionUnlocked);

  const handleNav = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const isCategoryActive = (view: string) => {
    if (view === 'home') {
      return currentView === 'home';
    }
    if (view === 'shop') {
      return currentView === 'shop' && (!selectedCategory || selectedCategory === '' || selectedCategory.toLowerCase() === 'all');
    }
    if (view.startsWith('shop?category=')) {
      const targetCat = decodeURIComponent(view.replace('shop?category=', '')).trim().toLowerCase();
      const currentCat = (selectedCategory || '').trim().toLowerCase();
      return currentView === 'shop' && currentCat === targetCat;
    }
    return currentView === view;
  };

  // Build dynamic categories list directly from state/database
  const dynamicCategories = (categories || []).map(c => ({
    label: c.name,
    view: `shop?category=${encodeURIComponent(c.name)}`
  }));

  const navCategories = [
    { label: 'Home', view: 'home' },
    ...dynamicCategories,
    { label: 'Atelier', view: 'about' },
    { label: 'Track Order', view: 'order-confirmation' },
  ];

  const getCurrentLocationDetails = () => {
    if (currentView === 'home') {
      return { parent: 'Zarven', current: 'Home', isCategory: false };
    }
    if (currentView === 'shop') {
      if (selectedCategory && selectedCategory.trim() !== '' && selectedCategory.toLowerCase() !== 'all') {
        return { parent: 'Home', current: selectedCategory, isCategory: true };
      }
      return { parent: 'Home', current: 'All Collection', isCategory: true };
    }
    if (currentView === 'about') {
      return { parent: 'Home', current: 'Atelier Story', isCategory: false };
    }
    if (currentView === 'order-confirmation') {
      return { parent: 'Home', current: 'Track Order', isCategory: false };
    }
    if (currentView === 'wishlist') {
      return { parent: 'Home', current: 'Wishlist', isCategory: false };
    }
    if (currentView === 'account') {
      return { parent: 'Home', current: 'Customer Account', isCategory: false };
    }
    if (currentView === 'checkout') {
      return { parent: 'Home', current: 'Checkout', isCategory: false };
    }
    return { parent: 'Home', current: currentView.toUpperCase(), isCategory: false };
  };

  const locationDetails = getCurrentLocationDetails();

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0a0a0d]/95 border-b border-[#22222b]">
        {/* 1. Optional announcement bar */}
        {settings.announcementActive && settings.announcementBarText && (
          <div className="bg-[#14141c] border-b border-[#272733] py-2 px-4 text-center flex items-center justify-center gap-3">
            <p className="text-[11px] uppercase tracking-widest text-[#d4af37] font-medium truncate max-w-5xl font-mono">
              {settings.announcementBarText}
            </p>
            <CustomButtonRenderer placement="announcement" className="inline-flex shrink-0" />
          </div>
        )}

        {/* 2. Top Bar: Mobile Menu Toggle on Left + Original ZARVEN Brand + Utilities on Right */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
            
            {/* Left: Mobile Menu Toggle + Original ZARVEN Brand Element */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-[#a1a1aa] hover:text-[#d4af37] hover:bg-white/5 transition-colors cursor-pointer rounded-xs shrink-0"
                aria-label="Open navigation menu"
                title="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button 
                onClick={() => handleNav('home')}
                className="text-left group cursor-pointer focus:outline-hidden flex items-center gap-2 sm:gap-3 min-w-0"
                aria-label="Zarven Homepage"
              >
                {settings.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Zarven Emblem" 
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-[#d4af37]/40 shadow-xs shrink-0"
                  />
                )}
                <span className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.18em] sm:tracking-[0.25em] uppercase text-white group-hover:text-[#d4af37] transition-colors truncate">
                  {settings.siteName || 'ZARVEN'}
                </span>
              </button>
            </div>

            {/* Right: Dynamic Custom Navbar Buttons + Admin Studio (Protected) + Search + Wishlist + Customer Account + Shopping Bag */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Custom Admin Defined Navbar Buttons */}
              <CustomButtonRenderer placement="navbar" className="hidden sm:flex items-center gap-2" />

              {/* Admin Studio: Visible only to Store Owner or Unlocked Session */}
              {canAccessAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/50 hover:bg-[#d4af37]/20 transition-all rounded-xs cursor-pointer whitespace-nowrap shrink-0 shadow-xs ${
                    currentView.startsWith('admin') ? 'bg-[#d4af37]/30 border-[#d4af37]' : ''
                  }`}
                  title="Go to Admin Studio"
                >
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]" />
                  <span className="hidden xs:inline sm:inline">Admin Studio</span>
                  <span className="xs:hidden">Admin</span>
                </button>
              )}

              {/* Search */}
              <button
                onClick={onOpenSearch}
                aria-label="Search collection"
                className="p-1.5 sm:p-2 text-[#a1a1aa] hover:text-white transition-colors cursor-pointer rounded-md focus-visible:ring-1 focus-visible:ring-[#d4af37]"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              {(settings.buttonSettings?.showWishlist ?? true) && (
                <button
                  onClick={() => handleNav('wishlist')}
                  aria-label="Wishlist"
                  className="relative p-1.5 sm:p-2 text-[#a1a1aa] hover:text-white transition-colors cursor-pointer rounded-md focus-visible:ring-1 focus-visible:ring-[#d4af37]"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#d4af37]" />
                  )}
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                aria-label={`Shopping bag containing ${totalItems} items`}
                className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xs bg-[#181822] hover:bg-[#20202e] border border-[#2e2e3d] text-white transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-[#d4af37]"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d4af37]" />
                <span className="text-xs font-mono tabular-nums font-semibold">
                  {totalItems}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. DIRECT CATEGORIES ROW: Hidden on Mobile (hamburger menu is used), visible on Computer / Desktop */}
        <div className="hidden md:block w-full bg-[#0a0a0e] border-t border-[#1c1c27] shadow-inner">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <nav 
              aria-label="Categories Navigation"
              className="flex items-center gap-1.5 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-none py-2 text-xs touch-pan-x"
            >
              {navCategories.map((cat) => {
                const isActive = isCategoryActive(cat.view);
                return (
                  <button
                    key={cat.label}
                    onClick={() => handleNav(cat.view)}
                    className={`text-[11px] sm:text-xs font-mono uppercase tracking-[0.14em] transition-all cursor-pointer whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xs relative group ${
                      isActive 
                        ? 'text-[#d4af37] font-bold bg-[#181824] border border-[#d4af37]/60 shadow-xs' 
                        : 'text-[#a1a1aa] hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />}
                      <span>{cat.label}</span>
                    </span>
                    <span 
                      className={`absolute bottom-0 left-2 right-2 h-[2px] bg-[#d4af37] transition-all duration-300 ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-70'
                      }`} 
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 4. Left-Side Mobile Drawer (Rendered outside header to prevent backdrop-blur fixed clipping) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Left Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-[80vw] max-w-xs h-[100dvh] bg-[#0c0c10] border-r border-[#242432] shadow-2xl flex flex-col justify-between z-[10000] overflow-hidden">
            
            {/* Drawer Top Bar with Brand & Explicit Close Button */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#20202d] bg-[#121218] shrink-0">
              <div className="flex items-center gap-2.5">
                {settings.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Zarven Emblem" 
                    className="h-6 w-6 rounded-full object-cover border border-[#d4af37]/40 shadow-xs"
                  />
                )}
                <span className="font-serif text-base font-bold tracking-[0.2em] uppercase text-white">
                  {settings.siteName || 'ZARVEN'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#1a1a24] hover:bg-[#252535] text-white hover:text-[#d4af37] border border-[#333346] rounded-xs text-xs font-mono uppercase cursor-pointer transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Close</span>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Quick Admin Studio Access Card for Store Managers */}
              <div className="bg-gradient-to-r from-[#1a1a28] to-[#121218] border-2 border-[#d4af37] rounded-xs p-3.5 shadow-lg shadow-black/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#d4af37] font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#d4af37]" />
                    <span>Admin Studio (এডমিন স্টুডিও)</span>
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-[#d4af37] text-black font-bold rounded-xs uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#e4e4e7] mb-3 leading-relaxed">
                  সাইট কাস্টমাইজেশন, ক্যাটাগরি, প্রোডাক্ট, হোমপেজ সেকশন ও প্রাইভেসি পলিসি অপশন।
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNav('admin')}
                    className="py-2 px-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-[11px] rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Studio</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin?tab=customization')}
                    className="py-2 px-2 bg-[#1f1f2e] hover:bg-[#28283c] text-[#d4af37] border border-[#d4af37]/60 font-mono text-[10px] rounded-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span>Customization →</span>
                  </button>
                </div>
              </div>

              {/* Category Links */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] mb-2 font-semibold">
                  Categories
                </p>
                <nav className="flex flex-col space-y-1">
                  {navCategories.map((cat) => {
                    const isActive = isCategoryActive(cat.view);
                    return (
                      <button
                        key={cat.label}
                        onClick={() => handleNav(cat.view)}
                        className={`text-left px-3 py-2.5 rounded-xs transition-colors cursor-pointer flex items-center justify-between text-xs uppercase tracking-wider font-medium ${
                          isActive 
                            ? 'text-[#d4af37] font-semibold bg-[#1a1a26] border-l-2 border-[#d4af37]' 
                            : 'text-[#d4d4d8] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isActive && <span className="text-[10px] text-[#d4af37] font-mono">Active</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Order Tracking & Service */}
              <div className="pt-4 border-t border-[#1e1e2c]">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#a1a1aa] mb-2 font-semibold">
                  Order Tracking & Service
                </p>
                <nav className="flex flex-col space-y-1 text-xs uppercase tracking-wider">
                  <button
                    onClick={() => handleNav('order-confirmation')}
                    className="text-left px-3 py-2 rounded-xs text-[#60a5fa] hover:bg-blue-950/20 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track My Order</span>
                  </button>
                  <button
                    onClick={() => handleNav('wishlist')}
                    className="text-left px-3 py-2 rounded-xs text-[#d4d4d8] hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Heart className="w-4 h-4 text-[#a1a1aa]" />
                    <span>My Wishlist ({wishlist.length})</span>
                  </button>
                  <button
                    onClick={() => handleNav('about')}
                    className="text-left px-3 py-2 rounded-xs text-[#d4d4d8] hover:text-white hover:bg-white/5 cursor-pointer font-medium"
                  >
                    About Zarven Atelier
                  </button>
                  <button
                    onClick={() => handleNav('contact')}
                    className="text-left px-3 py-2 rounded-xs text-[#d4d4d8] hover:text-white hover:bg-white/5 cursor-pointer font-medium"
                  >
                    Concierge & Appointments
                  </button>
                </nav>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[#20202d] bg-[#0e0e14] shrink-0 space-y-2">
              {canAccessAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left py-2 px-3 bg-[#171722] border border-[#d4af37]/50 text-[#d4af37] font-semibold flex items-center justify-between rounded-xs cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Studio</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a1a1aa]">Dashboard</span>
                </button>
              )}
              <p className="text-[10px] text-[#71717a] font-mono text-center">
                Zarven Sartorial & Haute Craft
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
