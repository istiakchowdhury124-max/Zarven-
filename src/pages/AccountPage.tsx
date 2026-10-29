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
    <div className="w-full min-h-screen py-12 bg-[#fafafc] text-[#111116]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="p-8 bg-[#ffffff] border border-[#e5e5eb] rounded-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-[#f4f4f7] border border-[#e5e5eb] flex items-center justify-center text-[#111116]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#b8860b]">
                Client Profile
              </span>
              <h1 className="font-serif text-2xl text-[#111116] font-semibold">
                {currentUser ? currentUser.displayName : 'Guest Patron'}
              </h1>
              <p className="text-xs text-[#71717a] font-mono">
                {currentUser?.email || 'Guest Session · No Account Required'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!currentUser ? (
              <>
                <button
                  onClick={loginWithGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#111116] hover:bg-[#272732] text-xs text-white font-medium rounded-xs cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google</span>
                </button>
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#d4d4d8] hover:border-[#b8860b] text-xs text-[#52525b] hover:text-[#b8860b] transition-colors rounded-xs cursor-pointer"
                  title="Store Staff & Owner Portal"
                >
                  <Shield className="w-3.5 h-3.5 text-[#b8860b]" />
                  <span>Admin Portal</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#d4d4d8] hover:border-red-600 text-xs text-[#52525b] hover:text-red-600 transition-colors rounded-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                {(currentUser?.email?.trim().toLowerCase() === 'chowdhuryistiak66@gmail.com' || isAdmin) && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#111116] hover:bg-[#272732] border border-[#111116] text-xs text-white font-medium rounded-xs cursor-pointer shadow-xs"
                  >
                    <Shield className="w-4 h-4 text-[#d4af37]" />
                    <span>Admin Studio</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-[#e5e5eb] mb-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-6 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-[#111116] text-[#111116]'
                : 'border-transparent text-[#71717a] hover:text-[#111116]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-6 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-[#111116] text-[#111116]'
                : 'border-transparent text-[#71717a] hover:text-[#111116]'
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
              <div className="py-16 text-center bg-[#ffffff] border border-[#e5e5eb] rounded-xs p-8 shadow-xs">
                <h3 className="font-serif text-base text-[#111116] mb-2 font-medium">No Past Orders Found</h3>
                <p className="text-xs text-[#71717a] mb-6">You have not placed an order under this account yet.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              customerOrders.map(ord => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="p-6 bg-[#ffffff] border border-[#e5e5eb] hover:border-[#111116]/40 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-all shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-bold text-[#111116]">{ord.orderNumber}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-[#f4f4f7] text-[#111116] border border-[#e5e5eb]">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#71717a]">
                      {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items · Payment: {ord.paymentMethod}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <span className="font-mono text-base font-bold text-[#111116] tabular-nums">
                      {currencyFormat(ord.total)}
                    </span>
                    <button className="flex items-center gap-1.5 text-xs text-[#b8860b] hover:underline font-medium">
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
              <div className="py-16 text-center bg-[#ffffff] border border-[#e5e5eb] rounded-xs p-8 shadow-xs">
                <h3 className="font-serif text-base text-[#111116] mb-2 font-medium">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#71717a] mb-6">Click the heart icon on any product card to save it for later.</p>
                <button
                  onClick={() => onNavigate('shop')}
                  className="px-6 py-2.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs cursor-pointer"
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
