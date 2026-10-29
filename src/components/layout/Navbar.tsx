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
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#3B1109] border-b border-[#250a05] shadow-md text-white">
        {/* 1. Optional announcement bar (Only shown on non-home pages, since on home it is placed below the hero banner) */}
        {settings.announcementActive && settings.announcementBarText && currentView !== 'home' && (
          <div className="bg-[#250a05] border-b border-[#4d180f] py-2 px-4 text-center flex items-center justify-center gap-3">
            <p className="text-[11px] uppercase tracking-widest text-[#f4d068] font-medium truncate max-w-5xl font-mono">
              {settings.announcementBarText}
            </p>
            <CustomButtonRenderer placement="announcement" className="inline-flex shrink-0" />
          </div>
        )}

        {/* 2. Top Bar: Mobile Menu Toggle on Left + Original ZARVEN Brand + Utilities on Right */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
            
            {/* Left: Mobile Menu Toggle + Original ZARVEN Brand Element */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-1.5 text-white hover:text-[#f4d068] hover:bg-[#4d180f] transition-colors cursor-pointer rounded-xs shrink-0"
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
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover border border-[#f4d068]/60 shadow-xs shrink-0"
                  />
                )}
                <span className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.18em] sm:tracking-[0.25em] uppercase text-white group-hover:text-[#f4d068] transition-colors truncate">
                  {settings.siteName || 'ZARVEN'}
                </span>
              </button>
            </div>

            {/* Middle: Expanded Search Bar with "Search here" */}
            <div className="flex-1 flex justify-center items-center px-2 sm:px-4 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <button
                onClick={onOpenSearch}
                type="button"
                aria-label="Search collection"
                className="w-full flex items-center justify-between gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white hover:bg-white/95 border border-white/50 text-gray-800 transition-all duration-200 cursor-pointer group shadow-xs"
              >
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-[#3B1109] transition-colors shrink-0 stroke-[2]" />
                  <span className="text-xs sm:text-sm text-gray-400 font-normal font-sans tracking-wide truncate group-hover:text-gray-600 transition-colors">
                    Search here
                  </span>
                </div>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-xs group-hover:bg-[#3B1109] group-hover:text-white transition-colors">
                  Quick Search
                </span>
              </button>
            </div>

            {/* Right: Dynamic Custom Navbar Buttons + Admin Studio (Protected) + Wishlist + Customer Account + Shopping Bag */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Custom Admin Defined Navbar Buttons */}
              <CustomButtonRenderer placement="navbar" className="hidden sm:flex items-center gap-2" />

              {/* Wishlist */}
              {(settings.buttonSettings?.showWishlist ?? true) && (
                <button
                  onClick={() => handleNav('wishlist')}
                  aria-label="Wishlist"
                  className="relative p-1.5 sm:p-2 text-white hover:text-[#f4d068] transition-colors cursor-pointer rounded-md focus-visible:ring-1 focus-visible:ring-[#f4d068]"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f4d068]" />
                  )}
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                aria-label={`Shopping bag containing ${totalItems} items`}
                className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xs bg-[#111116] hover:bg-black border border-white/20 text-white transition-all cursor-pointer shadow-xs focus-visible:ring-1 focus-visible:ring-[#f4d068]"
              >
                <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f4d068]" />
                <span className="text-xs font-mono tabular-nums font-bold">
                  {totalItems}
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. DIRECT CATEGORIES ROW: Hidden on Mobile (hamburger menu is used), visible on Computer / Desktop */}
        <div className="hidden md:block w-full bg-[#3B1109] border-t border-[#4d180f]/60 shadow-2xs">
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
                        ? 'text-white font-extrabold bg-[#250a05] border border-white/30 shadow-2xs' 
                        : 'text-white/90 font-bold hover:text-white hover:bg-[#4d180f]/60 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#f4d068] animate-pulse" />}
                      <span>{cat.label}</span>
                    </span>
                    <span 
                      className={`absolute bottom-0 left-2 right-2 h-[2px] bg-[#f4d068] transition-all duration-300 ${
                        isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-80'
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
          <div className="fixed inset-y-0 left-0 w-[80vw] max-w-xs h-[100dvh] bg-[#ffffff] border-r border-[#e5e5eb] shadow-2xl flex flex-col justify-between z-[10000] overflow-hidden text-[#111116]">
            
            {/* Drawer Top Bar with Brand & Explicit Close Button */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e5e5eb] bg-[#f8f8fa] shrink-0">
              <div className="flex items-center gap-2.5">
                {settings.logoUrl && (
                  <img 
                    src={settings.logoUrl} 
                    alt="Zarven Emblem" 
                    className="h-6 w-6 rounded-full object-cover border border-[#b8860b]/40 shadow-xs"
                  />
                )}
                <span className="font-serif text-base font-bold tracking-[0.2em] uppercase text-[#111116]">
                  {settings.siteName || 'ZARVEN'}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#ffffff] hover:bg-[#f0f0f4] text-[#111116] hover:text-[#b8860b] border border-[#d4d4d8] rounded-xs text-xs font-mono uppercase cursor-pointer transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-3.5 h-3.5 text-[#b8860b]" />
                <span>Close</span>
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

              {/* Category Links */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#997b32] mb-2 font-semibold">
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
                            ? 'text-[#111116] font-semibold bg-[#f4f4f6] border-l-2 border-[#111116]' 
                            : 'text-[#52525b] hover:text-[#111116] hover:bg-[#f8f8fa]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        {isActive && <span className="text-[10px] text-[#b8860b] font-mono">Active</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Order Tracking & Service */}
              <div className="pt-4 border-t border-[#e5e5eb]">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#71717a] mb-2 font-semibold">
                  Order Tracking & Service
                </p>
                <nav className="flex flex-col space-y-1 text-xs uppercase tracking-wider">
                  <button
                    onClick={() => handleNav('order-confirmation')}
                    className="text-left px-3 py-2 rounded-xs text-[#2563eb] hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Track My Order</span>
                  </button>
                  <button
                    onClick={() => handleNav('wishlist')}
                    className="text-left px-3 py-2 rounded-xs text-[#52525b] hover:text-[#111116] hover:bg-[#f8f8fa] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Heart className="w-4 h-4 text-[#71717a]" />
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
