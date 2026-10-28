import React from 'react';
import { Banner, BannerPlacement } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { ArrowUpRight } from 'lucide-react';

interface AdBannerProps {
  placement: BannerPlacement;
  customBanner?: Banner;
  className?: string;
  onNavigate?: (url: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  customBanner,
  className = '',
  onNavigate
}) => {
  const { getBannersByPlacement, trackBannerClick } = useSiteSettings();

  const banner = customBanner || getBannersByPlacement(placement)[0];

  if (!banner || !banner.active) return null;

  // Check optional scheduling dates
  const now = new Date().toISOString();
  if (banner.startDate && now < banner.startDate) return null;
  if (banner.endDate && now > banner.endDate) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackBannerClick(banner.id);
    if (onNavigate && banner.targetUrl) {
      onNavigate(banner.targetUrl);
    }
  };

  // Dedicated styling based on placement
  if (placement === 'bottom_ad') {
    return (
      <aside 
        aria-label="Promotional campaign"
        className={`relative w-full overflow-hidden border-t border-b border-[#272733] bg-[#0c0c10] my-12 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 bg-gradient-to-r from-[#121218] via-[#1a1a24] to-[#121218] shadow-2xl">
            {/* Background art image with measured dark scrim */}
            <div className="absolute inset-0">
              <picture>
                {banner.mobileImageUrl && (
                  <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />
                )}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-25 filter grayscale contrast-125 transition-transform duration-1000 hover:scale-105"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c10] via-[#0c0c10]/85 to-transparent" />
            </div>

            <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-2xl">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] block mb-3 font-semibold">
                Special Campaign Feature
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-bold leading-tight mb-4">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-sm sm:text-base text-[#a1a1aa] mb-8 font-light leading-relaxed">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaText && (
                <button
                  onClick={handleClick}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#0a0a0c] bg-[#d4af37] hover:bg-[#e5c158] transition-all duration-300 rounded-sm shadow-lg shadow-[#d4af37]/15 hover:translate-y-[-1px]"
                >
                  <span>{banner.ctaText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  if (placement === 'between_sections') {
    return (
      <section 
        aria-label="Featured showcase"
        className={`relative w-full my-16 overflow-hidden ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-[#272733] group">
            <picture className="absolute inset-0 w-full h-full">
              {banner.mobileImageUrl && (
                <source media="(max-width: 768px)" srcSet={banner.mobileImageUrl} />
              )}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-[#0a0a0d]/50 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-12 max-w-xl">
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#d4af37] font-medium mb-2">
                Curated Editorial
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold mb-3">
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p className="text-xs sm:text-sm text-[#d4d4d8] mb-6 line-clamp-2">
                  {banner.subtitle}
                </p>
              )}
              {banner.ctaText && (
                <div>
                  <button
                    onClick={handleClick}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider text-white border border-white/30 hover:border-[#d4af37] hover:text-[#d4af37] bg-black/40 backdrop-blur-md transition-all duration-300 rounded-sm"
                  >
                    <span>{banner.ctaText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Generic or footer placement
  return (
    <div className={`relative overflow-hidden rounded-lg border border-[#272733] bg-[#121217] p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#d4af37] block mb-1">
            Announcement
          </span>
          <h4 className="font-serif text-lg text-white font-medium">{banner.title}</h4>
          {banner.subtitle && (
            <p className="text-xs text-[#a1a1aa] mt-1">{banner.subtitle}</p>
          )}
        </div>
        {banner.ctaText && (
          <button
            onClick={handleClick}
            className="shrink-0 px-4 py-2 text-xs uppercase tracking-wider text-[#0a0a0d] bg-[#d4af37] hover:bg-[#e5c158] font-medium transition-colors rounded-sm"
          >
            {banner.ctaText}
          </button>
        )}
      </div>
    </div>
  );
};
