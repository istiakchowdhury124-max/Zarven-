import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { LuxuryFallbackImage } from '../common/LuxuryFallbackImage';
import { Heart, Plus, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onOrderNow?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onOrderNow }) => {
  const { isInWishlist, toggleWishlist, addToCart } = useCart();
  const { currencyFormat, settings } = useSiteSettings();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasSale = product.salePrice && product.salePrice < product.price;

  const handleOrderNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0]?.name || 'Standard';
    addToCart(product, defaultSize, defaultColor, 1);
    if (onOrderNow) {
      onOrderNow(product);
    } else {
      onSelectProduct(product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article 
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col bg-[#0e0e13] border border-[#20202a] hover:border-[#383848] rounded-xs overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* 1. Image Showcase (65-75% card height) */}
      <div className="relative w-full aspect-4/3 sm:aspect-3/4 overflow-hidden bg-[#14141c]">
        <LuxuryFallbackImage
          src={product.images[0]}
          alt={product.title}
          category={product.category}
          aspectRatio="3/4"
          className="w-full h-full"
        />

        {/* Wishlist button */}
        {(settings.buttonSettings?.showWishlist ?? true) && (
          <button
            onClick={handleWishlistToggle}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-colors ${
              isFavorited 
                ? 'bg-[#d4af37] text-[#0a0a0d]' 
                : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/80'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Status flags: Single unboxed text tag per anti-slop rules (never pill sandwiches) */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
          {hasSale && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] bg-black/80 px-2 py-0.5 border border-[#d4af37]/30 backdrop-blur-xs">
              Curated Sale
            </span>
          )}
          {isLowStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f87171] bg-black/80 px-2 py-0.5 border border-red-900/40 backdrop-blur-xs">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9ca3af] bg-black/80 px-2 py-0.5 border border-gray-700 backdrop-blur-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick add hover overlay on desktop */}
        {!isOutOfStock && (settings.buttonSettings?.showCardQuickOrder ?? true) && (
          <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleOrderNowClick}
              className="w-full py-2.5 px-3 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0d] text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 shadow-xl transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{settings.buttonSettings?.orderNowText || 'Order Now'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Tags: Unboxed clean text with typographic separator */}
          <div className="flex items-center gap-2 text-[11px] text-[#71717a] uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            {product.tags && product.tags[0] && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{product.tags[0]}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm text-white font-medium line-clamp-1 group-hover:text-[#d4af37] transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Color Swatches */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1c1c24]">
          <div className="flex items-baseline gap-2 font-mono tabular-nums text-sm">
            {hasSale ? (
              <>
                <span className="font-semibold text-[#d4af37]">
                  {currencyFormat(product.salePrice!)}
                </span>
                <span className="text-xs text-[#71717a] line-through">
                  {currencyFormat(product.price)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-white">
                {currencyFormat(product.price)}
              </span>
            )}
          </div>

          {/* Color preview dots */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 3).map((col, idx) => (
                <span
                  key={idx}
                  title={col.name}
                  className="w-2.5 h-2.5 rounded-full border border-black/40"
                  style={{ backgroundColor: col.hex }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[10px] text-[#71717a] font-mono">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
