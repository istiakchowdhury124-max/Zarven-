import React, { useState } from 'react';
import { Product } from '../types';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/store/ProductCard';
import { AdBanner } from '../components/banners/AdBanner';
import { 
  ArrowRight, 
  Scissors, 
  Flame, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import { LuxuryFallbackImage } from '../components/common/LuxuryFallbackImage';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct, onOrderNow }) => {
  const { settings, products, categories, getBannersByPlacement } = useSiteSettings();
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>('all');

  const heroBanners = getBannersByPlacement('hero');
  const activeHeroBanner = heroBanners[0];

  // Category quick filter
  const displayedProducts = selectedQuickCategory === 'all'
    ? products.filter(p => p.published)
    : products.filter(p => p.published && p.category.toLowerCase() === selectedQuickCategory.toLowerCase());

  const trendingProducts = products.filter(p => p.published && (p.isTrending || p.stock < 15));

  // Quick category tabs based on store categories
  const categoryTabs = [
    { id: 'all', label: 'All Garments' },
    ...categories
      .filter(c => !['tailoring', 'outerwear', 'knitwear'].includes(c.name.toLowerCase()))
      .map(c => ({ id: c.name.toLowerCase(), label: c.name }))
  ];

  return (
    <div className="w-full">
      
      {/* 1. STOREFRONT HERO CAMPAIGN SECTION (COMPACT LANDSCAPE MATCHING USER SCREENSHOT) */}
      {settings.enabledSections.hero && (
        <section className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[380px] lg:h-[440px] max-h-[500px] flex items-center justify-center overflow-hidden border-b border-[#20202a]">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0">
            {activeHeroBanner?.imageUrl ? (
              <img
                src={activeHeroBanner.imageUrl}
                alt="Zarven Campaign"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-75 contrast-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#14141e] via-[#0d0d12] to-[#0a0a0d]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d]/90 via-[#0a0a0d]/30 to-black/40" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#0a0a0d]/60" />
          </div>

          {/* Hero Content - sleek & compact */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-6 sm:py-8 flex flex-col items-center justify-center">
            <span className="inline-block text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#d4af37] mb-1.5 sm:mb-2 font-semibold border-b border-[#d4af37]/40 pb-0.5">
              Atelier Zarven // Collection 2026
            </span>
            
            <h1 className="font-serif text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-2.5 uppercase leading-tight text-balance drop-shadow-md">
              {activeHeroBanner?.title || 'Architectural Tailoring & Sublime Craft'}
            </h1>
            
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#d4d4d8] font-light leading-relaxed mb-3 sm:mb-5 line-clamp-2 drop-shadow-sm">
              {activeHeroBanner?.subtitle || 'Exacting Italian wools, virgin cashmeres, and bespoke silhouettes engineered for timeless prominence.'}
            </p>

            <div className="flex items-center justify-center">
              <button
                onClick={() => onNavigate('shop')}
                className="px-5 py-2 sm:px-7 sm:py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-[11px] sm:text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 rounded-xs shadow-lg shadow-[#d4af37]/20 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{activeHeroBanner?.ctaText || 'Explore Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. CONTINUOUS RUNNING ANNOUNCEMENT BAR (DIRECTLY BELOW HERO BANNER, MATCHING SCREENSHOT) */}
      {settings.announcementActive && (
        <div className="bg-black border-y border-[#20202a] py-2.5 sm:py-3 overflow-hidden select-none relative z-10 shadow-md">
          <div 
            className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs sm:text-sm font-bold uppercase tracking-wider text-white"
            style={{
              animationDuration: settings.announcementSpeed === 'fast' 
                ? '18s' 
                : settings.announcementSpeed === 'slow' 
                  ? '38s' 
                  : '26s'
            }}
          >
            {/* First track */}
            {settings.announcementBarText && (
              <span className="flex items-center gap-2 text-[#d4af37]">
                <span>★</span>
                <span>{settings.announcementBarText}</span>
              </span>
            )}
            <span className="text-white font-black text-sm">•</span>

            {((settings.announcementItems && settings.announcementItems.length > 0) 
              ? settings.announcementItems 
              : ['JAMUNA BRANCH', 'CHITTAGONG BRANCH', 'DHAKA GULSHAN FLAGSHIP', 'WHITE GLOVE ALL BANGLADESH DELIVERY']
            ).map((item, idx) => (
              <React.Fragment key={`marquee-1-${idx}`}>
                <span className="tracking-widest font-mono text-white">{item}</span>
                <span className="text-white font-black text-sm">•</span>
              </React.Fragment>
            ))}

            {/* Seamless duplicate track for continuous infinite marquee */}
            {settings.announcementBarText && (
              <span className="flex items-center gap-2 text-[#d4af37]">
                <span>★</span>
                <span>{settings.announcementBarText}</span>
              </span>
            )}
            <span className="text-white font-black text-sm">•</span>

            {((settings.announcementItems && settings.announcementItems.length > 0) 
              ? settings.announcementItems 
              : ['JAMUNA BRANCH', 'CHITTAGONG BRANCH', 'DHAKA GULSHAN FLAGSHIP', 'WHITE GLOVE ALL BANGLADESH DELIVERY']
            ).map((item, idx) => (
              <React.Fragment key={`marquee-2-${idx}`}>
                <span className="tracking-widest font-mono text-white">{item}</span>
                <span className="text-white font-black text-sm">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}



      {/* 3. CURATED TAXONOMY CATEGORIES */}
      {settings.enabledSections.collections && categories.length > 0 && (
        <section className="py-12 sm:py-16 border-b border-[#e5e5eb] bg-[#ffffff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8 pb-3 border-b border-black/20">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-black tracking-wider uppercase">
                  CATEGORIES
                </h2>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs sm:text-sm uppercase tracking-widest text-black hover:text-[#b8860b] transition-colors flex items-center gap-1.5 mt-2 sm:mt-0 cursor-pointer font-bold"
              >
                <span>View All Collections</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Standard Prominent Category Grid (2 columns on mobile, matching reference design) */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onNavigate(`shop?category=${encodeURIComponent(cat.name)}`)}
                  className="group flex flex-col cursor-pointer transition-all duration-300"
                >
                  {/* Portrait Image Container matching screenshot */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#f4f4f7] border border-[#e5e5eb] group-hover:border-black shadow-xs hover:shadow-md transition-all duration-300">
                    <LuxuryFallbackImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      category={cat.name}
                      aspectRatio="4/5"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Clean Category Label & Standard Shop Now Button */}
                  <div className="pt-3 sm:pt-4 text-center">
                    <h3 className="font-serif text-sm sm:text-base md:text-lg font-black tracking-wider text-black uppercase group-hover:text-[#b8860b] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-black font-bold mt-0.5 mb-2 sm:mb-2.5">
                      {cat.productCount} Pieces
                    </p>
                    <div className="flex items-center justify-center">
                      <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold tracking-wider uppercase rounded-md bg-[#ffffff] text-black group-hover:bg-black group-hover:text-white border-2 border-black shadow-xs transition-all duration-200">
                        Shop Now
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HOMEPAGE SHOWCASE & QUICK FILTER TABS */}
      <section className="py-20 border-b border-[#e5e5eb] bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Segmented Filter Control */}
          <div className="flex items-center justify-center mb-10 pb-4 border-b border-black/20">
            <div className="flex items-center gap-1.5 p-1 bg-[#f4f4f6] border border-black/25 rounded-xs overflow-x-auto text-xs">
              {categoryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedQuickCategory(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedQuickCategory === tab.id
                      ? 'bg-black text-white font-extrabold shadow-xs'
                      : 'text-black font-bold hover:text-[#b8860b] hover:bg-[#ebebef]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {displayedProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onOrderNow={onOrderNow}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-black hover:bg-black text-black hover:text-white text-xs uppercase tracking-widest font-extrabold rounded-xs transition-colors cursor-pointer shadow-xs"
            >
              <span>Explore Entire Catalog ({products.length} Pieces)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC BETWEEN-SECTIONS ADVERTISING BANNER */}
      {settings.enabledSections.promoBanners && (
        <AdBanner
          placement="between_sections"
          onNavigate={(url) => {
            if (url.startsWith('/')) {
              onNavigate(url.replace('/', ''));
            } else {
              window.location.href = url;
            }
          }}
        />
      )}

      {/* 6. TRENDING PIECES SECTION */}
      {trendingProducts.length > 0 && (
        <section className="py-20 border-b border-[#e5e5eb] bg-[#fafafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 pb-4 border-b border-black/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#997b32] block mb-1 font-bold">
                  High In Demand
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                  <span>Trending Right Now</span>
                </h2>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs uppercase tracking-widest text-black hover:text-[#b8860b] transition-colors flex items-center gap-1.5 cursor-pointer mt-2 sm:mt-0 font-bold"
              >
                <span>View All Trending</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onOrderNow={onOrderNow}
                />
              ))}
            </div>
          </div>
        </section>
      )}



      </div>
  );
};
