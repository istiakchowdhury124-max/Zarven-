import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { 
  CustomSiteButton, 
  ButtonSettings, 
  ButtonColorTheme, 
  ButtonPlacement, 
  ButtonIconType 
} from '../../types';
import { 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Sliders, 
  MousePointerClick, 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Shield, 
  Eye, 
  EyeOff,
  Layers,
  HelpCircle
} from 'lucide-react';

const COLOR_OPTIONS: { id: ButtonColorTheme; name: string; bg: string; text: string; border: string }[] = [
  { id: 'gold', name: 'Zarven Gold', bg: 'bg-[#d4af37]', text: 'text-black', border: 'border-[#d4af37]' },
  { id: 'black', name: 'Obsidian Black', bg: 'bg-[#181822]', text: 'text-white', border: 'border-[#38384f]' },
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-500' },
  { id: 'crimson', name: 'Royal Crimson', bg: 'bg-rose-700', text: 'text-white', border: 'border-rose-600' },
  { id: 'blue', name: 'Sapphire Blue', bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-500' }
];

const PLACEMENT_OPTIONS: { id: ButtonPlacement; label: string; desc: string }[] = [
  { id: 'floating', label: 'Floating Action (স্ক্রিনের নিচে ভাসমান বাটন)', desc: 'সবসময় ভিজিটরের সামনে থাকবে' },
  { id: 'navbar', label: 'Navbar Header (হেডার মেনুর পাশে)', desc: 'উপরের মেনু বারে থাকবে' },
  { id: 'product_modal', label: 'Product Details (প্রোডাক্ট ডিটেইলস মডালে)', desc: 'অর্ডার নাও ও কার্ট বাটনের সাথে' },
  { id: 'checkout', label: 'Checkout Page (চেকআউট পেজে)', desc: 'চেকআউটে হেল্পলাইন বা অফার লিংক' },
  { id: 'announcement', label: 'Announcement Bar (নোটিশ বারে)', desc: 'একদম উপরে বিশেষ নোটিশের পাশে' }
];

const ICON_OPTIONS: { id: ButtonIconType; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Phone Call' },
  { id: 'message', label: 'Message / Chat' },
  { id: 'bag', label: 'Shopping Bag' },
  { id: 'sparkles', label: 'Sparkles / Offer' },
  { id: 'link', label: 'External Link' },
  { id: 'shield', label: 'Shield / Guarantee' }
];

export const ElementsManager: React.FC = () => {
  const { settings, updateSettings } = useSiteSettings();

  const [buttonSettings, setButtonSettings] = useState<ButtonSettings>(() => {
    return settings.buttonSettings || {
      showOrderNow: true,
      orderNowText: 'ORDER NOW',
      orderNowColor: 'gold',
      showAddToCart: true,
      addToCartText: 'Add to Cart',
      showWishlist: true,
      showCardQuickOrder: true,
      showFloatingContact: true,
      floatingContactType: 'whatsapp',
      floatingContactValue: '+8801711000000',
      floatingContactText: 'WhatsApp Concierge',
      customButtons: []
    };
  });

  const [enabledSections, setEnabledSections] = useState({
    hero: settings.enabledSections?.hero ?? true,
    promoBanners: settings.enabledSections?.promoBanners ?? true,
    collections: settings.enabledSections?.collections ?? true,
    newArrivals: settings.enabledSections?.newArrivals ?? true,
    bestSellers: settings.enabledSections?.bestSellers ?? true,
    craftsmanship: settings.enabledSections?.craftsmanship ?? true,
    announcementBar: settings.announcementActive ?? true
  });

  // Sync when settings change from remote
  useEffect(() => {
    if (settings.buttonSettings) {
      setButtonSettings(settings.buttonSettings);
    }
    if (settings.enabledSections) {
      setEnabledSections({
        hero: settings.enabledSections.hero ?? true,
        promoBanners: settings.enabledSections.promoBanners ?? true,
        collections: settings.enabledSections.collections ?? true,
        newArrivals: settings.enabledSections.newArrivals ?? true,
        bestSellers: settings.enabledSections.bestSellers ?? true,
        craftsmanship: settings.enabledSections.craftsmanship ?? true,
        announcementBar: settings.announcementActive ?? true
      });
    }
  }, [settings]);

  // Modal for adding a new custom button
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnLink, setNewBtnLink] = useState('');
  const [newBtnPlacement, setNewBtnPlacement] = useState<ButtonPlacement>('floating');
  const [newBtnColor, setNewBtnColor] = useState<ButtonColorTheme>('emerald');
  const [newBtnIcon, setNewBtnIcon] = useState<ButtonIconType>('whatsapp');
  const [newBtnNewTab, setNewBtnNewTab] = useState(true);

  // Active view tab inside ElementsManager
  const [activeTab, setActiveTab] = useState<'buttons' | 'custom' | 'sections'>('buttons');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        buttonSettings,
        announcementActive: enabledSections.announcementBar,
        enabledSections: {
          ...settings.enabledSections,
          hero: enabledSections.hero,
          promoBanners: enabledSections.promoBanners,
          collections: enabledSections.collections,
          newArrivals: enabledSections.newArrivals,
          bestSellers: enabledSections.bestSellers,
          craftsmanship: enabledSections.craftsmanship
        }
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save element settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const [isSubmittingNewBtn, setIsSubmittingNewBtn] = useState(false);
  const [btnActionToast, setBtnActionToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setBtnActionToast({ message, type });
    setTimeout(() => {
      setBtnActionToast(null);
    }, 4000);
  };

  const handleCreateCustomButton = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBtnLabel.trim() || !newBtnLink.trim()) return;

    setIsSubmittingNewBtn(true);
    try {
      const newBtn: CustomSiteButton = {
        id: `btn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: newBtnLabel.trim(),
        link: newBtnLink.trim(),
        placement: newBtnPlacement,
        color: newBtnColor,
        icon: newBtnIcon,
        openInNewTab: newBtnNewTab,
        active: true
      };

      const updatedCustomButtons = [...(buttonSettings.customButtons || []), newBtn];
      const updatedButtonSettings: ButtonSettings = {
        ...buttonSettings,
        customButtons: updatedCustomButtons
      };

      // 1. Update local state
      setButtonSettings(updatedButtonSettings);

      // 2. Persist directly to Firestore
      await updateSettings({
        buttonSettings: updatedButtonSettings
      });

      // 3. Reset modal
      setNewBtnLabel('');
      setNewBtnLink('');
      setIsAddModalOpen(false);
      showToast('কাস্টম বাটন সফলভাবে সেভ হয়েছে এবং ওয়েবসাইটে যুক্ত হয়েছে!');
    } catch (err) {
      console.error('Failed to create and save custom button:', err);
      showToast('বাটন সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'error');
    } finally {
      setIsSubmittingNewBtn(false);
    }
  };

  const handleDeleteCustomButton = async (id: string) => {
    const updatedCustomButtons = (buttonSettings.customButtons || []).filter(b => b.id !== id);
    const updatedButtonSettings: ButtonSettings = {
      ...buttonSettings,
      customButtons: updatedCustomButtons
    };

    setButtonSettings(updatedButtonSettings);
    try {
      await updateSettings({
        buttonSettings: updatedButtonSettings
      });
      showToast('বাটনটি সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err) {
      console.error('Failed to delete custom button:', err);
      showToast('বাটন মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  const handleToggleCustomButton = async (id: string) => {
    const updatedCustomButtons = (buttonSettings.customButtons || []).map(b => 
      b.id === id ? { ...b, active: !b.active } : b
    );
    const updatedButtonSettings: ButtonSettings = {
      ...buttonSettings,
      customButtons: updatedCustomButtons
    };

    setButtonSettings(updatedButtonSettings);
    try {
      await updateSettings({
        buttonSettings: updatedButtonSettings
      });
      showToast('বাটন স্ট্যাটাস আপডেট হয়েছে!');
    } catch (err) {
      console.error('Failed to update custom button toggle:', err);
    }
  };

  const handleApplyPreset = (preset: 'whatsapp' | 'call' | 'messenger' | 'offer') => {
    if (preset === 'whatsapp') {
      setNewBtnLabel('WhatsApp Concierge');
      setNewBtnLink('https://wa.me/8801711000000');
      setNewBtnPlacement('floating');
      setNewBtnColor('emerald');
      setNewBtnIcon('whatsapp');
    } else if (preset === 'call') {
      setNewBtnLabel('Call Hotline: 01711-000000');
      setNewBtnLink('tel:+8801711000000');
      setNewBtnPlacement('floating');
      setNewBtnColor('gold');
      setNewBtnIcon('phone');
    } else if (preset === 'messenger') {
      setNewBtnLabel('Chat on Messenger');
      setNewBtnLink('https://m.me/zarven.official');
      setNewBtnPlacement('floating');
      setNewBtnColor('blue');
      setNewBtnIcon('message');
    } else if (preset === 'offer') {
      setNewBtnLabel('🔥 VIP Eid Offer');
      setNewBtnLink('/shop');
      setNewBtnPlacement('navbar');
      setNewBtnColor('crimson');
      setNewBtnIcon('sparkles');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#20202c]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#d4af37]/10 text-[#d4af37] rounded-md border border-[#d4af37]/20">
              <MousePointerClick className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
              Buttons & Elements Controller
            </h1>
          </div>
          <p className="text-xs text-[#a1a1aa]">
            ওয়েবসাইটের যেকোনো বাটন যোগ করুন, রিমুভ করুন, নাম ও কালার পরিবর্তন করুন এবং ফিচারসমূহ নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] text-xs uppercase tracking-widest font-bold rounded-xs shadow-lg shadow-[#d4af37]/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-900 stroke-[3]" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </>
          )}
        </button>
      </div>

      {/* Action Feedback Toast Banner */}
      {btnActionToast && (
        <div className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-medium animate-fadeIn ${
          btnActionToast.type === 'success'
            ? 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
            : 'bg-rose-950/70 border-rose-700/60 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{btnActionToast.message}</span>
          </div>
          <button
            onClick={() => setBtnActionToast(null)}
            className="text-white/60 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#20202c] pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('buttons')}
          className={`px-4 py-2 rounded-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'buttons'
              ? 'bg-[#d4af37] text-black font-bold'
              : 'bg-[#151520] text-[#a1a1aa] hover:text-white border border-[#232332]'
          }`}
        >
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Core Action Buttons (প্রধান বাটন)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-[#d4af37] text-black font-bold'
              : 'bg-[#151520] text-[#a1a1aa] hover:text-white border border-[#232332]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Buttons Builder ({buttonSettings.customButtons?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sections'
              ? 'bg-[#d4af37] text-black font-bold'
              : 'bg-[#151520] text-[#a1a1aa] hover:text-white border border-[#232332]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Website Sections & Toggles (অন্যান্য ফিচার)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CORE ACTION BUTTONS                               */}
      {/* ======================================================== */}
      {activeTab === 'buttons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. ORDER NOW BUTTON */}
          <div className="p-6 bg-[#121218] border border-[#242436] rounded-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#20202e]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d4af37]" />
                <h3 className="font-serif text-base font-bold text-white">
                  "ORDER NOW" বাটন নিয়ন্ত্রণ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setButtonSettings(prev => ({ ...prev, showOrderNow: !prev.showOrderNow }))}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  buttonSettings.showOrderNow
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                }`}
              >
                {buttonSettings.showOrderNow ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{buttonSettings.showOrderNow ? 'Visible (সক্রিয়)' : 'Hidden (লুকানো)'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#a1a1aa] block mb-1.5 font-medium">
                  বাটনে যা লেখা থাকবে (Button Text)
                </label>
                <input
                  type="text"
                  value={buttonSettings.orderNowText}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, orderNowText: e.target.value }))}
                  placeholder="ORDER NOW"
                  className="w-full bg-[#181824] border border-[#2d2d40] text-white px-3.5 py-2.5 rounded-lg font-mono focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[#a1a1aa] block mb-1.5 font-medium">
                  বাটন কালার থিম (Color Theme)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setButtonSettings(prev => ({ ...prev, orderNowColor: col.id }))}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                        buttonSettings.orderNowColor === col.id
                          ? 'border-[#d4af37] bg-[#222234] text-white font-bold ring-1 ring-[#d4af37]'
                          : 'border-[#2d2d40] bg-[#161622] text-[#a1a1aa] hover:text-white'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${col.bg}`} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-[#0d0d12] border border-[#1f1f2e] rounded-lg">
                <span className="text-[10px] text-[#71717a] uppercase font-mono block mb-2">লাইভ প্রিভিউ:</span>
                <div className={`w-full py-3 px-4 rounded-xs text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 ${
                  COLOR_OPTIONS.find(c => c.id === buttonSettings.orderNowColor)?.bg || 'bg-[#d4af37]'
                } ${COLOR_OPTIONS.find(c => c.id === buttonSettings.orderNowColor)?.text || 'text-black'}`}>
                  <span>{buttonSettings.orderNowText || 'ORDER NOW'} · ৳৪,৫০০</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. ADD TO CART BUTTON */}
          <div className="p-6 bg-[#121218] border border-[#242436] rounded-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#20202e]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#38384f]" />
                <h3 className="font-serif text-base font-bold text-white">
                  "Add to Cart" বাটন নিয়ন্ত্রণ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setButtonSettings(prev => ({ ...prev, showAddToCart: !prev.showAddToCart }))}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  buttonSettings.showAddToCart
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                }`}
              >
                {buttonSettings.showAddToCart ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{buttonSettings.showAddToCart ? 'Visible (সক্রিয়)' : 'Hidden (লুকানো)'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[#a1a1aa] block mb-1.5 font-medium">
                  বাটনে যা লেখা থাকবে (Button Text)
                </label>
                <input
                  type="text"
                  value={buttonSettings.addToCartText}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, addToCartText: e.target.value }))}
                  placeholder="Add to Cart"
                  className="w-full bg-[#181824] border border-[#2d2d40] text-white px-3.5 py-2.5 rounded-lg font-mono focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-[#0d0d12] border border-[#1f1f2e] rounded-lg mt-8">
                <span className="text-[10px] text-[#71717a] uppercase font-mono block mb-2">লাইভ প্রিভিউ:</span>
                <div className="w-full py-3 px-4 rounded-xs text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 bg-[#171722] text-white border border-[#38384d]">
                  <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
                  <span>{buttonSettings.addToCartText || 'Add to Cart'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. WISHLIST & PRODUCT CARD BUTTONS */}
          <div className="p-6 bg-[#121218] border border-[#242436] rounded-xl space-y-4">
            <h3 className="font-serif text-base font-bold text-white pb-3 border-b border-[#20202e]">
              পছন্দের তালিকা (Wishlist) ও ক্যাটালগ বাটন
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#171722] rounded-lg border border-[#28283a]">
                <div>
                  <span className="font-medium text-white block">Wishlist Heart বাটন (♡)</span>
                  <span className="text-[11px] text-[#8e8e9f]">প্রোডাক্ট মডালে পছন্দের তালিকায় রাখার বাটন</span>
                </div>
                <input
                  type="checkbox"
                  checked={buttonSettings.showWishlist}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, showWishlist: e.target.checked }))}
                  className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#171722] rounded-lg border border-[#28283a]">
                <div>
                  <span className="font-medium text-white block">Product Card "Order Now" বাটন</span>
                  <span className="text-[11px] text-[#8e8e9f]">হোমপেজ ও শপপেজের প্রতিটি কার্ডে সরাসরি অর্ডার বাটন</span>
                </div>
                <input
                  type="checkbox"
                  checked={buttonSettings.showCardQuickOrder}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, showCardQuickOrder: e.target.checked }))}
                  className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. FLOATING CONTACT / HELPLINE BUTTON */}
          <div className="p-6 bg-[#121218] border border-[#242436] rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#20202e]">
              <h3 className="font-serif text-base font-bold text-white">
                ফ্লোটিং হেল্পলাইন বাটন (Floating Concierge)
              </h3>
              <input
                type="checkbox"
                checked={buttonSettings.showFloatingContact}
                onChange={(e) => setButtonSettings(prev => ({ ...prev, showFloatingContact: e.target.checked }))}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#a1a1aa] block mb-1">বাটন টেক্সট</label>
                <input
                  type="text"
                  value={buttonSettings.floatingContactText}
                  onChange={(e) => setButtonSettings(prev => ({ ...prev, floatingContactText: e.target.value }))}
                  placeholder="WhatsApp Concierge"
                  className="w-full bg-[#181824] border border-[#2d2d40] text-white px-3 py-2 rounded-lg font-mono focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a1a1aa] block mb-1">যোগাযোগের ধরন</label>
                  <select
                    value={buttonSettings.floatingContactType}
                    onChange={(e) => setButtonSettings(prev => ({ ...prev, floatingContactType: e.target.value as any }))}
                    className="w-full bg-[#181824] border border-[#2d2d40] text-white px-3 py-2 rounded-lg text-xs"
                  >
                    <option value="whatsapp">WhatsApp Direct Chat</option>
                    <option value="phone">Direct Phone Call</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#a1a1aa] block mb-1">ফোন বা হোয়াটসঅ্যাপ নম্বর</label>
                  <input
                    type="text"
                    value={buttonSettings.floatingContactValue}
                    onChange={(e) => setButtonSettings(prev => ({ ...prev, floatingContactValue: e.target.value }))}
                    placeholder="+8801711000000"
                    className="w-full bg-[#181824] border border-[#2d2d40] text-white px-3 py-2 rounded-lg font-mono focus:border-[#d4af37] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CUSTOM BUTTONS BUILDER                            */}
      {/* ======================================================== */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                ওয়েবসাইটে তৈরি করা কাস্টম বাটনসমূহ
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                আপনি যেকোনো পেইজ, হেডার বা ফ্লোটিং স্থানে নতুন বাটন যুক্ত ও পরিচালনা করতে পারেন।
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase font-bold tracking-wider rounded-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add New Button</span>
            </button>
          </div>

          {/* List of Custom Buttons */}
          {buttonSettings.customButtons && buttonSettings.customButtons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buttonSettings.customButtons.map((btn) => (
                <div 
                  key={btn.id}
                  className="p-5 bg-[#121218] border border-[#242436] rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {btn.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        btn.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {btn.active ? 'Active' : 'Disabled'}
                      </span>
                      <span className="px-2 py-0.5 bg-[#1f1f2e] text-[#d4af37] text-[10px] font-mono rounded">
                        {btn.placement}
                      </span>
                    </div>

                    <p className="text-xs text-[#8e8e9f] font-mono truncate max-w-sm">
                      Link: <span className="text-[#d4d4d8]">{btn.link}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#71717a]">
                      <span>Color: <strong className="text-white capitalize">{btn.color}</strong></span>
                      <span>·</span>
                      <span>Icon: <strong className="text-white capitalize">{btn.icon}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCustomButton(btn.id)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        btn.active 
                          ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-950/40' 
                          : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'
                      }`}
                      title={btn.active ? 'Disable button' : 'Enable button'}
                    >
                      {btn.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomButton(btn.id)}
                      className="p-2 rounded-lg border border-rose-900/50 text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Delete button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#121218] border border-dashed border-[#28283a] rounded-xl space-y-3">
              <MousePointerClick className="w-8 h-8 text-[#71717a] mx-auto" />
              <h4 className="text-white font-medium text-sm">কোনো কাস্টম বাটন তৈরি করা হয়নি</h4>
              <p className="text-xs text-[#71717a] max-w-md mx-auto">
                আপনি চাইলে হোয়াটসঅ্যাপ, মেসেঞ্জার, হটলাইন বা যেকোনো অফারের জন্য সাইটে নতুন বাটন যোগ করতে পারেন।
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-xs"
              >
                Create Your First Button
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WEBSITE SECTIONS & TOGGLES                        */}
      {/* ======================================================== */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'announcementBar', title: 'Top Announcement Notice Bar', desc: 'ওয়েবসাইটের একদম উপরে বিশেষ অফার বা ফ্রি শিপিং নোটিশ' },
            { key: 'hero', title: 'Hero Banner Slider', desc: 'হোমপেজের মূল বড় স্লাইডার ব্যানার' },
            { key: 'promoBanners', title: 'Mid-Page Promo Banners', desc: 'হোমপেজে সেকশনের মাঝে বিজ্ঞাপনী ব্যানার' },
            { key: 'collections', title: 'Category Collections Grid', desc: 'ক্যাটাগরি ভিত্তিক ছবি ও লিংক সেকশন' },
            { key: 'trending', title: 'Trending Curations Strip', desc: 'জনপ্রিয় ও ট্রেন্ডিং পণ্যের সেকশন' },
            { key: 'craftsmanship', title: 'Atelier & Craftsmanship Story', desc: 'ব্র্যান্ডের কোয়ালিটি ও নির্ভরযোগ্যতার সেকশন' }
          ].map((sec) => {
            const isEnabled = (enabledSections as any)[sec.key] ?? true;
            return (
              <div 
                key={sec.key}
                onClick={() => setEnabledSections(prev => ({ ...prev, [sec.key]: !isEnabled }))}
                className={`p-5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isEnabled
                    ? 'border-[#d4af37]/60 bg-[#151520]'
                    : 'border-[#242436] bg-[#101016] opacity-60'
                }`}
              >
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">{sec.title}</h4>
                  <p className="text-xs text-[#8e8e9f] mt-0.5">{sec.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                  isEnabled ? 'bg-[#d4af37] border-[#d4af37] text-black' : 'border-[#44445c]'
                }`}>
                  {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD NEW CUSTOM BUTTON                             */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-[#2e2e42] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#222234]">
              <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#d4af37]" />
                <span>Create New Custom Button</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#a1a1aa] hover:text-white p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] text-[#8e8e9f] uppercase font-mono block mb-2">
                দ্রুত বাটন টেমপ্লেট নির্বাচন করুন (Presets):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('whatsapp')}
                  className="px-2.5 py-1.5 bg-[#1b1b28] hover:bg-[#252538] text-emerald-400 text-[11px] rounded-lg border border-emerald-900/50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('call')}
                  className="px-2.5 py-1.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] text-[11px] rounded-lg border border-[#d4af37]/30 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('messenger')}
                  className="px-2.5 py-1.5 bg-[#1b1b28] hover:bg-[#252538] text-blue-400 text-[11px] rounded-lg border border-blue-900/50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Messenger</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('offer')}
                  className="px-2.5 py-1.5 bg-[#1b1b28] hover:bg-[#252538] text-rose-400 text-[11px] rounded-lg border border-rose-900/50 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Offer Link</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateCustomButton} className="space-y-4 text-xs">
              <div>
                <label className="text-[#a1a1aa] block mb-1 font-medium">
                  বাটন লেবেল / নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBtnLabel}
                  onChange={(e) => setNewBtnLabel(e.target.value)}
                  placeholder="যেমন: জরুরি প্রয়োজনে কল করুন অথবা WhatsApp"
                  className="w-full bg-[#181824] border border-[#2c2c3e] text-white px-3.5 py-2.5 rounded-lg focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[#a1a1aa] block mb-1 font-medium">
                  বাটনের লিংক বা অ্যাকশন (Link / URL) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newBtnLink}
                  onChange={(e) => setNewBtnLink(e.target.value)}
                  placeholder="https://wa.me/88017... অথবা tel:01711000000 অথবা /shop"
                  className="w-full bg-[#181824] border border-[#2c2c3e] text-white px-3.5 py-2.5 rounded-lg font-mono focus:border-[#d4af37] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a1a1aa] block mb-1 font-medium">অবস্থান (Placement)</label>
                  <select
                    value={newBtnPlacement}
                    onChange={(e) => setNewBtnPlacement(e.target.value as ButtonPlacement)}
                    className="w-full bg-[#181824] border border-[#2c2c3e] text-white px-3 py-2 rounded-lg text-xs"
                  >
                    {PLACEMENT_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#a1a1aa] block mb-1 font-medium">বাটন আইকন (Icon)</label>
                  <select
                    value={newBtnIcon}
                    onChange={(e) => setNewBtnIcon(e.target.value as ButtonIconType)}
                    className="w-full bg-[#181824] border border-[#2c2c3e] text-white px-3 py-2 rounded-lg text-xs"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#a1a1aa] block mb-1.5 font-medium">বাটন কালার থিম</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(col => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setNewBtnColor(col.id)}
                      className={`px-3 py-1 rounded-md text-xs border flex items-center gap-1.5 cursor-pointer ${
                        newBtnColor === col.id
                          ? 'border-[#d4af37] bg-[#222234] text-white font-bold ring-1 ring-[#d4af37]'
                          : 'border-[#2d2d40] bg-[#161622] text-[#a1a1aa]'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${col.bg}`} />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newTabCheck"
                  checked={newBtnNewTab}
                  onChange={(e) => setNewBtnNewTab(e.target.checked)}
                  className="w-4 h-4 accent-[#d4af37] cursor-pointer"
                />
                <label htmlFor="newTabCheck" className="text-white text-xs cursor-pointer">
                  নতুন ট্যাবে ওপেন হবে (Open in new browser tab)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#202030]">
                <button
                  type="button"
                  disabled={isSubmittingNewBtn}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#2c2c3e] text-[#a1a1aa] hover:text-white rounded-xs uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewBtn}
                  className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold uppercase tracking-wider text-xs rounded-xs cursor-pointer shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingNewBtn ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>বাটন সেভ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>বাটন তৈরি ও সেভ করুন (Save Button)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
