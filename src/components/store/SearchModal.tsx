import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Search, X, ArrowRight } from 'lucide-react';
import { LuxuryFallbackImage } from '../common/LuxuryFallbackImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const { products, currencyFormat } = useSiteSettings();
  const [searchTerm, setSearchTerm] = useState('');

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
        <div className="relative w-full max-w-2xl bg-[#0f0f15] border border-[#272738] rounded-xs shadow-2xl overflow-hidden self-start">
          
          {/* Search Input Bar */}
          <div className="p-4 sm:p-6 border-b border-[#20202e] flex items-center gap-3">
            <Search className="w-5 h-5 text-[#d4af37]" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by garment, fabric, SKU, or category (e.g., Blazer, Silk, Wool)..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#71717a] focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#71717a] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs text-[#a1a1aa] hover:text-white uppercase tracking-wider pl-2 border-l border-[#272738]"
            >
              Esc
            </button>
          </div>

          {/* Quick Categories Bar */}
          <div className="px-6 py-3 bg-[#13131b] border-b border-[#1c1c28] flex items-center gap-2 overflow-x-auto text-[11px] text-[#a1a1aa]">
            <span className="uppercase tracking-widest text-[#71717a] shrink-0 font-medium">Suggestions:</span>
            {['Tailoring', 'Outerwear', 'Knitwear', 'Silk Shirts', 'Wool Trousers'].map(cat => (
              <button
                key={cat}
                onClick={() => setSearchTerm(cat)}
                className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#252535] text-white/80 hover:text-white rounded-xs transition-colors shrink-0"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {searchTerm.trim() === '' ? (
              <div className="py-12 text-center text-[#71717a]">
                <p className="text-xs uppercase tracking-widest">Type to search the Zarven luxury catalog</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-[#71717a]">
                <p className="text-sm font-serif text-white mb-1">No garments match "{searchTerm}"</p>
                <p className="text-xs">Try searching for Silk, Wool, Blazer, Trench, or Gold</p>
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
                    className="flex gap-3 p-3 bg-[#13131a] border border-[#20202b] hover:border-[#d4af37]/60 rounded-xs cursor-pointer group transition-colors"
                  >
                    <div className="w-16 h-20 rounded-xs overflow-hidden shrink-0 bg-[#181822]">
                      <LuxuryFallbackImage
                        src={p.images[0]}
                        alt={p.title}
                        aspectRatio="3/4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#71717a] uppercase font-mono">{p.category}</span>
                        <h4 className="font-serif text-xs text-white group-hover:text-[#d4af37] transition-colors line-clamp-1 font-medium">
                          {p.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-semibold text-white">
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
