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
        <div className="w-screen max-w-md bg-[#ffffff] border-l border-[#e5e5eb] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5eb] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#b8860b]" />
              <h2 className="font-serif text-lg text-[#111116] font-medium">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#71717a] hover:text-[#111116] transition-colors cursor-pointer rounded-xs"
              aria-label="Close shopping bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Strip */}
          <div className="bg-[#f8f8fa] px-6 py-3 border-b border-[#ebebef]">
            {amountToFreeShipping > 0 ? (
              <p className="text-xs text-[#52525b] mb-2">
                Add <span className="font-semibold text-[#b8860b] font-mono">{currencyFormat(amountToFreeShipping)}</span> more for complimentary luxury delivery.
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-medium mb-2">
                ✓ You qualify for complimentary luxury delivery across Bangladesh.
              </p>
            )}
            <div className="w-full h-1 bg-[#e5e5eb] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full border border-[#e5e5eb] flex items-center justify-center mb-4 text-[#71717a]">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-base text-[#111116] mb-2 font-medium">Your Bag is Empty</h3>
                <p className="text-xs text-[#71717a] max-w-xs mb-6">
                  Explore our curated seasonal tailoring, noble knitwear, and artisan accessories.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    onExplore();
                  }}
                  className="px-6 py-2.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors cursor-pointer shadow-xs"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-3 bg-[#ffffff] border border-[#e5e5eb] hover:border-[#d4d4d8] rounded-xs shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 overflow-hidden rounded-xs bg-[#f4f4f7] border border-[#ebebef]">
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
                        <h4 className="font-serif text-xs text-black font-bold line-clamp-1">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#71717a] hover:text-rose-600 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-black font-semibold mt-1 font-mono">
                        <span>Size: <span className="text-black font-black">{item.selectedSize}</span></span>
                        <span>·</span>
                        <span>Color: <span className="text-black font-black">{item.selectedColor}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-black/30 bg-[#f8f8fa] rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-[#b8860b] text-black font-bold transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="px-2 text-xs font-mono font-black text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-[#b8860b] text-black font-bold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-black text-black">
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
            <div className="p-6 border-t-2 border-black/20 bg-[#f8f8fa] space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-black font-bold">
                  <span>Subtotal</span>
                  <span className="font-mono text-black font-black tabular-nums">{currencyFormat(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-black/20">
                  <span>Total</span>
                  <span className="font-mono text-black font-black tabular-nums text-lg">
                    {currencyFormat(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  closeCart();
                  onCheckout();
                }}
                className="w-full py-3.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-black/10 cursor-pointer"
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
