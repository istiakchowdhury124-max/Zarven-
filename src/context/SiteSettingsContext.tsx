import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  increment,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, DEFAULT_SITE_SETTINGS, INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BANNERS, seedInitialDataIfEmpty } from '../lib/firebase';
import { SiteSettings, Banner, Product, Category, BannerPlacement } from '../types';

interface SiteSettingsContextType {
  settings: SiteSettings;
  banners: Banner[];
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  getBannersByPlacement: (placement: BannerPlacement) => Banner[];
  trackBannerClick: (bannerId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'productCount' | 'createdAt'> & { id?: string }) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  updateBanner: (id: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  currencyFormat: (amount: number) => string;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SITE_SETTINGS,
  banners: INITIAL_BANNERS,
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  isLoading: true,
  getBannersByPlacement: () => [],
  trackBannerClick: async () => {},
  updateSettings: async () => {},
  deleteProduct: async () => {},
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  addBanner: async () => {},
  updateBanner: async () => {},
  deleteBanner: async () => {},
  currencyFormat: (amount: number) => `৳${amount.toLocaleString('en-US')}`
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Run seed routine if database is fresh
    seedInitialDataIfEmpty().catch(() => {});

    // 1. Real-time site settings listener
    const unsubscribeSettings = onSnapshot(
      doc(db, 'siteSettings', 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = docSnap.data() as SiteSettings;
          setSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...remoteData,
            logoUrl: remoteData.logoUrl?.trim() ? remoteData.logoUrl : DEFAULT_SITE_SETTINGS.logoUrl,
            footerPrivacy: remoteData.footerPrivacy || DEFAULT_SITE_SETTINGS.footerPrivacy,
            buttonSettings: {
              showOrderNow: remoteData.buttonSettings?.showOrderNow ?? DEFAULT_SITE_SETTINGS.buttonSettings?.showOrderNow ?? true,
              orderNowText: remoteData.buttonSettings?.orderNowText || DEFAULT_SITE_SETTINGS.buttonSettings?.orderNowText || 'ORDER NOW',
              orderNowColor: remoteData.buttonSettings?.orderNowColor || DEFAULT_SITE_SETTINGS.buttonSettings?.orderNowColor || 'gold',
              showAddToCart: remoteData.buttonSettings?.showAddToCart ?? DEFAULT_SITE_SETTINGS.buttonSettings?.showAddToCart ?? true,
              addToCartText: remoteData.buttonSettings?.addToCartText || DEFAULT_SITE_SETTINGS.buttonSettings?.addToCartText || 'Add to Cart',
              showWishlist: remoteData.buttonSettings?.showWishlist ?? DEFAULT_SITE_SETTINGS.buttonSettings?.showWishlist ?? true,
              showCardQuickOrder: remoteData.buttonSettings?.showCardQuickOrder ?? DEFAULT_SITE_SETTINGS.buttonSettings?.showCardQuickOrder ?? true,
              showFloatingContact: remoteData.buttonSettings?.showFloatingContact ?? DEFAULT_SITE_SETTINGS.buttonSettings?.showFloatingContact ?? true,
              floatingContactType: remoteData.buttonSettings?.floatingContactType || DEFAULT_SITE_SETTINGS.buttonSettings?.floatingContactType || 'whatsapp',
              floatingContactValue: remoteData.buttonSettings?.floatingContactValue || DEFAULT_SITE_SETTINGS.buttonSettings?.floatingContactValue || '+8801711000000',
              floatingContactText: remoteData.buttonSettings?.floatingContactText || DEFAULT_SITE_SETTINGS.buttonSettings?.floatingContactText || 'WhatsApp Concierge',
              customButtons: Array.isArray(remoteData.buttonSettings?.customButtons)
                ? remoteData.buttonSettings.customButtons
                : (DEFAULT_SITE_SETTINGS.buttonSettings?.customButtons || [])
            }
          });
        } else {
          setSettings(DEFAULT_SITE_SETTINGS);
        }
      },
      () => {
        // Fallback to defaults
      }
    );

    // 2. Real-time banners listener
    const unsubscribeBanners = onSnapshot(
      collection(db, 'banners'),
      (snapshot) => {
        if (!snapshot.empty) {
          const bannerList: Banner[] = [];
          snapshot.forEach((doc) => {
            bannerList.push({ id: doc.id, ...doc.data() } as Banner);
          });
          bannerList.sort((a, b) => a.displayOrder - b.displayOrder);
          setBanners(bannerList);
        }
      },
      () => {
        // Fallback to defaults
      }
    );

    // 3. Real-time products listener (Crucial: synchronizes published/unpublished/edited products instantly)
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productList: Product[] = [];
        snapshot.forEach((doc) => {
          productList.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productList);
        setIsLoading(false);
      },
      (error) => {
        console.warn('Products onSnapshot error:', error);
        setIsLoading(false);
      }
    );

    // 4. Real-time categories listener
    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const catList: Category[] = [];
        snapshot.forEach((doc) => {
          catList.push({ id: doc.id, ...doc.data() } as Category);
        });
        if (catList.length > 0) {
          setCategories(catList);
        } else {
          setCategories(INITIAL_CATEGORIES);
        }
      },
      (err) => {
        console.warn('Categories onSnapshot error:', err);
      }
    );

    return () => {
      unsubscribeSettings();
      unsubscribeBanners();
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  const getBannersByPlacement = (placement: BannerPlacement): Banner[] => {
    return banners.filter(b => b.placement === placement && b.active);
  };

  const trackBannerClick = async (bannerId: string) => {
    try {
      const bannerRef = doc(db, 'banners', bannerId);
      await updateDoc(bannerRef, {
        clickCount: increment(1),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Banner click tracking local fallback:', err);
      setBanners(prev => prev.map(b => b.id === bannerId ? { ...b, clickCount: (b.clickCount || 0) + 1 } : b));
    }
  };

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const settingsRef = doc(db, 'siteSettings', 'general');
      const updated = { ...settings, ...newSettings, updatedAt: new Date().toISOString() };
      await setDoc(settingsRef, updated, { merge: true });
      setSettings(updated);
    } catch (err) {
      console.error('Failed to update settings in Firestore:', err);
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    // 1. Optimistic removal from client memory so UI reflects delete instantly
    setProducts(prev => prev.filter(p => p.id !== productId));
    
    // 2. Delete document from Firestore
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.error('Failed to delete product from Firestore:', err);
      throw err;
    }
  };

  const addCategory = async (catData: Omit<Category, 'id' | 'productCount' | 'createdAt'> & { id?: string }): Promise<void> => {
    const slug = catData.slug?.trim() || catData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const catId = catData.id?.trim() || `cat-${slug}-${Date.now().toString().slice(-4)}`;
    const newCategory: Category = {
      id: catId,
      name: catData.name.trim(),
      slug: slug,
      description: catData.description?.trim() || '',
      imageUrl: catData.imageUrl?.trim() || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
      productCount: 0,
      createdAt: new Date().toISOString()
    };

    // Optimistic state update
    setCategories(prev => {
      const existingIdx = prev.findIndex(c => c.id === catId || c.name.toLowerCase() === newCategory.name.toLowerCase());
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], ...newCategory };
        return copy;
      }
      return [...prev, newCategory];
    });

    try {
      await setDoc(doc(db, 'categories', catId), newCategory);
    } catch (err) {
      console.error('Failed to add category to Firestore:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await setDoc(doc(db, 'categories', id), updates, { merge: true });
    } catch (err) {
      console.error('Failed to update category in Firestore:', err);
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<void> => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (err) {
      console.error('Failed to delete category from Firestore:', err);
      throw err;
    }
  };

  // Helper to remove any undefined or problematic fields before writing to Firestore
  const cleanForFirestore = (obj: Record<string, any>): Record<string, any> => {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        clean[key] = val;
      }
    }
    return clean;
  };

  const addBanner = async (bannerData: Omit<Banner, 'id' | 'clickCount' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<void> => {
    const bannerId = bannerData.id?.trim() || `banner-${Date.now()}`;
    const newBanner: Banner = {
      id: bannerId,
      title: bannerData.title.trim(),
      subtitle: bannerData.subtitle?.trim() || '',
      placement: bannerData.placement || 'between_sections',
      imageUrl: bannerData.imageUrl.trim(),
      mobileImageUrl: bannerData.mobileImageUrl?.trim() || '',
      targetUrl: bannerData.targetUrl?.trim() || '/shop',
      ctaText: bannerData.ctaText?.trim() || 'Explore',
      startDate: bannerData.startDate?.trim() || '',
      endDate: bannerData.endDate?.trim() || '',
      active: bannerData.active ?? true,
      displayOrder: Number(bannerData.displayOrder) || (banners.length + 1),
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Optimistic state update immediately
    setBanners(prev => {
      const idx = prev.findIndex(b => b.id === bannerId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newBanner;
        return copy.sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
      }
      return [...prev, newBanner].sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));
    });

    // 2. Persist to Firestore cleanly without undefined
    try {
      const sanitized = cleanForFirestore(newBanner);
      await setDoc(doc(db, 'banners', bannerId), sanitized);
    } catch (err) {
      console.error('Failed to write banner to Firestore:', err);
      // Keep optimistic update so app never breaks
    }
  };

  const updateBanner = async (id: string, updates: Partial<Banner>): Promise<void> => {
    // 1. Optimistic state update immediately
    setBanners(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }).sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0)));

    // 2. Persist to Firestore cleanly without undefined
    try {
      const sanitized = cleanForFirestore({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'banners', id), sanitized, { merge: true });
    } catch (err) {
      console.error('Failed to update banner in Firestore:', err);
    }
  };

  const deleteBanner = async (bannerId: string): Promise<void> => {
    // 1. Optimistic removal
    setBanners(prev => prev.filter(b => b.id !== bannerId));

    // 2. Remove from Firestore
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch (err) {
      console.error('Failed to delete banner from Firestore:', err);
    }
  };

  const currencyFormat = (amount: number): string => {
    const symbol = settings.currencySymbol || '৳';
    return `${symbol}${amount.toLocaleString('en-US')}`;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        banners,
        products,
        categories,
        isLoading,
        getBannersByPlacement,
        trackBannerClick,
        updateSettings,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBanner,
        updateBanner,
        deleteBanner,
        currencyFormat
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};
