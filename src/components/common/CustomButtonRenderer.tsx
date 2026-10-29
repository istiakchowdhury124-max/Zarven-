import React from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ButtonPlacement, CustomSiteButton } from '../../types';
import { 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  Sparkles, 
  ExternalLink, 
  Shield 
} from 'lucide-react';

interface CustomButtonRendererProps {
  placement: ButtonPlacement;
  className?: string;
}

export const CustomButtonRenderer: React.FC<CustomButtonRendererProps> = ({ placement, className = '' }) => {
  const { settings } = useSiteSettings();
  const buttons = settings.buttonSettings?.customButtons || [];
  const activeButtons = buttons.filter(b => b.active && b.placement === placement);

  if (activeButtons.length === 0) return null;

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-[#d4af37]" />;
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'bag':
        return <ShoppingBag className="w-4 h-4 text-[#d4af37]" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      case 'shield':
        return <Shield className="w-4 h-4 text-[#d4af37]" />;
      default:
        return <ExternalLink className="w-3.5 h-3.5" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'gold':
        return 'bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] font-bold shadow-lg shadow-[#d4af37]/20 border border-[#d4af37]';
      case 'black':
        return 'bg-[#181824] hover:bg-[#232334] text-white border border-[#38384f]';
      case 'emerald':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/25 border border-emerald-500';
      case 'crimson':
        return 'bg-rose-700 hover:bg-rose-600 text-white font-semibold shadow-lg shadow-rose-700/25 border border-rose-600';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/25 border border-blue-500';
      default:
        return 'bg-[#d4af37] hover:bg-[#e5c158] text-[#0a0a0c] font-bold';
    }
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {activeButtons.map((btn) => (
        <a
          key={btn.id}
          href={btn.link}
          target={btn.openInNewTab ? '_blank' : '_self'}
          rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
          className={`py-2 px-3.5 rounded-xs text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${getColorClasses(btn.color)}`}
        >
          {renderIcon(btn.icon)}
          <span>{btn.label}</span>
        </a>
      ))}
    </div>
  );
};

export const FloatingButtonsRenderer: React.FC = () => {
  const { settings } = useSiteSettings();
  const buttonSettings = settings.buttonSettings;
  const customButtons = buttonSettings?.customButtons || [];
  const activeFloatingButtons = customButtons.filter(b => b.active && b.placement === 'floating');

  const showFloatingContact = buttonSettings?.showFloatingContact ?? true;
  const contactType = buttonSettings?.floatingContactType || 'whatsapp';
  const contactValue = buttonSettings?.floatingContactValue || '+8801711000000';
  const contactText = buttonSettings?.floatingContactText || 'WhatsApp Concierge';

  const cleanNum = contactValue.replace(/[^0-9]/g, '');
  const contactLink = contactType === 'whatsapp' 
    ? `https://wa.me/${cleanNum}?text=Hello%20Zarven,%20I%20would%20like%20to%20inquire%20about%20your%20collection.` 
    : `tel:${contactValue}`;

  return (
    <div className="fixed bottom-16 right-4 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
      {/* 1. Custom Floating Buttons */}
      {activeFloatingButtons.map((btn) => (
        <a
          key={btn.id}
          href={btn.link}
          target={btn.openInNewTab ? '_blank' : '_self'}
          rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-[#12121a]/95 hover:bg-[#1a1a24] text-white border border-[#2e2e42] hover:border-[#d4af37] rounded-full shadow-2xl shadow-black text-xs font-mono tracking-wider transition-all hover:scale-105 active:scale-95 group"
        >
          <span className="p-1 rounded-full bg-[#1e1e2d] text-[#d4af37]">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold">{btn.label}</span>
        </a>
      ))}

      {/* 2. Primary Floating Helpline (WhatsApp) - Icon Only */}
      {showFloatingContact && (
        <a
          href={contactLink}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl shadow-black/90 transition-all duration-300 hover:scale-110 active:scale-95 group relative border-2 border-white/20"
          title={contactText}
          aria-label={contactText}
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 0C5.398 0 .016 5.383.016 12.016c0 2.12.553 4.19 1.602 6.012L.07 24.032l6.195-1.625c1.742.953 3.719 1.453 5.766 1.453 6.633 0 12.016-5.383 12.016-12.016C24.047 5.383 18.664 0 12.031 0zm.016 21.984c-1.805 0-3.57-.484-5.117-1.406l-.367-.219-3.805.996 1.016-3.711-.242-.383A9.948 9.948 0 012.03 12.016c0-5.516 4.484-10 10.016-10 5.516 0 10 4.484 10 10s-4.484 10-10.016 10zm5.484-7.484c-.3-.15-1.781-.883-2.055-.984-.273-.1-.477-.15-.672.15-.2.3-.773.984-.953 1.18-.172.2-.352.219-.656.062s-1.289-.477-2.453-1.516c-.906-.805-1.523-1.805-1.703-2.109-.172-.3-.02-.469.133-.617.14-.14.3-.352.453-.531.148-.18.2-.3.3-.5.1-.2.05-.375-.023-.531-.078-.15-.672-1.625-.922-2.227-.242-.586-.484-.508-.672-.516-.172-.008-.375-.008-.57-.008s-.531.078-.805.375c-.281.3-1.078 1.055-1.078 2.57 0 1.516 1.102 2.977 1.258 3.18.156.2 2.164 3.305 5.242 4.633.734.313 1.305.5 1.75.641.734.234 1.406.2 1.938.125.594-.086 1.781-.727 2.031-1.43.25-.703.25-1.305.172-1.43-.078-.125-.273-.2-.57-.35z"/>
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0c0c0e] animate-pulse" />
        </a>
      )}
    </div>
  );
};
