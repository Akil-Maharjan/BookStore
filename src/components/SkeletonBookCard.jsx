import React from 'react';

export default function SkeletonBookCard({ variant = 'default' }) {
  // 'default' for grid view, 'featured' for featured section
  const isFeatured = variant === 'featured';
  
  return (
    <div 
      className={`group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur ${
        isFeatured 
          ? 'w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px]' 
          : 'w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] max-w-[22rem] mx-auto'
      }`}
    >
      {/* Shimmer effect for the book cover */}
      <div className="absolute inset-0 shimmer-bg" />

      {/* Hover overlay - only on desktop */}
      <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/15 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content that appears on hover (desktop) or is always visible (mobile) */}
      <div className={`absolute inset-0 flex flex-col justify-end px-0 ${isFeatured ? 'pt-6' : 'pt-10'} pb-4 gap-3 md:gap-4 transition-all duration-500 overflow-y-auto md:overflow-visible ${
        isFeatured 
          ? 'opacity-100 translate-y-0' 
          : 'md:translate-y-8 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100'
      }`}>
        {/* Book info */}
        <div className={`flex flex-col gap-2 sm:gap-3 w-full bg-slate-950/70 backdrop-blur-md px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 ${
          isFeatured ? 'text-white/80' : 'text-white/70'
        }`}>
          <div className="h-5 sm:h-6 w-10/12 sm:w-11/12 rounded bg-white/10" />
          <div className="h-3 sm:h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 sm:h-4 w-1/2 rounded bg-white/10" />
          <div className="h-4 sm:h-5 w-20 sm:w-28 rounded bg-white/15 mt-1" />
        </div>

        {/* Action buttons */}
        <div className={`flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 ${
          isFeatured ? 'mb-2' : 'mb-4 sm:mb-8'
        } md:mb-0`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-5 w-5 rounded-full bg-white/30" />
            <div className="h-4 w-20 sm:w-24 rounded bg-white/10" />
          </div>
          <div className="h-9 w-full sm:w-[110px] rounded border border-white/20 bg-slate-900/60 mt-1 sm:mt-0" />
        </div>
      </div>

      {/* Mobile overlay - always visible on mobile */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950/90 via-slate-950/70 to-transparent" />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
        .shimmer-bg {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 800px 104px;
          animation: shimmer 1.6s infinite;
        }
      `}</style>
    </div>
  );
}
