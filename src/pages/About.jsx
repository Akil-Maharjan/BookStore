import React from 'react';
import RevealOnScroll from '../components/RevealOnScroll.jsx';

export default function About() {
  return (
    
      <section id="about" className="relative py-20 md:py-30   scroll-mt-40  flex">
             {/* Background image (same as hero) */}
           
             {/* Overlay (kept empty to mirror hero current setup) */}
             <div className="absolute  inset-0" aria-hidden="true" />
             {/* Content */}
             <div className="relative z-10 flex-1">
               <div className="max-w-[96rem] mx-auto px-4 h-full flex items-center">
                 <div className="w-full flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
                   {/* Image left */}
                   <RevealOnScroll direction="right" className="flex-1 w-full flex items-center justify-center lg:justify-start">
                    
                     <img
                       src="https://i.ibb.co/k6kDQ772/pngaaa-com-1744483.png"
                       alt="Reading in a cozy space"
                       className="w-90 sm:w-120 md:w-[50rem] lg:w-[50rem]  md:h-[470px] xl:h-[460px] 2xl:h-[450px] lg:h-[430px]  xl:w-[56rem] 2xl:w-full max-w-full h-auto object-contain    "
                       loading="lazy"
                     />
                    
                   </RevealOnScroll>
                   {/* Text right */}
                   <RevealOnScroll direction="left" delay={0.1} className="flex-1 w-full md:max-w-3xl lg:max-w-2xl text-center">
                     <h2 className="text-white text-4xl md:text-4xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight drop-shadow-sm">About BookStore</h2>
                     <p className="mt-6 text-white/90 text-lg xl:text-2xl max-w-3xl mx-auto md:mx-0">
                       We connect readers with stories that inspire, educate, and entertain. From timeless classics to the latest releases, discover your next great read.
                     </p>
                     <p className="mt-4 text-white/90 text-lg xl:text-2xl max-w-3xl mx-auto md:mx-0">
                       Our mission: a delightful shopping experience with fast search, personalized recommendations, and a vibrant community of book lovers.
                     </p>
                     <div className="mt-8 flex flex-wrap justify-center md:justify-center gap-4">
                       <div className="rounded-xl px-4 py-3 bg-white/90 text-slate-900 font-semibold">Curated genres</div>
                       <div className="rounded-xl px-4 py-3 bg-white/90 text-slate-900 font-semibold">Bestsellers</div>
                       <div className="rounded-xl px-4 py-3 bg-white/90 text-slate-900 font-semibold">Great deals</div>
                       <div className="rounded-xl px-4 py-3 bg-white/90 text-slate-900 font-semibold">Friendly support</div>
                     </div>
                   </RevealOnScroll>
                 </div>
               </div>
             </div>
          </section>
    
  );
}
