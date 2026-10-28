import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { CheckCircle, Clock, Package, Truck, Check, ArrowRight, Search } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LuxuryFallbackImage } from '../components/common/LuxuryFallbackImage';

interface OrderConfirmationPageProps {
  order: Order | null;
  onExplore: () => void;
  onTrackOrder: (order: Order) => void;
}

const ORDER_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered'
];

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order: initialOrder,
  onExplore,
  onTrackOrder
}) => {
  const { currencyFormat } = useSiteSettings();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(initialOrder);
  const [trackQuery, setTrackQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');

    try {
      // Find order by orderNumber or id
      const formatted = trackQuery.trim();
      const docSnap = await getDoc(doc(db, 'orders', formatted));
      if (docSnap.exists()) {
        setCurrentOrder(docSnap.data() as Order);
      } else {
        setSearchError(`Order "${formatted}" was not found in our live registry.`);
      }
    } catch (err: any) {
      setSearchError('Error retrieving order details.');
    } finally {
      setIsSearching(false);
    }
  };

  const currentStepIdx = currentOrder
    ? ORDER_STEPS.indexOf(currentOrder.status)
    : 0;

  return (
    <div className="w-full min-h-screen py-16 bg-[#0c0c10]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Order Tracking Lookup Box */}
        <div className="mb-12 p-6 bg-[#121218] border border-[#20202c] rounded-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-sm font-semibold text-white">Live Courier Tracking</h3>
              <p className="text-xs text-[#71717a]">Enter an order code (e.g. ZAR-10492) to view real-time status.</p>
            </div>
            <form onSubmit={handleTrackSubmit} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="Enter Order #"
                className="bg-[#181824] border border-[#292938] text-xs text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37] w-full sm:w-48 font-mono"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer"
              >
                Track
              </button>
            </form>
          </div>
          {searchError && (
            <p className="text-xs text-red-400 mt-3">{searchError}</p>
          )}
        </div>

        {currentOrder ? (
          <div className="space-y-10">
            
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#18261a] border border-[#2d5231] text-[#86efac] flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
                Order Confirmed & Logged
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white uppercase">
                Thank You, {currentOrder.customerName.split(' ')[0]}
              </h1>
              <p className="text-xs text-[#a1a1aa] font-mono">
                Order ID: <span className="text-white font-bold">{currentOrder.orderNumber}</span> · Placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
              </p>
            </div>

            {/* Live Progress Bar */}
            <div className="p-8 bg-[#121218] border border-[#20202c] rounded-xs space-y-8">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-white">
                Fulfillment Status
              </h3>

              <div className="relative">
                {/* Connecting track */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-[#20202e] z-0" />
                <div 
                  className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-[#d4af37] z-0 transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentStepIdx / (ORDER_STEPS.length - 1)) * 100)}%` }}
                />

                <div className="relative z-10 flex justify-between">
                  {ORDER_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step} className="flex flex-col items-center">
                        <div 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                            isCompleted
                              ? 'bg-[#d4af37] text-black font-bold'
                              : isCurrent
                                ? 'bg-[#181822] text-[#d4af37] border-2 border-[#d4af37]'
                                : 'bg-[#181822] text-[#71717a] border border-[#272738]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] mt-2 font-mono uppercase tracking-wider ${
                          isCurrent ? 'text-white font-semibold' : 'text-[#71717a]'
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Receipt & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Delivery Details */}
              <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4 text-xs">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-white border-b border-[#20202c] pb-2">
                  Delivery Destination
                </h3>
                <div className="space-y-1 text-[#a1a1aa]">
                  <p className="text-white font-medium">{currentOrder.customerName}</p>
                  <p>{currentOrder.shippingAddress.street}</p>
                  <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.postalCode}</p>
                  <p>{currentOrder.shippingAddress.country}</p>
                  <p className="pt-2 text-white">Phone: <span className="font-mono">{currentOrder.customerPhone}</span></p>
                  <p className="text-white">Email: <span className="font-mono">{currentOrder.customerEmail}</span></p>
                  <p className="pt-2">Payment: <span className="text-[#d4af37] font-semibold">{currentOrder.paymentMethod}</span> ({currentOrder.paymentStatus})</p>
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4 text-xs">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-white border-b border-[#20202c] pb-2">
                  Timeline Log
                </h3>
                <div className="space-y-3">
                  {currentOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-l-2 border-[#d4af37]/40 pl-3">
                      <div>
                        <span className="font-semibold text-white block">{hist.status}</span>
                        <p className="text-[11px] text-[#71717a] mt-0.5">{hist.note}</p>
                        <span className="text-[10px] font-mono text-[#71717a] block mt-0.5">
                          {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Itemized Order Items */}
            <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-white border-b border-[#20202c] pb-3">
                Purchased Pieces
              </h3>

              <div className="divide-y divide-[#1e1e2c]">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 rounded-xs overflow-hidden bg-[#181822] shrink-0">
                        <LuxuryFallbackImage
                          src={item.image}
                          alt={item.title}
                          aspectRatio="3/4"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif text-white font-medium">{item.title}</h4>
                        <p className="text-[11px] text-[#71717a] font-mono">
                          {item.selectedSize} · {item.selectedColor} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-white font-semibold">
                      {currencyFormat(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#20202c] flex justify-between items-baseline text-sm">
                <span className="text-white font-semibold">Grand Total Paid</span>
                <span className="font-mono text-[#d4af37] text-lg font-bold">
                  {currencyFormat(currentOrder.total)}
                </span>
              </div>
            </div>

            <div className="text-center pt-6">
              <button
                onClick={onExplore}
                className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xl transition-colors cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 text-[#71717a]">
            <p className="text-sm font-serif text-white mb-2">No active order loaded</p>
            <p className="text-xs">Use the tracker above to look up an existing order by code.</p>
          </div>
        )}

      </div>
    </div>
  );
};
