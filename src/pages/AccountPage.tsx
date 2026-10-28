import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Product } from '../types';
import { User, Package, Heart, LogIn, LogOut, ArrowRight, Shield } from 'lucide-react';
import { ProductCard } from '../components/store/ProductCard';

interface AccountPageProps {
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onSelectProduct,
  onNavigate,
  onSelectOrder
}) => {
  const { currentUser, userProfile, loginWithGoogle, logout, isAdmin, isMockAdmin, toggleAdminMockMode } = useAuth();
  const { wishlist } = useCart();
  const { products, currencyFormat } = useSiteSettings();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      setIsLoadingOrders(true);
      try {
        let q;
        if (currentUser) {
          q = query(
            collection(db, 'orders'),
            where('customerId', '==', currentUser.uid)
          );
        } else {
          // If guest or evaluation mode, fetch all recent orders
          q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        }
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setCustomerOrders(list);
      } catch {
        // Silently continue
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadOrders();
  }, [currentUser]);

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="w-full min-h-screen py-12 bg-[#0c0c10]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="p-8 bg-[#121218] border border-[#20202c] rounded-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-[#181824] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
                Client Profile
              </span>
              <h1 className="font-serif text-2xl text-white font-semibold">
                {currentUser ? currentUser.displayName : 'Guest Patron'}
              </h1>
              <p className="text-xs text-[#71717a] font-mono">
                {currentUser?.email || 'Guest Session · No Account Required'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser && (
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#272738] hover:border-red-800 text-xs text-[#a1a1aa] hover:text-red-400 transition-colors rounded-xs cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}

            {(currentUser?.email?.trim().toLowerCase() === 'chowdhuryistiak66@gmail.com' || (isAdmin && typeof window !== 'undefined' && sessionStorage.getItem('zarven_admin_unlocked') === 'true')) && (
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1d1d28] hover:bg-[#282838] border border-[#d4af37]/40 text-xs text-[#d4af37] font-medium rounded-xs cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Studio</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#20202c] mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#d4af37] text-white'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-6 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-[#d4af37] text-white'
                : 'border-transparent text-[#71717a] hover:text-[#a1a1aa]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>
        </div>

        {/* Orders View */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="py-16 text-center text-[#71717a] text-xs">Loading order registry...</div>
            ) : customerOrders.length === 0 ? (
              <div className="py-16 text-center bg-[#101016] border border-[#20202c] rounded-xs p-8">
                <h3 className="font-serif text-base text-white mb-2">No Past Orders Found</h3>
                <p className="text-xs text-[#71717a] mb-6">You have not placed an order under this account yet.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 bg-[#d4af37] text-black text-xs uppercase tracking-wider font-semibold rounded-xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              customerOrders.map(ord => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="p-6 bg-[#121218] border border-[#20202c] hover:border-[#383848] rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-bold text-white">{ord.orderNumber}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-[#1a1a26] text-[#d4af37] border border-[#d4af37]/30">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a]">
                      {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items · Payment: {ord.paymentMethod}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      {currencyFormat(ord.total)}
                    </span>
                    <button className="flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline">
                      <span>View Receipt & Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist View */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="py-16 text-center bg-[#101016] border border-[#20202c] rounded-xs p-8">
                <h3 className="font-serif text-base text-white mb-2">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#71717a] mb-6">Click the heart icon on any product card to save it for later.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 bg-[#d4af37] text-black text-xs uppercase tracking-wider font-semibold rounded-xs"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {wishlistProducts.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
