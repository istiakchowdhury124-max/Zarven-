import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Search, X, ArrowRight } from 'lucide-react';
import { LuxuryFallbackImage } from '../common/LuxuryFallbackImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onNavigateAdmin?: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigateAdmin
}) => {
  const { products, currencyFormat } = useSiteSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchTerm.trim().toLowerCase();
      if (query === 'arman' || query === '/arman') {
        e.preventDefault();
        onClose();
        if (onNavigateAdmin) {
          onNavigateAdmin();
        }
      }
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return products.filter(
      p =>
        p.published &&
        (p.title.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.tags.some(t => t.toLowerCase().includes(term)))
    );
  }, [searchTerm, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
      />

      <div className="relative min-h-screen px-4 pt-16 pb-20 flex justify-center">
        <div className="relative w-full max-w-2xl bg-[#ffffff] border border-[#e5e5eb] rounded-xs shadow-2xl overflow-hidden self-start">
          
          {/* Search Input Bar */}
          <div className="p-4 sm:p-6 border-b-2 border-black/20 flex items-center gap-3">
            <Search className="w-5 h-5 text-black stroke-[2.5]" />
            <input
              id="store-search-input"
              name="search"
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by garment, fabric, SKU, or category (e.g., Blazer, Silk, Wool)..."
              className="flex-1 bg-transparent text-sm sm:text-base text-black font-bold placeholder-black/50 focus:outline-hidden"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-black hover:opacity-70 p-1 cursor-pointer font-bold"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-black hover:text-[#b8860b] uppercase tracking-wider pl-3 border-l-2 border-black/20 cursor-pointer font-black"
            >
              Esc
            </button>
          </div>

          {/* Quick Categories Bar */}
          <div className="px-6 py-3 bg-[#f8f8fa] border-b border-black/15 flex items-center gap-2 overflow-x-auto text-[11px] text-black">
            <span className="uppercase tracking-widest text-black shrink-0 font-black">Suggestions:</span>
            {['Tailoring', 'Outerwear', 'Knitwear', 'Silk Shirts', 'Wool Trousers'].map(cat => (
              <button
                key={cat}
                onClick={() => setSearchTerm(cat)}
                className="px-2.5 py-1 bg-[#ffffff] hover:bg-black hover:text-white text-black font-bold border border-black/30 rounded-xs transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {searchTerm.trim() === '' ? (
              <div className="py-12 text-center text-black">
                <p className="text-xs uppercase tracking-widest font-bold">Type to search the Zarven luxury catalog</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-black">
                <p className="text-sm font-serif text-black mb-1 font-black">No garments match "{searchTerm}"</p>
                <p className="text-xs font-bold text-black/70">Try searching for Silk, Wool, Blazer, Trench, or Gold</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="flex gap-3 p-3 bg-[#ffffff] border-2 border-black/20 hover:border-black rounded-xs cursor-pointer group transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="w-16 h-20 rounded-xs overflow-hidden shrink-0 bg-[#f4f4f7] border border-black/20">
                      <LuxuryFallbackImage
                        src={p.images[0]}
                        alt={p.title}
                        aspectRatio="3/4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-black uppercase font-mono font-bold">{p.category}</span>
                        <h4 className="font-serif text-xs text-black group-hover:text-[#b8860b] transition-colors line-clamp-1 font-bold">
                          {p.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-black text-black">
                        {currencyFormat(p.salePrice || p.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
