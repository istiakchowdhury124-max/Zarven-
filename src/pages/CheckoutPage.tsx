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
    <div className="w-full min-h-screen py-8 sm:py-12 bg-[#fafafc] text-[#111116]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">

        {/* Top Header & Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#71717a] hover:text-[#111116] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#b8860b] font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Cash on Delivery</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-[#111116] text-center mb-8 tracking-wide">
          Checkout
        </h1>

        {errorMsg && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-5">

          {/* ========================================================= */}
          {/* 1. SHIPPING ADDRESS CARD (Matches Screenshot 1)          */}
          {/* ========================================================= */}
          <div className="bg-[#ffffff] border-2 border-black/20 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-black/20">
              <div className="w-10 h-10 rounded-full bg-[#f4f4f7] border-2 border-black/30 flex items-center justify-center text-black shrink-0">
                <User className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-black text-black tracking-wide">
                  Shipping address
                </h2>
                <p className="text-xs text-black font-medium">
                  Fill in your delivery information
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-1">
              {/* Name */}
              <div>
                <label htmlFor="checkout-fullName" className="text-xs sm:text-sm text-black font-bold block mb-1.5">
                  Name <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  id="checkout-fullName"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="সম্পূর্ণ নামটি লিখুন"
                  className="w-full bg-[#f8f8fa] border-2 border-black/30 focus:border-black text-black font-bold px-3.5 py-3 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Phone Number with +88 prefix */}
              <div>
                <label htmlFor="checkout-phone" className="text-xs sm:text-sm text-black font-bold block mb-1.5">
                  phone number <span className="text-rose-600 font-bold">*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border-2 border-black/30 focus-within:border-black bg-[#f8f8fa] transition-colors">
                  <div className="bg-[#ebebef] text-black px-4 flex items-center justify-center border-r-2 border-black/30 font-mono text-sm font-extrabold select-none">
                    +88
                  </div>
                  <input
                    id="checkout-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                    placeholder="১১ ডিজিটের মোবাইল নাম্বারটি লিখুন"
                    className="flex-1 bg-transparent text-black font-bold px-3.5 py-3 text-sm placeholder:text-gray-400 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label htmlFor="checkout-email" className="text-xs sm:text-sm text-black font-bold block mb-1.5">
                  Email <span className="text-[#52525b] font-normal">(Optional)</span>
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-[#f8f8fa] border-2 border-black/30 focus:border-black text-black font-bold px-3.5 py-3 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="checkout-address" className="text-xs sm:text-sm text-black font-bold block mb-1.5">
                  Address <span className="text-rose-600 font-bold">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  name="address"
                  rows={2}
                  required
                  autoComplete="street-address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Road name/Number, House name/Number"
                  className="w-full bg-[#f8f8fa] border-2 border-black/30 focus:border-black text-black font-bold px-3.5 py-3 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden transition-colors resize-none"
                />
              </div>

              {/* Order Note (Optional) */}
              <div>
                <label htmlFor="checkout-orderNote" className="text-xs sm:text-sm text-black font-bold block mb-1.5">
                  Order Note <span className="text-[#52525b] font-normal">(Optional)</span>
                </label>
                <input
                  id="checkout-orderNote"
                  name="orderNote"
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Any special instructions..."
                  className="w-full bg-[#f8f8fa] border-2 border-black/30 focus:border-black text-black font-bold px-3.5 py-3 rounded-xl text-sm placeholder:text-gray-400 focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 2. DELIVERY AREA CARD (Matches Screenshot 3)             */}
          {/* ========================================================= */}
          <div className="bg-[#ffffff] border-2 border-black/20 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-black/20">
              <div className="w-10 h-10 rounded-full bg-[#f4f4f7] border-2 border-black/30 flex items-center justify-center text-black shrink-0">
                <MapPin className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-black text-black tracking-wide">
                  Delivery Area
                </h2>
                <p className="text-xs text-black font-medium">
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
                    className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-black bg-[#f8f8fa] shadow-xs'
                        : 'border-black/20 bg-[#ffffff] hover:border-black/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-black text-white' : 'bg-[#f4f4f7] text-black'
                      }`}>
                        <Truck className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-black text-black">
                          {zone.name}
                        </h3>
                        <p className="text-xs font-mono text-black font-black">
                          ৳{zone.fee}
                        </p>
                        <span className="text-[11px] text-black font-semibold">
                          {zone.deliveryEstimate}
                        </span>
                      </div>
                    </div>

                    {/* Radio circle */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-black'
                        : 'border-black/40'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-black" />
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
          <div className="bg-[#ffffff] border-2 border-black/20 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-black/20">
              <div className="w-10 h-10 rounded-full bg-[#f4f4f7] border-2 border-black/30 flex items-center justify-center text-black shrink-0">
                <CreditCard className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-serif text-base sm:text-lg font-black text-black tracking-wide">
                  Payment Options
                </h2>
                <p className="text-xs text-black font-medium">
                  How would you like to pay?
                </p>
              </div>
            </div>

            {/* Cash on Delivery option card */}
            <div className="p-4 rounded-xl border-2 border-black bg-[#f8f8fa] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                </div>
                <div>
                  <span className="font-serif text-sm font-black text-black block">
                    Cash on delivery
                  </span>
                  <span className="text-[11px] text-black font-semibold">
                    পার্সেল পেয়ে দেখে মূল্য পরিশোধ করুন
                  </span>
                </div>
              </div>

              <span className="font-mono text-xs font-black text-black bg-[#ebebef] px-2.5 py-1 rounded-md border border-black/20">
                ৳{deliveryCharge}
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. ITEMS & ORDER SUMMARY CARD (Matches Screenshot 2)     */}
          {/* ========================================================= */}
          <div className="bg-[#ffffff] border-2 border-black/20 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header with Bag Count */}
            <div 
              onClick={() => setIsBagExpanded(prev => !prev)}
              className="flex items-center justify-between cursor-pointer select-none pb-4 border-b border-black/20"
            >
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-black text-black">
                <ShoppingBag className="w-4 h-4 text-black stroke-[2.5]" />
                <span>
                  {activeItems.length} {activeItems.length === 1 ? 'Item' : 'Items'} In Your Bag
                </span>
              </div>
              <button 
                type="button" 
                className="text-black hover:text-black p-1 cursor-pointer"
                aria-label="Toggle items"
              >
                {isBagExpanded ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>

            {/* Items List dropdown preview */}
            {isBagExpanded && (
              <div className="space-y-3 pb-3 border-b border-black/20 max-h-60 overflow-y-auto pr-1">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-[#f4f4f7] shrink-0 border border-black/20">
                        <LuxuryFallbackImage
                          src={item.image}
                          alt={item.title}
                          aspectRatio="3/4"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-serif text-black font-black line-clamp-1 text-xs sm:text-sm">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-black font-mono mt-0.5 font-bold">
                          Size: <span className="text-black font-black">{item.selectedSize}</span> · Qty: <span className="text-black font-black">{item.quantity}</span>
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-black text-black text-xs sm:text-sm shrink-0">
                      Tk.{currencyFormat(item.price * item.quantity).replace(/[^0-9,.]/g, '')}
                    </span>
                  </div>
                ))}

                {/* If direct order without cart, allow instant product/size switch */}
                {cart.length === 0 && activeProduct && (
                  <div className="pt-2 text-[11px] text-black flex items-center justify-between bg-[#f8f8fa] p-2.5 rounded-lg border border-black/20">
                    <span className="font-bold">Product size selection:</span>
                    <div className="flex gap-1.5">
                      {activeProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setDirectSize(sz)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-black transition-colors cursor-pointer ${
                            directSize === sz 
                              ? 'bg-black text-white' 
                              : 'bg-[#ffffff] text-black border border-black/30 hover:border-black'
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
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-black font-black block">
                ORDER SUMMARY
              </span>

              {/* Subtotal */}
              <div className="flex justify-between text-xs sm:text-sm text-black font-bold">
                <span>Subtotal</span>
                <span className="font-mono text-black font-black">
                  Tk.{effectiveSubtotal.toLocaleString()}
                </span>
              </div>

              {/* Coupon Row */}
              <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                <span className="text-black">Coupon</span>
                {!isCouponOpen && discountPercent === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsCouponOpen(true)}
                    className="text-xs text-black underline font-black cursor-pointer"
                  >
                    + Add coupon
                  </button>
                ) : discountPercent > 0 ? (
                  <span className="font-mono text-emerald-700 font-black">
                    -Tk.{discountAmount.toLocaleString()} (10%)
                  </span>
                ) : null}
              </div>

              {/* Coupon Input Drawer */}
              {isCouponOpen && discountPercent === 0 && (
                <div className="p-3 bg-[#f8f8fa] border-2 border-black/20 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="checkout-coupon-code"
                      name="couponCode"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon (e.g. ZARVEN10)"
                      className="flex-1 bg-[#ffffff] border-2 border-black/30 text-black px-3 py-1.5 text-xs rounded-lg font-mono uppercase tracking-wider font-bold focus:outline-hidden focus:border-black"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-1.5 bg-black hover:bg-[#272732] text-white text-xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-[11px] font-bold ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              )}

              {/* Delivery Charge */}
              <div className="flex justify-between text-xs sm:text-sm text-black font-bold">
                <span>Delivery Charge</span>
                <span className="font-mono text-black font-black">
                  Tk.{deliveryCharge}
                </span>
              </div>

              {/* Dotted border line */}
              <div className="border-t-2 border-dashed border-black/30 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-serif text-base sm:text-lg font-black text-black">
                    Grand Total
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-black">
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
                  : settings.buttonSettings?.orderNowColor === 'gold'
                  ? 'bg-[#b8860b] hover:bg-[#997b32] text-white shadow-[#b8860b]/25'
                  : 'bg-[#111116] hover:bg-[#272732] text-white shadow-black/20'
              } font-bold text-sm sm:text-base tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
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
