import React, { useState } from 'react';

interface LuxuryFallbackImageProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1' | '3/4' | '4/5';
}

export const LuxuryFallbackImage: React.FC<LuxuryFallbackImageProps> = ({
  src,
  alt,
  className = '',
  category = 'Collection',
  aspectRatio = '4/3'
}) => {
  const [hasError, setHasError] = useState(!src);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div 
        className={`relative overflow-hidden bg-gradient-to-br from-[#121217] via-[#1a1a24] to-[#0e0e13] border border-[#272733] flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
        style={{ aspectRatio: aspectRatio.replace('/', ' / ') }}
        role="img"
        aria-label={alt}
      >
        {/* Subtle geometric luxury pattern lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="lux-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4af37" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lux-grid)" />
          </svg>
        </div>

        {/* Minimal gold insignia */}
        <div className="w-12 h-12 rounded-full border border-[#d4af37]/40 flex items-center justify-center mb-3 bg-[#0a0a0d]/60 backdrop-blur-xs">
          <span className="font-serif text-[#d4af37] text-base font-bold tracking-widest">Z</span>
        </div>

        <span className="text-[11px] uppercase tracking-[0.2em] text-[#a1a1aa] mb-1 font-medium">
          {category}
        </span>
        <h4 className="font-serif text-sm text-[#f4f4f6] line-clamp-2 max-w-[85%] font-medium">
          {alt}
        </h4>
        <span className="mt-2 text-[10px] tracking-wider text-[#d4af37]/70 uppercase">
          Zarven Atelier
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-10" />
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
