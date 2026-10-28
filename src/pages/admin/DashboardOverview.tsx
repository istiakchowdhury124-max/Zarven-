import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product, Banner } from '../../types';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Image, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { AdminTab } from './AdminLayout';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onOpenNewProduct: () => void;
  onOpenNewBanner: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenNewProduct,
  onOpenNewBanner
}) => {
  const { products, banners, categories, currencyFormat } = useSiteSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(15));
        const snap = await getDocs(q);
        const list: Order[] = [];
        snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
        setOrders(list);
      } catch {
        // Silently use empty orders list if unauthenticated or offline
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock <= 0);
  const totalBannerClicks = banners.reduce((sum, b) => sum + (b.clickCount || 0), 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c28]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            Executive Cockpit
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase">
            Store Performance
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs font-semibold uppercase tracking-wider rounded-xs cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b1b26] hover:bg-[#252535] border border-[#d4af37]/40 text-[#d4af37] text-xs font-medium uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={onOpenNewBanner}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b1b26] hover:bg-[#252535] border border-[#2e2e40] text-white text-xs font-medium uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Banner</span>
          </button>

          <button
            onClick={() => onNavigateTab('releases')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b1b26] hover:bg-[#252535] border border-[#d4af37]/40 text-[#d4af37] text-xs font-medium uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
          >
            <span>Package Release ZIP</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-[#86efac]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {currencyFormat(totalRevenue)}
          </p>
          <span className="text-[10px] text-[#71717a] block">
            Across {orders.length} logged customer orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#60a5fa]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {orders.length}
          </p>
          <span className="text-[10px] text-[#71717a] block">
            {orders.filter(o => o.status === 'Pending').length} Pending · {orders.filter(o => o.status === 'Delivered').length} Delivered
          </span>
        </div>

        {/* Catalog & Inventory */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Catalog Pieces</span>
            <Package className="w-4 h-4 text-[#d4af37]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {products.length}
          </p>
          <span className="text-[10px] text-[#71717a] block">
            {products.filter(p => p.published).length} Live on storefront
          </span>
        </div>

        {/* Low Stock Warnings */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-2">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Inventory Warnings</span>
            <AlertTriangle className="w-4 h-4 text-[#f87171]" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-bold text-[#f87171] tabular-nums">
            {lowStockProducts.length + outOfStockProducts.length}
          </p>
          <span className="text-[10px] text-[#71717a] block">
            {lowStockProducts.length} Low Stock (&le;5) · {outOfStockProducts.length} Out of Stock
          </span>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders & Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#20202c]">
            <h3 className="font-serif text-sm font-semibold text-white">Recent Customer Orders</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#71717a]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717a]">No orders placed yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1c1c28] text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181822]">
                  {orders.slice(0, 6).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#161620] transition-colors">
                      <td className="py-3 font-mono font-medium text-white">{ord.orderNumber}</td>
                      <td className="py-3 text-[#d4d4d8] truncate max-w-[140px]">{ord.customerName}</td>
                      <td className="py-3 text-[#a1a1aa] font-mono text-[11px]">{ord.paymentMethod}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : ord.status === 'Shipped'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                        {currencyFormat(ord.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts & Banner Health */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Low Stock Items */}
          <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
            <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f87171]" />
              <span>Low Inventory Items</span>
            </h3>

            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <p className="text-xs text-[#86efac]">All pieces maintain sufficient inventory levels.</p>
            ) : (
              <div className="space-y-3">
                {[...outOfStockProducts, ...lowStockProducts].slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-[#1c1c28] last:border-0">
                    <div className="truncate max-w-[180px]">
                      <span className="text-white block truncate">{p.title}</span>
                      <span className="text-[10px] text-[#71717a] font-mono">SKU: {p.sku}</span>
                    </div>
                    <span className={`font-mono text-xs font-bold ${p.stock <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                      {p.stock <= 0 ? '0 in stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ad Campaign Performance */}
          <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-semibold text-white flex items-center gap-2">
                <Image className="w-4 h-4 text-[#d4af37]" />
                <span>Ad Banners ({banners.length})</span>
              </h3>
              <span className="font-mono text-xs text-[#86efac]">{totalBannerClicks} Total Clicks</span>
            </div>

            <div className="space-y-2 text-xs">
              {banners.slice(0, 3).map(b => (
                <div key={b.id} className="p-2.5 bg-[#161622] rounded-xs flex items-center justify-between">
                  <div className="truncate max-w-[160px]">
                    <span className="text-white truncate block">{b.title}</span>
                    <span className="text-[10px] text-[#71717a] font-mono uppercase">{b.placement}</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#d4af37]">{b.clickCount} clicks</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
