import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocFromServer,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, Banner, SiteSettings, Category, ReleaseManifest } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
// Suppress internal WebChannel network reconnect/retry warnings
setLogLevel('error');

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Initial site defaults
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'general',
  siteName: 'Zarven',
  tagline: 'We Believe In Quality • Refined Sartorial Mastery',
  logoUrl: '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg',
  announcementBarText: 'Complimentary Express Shipping on all orders over ৳5,000 | Use code ZARVEN10 for 10% off',
  announcementActive: true,
  currency: 'BDT',
  currencySymbol: '৳',
  freeShippingThreshold: 0,
  standardShippingFee: 0,
  taxRate: 0,
  contactEmail: 'concierge@zarven.com',
  contactPhone: '+880 1711-000000',
  address: 'Level 12, Zarven Atelier, Gulshan Avenue, Dhaka 1212, Bangladesh',
  socialLinks: {
    instagram: 'https://instagram.com/zarven.official',
    facebook: 'https://facebook.com/zarven.official',
    twitter: 'https://twitter.com/zarven',
    pinterest: 'https://pinterest.com/zarven'
  },
  enabledSections: {
    hero: true,
    promoBanners: true,
    collections: true,
    privacy: true,
    newArrivals: true,
    bestSellers: true,
    craftsmanship: true,
    bottomBanner: true,
    newsletter: true
  },
  footerPrivacy: {
    enabled: true,
    heading: 'Privacy & Policies',
    links: [
      {
        id: 'fp-1',
        label: 'Privacy Policy',
        url: '#privacy-policy',
        content: 'At Zarven Atelier, we respect and safeguard your personal information. We only gather data required to process your bespoke tailoring requests, authenticate accounts, and securely deliver your orders. Your data is encrypted and never sold to third parties.'
      },
      {
        id: 'fp-2',
        label: 'Terms of Service',
        url: '#terms-of-service',
        content: 'By accessing Zarven Atelier services and commissioning garments, you agree to our terms of bespoke craftsmanship, intellectual property rights, and fair usage guidelines.'
      },
      {
        id: 'fp-3',
        label: 'Return & Exchange Policy',
        url: '#return-exchange',
        content: 'We provide complimentary 7-day exchanges on standard unworn garments in pristine condition with original tags intact. Made-to-measure bespoke creations receive complimentary alteration fittings until your silhouette is perfected.'
      },
      {
        id: 'fp-4',
        label: 'Shipping & White Glove Delivery',
        url: '#shipping-delivery',
        content: 'Complimentary expedited delivery on all orders above ৳5,000 across Bangladesh. Every garment is steamed, hand-inspected, and delivered in protective luxury covers.'
      },
      {
        id: 'fp-5',
        label: 'Authenticity Guarantee',
        url: '#authenticity-guarantee',
        content: 'Every garment bearing the Zarven emblem is crafted using certified raw textiles—from Egyptian Giza cotton to Italian super-wool—and passes our rigorous seven-stage atelier inspection.'
      }
    ]
  },
  paymentMethods: {
    cod: true,
    bkash: true,
    nagad: true,
    card: true
  },
  buttonSettings: {
    showOrderNow: true,
    orderNowText: 'ORDER NOW',
    orderNowColor: 'gold',
    showAddToCart: true,
    addToCartText: 'Add to Cart',
    showWishlist: true,
    showCardQuickOrder: true,
    showFloatingContact: true,
    floatingContactType: 'whatsapp',
    floatingContactValue: '+8801711000000',
    floatingContactText: 'WhatsApp Concierge',
    customButtons: [
      {
        id: 'btn-whatsapp',
        label: 'WhatsApp Concierge',
        link: 'https://wa.me/8801711000000',
        placement: 'floating',
        color: 'emerald',
        icon: 'whatsapp',
        openInNewTab: true,
        active: true
      }
    ]
  },
  adminPasscode: '1971'
};

