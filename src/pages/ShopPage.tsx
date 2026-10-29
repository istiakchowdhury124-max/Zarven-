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
    <div className="w-full min-h-screen bg-[#ffffff] text-[#111116]">
      {/* 1. Category Directional Breadcrumb Bar */}
      <div className="w-full bg-[#f8f8fa] border-b border-[#e5e5eb] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <nav aria-label="Category Direction Breadcrumb" className="flex items-center gap-2 sm:gap-2.5 font-sans tracking-wide truncate">
            <button 
              onClick={() => onNavigate ? onNavigate('home') : (onCategoryChange ? onCategoryChange('') : null)}
              className="text-black hover:text-[#b8860b] transition-colors flex items-center gap-1.5 cursor-pointer font-bold shrink-0"
              title="Return to Homepage"
            >
              <Home className="w-4 h-4 text-black" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-4 h-4 text-black/60 shrink-0 stroke-[2.5]" />
            <button 
              onClick={() => onCategoryChange ? onCategoryChange('') : null}
              className={`hover:text-black transition-colors cursor-pointer shrink-0 font-bold ${
                !filters.category ? 'text-[#b8860b] font-black' : 'text-black'
              }`}
            >
              All Categories
            </button>
            {filters.category && (
              <>
                <ChevronRight className="w-4 h-4 text-black/60 shrink-0 stroke-[2.5]" />
                <span className="text-black font-black tracking-wider uppercase truncate flex items-center gap-1.5 text-xs sm:text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 animate-pulse"></span>
                  <span className="truncate">{filters.category}</span>
                </span>
              </>
            )}
          </nav>
          {filters.category && (
            <button
              onClick={() => onCategoryChange?.('')}
              className="text-[11px] font-mono text-black hover:text-[#b8860b] font-bold underline shrink-0 cursor-pointer hidden sm:inline"
            >
              View All
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Title & Filter Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 pb-8 border-b border-[#e5e5eb]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#997b32] block mb-1 font-bold">
              {filters.category ? filters.category : 'The Full Catalog'}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-black uppercase">
              {filters.category ? `${filters.category} Collection` : 'All Garments'}
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs font-mono text-black font-bold tabular-nums">
              Showing {filteredProducts.length} pieces
            </span>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#ffffff] border-2 border-black/30 text-xs text-black font-bold rounded-xs shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Filter & Sort</span>
            </button>

            {/* Sort Dropdown */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <label htmlFor="shop-sort-by" className="text-black font-bold">Sort:</label>
              <select
                id="shop-sort-by"
                name="sortBy"
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#ffffff] border-2 border-black/30 text-black font-bold text-xs px-3 py-1.5 rounded-xs focus:outline-hidden focus:border-black font-mono cursor-pointer shadow-2xs"
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
          <aside className="hidden lg:block space-y-8 pr-6 border-r border-[#e5e5eb]">
            
            {/* Filter Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e5e5eb]">
              <span className="text-xs uppercase tracking-widest font-black text-black">
                Refine Selection
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#b8860b] hover:underline cursor-pointer font-bold"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                Garment Category
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: '' }));
                    onCategoryChange?.('');
                  }}
                  className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                    !filters.category ? 'bg-[#ebebef] text-black font-black border border-black/30' : 'text-black font-bold hover:bg-[#f4f4f7]'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[10px] text-black font-bold">{products.length}</span>
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: cat.name }));
                      onCategoryChange?.(cat.name);
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filters.category.toLowerCase() === cat.name.toLowerCase() ? 'bg-[#ebebef] text-black font-black border border-black/30' : 'text-black font-bold hover:bg-[#f4f4f7]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="font-mono text-[10px] text-black font-bold">
                      {products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-black">
                  Maximum Price
                </h3>
                <span className="font-mono text-xs font-black text-black">
                  {currencyFormat(filters.maxPrice)}
                </span>
              </div>
              <input
                id="shop-max-price"
                name="maxPrice"
                type="range"
                min="2000"
                max="50000"
                step="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                className="w-full accent-black bg-[#e5e5eb] h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(sz => (
                    <button
                      key={sz}
                      onClick={() => setFilters(prev => ({ ...prev, size: prev.size === sz ? '' : sz }))}
                      className={`px-3 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                        filters.size === sz
                          ? 'bg-black text-white border-black font-black shadow-2xs'
                          : 'bg-[#ffffff] text-black font-bold border-black/30 hover:border-black'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status toggle */}
            <div className="pt-4 border-t border-[#e5e5eb]">
              <label htmlFor="shop-in-stock-only" className="flex items-center gap-2.5 text-xs text-black font-bold cursor-pointer">
                <input
                  id="shop-in-stock-only"
                  name="inStockOnly"
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-xs accent-black bg-[#ffffff] border-black"
                />
                <span>In Stock Only</span>
              </label>
            </div>

          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#f8f8fa] border border-[#e5e5eb] rounded-xs p-8">
                <h3 className="font-serif text-lg text-[#111116] mb-2 font-bold">No Garments Found</h3>
                <p className="text-xs text-[#71717a] max-w-sm mx-auto mb-6">
                  No pieces matched your selected filter criteria. Clear filters to explore the entire catalog.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer shadow-xs"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#ffffff] border-l border-[#e5e5eb] p-6 flex flex-col justify-between overflow-y-auto text-[#111116] shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e5e5eb] mb-6">
                <h3 className="font-serif text-base text-[#111116] font-bold">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-[#71717a] hover:text-[#111116]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-[#997b32] mb-2 font-mono font-semibold">Category</h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, category: '' }));
                      onCategoryChange?.('');
                    }}
                    className={`block w-full text-left py-1 cursor-pointer ${!filters.category ? 'text-[#b8860b] font-bold' : 'text-[#52525b]'}`}
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
                      className={`block w-full text-left py-1 cursor-pointer ${filters.category.toLowerCase() === c.name.toLowerCase() ? 'text-[#b8860b] font-bold' : 'text-[#52525b]'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#b8860b] font-mono font-bold">Max: {currencyFormat(filters.maxPrice)}</span>
                </div>
                <input
                  id="shop-mobile-max-price"
                  name="mobileMaxPrice"
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  className="w-full accent-[#111116]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#e5e5eb] space-y-2">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-[#111116] text-white font-semibold text-xs uppercase tracking-wider rounded-xs hover:bg-[#272732] shadow-xs"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={() => {
                  resetFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2 bg-transparent text-[#71717a] hover:text-[#111116] text-xs uppercase tracking-wider cursor-pointer"
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
