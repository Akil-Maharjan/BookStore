import React from "react";

export default function SkeletonBookCard() {
  return (
    <div className="group relative rounded-xl max-w-[22rem] h-[480px] md:h-[550px] w-full overflow-hidden border border-white/10 bg-white/5 backdrop-blur">
      <div className="absolute inset-0 shimmer-bg" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/15 pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />

      <div className="absolute inset-0 flex flex-col justify-end px-0 pt-10 pb-4 gap-4 translate-y-8 opacity-0 transition-all duration-500 overflow-y-auto md:overflow-visible md:pt-8 md:pb-5 md:group-hover:translate-y-0 md:group-hover:opacity-100">
        <div className="flex flex-col gap-3 w-full bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-5 text-white/70">
          <div className="h-6 w-11/12 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-4 w-1/2 rounded bg-white/10" />
          <div className="h-5 w-28 rounded bg-white/15" />
        </div>

        <div className="flex justify-between gap-2 px-4 sm:px-6 mb-8 md:mb-0">
          <div className="group pointer-events-none flex rounded overflow-hidden font-poppins bg-brand/60 text-sm items-center gap-2 w-[150px] opacity-80">
            <div className="flex border border-white/30 bg-slate-900/70 w-[150px] items-center justify-between rounded px-3 py-2 gap-2">
              <div className="h-5 w-5 rounded-full bg-white/30" />
              <div className="h-4 flex-1 rounded bg-white/20" />
            </div>
          </div>
          <div className="flex h-9 w-[110px] items-center justify-center rounded border border-white/20 bg-slate-900/60" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -468px 0; }
          100% { background-position: 468px 0; }
        }
        .shimmer-bg {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 800px 104px;
          animation: shimmer 1.6s infinite;
        }
      `}</style>
    </div>
  );
}