// Initial luxury products catalog
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    title: 'The Obsidian Tailored Wool Blazer',
    slug: 'the-obsidian-tailored-wool-blazer',
    sku: 'ZAR-JKT-001',
    description: 'Precision cut from 100% fine Italian virgin wool. Features hand-stitched pick lapels, unstructured shoulders for effortless drape, brushed horn buttons, and cupro silk lining. Designed for modern formal and elevated evening attire.',
    category: 'Tailoring',
    price: 14500,
    salePrice: 12900,
    sizes: ['38R', '40R', '42R', '44R'],
    colors: [
      { name: 'Obsidian Black', hex: '#111114' },
      { name: 'Midnight Navy', hex: '#161e2e' }
    ],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 18,
    tags: ['Tailoring', 'Italian Wool', 'Formal', 'Best Seller'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    title: 'Raw Silk Mandarin Minimalist Shirt',
    slug: 'raw-silk-mandarin-minimalist-shirt',
    sku: 'ZAR-SHT-002',
    description: 'Handwoven tussar silk shirt with a contemporary clean band collar. Concealed mother-of-pearl placket, French seams, and a relaxed architectural silhouette that catches light with a subtle golden sheen.',
    category: 'Shirts',
    price: 7800,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Ivory Cream', hex: '#f6f4ee' },
      { name: 'Warm Charcoal', hex: '#2b2a2d' }
    ],
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 24,
    tags: ['Silk', 'Mandarin Collar', 'Minimal'],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isTrending: true,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    title: 'Artisan Lambskin Belted Trench Coat',
    slug: 'artisan-lambskin-belted-trench-coat',
    sku: 'ZAR-OUT-003',
    description: 'Sculpted from supple full-grain lambskin leather with a matte espresso finish. Features a double-breasted storm flap, detachable waist tie with brushed brass hardware, and interior welt pockets.',
    category: 'Outerwear',
    price: 28500,
    salePrice: 24900,
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Espresso Brown', hex: '#261c16' },
      { name: 'Onyx Black', hex: '#121214' }
    ],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 8,
    tags: ['Leather', 'Luxury Outerwear', 'Signature'],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isTrending: false,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    title: 'Chunky Merino Wool Mock-Neck Sweater',
    slug: 'chunky-merino-wool-mock-neck-sweater',
    sku: 'ZAR-KNT-004',
    description: 'Knitted from heavyweight 7-gauge extrafine Australian merino wool. Ribbed collar and hem with relaxed raglan sleeves. Exceptionally thermal yet breathable, ideal for chilly seasonal evenings.',
    category: 'Knitwear',
    price: 8900,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Oatmeal Heather', hex: '#d9d2c5' },
      { name: 'Forest Moss', hex: '#2d382e' },
      { name: 'Pitch Black', hex: '#0e0e11' }
    ],
    images: [
      'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 14,
    tags: ['Merino Wool', 'Knitwear', 'Winter'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isTrending: true,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    title: 'Pleated High-Waisted Wool Trousers',
    slug: 'pleated-high-waisted-wool-trousers',
    sku: 'ZAR-TRS-005',
    description: 'Double front pleats with a relaxed tapered leg and extended side adjusters eliminating the need for a belt. Spun from breathable wool-mohair blend that resists wrinkling during travel.',
    category: 'Trousers',
    price: 6900,
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Chalk White', hex: '#eeede8' },
      { name: 'Dark Slate', hex: '#2f343b' }
    ],
    images: [
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 22,
    tags: ['Trousers', 'Pleated', 'Tailoring'],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isTrending: true,
    published: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    title: 'Zarven Brushed Gold Cufflinks & Tie Bar Set',
    slug: 'zarven-brushed-gold-cufflinks-tie-bar-set',
    sku: 'ZAR-ACC-006',
    description: 'Hand-finished solid brass jewelry with 18k champagne gold vapor deposition. Engraved with the subtle Zarven crest. Delivered in a velvet atelier presentation box.',
    category: 'Accessories',
    price: 4500,
    sizes: ['One Size'],
    colors: [
      { name: 'Champagne Gold', hex: '#d4af37' },
      { name: 'Sterling Silver', hex: '#d1d5db' }
    ],
    images: [
      'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 35,
    tags: ['Jewelry', 'Gold', 'Gift'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isTrending: false,
    published: true,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-tailoring',
    name: 'Tailoring',
    slug: 'tailoring',
    description: 'Architectural blazers, bespoke suit separates, and sharp waistcoats.',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop',
    productCount: 12
  },
  {
    id: 'cat-outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Sublime trench coats, artisanal leather overcoats, and wool parkas.',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    productCount: 8
  },
  {
    id: 'cat-knitwear',
    name: 'Knitwear',
    slug: 'knitwear',
    description: 'Luxurious merino, cashmere blends, and sculptural mock necks.',
    imageUrl: 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?q=80&w=800&auto=format&fit=crop',
    productCount: 15
  },
  {
    id: 'cat-shirts',
    name: 'Shirts',
    slug: 'shirts',
    description: 'Raw silk, Egyptian Giza cotton, and tailored evening shirts.',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    productCount: 19
  },
  {
    id: 'cat-trousers',
    name: 'Trousers',
    slug: 'trousers',
    description: 'Double pleated trousers, high-waist wool slacks, and relaxed chinos.',
    imageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?q=80&w=800&auto=format&fit=crop',
    productCount: 11
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Gold jewelry, Italian leather belts, silk pocket squares, and cashmere scarves.',
    imageUrl: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=800&auto=format&fit=crop',
    productCount: 14
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-hero-main',
    title: 'THE SARTORIAL EDIT // AUTUMN 2026',
    subtitle: 'Sculptural tailoring and effortless silhouettes handcrafted for timeless distinction.',
    placement: 'hero',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920&auto=format&fit=crop',
    mobileImageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900&auto=format&fit=crop',
    targetUrl: '/shop?category=Tailoring',
    ctaText: 'Explore The Collection',
    active: true,
    displayOrder: 1,
    clickCount: 142
  },
  {
    id: 'banner-mid-promo',
    title: 'BESPOKE OUTERWEAR & NOBLE FIBERS',
    subtitle: 'Pure Italian cashmere, supple leather, and tailored warmth.',
    placement: 'between_sections',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
    targetUrl: '/shop?category=Outerwear',
    ctaText: 'Discover Outerwear',
    active: true,
    displayOrder: 1,
    clickCount: 88
  },
  {
    id: 'banner-bottom-ad-01',
    title: 'ZARVEN PRIVÉ ATELIER ACCESS',
    subtitle: 'Sign up for private trunk shows, concierge fitting sessions, and priority releases.',
    placement: 'bottom_ad',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920&auto=format&fit=crop',
    mobileImageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=900&auto=format&fit=crop',
    targetUrl: '/contact',
    ctaText: 'Book Private Fitting',
    active: true,
    displayOrder: 1,
    clickCount: 65
  }
];

export const INITIAL_RELEASES: ReleaseManifest[] = [
  {
    id: 'rel-v1-0-0',
    version: 'v1.0.0',
    releaseDate: 'October 26, 2026',
    title: 'Zarven Production Release — Core E-Commerce & Admin Studio',
    changelog: [
      'Full customer storefront with animated luxury aesthetic and responsive viewport layout',
      'Real-time Cloud Firestore catalog synchronization with live publish/unpublish toggling',
      'Cart, checkout, BDT (৳) calculations, and multi-option payment handling (COD, bKash, Nagad, Card)',
      'Customer accounts, order tracking, and live status history workflow',
      'Executive Admin Dashboard with KPI analytics, Product CRUD, Order management, and Banner manager',
      'Dedicated Bottom-of-Page advertising section and multi-placement banner engine',
      'Automated downloadable release packaging pipeline with checksum verification'
    ],
    zipFileName: 'zarven-source-v1.0.0.zip',
    fileSizeBytes: 2485900,
    checksum: '8f94d1b7216a9089278913b7d6e8acbc578912ef',
    downloadUrl: '/api/releases/download/v1.0.0',
    verified: true,
    createdAt: new Date().toISOString()
  }
];

// Helper to seed database on first launch if empty
export async function seedInitialDataIfEmpty() {
  try {
    const settingsDoc = await getDoc(doc(db, 'siteSettings', 'general'));
    if (!settingsDoc.exists()) {
      try {
        await setDoc(doc(db, 'siteSettings', 'general'), DEFAULT_SITE_SETTINGS);
      } catch {
        // Not yet authenticated as admin, fallback to default state silently
      }
    }

    // Check products
    const prodSnapshot = await getDocs(collection(db, 'products'));
    if (prodSnapshot.empty) {
      for (const prod of INITIAL_PRODUCTS) {
        try {
          await setDoc(doc(db, 'products', prod.id), prod);
        } catch {
          break; // Stop seeding if unauthenticated
        }
      }
    }

    // Check categories
    const catSnapshot = await getDocs(collection(db, 'categories'));
    if (catSnapshot.empty) {
      for (const cat of INITIAL_CATEGORIES) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch {
          break;
        }
      }
    }

    // Check banners
    const bannerSnapshot = await getDocs(collection(db, 'banners'));
    if (bannerSnapshot.empty) {
      for (const banner of INITIAL_BANNERS) {
        try {
          await setDoc(doc(db, 'banners', banner.id), banner);
        } catch {
          break;
        }
      }
    }

    // Check releases
    const releasesSnapshot = await getDocs(collection(db, 'releases'));
    if (releasesSnapshot.empty) {
      for (const rel of INITIAL_RELEASES) {
        try {
          await setDoc(doc(db, 'releases', rel.id), rel);
        } catch {
          break;
        }
      }
    }
  } catch {
    // Silently continue with local defaults
  }
}
