import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Check, 
  Minus, 
  Plus, 
  Ruler, 
  Star,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import { LuxuryFallbackImage } from '../common/LuxuryFallbackImage';
import { CustomButtonRenderer } from '../common/CustomButtonRenderer';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOrderNow?: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  onOrderNow
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { settings, products, currencyFormat } = useSiteSettings();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'delivery' | 'reviews'>('details');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Sync selection when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      setSelectedSize(product.sizes[0] || 'M');
      setSelectedColor(product.colors[0]?.name || 'Obsidian Black');
      setQuantity(1);
      setAddedAnimation(false);
      setActiveTab('details');
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const hasSale = product.salePrice && product.salePrice < product.price;
  const discountSavings = hasSale ? product.price - product.salePrice! : 0;
  const discountPercentage = hasSale ? Math.round((discountSavings / product.price) * 100) : 0;

  const unitPrice = product ? (product.salePrice && product.salePrice > 0 ? product.salePrice : product.price) : 0;
  const itemsTotal = unitPrice * quantity;

  const btnSettings = settings.buttonSettings;
  const showAddToCart = btnSettings?.showAddToCart ?? true;
  const addToCartText = btnSettings?.addToCartText || 'Add to Cart';
  const showOrderNow = btnSettings?.showOrderNow ?? true;
  const orderNowText = btnSettings?.orderNowText || 'ORDER NOW';
  const showWishlist = btnSettings?.showWishlist ?? true;
  const orderNowColor = btnSettings?.orderNowColor || 'gold';

  const getOrderNowColorClass = (color: string) => {
    switch (color) {
      case 'black':
        return 'bg-[#1a1a24] hover:bg-[#252538] text-white border border-[#3e3e54] shadow-lg';
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25';
      case 'crimson':
        return 'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-700/25';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25';
      case 'gold':
      default:
        return 'bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] shadow-lg shadow-[#d4af37]/25';
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleOrderNow = () => {
    if (isOutOfStock || !product) return;
    addToCart(product, selectedSize, selectedColor, quantity);
    if (onOrderNow) {
      onOrderNow(product, selectedSize, selectedColor, quantity);
    } else {
      onClose();
    }
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-4xl bg-[#0f0f15] border border-[#272736] rounded-xs shadow-2xl overflow-hidden my-6">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 text-[#71717a] hover:text-white bg-black/50 hover:bg-black/90 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left: Gallery & Zoom Preview */}
            <div className="p-6 sm:p-8 bg-[#0a0a0d] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#20202d]">
              <div className="relative aspect-3/4 rounded-xs overflow-hidden bg-[#14141c] mb-4">
                <LuxuryFallbackImage
                  src={product.images[selectedImageIdx] || product.images[0]}
                  alt={product.title}
                  aspectRatio="3/4"
                  category={product.category}
                  className="w-full h-full object-cover"
                />

                {hasSale && (
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] bg-black/90 px-2.5 py-1 border border-[#d4af37]/40">
                      Curated Sale · {discountPercentage}% Off
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-black/90 px-2 py-0.5 border border-emerald-800/40">
                      Save {currencyFormat(discountSavings)}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-16 h-20 rounded-xs overflow-hidden shrink-0 border transition-colors cursor-pointer ${
                        selectedImageIdx === idx ? 'border-[#d4af37]' : 'border-[#272736] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} view ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Purchase Module */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Category & SKU */}
                <div className="flex items-center gap-2 text-xs text-[#71717a] uppercase tracking-widest mb-1.5 font-mono">
                  <span>{product.category}</span>
                  <span>·</span>
                  <span>SKU: {product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="font-serif text-xl sm:text-2xl text-white font-semibold leading-snug mb-2">
                  {product.title}
                </h1>

                {/* Rating & Review counter */}
                <div className="flex items-center gap-2 text-xs text-[#d4af37] mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#d4af37]" />
                    ))}
                  </div>
                  <span className="font-mono text-white text-[11px]">4.9</span>
                  <span className="text-[11px] text-[#71717a]">(18 Bespoke Reviews)</span>
                </div>

                {/* Pricing & Stock Availability */}
                <div className="flex items-baseline gap-3 mb-4 font-mono">
                  {hasSale ? (
                    <>
                      <span className="text-2xl font-bold text-[#d4af37]">
                        {currencyFormat(product.salePrice!)}
                      </span>
                      <span className="text-sm text-[#71717a] line-through">
                        {currencyFormat(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {currencyFormat(product.price)}
                    </span>
                  )}
                  
                  {product.stock > 0 ? (
                    <span className="text-xs text-[#86efac] font-sans">
                      In Stock ({product.stock} units available)
                    </span>
                  ) : (
                    <span className="text-xs text-[#f87171] font-sans">
                      Currently Unavailable
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-[#a1a1aa] leading-relaxed mb-6 font-light">
                  {product.description}
                </p>

                {/* Size Selector with Size Guide Trigger */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-white font-medium">Select Size:</span>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[11px] text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Ruler className="w-3 h-3" />
                        <span>Size Guide</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-[#14141c] text-[#d4d4d8] border-[#272738] hover:border-[#71717a]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs text-white font-medium block mb-2">
                      Color Tone: <span className="text-[#a1a1aa]">{selectedColor}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {product.colors.map((col) => (
                        <button
                          key={col.name}
                          onClick={() => setSelectedColor(col.name)}
                          title={col.name}
                          className={`relative w-7 h-7 rounded-full border-2 transition-transform p-0.5 cursor-pointer ${
                            selectedColor === col.name ? 'border-[#d4af37] scale-110' : 'border-transparent'
                          }`}
                        >
                          <span
                            className="block w-full h-full rounded-full border border-black/40"
                            style={{ backgroundColor: col.hex }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-xs text-white font-medium">Quantity:</span>
                  <div className="flex items-center border border-[#272738] bg-[#14141c] rounded-xs">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-[#a1a1aa] hover:text-white disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 text-[#a1a1aa] hover:text-white disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Actions: Add to Cart (Left) & Order Now (Right) & Wishlist */}
                <div className="pt-2 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* 1. Add to Cart Button (On the Left) */}
                    {showAddToCart && (
                      <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 py-3.5 px-4 rounded-xs text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          isOutOfStock
                            ? 'bg-[#181822] text-[#71717a] border-[#272738] cursor-not-allowed'
                            : addedAnimation
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                            : 'bg-[#171722] hover:bg-[#222232] text-white border-[#38384d] hover:border-[#d4af37]/70 active:scale-[0.99]'
                        }`}
                        title="Add to Shopping Cart"
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Added to Cart ({quantity})</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                            <span>{addToCartText}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* 2. Order Now Button (On the Right - Directly goes to checkout) */}
                    {showOrderNow && (
                      <button
                        onClick={handleOrderNow}
                        disabled={isOutOfStock}
                        className={`flex-1 py-3.5 px-4 rounded-xs text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                          isOutOfStock
                            ? 'bg-[#1e1e28] text-[#71717a] cursor-not-allowed'
                            : getOrderNowColorClass(orderNowColor)
                        }`}
                        title="Proceed Directly to Order Checkout"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>
                          {isOutOfStock ? 'Sold Out' : `${orderNowText} · ${currencyFormat(itemsTotal)}`}
                        </span>
                      </button>
                    )}

                    {/* 3. Wishlist Button */}
                    {showWishlist && (
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-3.5 rounded-xs border transition-colors cursor-pointer shrink-0 flex items-center justify-center ${
                          isFavorited
                            ? 'bg-[#d4af37] text-black border-[#d4af37]'
                            : 'border-[#272738] text-[#a1a1aa] hover:text-white hover:border-[#71717a] bg-[#121218]'
                        }`}
                        aria-label="Wishlist toggle"
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Custom Buttons for Product Modal */}
                  <CustomButtonRenderer placement="product_modal" />
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="pt-4 border-t border-[#1c1c28] grid grid-cols-3 gap-2 text-[10px] text-[#71717a] text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>100% Authentic Fabric</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Express Bangladesh Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>7-Day Bespoke Exchange</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specs Tabs */}
          <div className="p-6 sm:p-8 bg-[#0a0a0d] border-t border-[#20202d]">
            <div className="flex border-b border-[#20202d] gap-6 text-xs mb-4">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'details' ? 'border-[#d4af37] text-white' : 'border-transparent text-[#71717a]'
                }`}
              >
                Craftsmanship
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`pb-2 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'materials' ? 'border-[#d4af37] text-white' : 'border-transparent text-[#71717a]'
                }`}
              >
                Fabric & Care
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`pb-2 uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'delivery' ? 'border-[#d4af37] text-white' : 'border-transparent text-[#71717a]'
                }`}
              >
                Delivery & Returns
              </button>
            </div>

            <div className="text-xs text-[#a1a1aa] leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>Hand-cut and assembled by master tailors. Features canvas basted chest architecture ensuring the garment forms naturally to your chest contours over time.</p>
                  <p className="text-[#d4af37]">Horn buttons sustainably harvested, pick-stitched lapels, and double interior jet pockets.</p>
                </div>
              )}
              {activeTab === 'materials' && (
                <div className="space-y-2">
                  <p>Composition: 100% Super 130s Virgin Wool / Artisan Silk. Sourced directly from premier Biella mills.</p>
                  <p>Care: Specialist dry clean only. Steam gently between wearings to release natural creasing.</p>
                </div>
              )}
              {activeTab === 'delivery' && (
                <div className="space-y-2">
                  <p>Metropolitan Dhaka: Delivery within 24 to 48 hours via dedicated courier in custom atelier garment bag.</p>
                  <p>Divisions across Bangladesh: Express delivery in 3 to 4 business days.</p>
                  <p>Complimentary delivery applies automatically to all orders over ৳5,000.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="p-6 sm:p-8 bg-[#0a0a0d] border-t border-[#20202d]">
              <h4 className="text-xs uppercase tracking-widest text-[#a1a1aa] mb-4 font-semibold">
                Complete The Silhouette
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="group cursor-pointer text-left"
                  >
                    <div className="aspect-3/4 rounded-xs overflow-hidden bg-[#14141c] mb-2 border border-[#20202d] group-hover:border-[#d4af37]/50 transition-colors">
                      <LuxuryFallbackImage
                        src={rel.images[0]}
                        alt={rel.title}
                        aspectRatio="3/4"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-serif text-white truncate group-hover:text-[#d4af37] transition-colors">
                      {rel.title}
                    </p>
                    <p className="text-[11px] font-mono text-[#a1a1aa]">
                      {currencyFormat(rel.salePrice || rel.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Size Guide Drawer */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div onClick={() => setIsSizeGuideOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-[#121218] border border-[#272738] rounded-xs p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#20202e]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#d4af37]" />
                <h3 className="font-serif text-sm font-bold text-white uppercase">Sartorial Size Chart</h3>
              </div>
              <button onClick={() => setIsSizeGuideOpen(false)} className="text-[#a1a1aa] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#20202c] text-[#71717a]">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (in)</th>
                    <th className="py-2">Shoulder (in)</th>
                    <th className="py-2">Sleeve (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181822] text-[#d4d4d8]">
                  <tr><td className="py-2 font-bold text-white">38R / S</td><td>38 - 39</td><td>17.5</td><td>25.0</td></tr>
                  <tr><td className="py-2 font-bold text-white">40R / M</td><td>40 - 41</td><td>18.0</td><td>25.5</td></tr>
                  <tr><td className="py-2 font-bold text-white">42R / L</td><td>42 - 43</td><td>18.5</td><td>26.0</td></tr>
                  <tr><td className="py-2 font-bold text-white">44R / XL</td><td>44 - 45</td><td>19.0</td><td>26.5</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-[#71717a]">All measurements reflect relaxed garments. For custom bespoke fitting appointments, contact the atelier concierge.</p>
          </div>
        </div>
      )}
    </div>
  );
};
