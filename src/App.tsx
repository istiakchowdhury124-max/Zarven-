import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { CartProvider, useCart } from './context/CartContext';
import { testConnection } from './lib/firebase';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage, DirectProductSelection } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage, ContactPage, FAQPage, PolicyPage } from './pages/InfoPages';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { CartDrawer } from './components/store/CartDrawer';
import { SearchModal } from './components/store/SearchModal';
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout';
import { DashboardOverview } from './pages/admin/DashboardOverview';
import { ProductManager } from './pages/admin/ProductManager';
import { OrderManager } from './pages/admin/OrderManager';
import { CustomerManager } from './pages/admin/CustomerManager';
import { BannerManager } from './pages/admin/BannerManager';
import { CustomizationManager } from './pages/admin/CustomizationManager';
import { ElementsManager } from './pages/admin/ElementsManager';
import { SettingsManager } from './pages/admin/SettingsManager';
import { CategoryManager } from './pages/admin/CategoryManager';
import { ReleasesManager } from './pages/admin/ReleasesManager';
import { AdminSecurityGate } from './components/admin/AdminSecurityGate';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { FloatingButtonsRenderer } from './components/common/CustomButtonRenderer';
import { Order, Product } from './types';

function MainApp() {
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (
        search.includes('arman') ||
        hash.includes('arman') ||
        pathname.includes('arman') ||
        search.includes('secret=zarven-admin') ||
        search.includes('admin=studio') ||
        search.includes('portal=admin') ||
        search.includes('admin=true') ||
        hash === '#zarven-admin' ||
        hash === '#admin' ||
        pathname === '/admin'
      ) {
        return 'admin';
      }
      const savedView = localStorage.getItem('zarven_current_view');
      if (savedView) return savedView;
    }
    return 'home';
  });

  const [shopCategory, setShopCategory] = useState<string>('');
  const [shopFilter, setShopFilter] = useState<'all' | 'new' | 'bestseller'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { addToCart } = useCart();
  const [directOrderProduct, setDirectOrderProduct] = useState<DirectProductSelection | null>(null);

  const handleDirectOrder = (product: Product, size?: string, color?: string, qty = 1) => {
    const chosenSize = size || product.sizes[0] || 'M';
    const chosenColor = color || product.colors[0]?.name || 'Standard';
    addToCart(product, chosenSize, chosenColor, qty);
    setDirectOrderProduct({
      product,
      size: chosenSize,
      color: chosenColor,
      quantity: qty
    });
    setSelectedProduct(null);
    handleNavigate('checkout');
  };

  // Admin states with persistent storage
  const [adminTab, setAdminTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const tabMatch = window.location.search.match(/tab=([^&]+)/) || window.location.hash.match(/tab=([^&]+)/);
      if (tabMatch && tabMatch[1]) {
        return tabMatch[1] as AdminTab;
      }
      const savedTab = localStorage.getItem('zarven_admin_tab') as AdminTab;
      if (savedTab) return savedTab;
    }
    return 'overview';
  });
  const [openNewProductTrigger, setOpenNewProductTrigger] = useState(false);
  const [openNewBannerTrigger, setOpenNewBannerTrigger] = useState(false);

  const { isAdmin } = useAuth();

  // Persist currentView and adminTab to localStorage so user never loses their page on browser switch/sleep
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zarven_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zarven_admin_tab', adminTab);
    }
  }, [adminTab]);

  // Test Firebase connection on mount as mandated by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // Check for secret admin access in URL (?secret=zarven-admin, ?admin=studio, #zarven-admin, /admin, etc.)
  useEffect(() => {
    const checkSecretUrl = () => {
      if (typeof window === 'undefined') return;

      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      const isSecretUrl =
        search.includes('arman') ||
        hash.includes('arman') ||
        pathname.includes('arman') ||
        search.includes('secret=zarven-admin') ||
        search.includes('admin=studio') ||
        search.includes('portal=admin') ||
        search.includes('admin=true') ||
        hash === '#zarven-admin' ||
        hash === '#admin' ||
        hash === '#admin-portal' ||
        pathname === '/admin' ||
        pathname === '/admin-portal';

      if (isSecretUrl) {
        // Parse tab if specified in query or hash
        const tabMatch = window.location.search.match(/tab=([^&]+)/) || window.location.hash.match(/tab=([^&]+)/);
        if (tabMatch && tabMatch[1]) {
          setAdminTab(tabMatch[1] as AdminTab);
        }
        setCurrentView('admin');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey: Ctrl + Shift + A (or Cmd + Shift + A) for instant Admin Access
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentView('admin');
      }
    };

    checkSecretUrl();
    window.addEventListener('hashchange', checkSecretUrl);
    window.addEventListener('popstate', checkSecretUrl);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkSecretUrl);
      window.removeEventListener('popstate', checkSecretUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExitAdmin = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zarven_current_view', 'home');
        localStorage.removeItem('zarven_product_modal_open');
        const url = new URL(window.location.href);
        url.searchParams.delete('secret');
        url.searchParams.delete('admin');
        url.searchParams.delete('portal');
        if (url.hash.includes('admin')) {
          url.hash = '';
        }
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch {
        // ignore url parsing error
      }
    }
    handleNavigate('home');
  };

  // Handle navigation
  const handleNavigate = (view: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view.startsWith('shop')) {
      const catMatch = view.match(/category=([^&]+)/);
      if (catMatch) {
        setShopCategory(decodeURIComponent(catMatch[1]));
      } else {
        setShopCategory('');
      }

      const filterMatch = view.match(/filter=([^&]+)/);
      if (filterMatch) {
        setShopFilter(filterMatch[1] as any);
      } else {
        setShopFilter('all');
      }

      setCurrentView('shop');
    } else if (view.startsWith('admin')) {
      const tabMatch = view.match(/tab=([^&]+)/);
      if (tabMatch) {
        setAdminTab(tabMatch[1] as AdminTab);
      }
      setCurrentView('admin');
    } else {
      setCurrentView(view);
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveOrder(order);
    setCurrentView('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in admin mode
  if (currentView.startsWith('admin')) {
    return (
      <AdminSecurityGate onExitAdmin={handleExitAdmin}>
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={(tab) => setAdminTab(tab)}
          onExitAdmin={handleExitAdmin}
        >
        <ErrorBoundary fallbackTitle="Admin Section Error">
          {adminTab === 'overview' && (
            <DashboardOverview
              onNavigateTab={(tab) => setAdminTab(tab)}
              onOpenNewProduct={() => {
                setAdminTab('products');
                setOpenNewProductTrigger(true);
              }}
              onOpenNewBanner={() => {
                setAdminTab('banners');
                setOpenNewBannerTrigger(true);
              }}
            />
          )}
          {adminTab === 'products' && (
            <ProductManager
              onOpenNewProductModal={openNewProductTrigger}
              onResetNewProductModal={() => setOpenNewProductTrigger(false)}
              onNavigateCategories={() => setAdminTab('categories')}
            />
          )}
          {adminTab === 'categories' && (
            <CategoryManager
              onOpenStorefrontCategory={(cat) => handleNavigate(`shop?category=${encodeURIComponent(cat)}`)}
            />
          )}
          {adminTab === 'orders' && <OrderManager />}
          {adminTab === 'customers' && <CustomerManager />}
          {adminTab === 'banners' && (
            <BannerManager
              onOpenNewBannerModal={openNewBannerTrigger}
              onResetNewBannerModal={() => setOpenNewBannerTrigger(false)}
            />
          )}
          {adminTab === 'customization' && <CustomizationManager />}
          {adminTab === 'elements' && <ElementsManager />}
          {adminTab === 'settings' && <SettingsManager />}
          {adminTab === 'releases' && <ReleasesManager />}
        </ErrorBoundary>
      </AdminLayout>
    </AdminSecurityGate>
  );
  }

  // Customer storefront views
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0e] text-[#f4f4f5]">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        selectedCategory={shopCategory}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 2. Page Content */}
      <ErrorBoundary fallbackTitle="Page Display Error">
        <main className="flex-1">
          {currentView === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onOrderNow={handleDirectOrder}
            />
          )}

          {currentView === 'shop' && (
            <ShopPage
              initialCategory={shopCategory}
              initialFilter={shopFilter}
              onCategoryChange={(cat) => setShopCategory(cat)}
              onNavigate={handleNavigate}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onOrderNow={handleDirectOrder}
            />
          )}

          {currentView === 'checkout' && (
            <CheckoutPage
              onBack={() => handleNavigate('shop')}
              onOrderSuccess={handleOrderSuccess}
              directProduct={directOrderProduct}
            />
          )}

          {currentView === 'order-confirmation' && (
            <OrderConfirmationPage
              order={activeOrder}
              onExplore={() => handleNavigate('shop')}
              onTrackOrder={(ord) => setActiveOrder(ord)}
            />
          )}

          {currentView === 'account' && (
            <AccountPage
              onSelectProduct={(p) => setSelectedProduct(p)}
              onNavigate={handleNavigate}
              onSelectOrder={(ord) => {
                setActiveOrder(ord);
                setCurrentView('order-confirmation');
              }}
            />
          )}

          {currentView === 'wishlist' && (
            <AccountPage
              onSelectProduct={(p) => setSelectedProduct(p)}
              onNavigate={handleNavigate}
              onSelectOrder={(ord) => {
                setActiveOrder(ord);
                setCurrentView('order-confirmation');
              }}
            />
          )}

          {currentView === 'about' && <AboutPage />}
          {currentView === 'contact' && <ContactPage />}
          {currentView === 'faq' && <FAQPage />}
          {currentView === 'privacy' && <PolicyPage type="privacy" />}
          {currentView === 'terms' && <PolicyPage type="terms" />}
          {currentView === 'return-policy' && <PolicyPage type="return" />}
        </main>
      </ErrorBoundary>

      {/* 3. Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 4. Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOrderNow={(p, s, c, q) => handleDirectOrder(p, s, c, q)}
      />

      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onExplore={() => handleNavigate('shop')}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onNavigateAdmin={() => handleNavigate('admin')}
      />

      {/* Floating Buttons: WhatsApp, Call & Custom Site Buttons */}
      <FloatingButtonsRenderer />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
