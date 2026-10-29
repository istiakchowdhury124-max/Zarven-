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
      className="group relative flex flex-col bg-[#ffffff] border border-[#e5e5eb] hover:border-[#111116]/30 rounded-xs overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs hover:shadow-md"
    >
      {/* 1. Image Showcase (65-75% card height) */}
      <div className="relative w-full aspect-4/3 sm:aspect-3/4 overflow-hidden bg-[#f4f4f7]">
        <LuxuryFallbackImage
          src={product.images[0]}
          alt={product.title}
          category={product.category}
          aspectRatio="3/4"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Wishlist button */}
        {(settings.buttonSettings?.showWishlist ?? true) && (
          <button
            onClick={handleWishlistToggle}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md transition-colors shadow-xs ${
              isFavorited 
                ? 'bg-[#111116] text-[#d4af37]' 
                : 'bg-white/80 text-[#52525b] hover:text-[#111116] hover:bg-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current text-[#d4af37]' : ''}`} />
          </button>
        )}

        {/* Status flags */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1 pointer-events-none">
          {hasSale && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-[#111116] px-2 py-0.5 border border-[#111116] shadow-xs">
              Curated Sale
            </span>
          )}
          {isLowStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-rose-700 px-2 py-0.5 shadow-xs">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-white bg-zinc-600 px-2 py-0.5 shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick add hover overlay on desktop */}
        {!isOutOfStock && (settings.buttonSettings?.showCardQuickOrder ?? true) && (
          <div className="absolute inset-x-3 bottom-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleOrderNowClick}
              className="w-full py-2.5 px-3 bg-[#111116] hover:bg-[#272732] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{settings.buttonSettings?.orderNowText || 'Order Now'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Product Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[#ffffff]">
        <div>
          {/* Category & Tags */}
          <div className="flex items-center gap-2 text-[11px] text-black font-bold uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            {product.tags && product.tags[0] && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{product.tags[0]}</span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-sm sm:text-base text-black font-bold line-clamp-1 group-hover:text-[#b8860b] transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & Color Swatches */}
        <div className="flex items-center justify-between pt-2 border-t border-[#e5e5eb]">
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            {hasSale ? (
              <>
                <span className="font-black text-black text-sm sm:text-base">
                  {currencyFormat(product.salePrice!)}
                </span>
                <span className="text-xs text-[#52525b] font-bold line-through">
                  {currencyFormat(product.price)}
                </span>
              </>
            ) : (
              <span className="font-black text-black text-sm sm:text-base">
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
                  className="w-2.5 h-2.5 rounded-full border border-gray-300"
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
