export type ProductCategory = 
  | 'Tailoring'
  | 'Outerwear'
  | 'Knitwear'
  | 'Shirts'
  | 'Trousers'
  | 'Accessories'
  | 'Footwear';

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  category: ProductCategory | string;
  price: number;
  salePrice?: number | null;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  stock: number;
  tags: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  maxStock: number;
}

export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus = 
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  stateOrDivision: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionRef?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export type BannerPlacement = 
  | 'hero'
  | 'between_sections'
  | 'product_page'
  | 'footer'
  | 'bottom_ad';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  placement: BannerPlacement;
  imageUrl: string;
  mobileImageUrl?: string;
  targetUrl: string;
  ctaText?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  displayOrder: number;
  clickCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  tagline: string;
  logoUrl?: string;
  announcementBarText: string;
  announcementActive: boolean;
  announcementItems?: string[];
  announcementSpeed?: 'normal' | 'fast' | 'slow';
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRate: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook?: string;
    whatsapp?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    pinterest?: string;
  };
  enabledSections: {
    hero: boolean;
    promoBanners: boolean;
    collections: boolean;
    privacy?: boolean;
    newArrivals: boolean;
    bestSellers: boolean;
    craftsmanship: boolean;
    bottomBanner: boolean;
    newsletter: boolean;
  };
  footerPrivacy?: {
    enabled: boolean;
    heading: string;
    links: Array<{
      id: string;
      label: string;
      url: string;
      content?: string;
    }>;
  };
  paymentMethods: {
    cod: boolean;
    bkash: boolean;
    nagad: boolean;
    card: boolean;
  };
  buttonSettings?: ButtonSettings;
  adminPasscode?: string;
  updatedAt?: string;
}

export type ButtonColorTheme = 'gold' | 'black' | 'emerald' | 'blue' | 'crimson';
export type ButtonPlacement = 'floating' | 'navbar' | 'product_modal' | 'checkout' | 'announcement';
export type ButtonIconType = 'whatsapp' | 'phone' | 'message' | 'bag' | 'sparkles' | 'link' | 'shield';

export interface CustomSiteButton {
  id: string;
  label: string;
  link: string;
  placement: ButtonPlacement;
  color: ButtonColorTheme;
  icon: ButtonIconType;
  openInNewTab: boolean;
  active: boolean;
}

export interface ButtonSettings {
  showOrderNow: boolean;
  orderNowText: string;
  orderNowColor: ButtonColorTheme;
  showAddToCart: boolean;
  addToCartText: string;
  showWishlist: boolean;
  showCardQuickOrder: boolean;
  showFloatingContact: boolean;
  floatingContactType: 'whatsapp' | 'phone';
  floatingContactValue: string;
  floatingContactText: string;
  customButtons: CustomSiteButton[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  role: 'customer' | 'admin';
  shippingAddress?: Partial<ShippingAddress>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReleaseManifest {
  id: string;
  version: string;
  releaseDate: string;
  title: string;
  changelog: string[];
  zipFileName: string;
  fileSizeBytes: number;
  checksum: string;
  downloadUrl?: string;
  verified: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  size: string;
  color: string;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'best-selling';
  searchQuery: string;
}
