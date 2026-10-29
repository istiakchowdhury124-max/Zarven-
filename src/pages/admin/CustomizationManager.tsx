import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { Check, Save, Plus, Trash2, FileText, Shield, Megaphone, Eye, Sparkles } from 'lucide-react';
import { ImageAttachmentUploader } from '../../components/admin/ImageAttachmentUploader';

export const CustomizationManager: React.FC = () => {
  const { settings, updateSettings } = useSiteSettings();

  const [formData, setFormData] = useState({
    siteName: settings.siteName,
    tagline: settings.tagline,
    logoUrl: settings.logoUrl || '',
    announcementBarText: settings.announcementBarText,
    announcementActive: settings.announcementActive,
    announcementItems: settings.announcementItems || [
      'JAMUNA BRANCH',
      'CHITTAGONG BRANCH',
      'DHAKA GULSHAN FLAGSHIP',
      'WHITE GLOVE ALL BANGLADESH DELIVERY'
    ],
    announcementSpeed: settings.announcementSpeed || 'normal',
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    address: settings.address,
    enabledSections: { ...settings.enabledSections },
    socialLinks: { ...settings.socialLinks },
    footerPrivacy: settings.footerPrivacy || {
      enabled: true,
      heading: 'Privacy & Policies',
      links: [
        {
          id: 'fp-1',
          label: 'Privacy Policy',
          url: '#privacy-policy',
          content: 'At Zarven Atelier, we respect and safeguard your personal information. We only gather data required to process your bespoke tailoring requests, authenticate accounts, and securely deliver your orders. Your data is encrypted and never sold to third parties.'
        },
        {
          id: 'fp-2',
          label: 'Terms of Service',
          url: '#terms-of-service',
          content: 'By accessing Zarven Atelier services and commissioning garments, you agree to our terms of bespoke craftsmanship, intellectual property rights, and fair usage guidelines.'
        },
        {
          id: 'fp-3',
          label: 'Return & Exchange Policy',
          url: '#return-exchange',
          content: 'We provide complimentary 7-day exchanges on standard unworn garments in pristine condition with original tags intact. Made-to-measure bespoke creations receive complimentary alteration fittings until your silhouette is perfected.'
        },
        {
          id: 'fp-4',
          label: 'Shipping & White Glove Delivery',
          url: '#shipping-delivery',
          content: 'Complimentary expedited delivery on all orders above ৳5,000 across Bangladesh. Every garment is steamed, hand-inspected, and delivered in protective luxury covers.'
        },
        {
          id: 'fp-5',
          label: 'Authenticity Guarantee',
          url: '#authenticity-guarantee',
          content: 'Every garment bearing the Zarven emblem is crafted using certified raw textiles—from Egyptian Giza cotton to Italian super-wool—and passes our rigorous seven-stage atelier inspection.'
        }
      ]
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        siteName: settings.siteName,
        tagline: settings.tagline,
        logoUrl: settings.logoUrl || '',
        announcementBarText: settings.announcementBarText,
        announcementActive: settings.announcementActive,
        announcementItems: settings.announcementItems || prev.announcementItems,
        announcementSpeed: settings.announcementSpeed || prev.announcementSpeed,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        address: settings.address,
        enabledSections: { ...settings.enabledSections },
        socialLinks: { ...settings.socialLinks },
        footerPrivacy: settings.footerPrivacy || prev.footerPrivacy
      }));
    }
  }, [settings]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newAnnouncementItem, setNewAnnouncementItem] = useState('');

  const handleAddAnnouncementItem = (textToAdd?: string) => {
    const val = (textToAdd ?? newAnnouncementItem).trim();
    if (!val) return;
    setFormData(prev => ({
      ...prev,
      announcementItems: [...(prev.announcementItems || []), val]
    }));
    if (!textToAdd) setNewAnnouncementItem('');
  };

  const handleRemoveAnnouncementItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      announcementItems: (prev.announcementItems || []).filter((_, i) => i !== index)
    }));
  };

  const handleUpdateAnnouncementItem = (index: number, val: string) => {
    setFormData(prev => {
      const copy = [...(prev.announcementItems || [])];
      copy[index] = val;
      return { ...prev, announcementItems: copy };
    });
  };

  const handleToggleSection = (sectionKey: keyof typeof formData.enabledSections) => {
    setFormData(prev => ({
      ...prev,
      enabledSections: {
        ...prev.enabledSections,
        [sectionKey]: !prev.enabledSections[sectionKey]
      }
    }));
  };

  const handleAddPrivacyLink = () => {
    const newId = `fp-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      footerPrivacy: {
        ...prev.footerPrivacy,
        links: [
          ...prev.footerPrivacy.links,
          {
            id: newId,
            label: 'New Policy or Custom Page',
            url: `#policy-${newId}`,
            content: 'Write the official policy terms, instructions, or conditions here.'
          }
        ]
      }
    }));
  };

  const handleUpdatePrivacyLink = (id: string, updates: Partial<{ label: string; url: string; content?: string }>) => {
    setFormData(prev => ({
      ...prev,
      footerPrivacy: {
        ...prev.footerPrivacy,
        links: prev.footerPrivacy.links.map(l => l.id === id ? { ...l, ...updates } : l)
      }
    }));
  };

  const handleDeletePrivacyLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      footerPrivacy: {
        ...prev.footerPrivacy,
        links: prev.footerPrivacy.links.filter(l => l.id !== id)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert('Error saving customization: ' + err.message);
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
            Visual Identity & Sections
          </span>
          <h1 className="font-serif text-2xl font-bold text-white uppercase">
            Website Customization
          </h1>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#172b1b] border border-[#2a5932] text-[#86efac] text-xs rounded-xs font-mono">
            <Check className="w-4 h-4" />
            <span>Storefront Synchronized</span>
          </div>
        )}
      </div>

      {/* Quick Jump Navigation Bar (Helpful for Mobile Users) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#111118] border border-[#232334] rounded-xs text-xs font-mono">
        <span className="text-[#a1a1aa] uppercase text-[10px] tracking-wider shrink-0 mr-1">
          Quick Jump:
        </span>
        <button
          type="button"
          onClick={() => document.getElementById('announcement-bar-editor')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-2.5 py-1 bg-[#d4af37]/20 hover:bg-[#d4af37]/35 text-[#d4af37] border border-[#d4af37]/80 rounded-xs cursor-pointer text-[11px] font-semibold flex items-center gap-1.5"
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>📢 Announcement Bar (অ্যানাউন্সমেন্ট বার এডিটর)</span>
        </button>
        <button
          type="button"
          onClick={() => document.getElementById('homepage-toggles')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-2.5 py-1 bg-[#181824] hover:bg-[#202030] text-[#d4d4d8] hover:text-white border border-[#2a2a3e] rounded-xs cursor-pointer text-[11px]"
        >
          Homepage Toggles
        </button>
        <button
          type="button"
          onClick={() => document.getElementById('privacy-section-editor')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-2.5 py-1 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/60 rounded-xs cursor-pointer text-[11px] font-semibold flex items-center gap-1.5"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>🛡️ Privacy Section</span>
        </button>
        <button
          type="button"
          onClick={() => document.getElementById('identity-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-2.5 py-1 bg-[#181824] hover:bg-[#202030] text-[#d4d4d8] hover:text-white border border-[#2a2a3e] rounded-xs cursor-pointer text-[11px]"
        >
          Brand & Logo
        </button>
        <button
          type="button"
          onClick={() => document.getElementById('social-links-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-2.5 py-1 bg-[#181824] hover:bg-[#202030] text-[#d4d4d8] hover:text-white border border-[#2a2a3e] rounded-xs cursor-pointer text-[11px] flex items-center gap-1.5"
        >
          <span>🌐 Follow Us (সোশ্যাল মিডিয়া)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        
        {/* Brand & Logo Identity */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Brand Identity & Logo Configuration
          </h3>
          <p className="text-[#71717a] text-[11px]">
            Keep the logo configurable. Initially Zarven uses an architectural wordmark; you can insert your official vector or image logo URL below anytime without redeploying.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={formData.siteName}
                onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>

            <div>
              <ImageAttachmentUploader
                images={formData.logoUrl ? [formData.logoUrl] : []}
                onChange={(imgs) => setFormData(prev => ({ ...prev, logoUrl: imgs[0] || '' }))}
                label="Official Brand Logo (Attach from Gallery)"
                description="Attach your logo directly from your device gallery or computer."
                multiple={false}
              />
            </div>
          </div>

          {/* Logo Visual Live Preview */}
          <div className="p-4 bg-[#0e0e14] border border-[#222230] rounded-xs flex items-center gap-4">
            <img 
              src={formData.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
              alt="Logo Preview" 
              className="w-16 h-16 rounded-full object-cover border-2 border-[#d4af37]/60 shadow-lg shadow-black/80 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg';
              }}
            />
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] block">
                Active Brand Emblem Preview
              </span>
              <p className="font-serif text-lg text-white font-bold tracking-wider uppercase">
                {formData.siteName || 'ZARVEN'}
              </p>
              <p className="text-[11px] text-[#71717a] font-light">
                Official Metallic Monogram (ZW / Zarven) with tagline "We Believe In Quality"
              </p>
            </div>
          </div>

          <div>
            <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
              Atelier Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Announcement Bar & Running Marquee Editor */}
        <div id="announcement-bar-editor" className="p-6 bg-[#121218] border border-[#272738] rounded-xs space-y-6 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#20202e]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] rounded-xs">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-semibold text-white uppercase tracking-wider">
                    Announcement Bar & Running Marquee (অ্যানাউন্সমেন্ট বার এডিটর)
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-xs uppercase ${
                    formData.announcementActive 
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
                      : 'bg-red-950/80 text-red-400 border border-red-800'
                  }`}>
                    {formData.announcementActive ? 'Live / Active' : 'Hidden / Off'}
                  </span>
                </div>
                <p className="text-[#8e8ea0] text-[11px] mt-0.5">
                  ব্যানারের নিচের চলমান মারকুই বার (Marquee) এবং স্টোরফ্রন্টের টপ নোটিশ ও শাখা সমূহ এডিট করুন।
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer bg-[#181824] px-4 py-2 border border-[#2e2e42] hover:border-[#d4af37]/60 rounded-xs transition-colors self-start sm:self-auto">
              <input
                type="checkbox"
                checked={formData.announcementActive}
                onChange={(e) => setFormData(prev => ({ ...prev, announcementActive: e.target.checked }))}
                className="accent-[#d4af37] w-4 h-4 cursor-pointer"
              />
              <span className="font-mono text-xs text-white font-medium">
                {formData.announcementActive ? '✓ Bar is Displayed (চালু)' : '✕ Bar is Hidden (বন্ধ)'}
              </span>
            </label>
          </div>

          {/* Live Marquee Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Live Storefront Marquee Preview (লাইভ প্রিভিউ)</span>
              </span>
              <span className="text-[10px] font-mono text-[#71717a]">
                Speed: {formData.announcementSpeed || 'normal'}
              </span>
            </div>
            <div className="bg-black border border-[#2b2b3d] py-3 px-2 overflow-hidden select-none rounded-xs relative">
              <div 
                className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-white"
                style={{
                  animationDuration: formData.announcementSpeed === 'fast' 
                    ? '18s' 
                    : formData.announcementSpeed === 'slow' 
                      ? '38s' 
                      : '26s'
                }}
              >
                {formData.announcementBarText && (
                  <span className="flex items-center gap-2 text-[#d4af37]">
                    <span>★</span>
                    <span>{formData.announcementBarText}</span>
                  </span>
                )}
                <span className="text-white font-black">•</span>
                {(formData.announcementItems || []).map((item, idx) => (
                  <React.Fragment key={`prev-1-${idx}`}>
                    <span className="tracking-widest font-mono text-white">{item}</span>
                    <span className="text-white font-black">•</span>
                  </React.Fragment>
                ))}
                {/* Second track for loop */}
                {formData.announcementBarText && (
                  <span className="flex items-center gap-2 text-[#d4af37]">
                    <span>★</span>
                    <span>{formData.announcementBarText}</span>
                  </span>
                )}
                <span className="text-white font-black">•</span>
                {(formData.announcementItems || []).map((item, idx) => (
                  <React.Fragment key={`prev-2-${idx}`}>
                    <span className="tracking-widest font-mono text-white">{item}</span>
                    <span className="text-white font-black">•</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 1. Main Announcement / Offer Text */}
          <div className="space-y-1.5">
            <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block">
              1. Main Headline / Special Offer Text (মূল নোটিশ বা বিশেষ অফার)
            </label>
            <input
              type="text"
              value={formData.announcementBarText}
              onChange={(e) => setFormData(prev => ({ ...prev, announcementBarText: e.target.value }))}
              placeholder="e.g. Complimentary Express Shipping on all orders over ৳5,000 | Use code ZARVEN10 for 10% off"
              className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37] font-medium"
            />
            <p className="text-[10px] text-[#71717a]">
              This text is highlighted in gold (★) at the start of the marquee cycle.
            </p>
          </div>

          {/* 2. Marquee Ticker Items / Branches */}
          <div className="space-y-3 pt-2 border-t border-[#1e1e2c]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block">
                  2. Running Branch & Outlet Items (চলমান শাখা, আউটলেট ও ট্যাগলাইন সমূহ)
                </label>
                <p className="text-[11px] text-[#71717a]">
                  Each item will scroll continuously separated by stylish bullets (•).
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#d4af37]">
                {(formData.announcementItems || []).length} Items active
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#14141e] border border-[#222234] rounded-xs text-[11px]">
              <span className="text-[#71717a] font-mono text-[10px] uppercase mr-1">Quick Add:</span>
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem('JAMUNA FUTURE PARK ATELIER')}
                className="px-2 py-0.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] border border-[#2e2e46] rounded-xs cursor-pointer"
              >
                + Jamuna Atelier
              </button>
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem('CHITTAGONG OUTLET')}
                className="px-2 py-0.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] border border-[#2e2e46] rounded-xs cursor-pointer"
              >
                + Chittagong Outlet
              </button>
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem('DHAKA GULSHAN FLAGSHIP')}
                className="px-2 py-0.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] border border-[#2e2e46] rounded-xs cursor-pointer"
              >
                + Gulshan Flagship
              </button>
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem('WHITE GLOVE ALL BANGLADESH DELIVERY')}
                className="px-2 py-0.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] border border-[#2e2e46] rounded-xs cursor-pointer"
              >
                + White Glove Delivery
              </button>
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem('HOTLINE: 01711-000000')}
                className="px-2 py-0.5 bg-[#1b1b28] hover:bg-[#252538] text-[#d4af37] border border-[#2e2e46] rounded-xs cursor-pointer"
              >
                + Hotline
              </button>
            </div>

            {/* List of current items */}
            <div className="space-y-2">
              {(formData.announcementItems || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#161622] border border-[#252536] p-2 rounded-xs">
                  <span className="text-[#d4af37] font-mono text-[11px] w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateAnnouncementItem(idx, e.target.value)}
                    className="flex-1 bg-[#101018] border border-[#232334] text-white px-3 py-1.5 rounded-xs text-xs font-mono focus:border-[#d4af37] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAnnouncementItem(idx)}
                    className="p-1.5 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xs transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Item Row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newAnnouncementItem}
                onChange={(e) => setNewAnnouncementItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAnnouncementItem();
                  }
                }}
                placeholder="নতুন শাখা বা টেক্সট লিখুন (e.g. UTTARA SHOWROOM বা 100% ORIGINAL)"
                className="flex-1 bg-[#181824] border border-[#2e2e42] text-white px-3.5 py-2 rounded-xs text-xs font-mono focus:border-[#d4af37] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddAnnouncementItem()}
                className="px-4 py-2 bg-[#1e1e2d] hover:bg-[#28283d] text-[#d4af37] border border-[#d4af37]/40 rounded-xs text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* 3. Speed selector & Save Shortcut */}
          <div className="pt-4 border-t border-[#1e1e2c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] shrink-0">
                Ticker Speed (গতি):
              </label>
              <div className="flex items-center gap-1 bg-[#14141e] p-1 border border-[#252538] rounded-xs text-xs font-mono">
                {[
                  { id: 'fast', label: 'Fast (18s)' },
                  { id: 'normal', label: 'Normal (26s)' },
                  { id: 'slow', label: 'Smooth / Slow (38s)' }
                ].map(spd => (
                  <button
                    key={spd.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, announcementSpeed: spd.id as any }))}
                    className={`px-2.5 py-1 rounded-xs transition-colors cursor-pointer ${
                      (formData.announcementSpeed || 'normal') === spd.id
                        ? 'bg-[#d4af37] text-black font-bold'
                        : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] font-semibold text-xs uppercase tracking-wider rounded-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all self-end sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Announcement Bar'}</span>
            </button>
          </div>
        </div>

        {/* Section Visibility Toggles */}
        <div id="homepage-toggles" className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4 scroll-mt-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Homepage Section Toggles (হোম পেজ সেকশন টগলস)</span>
                <span className="px-2 py-0.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-mono rounded-xs lowercase">
                  live
                </span>
              </h3>
              <p className="text-[#71717a] text-[11px]">
                Enable or disable storefront sections dynamically. Changes appear on the live site instantly via Cloud Firestore.
              </p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById('privacy-section-editor')?.scrollIntoView({ behavior: 'smooth' })}
              className="self-start sm:self-auto px-2.5 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37]/30 text-[#d4af37] border border-[#d4af37]/50 rounded-xs text-[11px] font-mono cursor-pointer flex items-center gap-1.5"
            >
              <span>🛡️ Edit Privacy Links & Text (লিংক ও লেখা পরিবর্তন) ↓</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {[
              { key: 'hero', label: 'Editorial Hero Banner' },
              { key: 'collections', label: 'Curated Categories Strip (কালেকশন সেকশন)' },
              { 
                key: 'privacy', 
                label: 'Privacy & Policies (প্রাইভেসি সেকশন - কালেকশনের পরে)',
                isSpecial: true,
                badge: 'Requested'
              },
              { key: 'promoBanners', label: 'Mid-Page Dynamic Promo Banner' },
              { key: 'newArrivals', label: 'New Arrivals Product Grid' },
              { key: 'craftsmanship', label: 'The Atelier Craftsmanship Section' },
              { key: 'bottomBanner', label: 'Dedicated Bottom Advertising Slot' },
              { key: 'newsletter', label: 'Privé Newsletter Dispatch' }
            ].map(sec => {
              const k = sec.key as keyof typeof formData.enabledSections;
              const isEnabled = formData.enabledSections[k] !== false;
              return (
                <div
                  key={sec.key}
                  onClick={() => handleToggleSection(k)}
                  className={`p-3.5 rounded-xs border cursor-pointer flex flex-col justify-between transition-all ${
                    sec.isSpecial 
                      ? isEnabled 
                        ? 'bg-[#181826] border-[#d4af37] ring-1 ring-[#d4af37]/40' 
                        : 'bg-[#14141d] border-[#d4af37]/40 opacity-70'
                      : isEnabled
                        ? 'bg-[#181824] border-[#d4af37]'
                        : 'bg-[#121218] border-[#222230] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-white font-medium text-xs leading-snug">
                      {sec.label}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs shrink-0 ${
                      isEnabled ? 'bg-[#d4af37] text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  {sec.isSpecial && (
                    <div className="mt-2.5 pt-2 border-t border-[#2a2a3e] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#d4af37]">★ কালেকশন সেকশনের পরে</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('privacy-section-editor')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[10px] font-mono text-[#e5c158] hover:underline cursor-pointer"
                      >
                        এডিট করুন ↓
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer & Homepage Privacy & Policies Section (Directly after Collections) */}
        <div id="privacy-section-editor" className="p-6 bg-[#13131c] border-2 border-[#d4af37]/60 rounded-xs space-y-5 scroll-mt-20 relative shadow-xl shadow-black/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242436]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#d4af37]/15 rounded-xs border border-[#d4af37]/40">
                <Shield className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Privacy & Policies Section Editor
                  </h3>
                  <span className="px-2 py-0.5 bg-[#d4af37] text-black font-mono font-bold text-[9px] rounded-xs uppercase">
                    প্রাইভেসি সেকশন
                  </span>
                </div>
                <p className="text-[#a1a1aa] text-[11px] mt-0.5">
                  হোমপেজে কালেকশনের ঠিক পরে এবং সাইট ফুটারে প্রদর্শিত হয়। এখান থেকে লিংক, টাইটেল ও বিস্তারিত লেখা এডিট করুন।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-white bg-[#1a1a26] px-2.5 py-1.5 border border-[#2e2e42] rounded-xs">
                <input
                  type="checkbox"
                  checked={formData.enabledSections.privacy !== false}
                  onChange={() => handleToggleSection('privacy')}
                  className="accent-[#d4af37]"
                />
                <span className="font-mono text-[11px] text-[#d4af37]">Show on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-white bg-[#1a1a26] px-2.5 py-1.5 border border-[#2e2e42] rounded-xs">
                <input
                  type="checkbox"
                  checked={formData.footerPrivacy.enabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    footerPrivacy: { ...prev.footerPrivacy, enabled: e.target.checked }
                  }))}
                  className="accent-[#d4af37]"
                />
                <span className="font-mono text-[11px] text-[#d4af37]">Show in Footer</span>
              </label>

              <button
                type="button"
                onClick={handleAddPrivacyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-[11px] font-mono font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন লিংক যোগ করুন (Add Link)</span>
              </button>
            </div>
          </div>

          <div className="max-w-md">
            <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">
              Section Heading / Title *
            </label>
            <input
              type="text"
              required
              value={formData.footerPrivacy.heading}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                footerPrivacy: { ...prev.footerPrivacy, heading: e.target.value }
              }))}
              placeholder="e.g. Privacy & Policies"
              className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
            />
          </div>

          {/* Policy Links List */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-[#a1a1aa] text-[11px] font-mono uppercase tracking-wider">
              <span>Configured Policy Links ({formData.footerPrivacy.links.length})</span>
              <span className="text-[#71717a]">Clickable on storefront with instant policy viewer</span>
            </div>

            {formData.footerPrivacy.links.length === 0 ? (
              <div className="p-4 bg-[#14141c] border border-dashed border-[#272738] rounded-xs text-center text-[#71717a]">
                <p>No policy links currently added. Click "Add Policy Link" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.footerPrivacy.links.map((link, idx) => (
                  <div 
                    key={link.id} 
                    className="p-4 bg-[#0e0e14] border border-[#1f1f2c] hover:border-[#2d2d3f] rounded-xs space-y-3 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Link #{idx + 1}: {link.label || 'Untitled'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeletePrivacyLink(link.id)}
                        className="text-[#ef4444] hover:text-[#f87171] p-1 rounded-xs hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                        title="Delete policy link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#71717a] text-[10px] uppercase font-mono tracking-wider block mb-1">
                          Link Label (Text shown in Footer) *
                        </label>
                        <input
                          type="text"
                          required
                          value={link.label}
                          onChange={(e) => handleUpdatePrivacyLink(link.id, { label: e.target.value })}
                          placeholder="e.g. Privacy Policy"
                          className="w-full bg-[#161622] border border-[#272738] text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37] text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[#71717a] text-[10px] uppercase font-mono tracking-wider block mb-1">
                          Link URL or Hash Anchor
                        </label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdatePrivacyLink(link.id, { url: e.target.value })}
                          placeholder="e.g. #privacy-policy or https://..."
                          className="w-full bg-[#161622] border border-[#272738] text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37] text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[#71717a] text-[10px] uppercase font-mono tracking-wider block mb-1">
                        Policy Content / Detailed Text (Shown when customer clicks this link)
                      </label>
                      <textarea
                        rows={2}
                        value={link.content || ''}
                        onChange={(e) => handleUpdatePrivacyLink(link.id, { content: e.target.value })}
                        placeholder="Write the full policy wording, customer terms, or exchange details..."
                        className="w-full bg-[#161622] border border-[#272738] text-white px-3 py-2 rounded-xs focus:outline-hidden focus:border-[#d4af37] text-xs resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Information & Socials */}
        <div className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4">
          <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
            Contact & Footer Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Concierge Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Telephone Line</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#a1a1aa] uppercase font-mono tracking-wider block mb-1">Physical Atelier Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full bg-[#181824] border border-[#272738] text-white px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Social Media Channels & Follow Us Links */}
        <div id="social-links-section" className="p-6 bg-[#121218] border border-[#20202c] rounded-xs space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f1f2c]">
            <h3 className="font-serif text-sm font-semibold text-white uppercase tracking-wider">
              Social Media Channels & Follow Us Links (সোশ্যাল মিডিয়া ও ফলো আস লিংক)
            </h3>
            <span className="text-[10px] font-mono text-[#d4af37] uppercase">
              Footer Follow Us
            </span>
          </div>

          <p className="text-[#8e8ea0] text-[11px] leading-relaxed">
            ফুটারের একদম ডানে থাকা <strong>FOLLOW US</strong> সেকশনের ফেসবুক, হোয়াটসঅ্যাপ, ইনস্টাগ্রাম, ইউটিউব এবং টিকটক লিংক এখানে সেট করুন। ভিজিটররা ক্লিক করলে সরাসরি আপনার অফিসিয়াল পেজ ওপেন হবে।
          </p>

          <div className="space-y-3.5 pt-1">
            {/* Facebook */}
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                <span className="text-[#1877F2] font-bold">f</span>
                <span>Facebook Page / Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                }))}
                placeholder="https://facebook.com/your-brand"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2 rounded-xs font-mono text-xs focus:outline-hidden"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                <span className="text-[#25D366] font-bold">wa</span>
                <span>WhatsApp Number or Direct Link</span>
              </label>
              <input
                type="text"
                value={formData.socialLinks.whatsapp || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                }))}
                placeholder="https://wa.me/8801700000000 বা +8801700000000"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2 rounded-xs font-mono text-xs focus:outline-hidden"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                <span className="text-[#E4405F] font-bold">ig</span>
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
                placeholder="https://instagram.com/your-brand"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2 rounded-xs font-mono text-xs focus:outline-hidden"
              />
            </div>

            {/* YouTube */}
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                <span className="text-[#FF0000] font-bold">yt</span>
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                value={formData.socialLinks.youtube || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                }))}
                placeholder="https://youtube.com/@your-channel"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2 rounded-xs font-mono text-xs focus:outline-hidden"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="text-[#a1a1aa] uppercase font-mono tracking-wider text-[11px] block mb-1 flex items-center gap-1.5">
                <span className="text-[#00F2FE] font-bold">tt</span>
                <span>TikTok Profile URL</span>
              </label>
              <input
                type="url"
                value={formData.socialLinks.tiktok || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialLinks: { ...prev.socialLinks, tiktok: e.target.value }
                }))}
                placeholder="https://tiktok.com/@your-profile"
                className="w-full bg-[#181824] border border-[#272738] focus:border-[#d4af37] text-white px-3.5 py-2 rounded-xs font-mono text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#d4af37] hover:bg-[#e5c158] text-black text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xl shadow-[#d4af37]/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Synchronizing...' : 'Save All Customizations'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
