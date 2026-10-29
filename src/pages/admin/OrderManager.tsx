import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Search, Eye, CheckCircle, Truck, X, Clock, Mail, Phone, MapPin, Send } from 'lucide-react';

export const OrderManager: React.FC = () => {
  const { currencyFormat } = useSiteSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: Order[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
      setOrders(list);
    } catch {
      // Silently handle offline / unauthenticated states
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      const timestamp = new Date().toISOString();
      const updatedHistory = [
        ...selectedOrder.statusHistory,
        {
          status: newStatus,
          timestamp,
          note: statusUpdateNote || `Status escalated to ${newStatus} by administrator.`,
          updatedBy: 'Admin'
        }
      ];

      const ref = doc(db, 'orders', selectedOrder.id);
      await updateDoc(ref, {
        status: newStatus,
        statusHistory: updatedHistory,
        updatedAt: timestamp
      });

      const updated = {
        ...selectedOrder,
        status: newStatus,
        statusHistory: updatedHistory,
        updatedAt: timestamp
      };

      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
      setStatusUpdateNote('');
    } catch (err: any) {
      alert('Error updating order: ' + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (newPaymentStatus: PaymentStatus) => {
    if (!selectedOrder) return;
    try {
      const timestamp = new Date().toISOString();
      const ref = doc(db, 'orders', selectedOrder.id);
      await updateDoc(ref, {
        paymentStatus: newPaymentStatus,
        updatedAt: timestamp
      });

      const updated = {
        ...selectedOrder,
        paymentStatus: newPaymentStatus,
        updatedAt: timestamp
      };

      setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o));
    } catch (err: any) {
      alert('Error updating payment status: ' + err.message);
    }
  };

  const handleSendNotification = () => {
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c28]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            Fulfillment Studio
          </span>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">
            Customer Orders ({orders.length})
          </h1>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-[#181824] hover:bg-[#20202e] border border-[#272738] text-xs text-white uppercase tracking-wider rounded-xs cursor-pointer"
        >
          Refresh Registry
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-[#121218] border border-[#20202c] rounded-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-3" />
          <input
            id="admin-order-search"
            name="orderSearch"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order #, customer name, email, or phone..."
            className="w-full bg-[#181824] border border-[#272738] text-xs text-white pl-9 pr-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
            autoComplete="off"
          />
        </div>

        <select
          id="admin-order-status-filter"
          name="orderStatusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#181824] border border-[#272738] text-xs text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121218] border border-[#20202c] rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1c1c28] text-[10px] font-mono uppercase tracking-wider text-[#71717a] bg-[#0e0e14]">
                <th className="py-3 px-4 font-medium">Order #</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Customer Details</th>
                <th className="py-3 px-4 font-medium">Items</th>
                <th className="py-3 px-4 font-medium">Total</th>
                <th className="py-3 px-4 font-medium">Fulfillment</th>
                <th className="py-3 px-4 font-medium">Payment</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181822]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#71717a]">
                    No orders matched current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#161622] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="py-3 px-4 text-[#71717a] font-mono text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white block font-medium truncate max-w-[150px]">{ord.customerName}</span>
                      <span className="text-[10px] text-[#71717a] block font-mono">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#a1a1aa]">{ord.items.length} pcs</td>
                    <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                      {currencyFormat(ord.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : ord.status === 'Shipped'
                            ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                            : ord.status === 'Cancelled'
                              ? 'bg-red-950/60 text-red-300 border border-red-800'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono text-[#d4d4d8] block">{ord.paymentMethod}</span>
                      <span className={`text-[10px] font-mono ${ord.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-[#1e1e2c] hover:bg-[#d4af37] hover:text-black text-white text-[11px] font-medium rounded-xs transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/85 backdrop-blur-xs" />
          <div className="relative min-h-screen p-4 flex items-center justify-center">
            <div className="relative w-full max-w-3xl bg-[#121218] border border-[#272738] rounded-xs p-6 sm:p-8 space-y-6 my-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#20202e]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                    Order Management
                  </span>
                  <h3 className="font-serif text-xl font-bold text-white uppercase">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-[#a1a1aa] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Address Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-[#0e0e14] border border-[#20202c] rounded-xs text-xs">
                <div className="space-y-1 text-[#a1a1aa]">
                  <h4 className="font-serif uppercase tracking-wider text-white font-semibold mb-2">Customer Profile</h4>
                  <p className="text-white font-medium">{selectedOrder.customerName}</p>
                  <p>Email: <span className="font-mono text-white">{selectedOrder.customerEmail}</span></p>
                  <p>Phone: <span className="font-mono text-white">{selectedOrder.customerPhone}</span></p>
                  <p>Client ID: <span className="font-mono">{selectedOrder.customerId}</span></p>
                </div>

                <div className="space-y-1 text-[#a1a1aa]">
                  <h4 className="font-serif uppercase tracking-wider text-white font-semibold mb-2">Courier Destination</h4>
                  <p className="text-white">{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.shippingAddress.notes && (
                    <p className="text-[#d4af37] italic mt-1">Note: {selectedOrder.shippingAddress.notes}</p>
                  )}
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="p-4 bg-[#161622] border border-[#272738] rounded-xs space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                  Update Fulfillment Status
                </h4>

                <div className="flex flex-wrap gap-2">
                  {(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateOrderStatus(st)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs border transition-colors cursor-pointer ${
                        selectedOrder.status === st
                          ? 'bg-[#d4af37] text-black border-[#d4af37] font-bold'
                          : 'bg-[#121218] text-[#a1a1aa] border-[#272738] hover:border-[#71717a]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[10px] font-mono text-[#71717a] block mb-1 uppercase">Optional Status Note</label>
                    <input
                      type="text"
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                      placeholder="e.g. Courier tracking code dispatched."
                      className="w-full bg-[#121218] border border-[#272738] text-xs text-white px-3 py-1.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#71717a] block mb-1 uppercase">Payment Status</label>
                    <div className="flex gap-2">
                      {(['Pending', 'Paid', 'Failed', 'Refunded'] as PaymentStatus[]).map(ps => (
                        <button
                          key={ps}
                          onClick={() => handleUpdatePaymentStatus(ps)}
                          className={`px-2.5 py-1.5 text-[11px] font-mono rounded-xs border transition-colors cursor-pointer ${
                            selectedOrder.paymentStatus === ps
                              ? 'bg-white text-black font-semibold'
                              : 'bg-[#121218] text-[#71717a] border-[#272738]'
                          }`}
                        >
                          {ps}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dispatch Customer Notification */}
                <div className="pt-2 border-t border-[#20202c] flex items-center justify-between">
                  <span className="text-xs text-[#a1a1aa]">Trigger SMS / Email delivery dispatch update</span>
                  <button
                    onClick={handleSendNotification}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#202030] hover:bg-[#d4af37] hover:text-black text-xs text-white rounded-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>{notificationSent ? 'Dispatched!' : 'Send Notification'}</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-white font-semibold">
                  Purchased Pieces
                </h4>
                <div className="divide-y divide-[#1c1c28]">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="py-2.5 flex justify-between text-xs">
                      <div>
                        <span className="text-white font-medium">{item.title}</span>
                        <p className="text-[11px] text-[#71717a] font-mono">
                          Size {item.selectedSize} · {item.selectedColor} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-white font-semibold">
                        {currencyFormat(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="p-4 bg-[#0e0e14] border border-[#20202c] rounded-xs space-y-1 text-xs">
                <div className="flex justify-between text-[#71717a]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">{currencyFormat(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#71717a]">
                  <span>Delivery Fee:</span>
                  <span className="font-mono text-white">{currencyFormat(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-[#71717a]">
                  <span>VAT (5%):</span>
                  <span className="font-mono text-white">{currencyFormat(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#1c1c28]">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#d4af37] text-base">{currencyFormat(selectedOrder.total)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
