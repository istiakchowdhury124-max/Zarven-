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
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5 pointer-events-none">
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

      {/* 2. Primary Floating Helpline (WhatsApp or Phone) */}
      {showFloatingContact && (
        <a
          href={contactLink}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-[#111116]/95 hover:bg-[#171720] text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 rounded-full shadow-2xl shadow-black/80 backdrop-blur-md text-xs font-mono tracking-wider transition-all hover:scale-105 active:scale-95 group"
          title={contactText}
          aria-label={contactText}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
          <span className="font-bold text-white text-xs">{contactText}</span>
        </a>
      )}
    </div>
  );
};
