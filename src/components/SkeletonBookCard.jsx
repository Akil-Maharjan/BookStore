import React from 'react';

export default function SkeletonBookCard() {
  return (
    <div className="rounded-xl overflow-hidden border backdrop-blur bg-white/5">
      <div className="h-80 w-full bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-[shimmer_1.5s_infinite]" />
      <div className="p-3 space-y-3">
        <div className="h-5 bg-white/10 rounded w-11/12" />
        <div className="h-4 bg-white/10 rounded w-3/5" />
        <div className="h-5 bg-white/15 rounded w-28" />
        <div className="flex gap-2 pt-2">
          <div className="h-9 w-36 bg-white/10 rounded" />
          <div className="h-9 w-28 bg-white/10 rounded" />
        </div>
      </div>
      <style>{`
        @keyframes shimmer { 0%{background-position:-468px 0} 100%{background-position:468px 0} }
        .animate-[shimmer_1.5s_infinite]{background-size: 800px 104px;}
      `}</style>
    </div>
  );
}
