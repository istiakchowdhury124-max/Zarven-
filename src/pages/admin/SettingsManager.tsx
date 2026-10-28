import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Check, Save, Shield, Lock, KeyRound } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const { settings, updateSettings } = useSiteSettings();

  const [formData, setFormData] = useState({
    currency: settings.currency || 'BDT',
    currencySymbol: settings.currencySymbol || '৳',
    freeShippingThreshold: settings.freeShippingThreshold || 5000,
    standardShippingFee: settings.standardShippingFee || 150,
    taxRate: settings.taxRate || 0.05,
    paymentMethods: { ...settings.paymentMethods },
    adminPasscode: settings.adminPasscode || '1971'
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        ...formData,
        freeShippingThreshold: Number(formData.freeShippingThreshold),
        standardShippingFee: Number(formData.standardShippingFee),
        taxRate: Number(formData.taxRate)
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      alert('Error updating store settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1c1c28]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            Configuration & Commerce Rules
          </span>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">
            Store Settings
          </h1>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#172b1b] border border-[#2a5932] text-[#86efac] text-xs rounded-xs font-mono">
            <Check className="w-4 h-4" />
            <span>Settings Applied to Live Store</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs max-w-3xl">
        
        {/* Currency Settings */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Currency & Monetary Standards
          </h3>
          <p className="text-[#71717a] text-[11px]">
            Configure default currency code and symbol displayed across product cards, cart, and checkout.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                Currency Code *
              </label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs font-mono focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                Currency Glyph / Symbol *
              </label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs font-mono text-base focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Thresholds */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Logistics & Shipping Fees
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                Standard Shipping Fee ({formData.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.standardShippingFee}
                onChange={(e) => setFormData(prev => ({ ...prev, standardShippingFee: Number(e.target.value) }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs font-mono focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                Complimentary Shipping Threshold ({formData.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.freeShippingThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs font-mono focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
              Estimated VAT Rate (e.g. 0.05 for 5%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.taxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
              className="w-full sm:w-1/2 bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs font-mono focus:outline-hidden focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Enabled Payment Gateways */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Active Payment Gateways
          </h3>

          <div className="space-y-3">
            {[
              { id: 'cod', label: 'Cash on Delivery (COD)' },
              { id: 'bkash', label: 'bKash Merchant Mobile Financial Services' },
              { id: 'nagad', label: 'Nagad Postal Mobile Wallet' },
              { id: 'card', label: 'Credit / Debit Card (Visa, MasterCard)' }
            ].map(m => {
              const k = m.id as keyof typeof formData.paymentMethods;
              const isChecked = formData.paymentMethods[k];
              return (
                <label key={m.id} className="flex items-center gap-3 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        paymentMethods: {
                          ...prev.paymentMethods,
                          [k]: !prev.paymentMethods[k]
                        }
                      }));
                    }}
                    className="accent-[#d4af37]"
                  />
                  <span>{m.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Admin Access & Master Passcode Protection */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
                Admin Studio Security & Access Control (এডমিন নিরাপত্তা)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Protected
            </span>
          </div>

          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            আপনার ওয়েবসাইটের এডমিন প্যানেল সম্পূর্ণ সুরক্ষিত। সাধারণ ভিজিটর বা কাস্টমাররা এটিতে ঢুকতে পারবে না। শুধুমাত্র অনুমোদিত Google অ্যাকাউন্ট অথবা আপনার সেট করা গোপন মাস্টার পাসকোড প্রবেশ করিয়ে এডমিন প্যানেলে প্রবেশ করা যাবে।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-mono text-[#a1a1aa] uppercase mb-1.5">
                Authorized Root Admin Email
              </label>
              <input
                type="text"
                readOnly
                value="chowdhuryistiak66@gmail.com"
                className="w-full bg-[#181824] border border-[#272738] text-white/80 px-3.5 py-2.5 rounded-xs font-mono text-xs cursor-not-allowed opacity-90"
              />
              <span className="text-[10px] text-[#71717a] mt-1 block">
                এই Google অ্যাকাউন্ট দিয়ে সাইন-ইন করলে সাথে সাথে ড্যাশবোর্ড আনলক হবে।
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#d4af37] uppercase mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Admin Master Passcode (সিক্রেট পাসকোড)
              </label>
              <input
                type="text"
                value={formData.adminPasscode}
                onChange={(e) => setFormData(prev => ({ ...prev, adminPasscode: e.target.value }))}
                placeholder="মাস্টার পাসকোড (যেমন: 1971)"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2.5 rounded-xs font-mono text-xs focus:outline-hidden"
              />
              <span className="text-[10px] text-[#71717a] mt-1 block">
                অন্য কোনো ডিভাইস বা ব্রাউজার থেকে সরাসরি এই কোড দিয়ে আনলক করা যাবে।
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xl shadow-[#d4af37]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Applying Changes...' : 'Save Commerce Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
