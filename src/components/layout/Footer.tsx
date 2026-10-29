import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, X, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useSiteSettings();
  const { currentUser, isAdmin } = useAuth();
  const [selectedPolicy, setSelectedPolicy] = useState<{ label: string; content?: string } | null>(null);

  // 2-Step Secret Admin Entrance States
  const [ltdTapCount, setLtdTapCount] = useState(0);
  const [isLockVisible, setIsLockVisible] = useState(false);
  const [lockTapCount, setLockTapCount] = useState(0);

  // Step 1: 3 taps on Ltd. reveals the secret lock
  const handleLtdTap = () => {
    const next = ltdTapCount + 1;
    if (next >= 3) {
      setIsLockVisible(true);
      setLtdTapCount(0);
      setLockTapCount(0);
    } else {
      setLtdTapCount(next);
    }
  };

  // Step 2: 3 taps on revealed lock navigates to Admin Portal
  const handleLockTap = () => {
    const next = lockTapCount + 1;
    if (next >= 3) {
      setLockTapCount(0);
      setIsLockVisible(false);
      onNavigate('admin');
    } else {
      setLockTapCount(next);
    }
  };

  // Auto-hide the secret lock if untouched for 20 seconds
  useEffect(() => {
    if (!isLockVisible) return;
    const timer = setTimeout(() => {
      setIsLockVisible(false);
      setLockTapCount(0);
    }, 20000);
    return () => clearTimeout(timer);
  }, [isLockVisible]);

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
    <footer className="w-full bg-[#3B1109] border-t border-[#4d180f] text-white pt-8 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-6">
          
          {/* Brand & Atelier Mission */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <img 
                src={settings.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
                alt={settings.siteName || 'Zarven'} 
                className="h-10 w-10 rounded-full object-cover border-2 border-[#f4d068]/60 shadow-xs"
              />
              <div>
                <span className="font-serif text-lg sm:text-xl font-black tracking-[0.2em] text-white block uppercase">
                  {settings.siteName || 'ZARVEN'}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#f4d068] block font-bold font-mono">
                  We Believe In Quality
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-white/90 font-medium max-w-sm">
              {settings.tagline || 'Refined Sartorial Mastery & Modern Luxury'}
            </p>
            <div className="text-xs text-white/85 font-medium space-y-1 pt-0.5">
              <p className="leading-snug">{settings.address}</p>
              <p>Email: <span className="text-white font-bold">{settings.contactEmail}</span></p>
              <p>Concierge: <span className="text-white font-bold">{settings.contactPhone}</span></p>
            </div>
          </div>

          {/* Catalog Navigation - Dynamic Categories */}
          <div className="space-y-2.5">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-white pb-1 border-b border-white/20">
              Collections
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {categories && categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => onNavigate(`shop?category=${encodeURIComponent(cat.name)}`)}
                      className="text-white/85 font-medium hover:text-[#f4d068] transition-colors cursor-pointer text-left block py-0.5"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))
              ) : (
                <li>
                  <button 
                    onClick={() => onNavigate('shop')}
                    className="text-white/85 font-medium hover:text-[#f4d068] transition-colors cursor-pointer text-left block py-0.5"
                  >
                    All Collections
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Privacy & Legal Policies Section (Immediately after Collections) */}
          {settings.footerPrivacy?.enabled !== false && (
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-white pb-1 border-b border-white/20">
                {settings.footerPrivacy?.heading || 'Privacy & Policies'}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm">
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
                      className="text-white/85 font-medium hover:text-[#f4d068] transition-colors cursor-pointer text-left block py-0.5"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Column 4: FOLLOW US on the far right */}
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#250a05] border border-white/30 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xs shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f4d068] animate-pulse" />
              <span>FOLLOW US</span>
            </div>

            {/* Social Logos in their Official Brand Colors (Standard Compact Luxury Size) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Facebook - Official Blue */}
              <a
                href={settings.socialLinks?.facebook || 'https://facebook.com/zarven.official'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                title="Follow on Facebook"
                className="w-8 h-8 rounded-xs bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* WhatsApp - Official Green */}
              <a
                href={
                  settings.socialLinks?.whatsapp
                    ? settings.socialLinks.whatsapp.startsWith('http')
                    ? settings.socialLinks.whatsapp
                    : `https://wa.me/${settings.socialLinks.whatsapp.replace(/[^0-9]/g, '')}`
                    : 'https://wa.me/8801711000000'
                }
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
                className="w-8 h-8 rounded-xs bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.398 0 .016 5.383.016 12.016c0 2.12.553 4.19 1.602 6.012L.07 24.032l6.195-1.625c1.742.953 3.719 1.453 5.766 1.453 6.633 0 12.016-5.383 12.016-12.016C24.047 5.383 18.664 0 12.031 0zm.016 21.984c-1.805 0-3.57-.484-5.117-1.406l-.367-.219-3.805.996 1.016-3.711-.242-.383A9.948 9.948 0 012.03 12.016c0-5.516 4.484-10 10.016-10 5.516 0 10 4.484 10 10s-4.484 10-10.016 10zm5.484-7.484c-.3-.15-1.781-.883-2.055-.984-.273-.1-.477-.15-.672.15-.2.3-.773.984-.953 1.18-.172.2-.352.219-.656.062s-1.289-.477-2.453-1.516c-.906-.805-1.523-1.805-1.703-2.109-.172-.3-.02-.469.133-.617.14-.14.3-.352.453-.531.148-.18.2-.3.3-.5.1-.2.05-.375-.023-.531-.078-.15-.672-1.625-.922-2.227-.242-.586-.484-.508-.672-.516-.172-.008-.375-.008-.57-.008s-.531.078-.805.375c-.281.3-1.078 1.055-1.078 2.57 0 1.516 1.102 2.977 1.258 3.18.156.2 2.164 3.305 5.242 4.633.734.313 1.305.5 1.75.641.734.234 1.406.2 1.938.125.594-.086 1.781-.727 2.031-1.43.25-.703.25-1.305.172-1.43-.078-.125-.273-.2-.57-.35z"/>
                </svg>
              </a>

              {/* Instagram - Official Sunset Gradient */}
              <a
                href={settings.socialLinks?.instagram || 'https://instagram.com/zarven.official'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Follow on Instagram"
                className="w-8 h-8 rounded-xs bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* YouTube - Official Red */}
              <a
                href={settings.socialLinks?.youtube || 'https://youtube.com/@zarven'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                title="Subscribe on YouTube"
                className="w-8 h-8 rounded-xs bg-[#FF0000] hover:bg-[#e60000] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* TikTok - Official Black with Cyan Accent */}
              <a
                href={settings.socialLinks?.tiktok || 'https://tiktok.com/@zarven'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                title="Follow on TikTok"
                className="w-8 h-8 rounded-xs bg-[#010101] border border-[#2d2d3a] hover:border-[#00f2fe] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Centered Copyright & Discreet 2-Step Admin Access */}
        <div className="pt-4 border-t border-white/20 flex flex-col items-center justify-center text-center gap-1.5 text-xs sm:text-sm text-white font-bold">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <p className="text-white font-extrabold tracking-wide inline-flex items-center">
              <span>© 2026, All Rights Reserved By Zarven</span>
              <button
                type="button"
                onClick={handleLtdTap}
                className="ml-1 text-white font-extrabold cursor-default hover:text-[#f4d068] transition-colors select-none focus:outline-none"
                title="Zarven Ltd."
                aria-label="Zarven Ltd."
              >
                Ltd.
              </button>
            </p>

            {/* Step 2: Lock icon appears only after 3 taps on Ltd., and navigating to admin requires 3 taps on this Lock */}
            {isLockVisible && (
              <button
                type="button"
                onClick={handleLockTap}
                className="text-[#f4d068] hover:text-white p-1 transition-all cursor-pointer rounded-xs animate-bounce active:scale-90"
                title={`Security Check (Tap ${3 - lockTapCount} more ${3 - lockTapCount === 1 ? 'time' : 'times'})`}
                aria-label="Security Portal"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Atelier Policy Reader Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#ffffff] border border-[#e5e5eb] rounded-xs shadow-2xl p-6 relative animate-fadeIn text-[#111116]">
            <button
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-[#71717a] hover:text-[#111116] p-1 rounded-xs transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#b8860b]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#997b32]">
                Official Atelier Policy
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#111116] mb-4">
              {selectedPolicy.label}
            </h3>
            <div className="text-xs text-[#52525b] leading-relaxed max-h-[60vh] overflow-y-auto pr-2 space-y-3 font-light">
              <p className="whitespace-pre-line">{selectedPolicy.content}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#e5e5eb] flex justify-end">
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-5 py-2.5 bg-[#111116] text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#272732] transition-colors cursor-pointer shadow-xs"
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
