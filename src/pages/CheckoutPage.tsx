import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, PaymentStatus, ShippingAddress, Product, CartItem } from '../types';
import { 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Truck, 
  ArrowLeft, 
  Check, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { LuxuryFallbackImage } from '../components/common/LuxuryFallbackImage';
import { CustomButtonRenderer } from '../components/common/CustomButtonRenderer';

export interface DirectProductSelection {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: (order: Order) => void;
  directProduct?: DirectProductSelection | null;
}

interface DeliveryZone {
  id: 'outside_dhaka';
  name: string;
  fee: number;
  deliveryEstimate: string;
}

const DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'outside_dhaka', name: 'Outside Dhaka', fee: 150, deliveryEstimate: 'সারা বাংলাদেশ (৩-৫ কার্যদিবস)' }
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderSuccess, directProduct }) => {
  const { cart, clearCart } = useCart();
  const { products, currencyFormat, settings } = useSiteSettings();
  const { currentUser, userProfile } = useAuth();

  // Instant direct order product support when cart is empty
  const [selectedProductId, setSelectedProductId] = useState<string>(
    directProduct?.product.id || (products.length > 0 ? products[0].id : '')
  );
  const activeProduct = products.find(p => p.id === selectedProductId) || directProduct?.product || products[0];

  const [directSize, setDirectSize] = useState<string>(
    directProduct?.size || (activeProduct?.sizes?.[0] || 'M')
  );
  const [directColor, setDirectColor] = useState<string>(
    directProduct?.color || (activeProduct?.colors?.[0]?.name || 'Standard')
  );
  const [directQty, setDirectQty] = useState<number>(directProduct?.quantity || 1);

  // Sync state if directProduct prop updates
  useEffect(() => {
    if (directProduct) {
      setSelectedProductId(directProduct.product.id);
      setDirectSize(directProduct.size);
      setDirectColor(directProduct.color);
      setDirectQty(directProduct.quantity);
    }
  }, [directProduct]);

  // Compute active order items: use cart if has items, otherwise use direct product
  const activeItems: CartItem[] = cart.length > 0
    ? cart
    : activeProduct
    ? [
        {
          id: `${activeProduct.id}-${directSize}-${directColor}`,
          productId: activeProduct.id,
          title: activeProduct.title,
          price: (activeProduct.salePrice && activeProduct.salePrice > 0 ? activeProduct.salePrice : activeProduct.price),
          image: activeProduct.images[0] || '',
          selectedSize: directSize,
          selectedColor: directColor,
          quantity: directQty,
          maxStock: activeProduct.stock || 99
        }
      ]
    : [];

  const effectiveSubtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Form Fields matching screenshot 1
  const [fullName, setFullName] = useState(currentUser?.displayName || userProfile?.displayName || '');
  const [phoneDigits, setPhoneDigits] = useState(userProfile?.phone?.replace(/^\+88/, '') || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Delivery Zone matching screenshot 3
  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<'outside_dhaka'>('outside_dhaka');
  const activeZone = DELIVERY_ZONES[0];
  const deliveryCharge = activeZone.fee;

  // Coupon state
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Cart preview toggle
  const [isBagExpanded, setIsBagExpanded] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    if (code === 'ZARVEN10') {
      setDiscountPercent(0.10);
      setCouponMessage({ text: 'Coupon ZARVEN10 applied: 10% discount!', isError: false });
    } else {
      setDiscountPercent(0);
      setCouponMessage({ text: 'Invalid coupon code. Try ZARVEN10 for 10% off.', isError: true });
    }
  };

  const discountAmount = Math.round(effectiveSubtotal * discountPercent);
  const finalTotal = Math.max(0, effectiveSubtotal - discountAmount) + deliveryCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ নামটি লিখুন (Name is required)');
      return;
    }

    const cleanPhone = phoneDigits.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বরটি লিখুন (Valid 11-digit phone required)');
      return;
    }

    if (!streetAddress.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (Delivery address is required)');
      return;
    }

    if (activeItems.length === 0) {
      setErrorMsg('অর্ডার করার জন্য কোনো পণ্য নির্বাচন করা নেই।');
      return;
    }

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `ZAR-${randomNum}`;
      const orderId = `ord-${Date.now()}-${randomNum}`;
      const formattedPhone = cleanPhone.startsWith('88') ? `+${cleanPhone}` : `+88${cleanPhone.replace(/^0/, '0')}`;
      const finalEmail = email.trim() || `${cleanPhone}@cod.zarven.com`;

      const shippingAddressData: ShippingAddress = {
        fullName: fullName.trim(),
        phone: formattedPhone,
        street: streetAddress.trim(),
        city: 'Outside Dhaka',
        stateOrDivision: 'Bangladesh',
        postalCode: '1000',
        country: 'Bangladesh',
        notes: orderNote.trim()
      };

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerId: 'guest',
        customerName: fullName.trim(),
        customerEmail: finalEmail,
        customerPhone: formattedPhone,
        shippingAddress: shippingAddressData,
        items: [...activeItems],
        subtotal: effectiveSubtotal,
        shippingFee: deliveryCharge,
        tax: 0,
        total: finalTotal,
        currency: 'BDT',
        status: 'Pending' as OrderStatus,
        paymentStatus: 'Pending' as PaymentStatus,
        paymentMethod: 'Cash on Delivery',
        transactionRef: 'COD-UNPAID',
        statusHistory: [
          {
            status: 'Pending',
            timestamp,
            note: `Order placed via Cash on Delivery (${activeZone.name} - ৳${deliveryCharge}). Pay upon parcel arrival.`,
            updatedBy: 'Customer'
          }
        ],
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // 1. Write order to Firestore
      await setDoc(doc(db, 'orders', orderId), newOrder);

      // 2. Reduce stock for each item in Firestore
      for (const item of activeItems) {
        try {
          const productRef = doc(db, 'products', item.productId);
          await updateDoc(productRef, {
            stock: increment(-item.quantity),
            updatedAt: timestamp
          });
        } catch (stockErr) {
          console.warn('Could not decrement stock for product:', item.productId, stockErr);
        }
      }

      // 3. Clear cart
      clearCart();

      // 4. Navigate to success receipt
      onOrderSuccess(newOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen py-8 sm:py-12 bg-[#0c0c10] text-[#e4e4e7]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">

        {/* Top Header & Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#a1a1aa] hover:text-[#d4af37] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#d4af37]">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Cash on Delivery</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-white text-center mb-8 tracking-wide">
          Checkout
        </h1>

        {errorMsg && (
          <div className="p-4 mb-6 bg-red-950/60 border border-red-800 text-xs text-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-5">

          {/* ========================================================= */}
          {/* 1. SHIPPING ADDRESS CARD (Matches Screenshot 1)          */}
          {/* ========================================================= */}
          <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#1f1f2b]">
              <div className="w-10 h-10 rounded-full bg-[#181824] border border-[#2d2d3e] flex items-center justify-center text-white shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Shipping address
                </h2>
                <p className="text-xs text-[#8e8e9f]">
                  Fill in your delivery information
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-1">
              {/* Name */}
              <div>
                <label className="text-xs text-[#d4d4d8] font-medium block mb-1.5">
                  Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="সম্পূর্ণ নামটি লিখুন"
                  className="w-full bg-[#181822] border border-[#28283a] focus:border-[#d4af37] text-white px-3.5 py-3 rounded-xl text-sm placeholder:text-[#636372] focus:outline-hidden transition-colors"
                />
              </div>

              {/* Phone Number with +88 prefix */}
              <div>
                <label className="text-xs text-[#d4d4d8] font-medium block mb-1.5">
                  phone number <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-[#28283a] focus-within:border-[#d4af37] bg-[#181822] transition-colors">
                  <div className="bg-[#1f1f2d] text-[#a1a1aa] px-4 flex items-center justify-center border-r border-[#28283a] font-mono text-sm font-semibold select-none">
                    +88
                  </div>
                  <input
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="১১ ডিজিটের মোবাইল নাম্বারটি লিখুন"
                    className="flex-1 bg-transparent text-white px-3.5 py-3 text-sm placeholder:text-[#636372] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="text-xs text-[#d4d4d8] font-medium block mb-1.5">
                  Email <span className="text-[#71717a] font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-[#181822] border border-[#28283a] focus:border-[#d4af37] text-white px-3.5 py-3 rounded-xl text-sm placeholder:text-[#636372] focus:outline-hidden transition-colors"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-[#d4d4d8] font-medium block mb-1.5">
                  Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Road name/Number, House name/Number"
                  className="w-full bg-[#181822] border border-[#28283a] focus:border-[#d4af37] text-white px-3.5 py-3 rounded-xl text-sm placeholder:text-[#636372] focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Order Note (Optional) */}
              <div>
                <label className="text-xs text-[#d4d4d8] font-medium block mb-1.5">
                  Order Note <span className="text-[#71717a] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full bg-[#181822] border border-[#28283a] focus:border-[#d4af37] text-white px-3.5 py-3 rounded-xl text-sm placeholder:text-[#636372] focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. DELIVERY AREA CARD (Matches Screenshot 3)             */}
          {/* ========================================================= */}
          <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#1f1f2b]">
              <div className="w-10 h-10 rounded-full bg-[#181824] border border-[#2d2d3e] flex items-center justify-center text-white shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Delivery Area
                </h2>
                <p className="text-xs text-[#8e8e9f]">
                  Choose your delivery zone
                </p>
              </div>
            </div>

            {/* Delivery Zone Radio Cards */}
            <div className="space-y-3 pt-1">
              {DELIVERY_ZONES.map((zone) => {
                const isSelected = selectedDeliveryZone === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedDeliveryZone(zone.id)}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#d4af37] bg-[#191924] shadow-md shadow-[#d4af37]/5'
                        : 'border-[#262638] bg-[#15151f] hover:border-[#38384f]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#242436] text-[#d4af37]' : 'bg-[#1b1b26] text-[#8e8e9f]'
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-bold text-white">
                          {zone.name}
                        </h3>
                        <p className="text-xs font-mono text-[#d4af37] font-semibold">
                          ৳{zone.fee}
                        </p>
                        <span className="text-[10px] text-[#71717a]">
                          {zone.deliveryEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Radio circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-[#d4af37]'
                        : 'border-[#44445c]'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. PAYMENT OPTIONS CARD (Matches Screenshot 2)           */}
          {/* ========================================================= */}
          <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#1f1f2b]">
              <div className="w-10 h-10 rounded-full bg-[#181824] border border-[#2d2d3e] flex items-center justify-center text-white shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Payment Options
                </h2>
                <p className="text-xs text-[#8e8e9f]">
                  How would you like to pay?
                </p>
              </div>
            </div>

            {/* Cash on Delivery option card */}
            <div className="p-4 rounded-xl border border-[#d4af37] bg-[#191924] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#d4af37] flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
                </div>
                <div>
                  <span className="font-serif text-sm font-bold text-white block">
                    Cash on delivery
                  </span>
                  <span className="text-[11px] text-[#a1a1aa]">
                    পার্সেল পেয়ে দেখে মূল্য পরিশোধ করুন
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-[#d4af37] bg-[#242436] px-2.5 py-1 rounded-md">
                ৳{deliveryCharge}
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. ITEMS & ORDER SUMMARY CARD (Matches Screenshot 2)     */}
          {/* ========================================================= */}
          <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            {/* Header with Bag Count */}
            <div 
              onClick={() => setIsBagExpanded(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-[#1f1f2b]"
            >
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white">
                <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                <span>
                  {activeItems.length} {activeItems.length === 1 ? 'Item' : 'Items'} In Your Bag
                </span>
              </div>
              <button 
                type="button" 
                className="text-[#a1a1aa] hover:text-white p-1"
                aria-label="Toggle items"
              >
                {isBagExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Items List dropdown preview */}
            {isBagExpanded && (
              <div className="space-y-3 pb-3 border-b border-[#1f1f2b] max-h-60 overflow-y-auto pr-1">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-[#181822] shrink-0 border border-[#262638]">
                        <LuxuryFallbackImage
                          src={item.image}
                          alt={item.title}
                          aspectRatio="3/4"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif text-white font-medium line-clamp-1 text-xs sm:text-sm">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#8e8e9f] font-mono mt-0.5">
                          Size: <span className="text-white">{item.selectedSize}</span> · Qty: <span className="text-white">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-white text-xs sm:text-sm shrink-0">
                      Tk.{currencyFormat(item.price * item.quantity).replace(/[^0-9,.]/g, '')}
                    </span>
                  </div>
                ))}

                {/* If direct order without cart, allow instant product/size switch */}
                {cart.length === 0 && activeProduct && (
                  <div className="pt-2 text-[11px] text-[#8e8e9f] flex items-center justify-between bg-[#151520] p-2.5 rounded-lg border border-[#262638]">
                    <span>Product size selection:</span>
                    <div className="flex gap-1.5">
                      {activeProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setDirectSize(sz)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                            directSize === sz 
                              ? 'bg-[#d4af37] text-black' 
                              : 'bg-[#20202e] text-[#a1a1aa] hover:text-white'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ORDER SUMMARY */}
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#8e8e9f] font-semibold block">
                ORDER SUMMARY
              </span>

              {/* Subtotal */}
              <div className="flex justify-between text-xs sm:text-sm text-[#d4d4d8]">
                <span>Subtotal</span>
                <span className="font-mono text-white font-medium">
                  Tk.{effectiveSubtotal.toLocaleString()}
                </span>
              </div>

              {/* Coupon Row */}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-[#d4d4d8]">Coupon</span>
                {!isCouponOpen && discountPercent === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsCouponOpen(true)}
                    className="text-xs text-[#d4af37] hover:text-[#e5c158] transition-colors font-medium cursor-pointer"
                  >
                    + Add coupon
                  </button>
                ) : discountPercent > 0 ? (
                  <span className="font-mono text-emerald-400 font-semibold">
                    -Tk.{discountAmount.toLocaleString()} (10%)
                  </span>
                ) : null}
              </div>

              {/* Coupon Input Drawer */}
              {isCouponOpen && discountPercent === 0 && (
                <div className="p-3 bg-[#181824] border border-[#2a2a3e] rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon (e.g. ZARVEN10)"
                      className="flex-1 bg-[#12121a] border border-[#2e2e42] text-white px-3 py-1.5 text-xs rounded-lg font-mono uppercase tracking-wider focus:outline-hidden focus:border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-[11px] ${couponMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              )}

              {/* Delivery Charge */}
              <div className="flex justify-between text-xs sm:text-sm text-[#d4d4d8]">
                <span>Delivery Charge</span>
                <span className="font-mono text-white font-medium">
                  Tk.{deliveryCharge}
                </span>
              </div>

              {/* Dotted border line like in screenshot 2 */}
              <div className="border-t border-dashed border-[#2f2f42] pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-base sm:text-lg font-bold text-white">
                    Grand Total
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-white">
                    Tk.{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Custom Checkout Buttons (e.g. WhatsApp support / Call order) */}
          <CustomButtonRenderer placement="checkout" className="pt-2" />

          {/* ========================================================= */}
          {/* 5. BOTTOM CTA BUTTON (Matches Screenshot 2)              */}
          {/* ========================================================= */}
          <div className="pt-2 sticky bottom-4 z-30">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl ${
                settings.buttonSettings?.orderNowColor === 'emerald'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                  : settings.buttonSettings?.orderNowColor === 'crimson'
                  ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-700/25'
                  : settings.buttonSettings?.orderNowColor === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
                  : settings.buttonSettings?.orderNowColor === 'black'
                  ? 'bg-[#1e1e28] hover:bg-[#282836] text-white border border-[#3e3e50] shadow-black/40'
                  : 'bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] shadow-[#d4af37]/25'
              } font-bold text-sm sm:text-base tracking-wider uppercase shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span>অর্ডার প্রসেস হচ্ছে...</span>
              ) : (
                <span>
                  {settings.buttonSettings?.orderNowText || 'Order Now'} — Tk.{finalTotal.toLocaleString()}
                </span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
