import React from 'react';
import { useCart } from '../../context/CartContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { LuxuryFallbackImage } from '../common/LuxuryFallbackImage';

interface CartDrawerProps {
  onCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onExplore }) => {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    shippingFee, 
    total,
    totalItems 
  } = useCart();
  const { settings, currencyFormat } = useSiteSettings();

  if (!isCartOpen) return null;

  const freeThreshold = settings.freeShippingThreshold || 5000;
  const amountToFreeShipping = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e0e13] border-l border-[#242430] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-[#1c1c26] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
              <h2 className="font-serif text-lg text-white font-medium">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#71717a] hover:text-white transition-colors cursor-pointer rounded-xs"
              aria-label="Close shopping bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Strip */}
          <div className="bg-[#14141c] px-6 py-3 border-b border-[#1f1f2a]">
            {amountToFreeShipping > 0 ? (
              <p className="text-xs text-[#a1a1aa] mb-2">
                Add <span className="font-semibold text-[#d4af37] font-mono">{currencyFormat(amountToFreeShipping)}</span> more for complimentary luxury delivery.
              </p>
            ) : (
              <p className="text-xs text-[#86efac] font-medium mb-2">
                ✓ You qualify for complimentary luxury delivery across Bangladesh.
              </p>
            )}
            <div className="w-full h-1 bg-[#242432] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#d4af37] to-[#f59e0b] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full border border-[#272733] flex items-center justify-center mb-4 text-[#71717a]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-base text-white mb-2">Your Bag is Empty</h3>
                <p className="text-xs text-[#71717a] max-w-xs mb-6">
                  Explore our curated seasonal tailoring, noble knitwear, and artisan accessories.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onExplore();
                  }}
                  className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-3 bg-[#131319] border border-[#20202a] rounded-xs"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xs bg-[#1a1a24]">
                    <LuxuryFallbackImage
                      src={item.image}
                      alt={item.title}
                      aspectRatio="3/4"
                      className="w-full h-full"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-xs text-white font-medium line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#71717a] hover:text-[#f87171] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#71717a] mt-1 font-mono">
                        <span>Size: <span className="text-white">{item.selectedSize}</span></span>
                        <span>·</span>
                        <span>Color: <span className="text-white">{item.selectedColor}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#272733] bg-[#0c0c10] rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#d4af37] text-[#a1a1aa] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#d4af37] text-[#a1a1aa] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-semibold text-white">
                        {currencyFormat(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#1c1c26] bg-[#0a0a0e] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#a1a1aa]">
                  <span>Subtotal</span>
                  <span className="font-mono text-white tabular-nums">{currencyFormat(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-white pt-2 border-t border-[#1f1f2a]">
                  <span>Total</span>
                  <span className="font-mono text-[#d4af37] tabular-nums text-base">
                    {currencyFormat(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/15 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
