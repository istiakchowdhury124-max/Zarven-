import React, { useState } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSiteSettings();
  const { currentUser, isAdmin } = useAuth();
  const [selectedPolicy, setSelectedPolicy] = useState<{ label: string; content?: string } | null>(null);

  const isOwnerEmail = currentUser?.email?.trim().toLowerCase() === 'chowdhuryistiak66@gmail.com';
  const isSessionUnlocked = typeof window !== 'undefined' && sessionStorage.getItem('zarven_admin_unlocked') === 'true';
  const canAccessAdmin = isOwnerEmail || (isAdmin && isSessionUnlocked);

  const handlePolicyClick = (link: { label: string; url: string; content?: string }) => {
    if (link.url && (link.url.startsWith('http://') || link.url.startsWith('https://'))) {
      window.location.href = link.url;
      return;
    }
    if (link.url && link.url.startsWith('shop?')) {
      onNavigate(link.url);
      return;
    }
    // Show official policy reader modal
    setSelectedPolicy({
      label: link.label,
      content: link.content || 'At Zarven Atelier, customer satisfaction, bespoke excellence, and data protection are our highest priorities. Please contact our concierge desk for tailored inquiries.'
    });
  };

  return (
    <footer className="w-full bg-[#08080a] border-t border-[#1f1f28] text-[#a1a1aa] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12 mb-16">
          
          {/* Brand & Atelier Mission */}
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3.5">
              <img 
                src={settings.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
                alt={settings.siteName || 'Zarven'} 
                className="h-12 w-12 rounded-full object-cover border border-[#d4af37]/50 shadow-lg shadow-black/80"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.25em] text-white block uppercase">
                  {settings.siteName || 'ZARVEN'}
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af37] block font-medium font-mono">
                  We Believe In Quality
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[#71717a] max-w-sm">
              {settings.tagline || 'Refined Sartorial Mastery & Modern Luxury'}
            </p>
            <div className="text-xs text-[#71717a] space-y-1 pt-2">
              <p>{settings.address}</p>
              <p>Email: <span className="text-[#d4d4d8]">{settings.contactEmail}</span></p>
              <p>Concierge: <span className="text-[#d4d4d8]">{settings.contactPhone}</span></p>
            </div>
          </div>

          {/* Catalog Navigation */}
          <div className="space-y-3 min-w-[200px]">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('shop?category=Tailoring')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tailoring & Blazers
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('shop?category=Outerwear')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Outerwear & Trench
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('shop?category=Knitwear')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fine Knitwear
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('shop?category=Shirts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Silk & Giza Shirts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('shop?category=Accessories')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Atelier Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal Policies Section (Immediately after Collections) */}
          {settings.footerPrivacy?.enabled !== false && (
            <div className="space-y-3 min-w-[200px]">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                {settings.footerPrivacy?.heading || 'Privacy & Policies'}
              </h4>
              <ul className="space-y-2.5 text-xs">
                {(settings.footerPrivacy?.links || [
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
                ]).map((link) => (
                  <li key={link.id}>
                    <button 
                      onClick={() => handlePolicyClick(link)}
                      className="hover:text-white transition-colors cursor-pointer text-left block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Management Link: Only visible to authorized store owner or unlocked admin session */}
          {canAccessAdmin && (
            <div className="space-y-3 min-w-[180px]">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Store Management
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-2 px-3 py-2 bg-[#14141d] hover:bg-[#1f1f2e] border border-[#d4af37]/40 text-[#d4af37] text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer transition-all shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Studio</span>
                </button>
                <p className="text-[11px] text-[#71717a]">
                  Store dashboard, banners, products & categories.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Bar: Payment Methods, Legal & Copyright */}
        <div className="pt-8 border-t border-[#181822] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#71717a]">
          <p>© {new Date().getFullYear()} {settings.siteName || 'Zarven'} Luxury Apparel Ltd. All rights reserved.</p>
          
          {/* Payment badges */}
          <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-wider">
            <span className="px-3 py-1 bg-[#151520] border border-[#d4af37]/60 text-[#d4af37] font-semibold rounded-xs">
              100% Cash on Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Atelier Policy Reader Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0e0e14] border border-[#2a2a3c] rounded-xs shadow-2xl p-6 relative animate-fadeIn">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-[#71717a] hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#d4af37]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37]">
                Official Atelier Policy
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              {selectedPolicy.label}
            </h3>
            <div className="text-xs text-[#a1a1aa] leading-relaxed max-h-[60vh] overflow-y-auto pr-2 space-y-3 font-light">
              <p className="whitespace-pre-line">{selectedPolicy.content}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1c1c28] flex justify-end">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-5 py-2.5 bg-[#d4af37] text-black text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#e5c158] transition-colors cursor-pointer"
              >
                Close Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
