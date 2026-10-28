import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, UserProfile } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Search, User, Shield, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';

export const CustomerManager: React.FC = () => {
  const { currencyFormat } = useSiteSettings();
  const [customers, setCustomers] = useState<{
    key: string;
    name: string;
    email: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
    role: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        const [ordersSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'users'))
        ]);

        const customerMap = new Map<string, {
          key: string;
          name: string;
          email: string;
          phone: string;
          orderCount: number;
          totalSpent: number;
          lastOrderDate: string;
          role: string;
        }>();

        // 1. Process authenticated users
        usersSnap.forEach(u => {
          const data = u.data() as UserProfile;
          customerMap.set(data.email.toLowerCase(), {
            key: data.uid,
            name: data.displayName || 'Client',
            email: data.email,
            phone: data.phone || '—',
            orderCount: 0,
            totalSpent: 0,
            lastOrderDate: data.createdAt || '',
            role: data.role || 'customer'
          });
        });

        // 2. Aggregate from orders
        ordersSnap.forEach(o => {
          const ord = o.data() as Order;
          const emailKey = (ord.customerEmail || '').toLowerCase();
          if (!emailKey) return;

          const existing = customerMap.get(emailKey);
          if (existing) {
            existing.orderCount += 1;
            existing.totalSpent += ord.total || 0;
            if (!existing.lastOrderDate || ord.createdAt > existing.lastOrderDate) {
              existing.lastOrderDate = ord.createdAt;
            }
            if (ord.customerPhone && existing.phone === '—') {
              existing.phone = ord.customerPhone;
            }
          } else {
            customerMap.set(emailKey, {
              key: ord.customerId || emailKey,
              name: ord.customerName || 'Guest Client',
              email: ord.customerEmail,
              phone: ord.customerPhone || '—',
              orderCount: 1,
              totalSpent: ord.total || 0,
              lastOrderDate: ord.createdAt,
              role: 'guest'
            });
          }
        });

        setCustomers(Array.from(customerMap.values()));
      } catch {
        // Silently continue
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c28]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            Client Relations
          </span>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">
            Client Directory ({customers.length})
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-[#121218] border border-[#20202c] rounded-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client name, email, or telephone number..."
            className="w-full bg-[#181824] border border-[#272738] text-xs text-white pl-9 pr-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#121218] border border-[#20202c] rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c28] text-[10px] font-mono uppercase tracking-wider text-[#71717a] bg-[#0e0e14]">
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Contact</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Orders</th>
                <th className="py-3 px-4 font-medium">Lifetime Spend</th>
                <th className="py-3 px-4 font-medium text-right">Latest Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181822]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#71717a]">
                    Loading client directory...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#71717a]">
                    No clients found matching query.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.key} className="hover:bg-[#161622] transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#181824] border border-[#272738] text-[#d4af37] flex items-center justify-center font-serif text-xs font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-white font-medium block truncate max-w-[160px]">{c.name}</span>
                          <span className="text-[10px] text-[#71717a] font-mono truncate max-w-[160px] block">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#a1a1aa] font-mono text-[11px]">{c.phone}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase ${
                        c.role === 'admin'
                          ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                          : 'bg-[#181824] text-[#a1a1aa] border border-[#272738]'
                      }`}>
                        {c.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-white tabular-nums">
                      {c.orderCount} orders
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                      {currencyFormat(c.totalSpent)}
                    </td>

                    <td className="py-3 px-4 text-right text-[11px] font-mono text-[#71717a]">
                      {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
