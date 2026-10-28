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
      
      {/* 1. STOREFRONT HERO CAMPAIGN SECTION */}
      {settings.enabledSections.hero && (
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-[#20202a]">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0">
            {activeHeroBanner?.imageUrl ? (
              <img
                src={activeHeroBanner.imageUrl}
                alt="Zarven Campaign"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-60 contrast-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-[#14141e] via-[#0d0d12] to-[#0a0a0d]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/40 to-black/60" />
            <div className="absolute inset-0 bg-radial from-transparent to-[#0a0a0d]/80" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <span className="inline-block text-[11px] font-mono uppercase tracking-[0.3em] text-[#d4af37] mb-6 font-semibold border-b border-[#d4af37]/40 pb-1">
              Atelier Zarven // Collection 2026
            </span>
            
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 uppercase leading-[1.08] text-balance">
              {activeHeroBanner?.title || 'Architectural Tailoring & Sublime Craft'}
            </h1>
            
            <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#d4d4d8] font-light leading-relaxed mb-10">
              {activeHeroBanner?.subtitle || 'Exacting Italian wools, virgin cashmeres, and bespoke silhouettes engineered for timeless prominence.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto px-8 py-4 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 rounded-xs shadow-xl shadow-[#d4af37]/20 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{activeHeroBanner?.ctaText || 'Explore Full Collection'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}



      {/* 3. CURATED TAXONOMY CATEGORIES */}
      {settings.enabledSections.collections && categories.length > 0 && (
        <section className="py-12 border-b border-[#1b1b24] bg-[#0c0c10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-6 pb-3 border-b border-[#1f1f2a]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                  Taxonomy
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white">
                  Curated Collections
                </h2>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs uppercase tracking-widest text-[#a1a1aa] hover:text-[#d4af37] transition-colors flex items-center gap-1.5 mt-2 sm:mt-0 cursor-pointer"
              >
                <span>View All Collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Compact Category Boxes (Reduced by ~0.5-1 inch for sleeker layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onNavigate(`shop?category=${encodeURIComponent(cat.name)}`)}
                  className="group relative flex flex-col overflow-hidden rounded-xs bg-[#121218] border border-[#20202a] hover:border-[#d4af37]/60 transition-all duration-300 cursor-pointer max-w-[200px] mx-auto w-full"
                >
                  {/* Reduced image container height from aspect-3/4 to aspect-[1/1] (saves ~50-70px / 0.5-1 inch) */}
                  <div className="relative aspect-square overflow-hidden bg-[#181822]">
                    <LuxuryFallbackImage
                      src={cat.imageUrl}
                      alt={cat.name}
                      category={cat.name}
                      aspectRatio="1/1"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="p-2 sm:p-2.5 text-center">
                    <h3 className="font-serif text-xs font-semibold text-white group-hover:text-[#d4af37] transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
                      {cat.productCount} Pieces
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. HOMEPAGE SHOWCASE & QUICK FILTER TABS */}
      <section className="py-20 border-b border-[#1b1b24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Segmented Filter Control */}
          <div className="flex items-center justify-center mb-10 pb-4 border-b border-[#1f1f2a]">
            <div className="flex items-center gap-1.5 p-1 bg-[#14141c] border border-[#272738] rounded-xs overflow-x-auto text-xs">
              {categoryTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedQuickCategory(tab.id)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedQuickCategory === tab.id
                      ? 'bg-[#d4af37] text-black font-semibold'
                      : 'text-[#a1a1aa] hover:text-white'
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
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#2e2e40] hover:border-[#d4af37] text-white hover:text-[#d4af37] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer"
            >
              <span>Explore Entire Catalog ({products.length} Pieces)</span>
              <ArrowRight className="w-4 h-4" />
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
        <section className="py-20 border-b border-[#1b1b24] bg-[#0c0c10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12 pb-4 border-b border-[#1f1f2a]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                  High In Demand
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <span>Trending Right Now</span>
                </h2>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="text-xs uppercase tracking-widest text-[#a1a1aa] hover:text-[#d4af37] transition-colors flex items-center gap-1.5 cursor-pointer mt-2 sm:mt-0"
              >
                <span>View All Trending</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
