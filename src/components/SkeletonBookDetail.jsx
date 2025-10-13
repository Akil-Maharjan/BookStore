import React from "react";

export default function SkeletonBookDetail() {
  return (
    <div className="max-w-[96rem] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
            <div className="w-full h-[420px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
        <div>
          <div className="h-10 bg-white/10 rounded w-2/3 mb-3" />
          <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
          <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
          <div className="h-4 bg-white/10 rounded w-1/4 mb-6" />
          <div className="h-20 bg-white/10 rounded w-full mb-4" />
          <div className="flex items-center gap-3 mt-2">
            <div className="h-10 w-24 bg-white/10 rounded" />
            <div className="h-10 w-32 bg-white/10 rounded" />
          </div>
        </div>
      </div>
      <div className="my-6 h-px bg-white/10" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded border border-white/10 bg-white/5 p-3"
          >
            <div className="h-4 bg-white/10 rounded w-32 mb-2" />
            <div className="h-4 bg-white/10 rounded w-24 mb-2" />
            <div className="h-6 bg-white/10 rounded w-full" />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes shimmer { 0%{background-position:-468px 0} 100%{background-position:468px 0} }
        .animate-[shimmer_1.5s_infinite]{background-size: 800px 104px;}
      `}</style>
    </div>
  );
}
