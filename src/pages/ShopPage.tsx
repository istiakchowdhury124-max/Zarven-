import React, { useState, useMemo, useEffect } from 'react';
import { Product, FilterState } from '../types';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ProductCard } from '../components/store/ProductCard';
import { Filter, X, SlidersHorizontal, ArrowUpDown, ChevronRight, Home } from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  initialFilter?: 'all' | 'new' | 'bestseller';
  onCategoryChange?: (category: string) => void;
  onNavigate?: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory = '',
  initialFilter = 'all',
  onCategoryChange,
  onNavigate,
  onSelectProduct,
  onOrderNow
}) => {
  const { products, categories, currencyFormat } = useSiteSettings();

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 50000,
    size: '',
    color: '',
    sortBy: initialFilter === 'new' ? 'newest' : initialFilter === 'bestseller' ? 'best-selling' : 'featured',
    searchQuery: ''
  });

  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: initialCategory || '' }));
  }, [initialCategory]);

  useEffect(() => {
    if (initialFilter === 'new') {
      setFilters(prev => ({ ...prev, sortBy: 'newest' }));
    } else if (initialFilter === 'bestseller') {
      setFilters(prev => ({ ...prev, sortBy: 'best-selling' }));
    }
  }, [initialFilter]);

  // Extract all unique sizes and colors across catalog
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => set.add(s)));
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.colors.forEach(c => set.add(c.name)));
    return Array.from(set);
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Must be published on storefront
      if (!product.published) return false;

      // Category
      if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Price
      const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      if (effectivePrice < filters.minPrice || effectivePrice > filters.maxPrice) {
        return false;
      }

      // Size
      if (filters.size && !product.sizes.includes(filters.size)) {
        return false;
      }

      // Color
      if (filters.color && !product.colors.some(c => c.name.toLowerCase() === filters.color.toLowerCase())) {
        return false;
      }

      // In stock
      if (inStockOnly && product.stock <= 0) {
        return false;
      }

      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        const matchSku = product.sku.toLowerCase().includes(query);
        if (!matchTitle && !matchCategory && !matchSku) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;

      if (filters.sortBy === 'price-asc') return priceA - priceB;
      if (filters.sortBy === 'price-desc') return priceB - priceA;
      if (filters.sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      if (filters.sortBy === 'best-selling') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, filters, inStockOnly]);

  const resetFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 50000,
      size: '',
      color: '',
      sortBy: 'featured',
      searchQuery: ''
    });
    setInStockOnly(false);
    onCategoryChange?.('');
  };

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.size ||
    filters.color ||
    filters.maxPrice < 50000 ||
    filters.minPrice > 0 ||
    filters.searchQuery ||
    inStockOnly
  );

  return (
    <div className="w-full min-h-screen bg-[#0c0c10]">
      {/* 1. Category Directional Breadcrumb Bar: Matches 2nd Picture (Home > All Categories > [CATEGORY]) */}
      <div className="w-full bg-[#111119] border-b border-[#212130] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <nav aria-label="Category Direction Breadcrumb" className="flex items-center gap-2 sm:gap-2.5 font-sans tracking-wide truncate">
            <button 
              onClick={() => onNavigate ? onNavigate('home') : (onCategoryChange ? onCategoryChange('') : null)}
              className="text-[#94a3b8] hover:text-[#d4af37] transition-colors flex items-center gap-1.5 cursor-pointer font-medium shrink-0"
              title="Return to Homepage"
            >
              <Home className="w-4 h-4 text-[#d4af37]" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
            <button 
              onClick={() => onCategoryChange ? onCategoryChange('') : null}
              className={`hover:text-white transition-colors cursor-pointer shrink-0 font-medium ${
                !filters.category ? 'text-[#d4af37] font-semibold' : 'text-[#94a3b8]'
              }`}
            >
              All Categories
            </button>
            {filters.category && (
              <>
                <ChevronRight className="w-4 h-4 text-[#64748b] shrink-0" />
                <span className="text-white font-bold tracking-wider uppercase truncate flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0 animate-pulse"></span>
                  <span className="truncate">{filters.category}</span>
                </span>
              </>
            )}
          </nav>
          {filters.category && (
            <button
              onClick={() => onCategoryChange?.('')}
              className="text-[11px] font-mono text-[#a1a1aa] hover:text-[#d4af37] underline shrink-0 cursor-pointer hidden sm:inline"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Title & Filter Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 pb-8 border-b border-[#20202c]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
              {filters.category ? filters.category : 'The Full Catalog'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white uppercase">
              {filters.category ? `${filters.category} Collection` : 'All Garments'}
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-mono text-[#71717a] tabular-nums">
              Showing {filteredProducts.length} pieces
            </span>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#161620] border border-[#272738] text-xs text-white rounded-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Filter & Sort</span>
            </button>

            {/* Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-[#71717a]">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#14141c] border border-[#272738] text-white text-xs px-3 py-1.5 rounded-xs focus:outline-hidden focus:border-[#d4af37] font-mono cursor-pointer"
              >
                <option value="featured">Curated & Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="best-selling">Best Sellers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid with Sidebar Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block space-y-8 pr-6 border-r border-[#1c1c28]">
            
            {/* Filter Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-[#20202c]">
              <span className="text-xs uppercase tracking-widest font-semibold text-white">
                Refine Selection
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#d4af37] hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-3">
                Garment Category
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: '' }));
                    onCategoryChange?.('');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                    !filters.category ? 'bg-[#1e1e2c] text-white font-medium' : 'text-[#71717a] hover:text-white'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[10px]">{products.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: cat.name }));
                      onCategoryChange?.(cat.name);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filters.category.toLowerCase() === cat.name.toLowerCase() ? 'bg-[#1e1e2c] text-[#d4af37] font-medium' : 'text-[#71717a] hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="font-mono text-[10px]">
                      {products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">
                  Maximum Price
                </h3>
                <span className="font-mono text-xs text-[#d4af37]">
                  {currencyFormat(filters.maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-[#d4af37] bg-[#242432] h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-3">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setFilters(prev => ({ ...prev, size: prev.size === sz ? '' : sz }))}
                      className={`px-3 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                        filters.size === sz
                          ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold'
                          : 'bg-[#13131c] text-[#a1a1aa] border-[#272738] hover:border-[#71717a]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-3">
                  Color Tone
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map(col => (
                    <button
                      key={col}
                      onClick={() => setFilters(prev => ({ ...prev, color: prev.color === col ? '' : col }))}
                      className={`px-3 py-1 text-xs rounded-xs border transition-colors cursor-pointer ${
                        filters.color === col
                          ? 'bg-white text-black border-white font-medium'
                          : 'bg-[#13131c] text-[#a1a1aa] border-[#272738] hover:border-[#71717a]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status toggle */}
            <div className="pt-4 border-t border-[#1c1c28]">
              <label className="flex items-center gap-2.5 text-xs text-[#a1a1aa] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs accent-[#d4af37] bg-[#14141c] border-[#272738]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#101017] border border-[#20202c] rounded-xs p-8">
                <h3 className="font-serif text-lg text-white mb-2">No Garments Found</h3>
                <p className="text-xs text-[#71717a] max-w-sm mx-auto mb-6">
                  No pieces matched your selected filter criteria. Clear filters to explore the entire catalog.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={onSelectProduct}
                    onOrderNow={onOrderNow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#0e0e14] border-l border-[#242435] p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#20202e] mb-6">
                <h3 className="font-serif text-base text-white">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#a1a1aa]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-[#d4af37] mb-2 font-mono">Category</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: '' }));
                      onCategoryChange?.('');
                    }}
                    className={`block w-full text-left py-1 cursor-pointer ${!filters.category ? 'text-[#d4af37] font-semibold' : 'text-[#a1a1aa]'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, category: c.name }));
                        onCategoryChange?.(c.name);
                      }}
                      className={`block w-full text-left py-1 cursor-pointer ${filters.category.toLowerCase() === c.name.toLowerCase() ? 'text-[#d4af37] font-semibold' : 'text-[#a1a1aa]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#d4af37] font-mono">Max: {currencyFormat(filters.maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-[#d4af37]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#20202e] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#d4af37] text-black font-semibold text-xs uppercase tracking-wider rounded-xs"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2 bg-transparent text-[#71717a] text-xs uppercase tracking-wider"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
