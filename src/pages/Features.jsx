import React from 'react';
import { QrCode, Gift, BarChart3, Database, TrendingUp, Bell } from 'lucide-react';
import RevealOnScroll from '../components/RevealOnScroll.jsx';

export default function Features({ sectionId = 'features', disableId = false, className = '' }) {
  const items = [
    { title: 'Beautiful UI', desc: 'Clean, modern, and responsive design inspired by top product shots.' },
    { title: 'Fast Search', desc: 'Find books by title, author, or category with server-side filters.' },
    { title: 'Reviews & Ratings', desc: 'Read and write reviews to help others find great reads.' },
    { title: 'Secure Auth', desc: 'Protected routes, role-based access, and secure cookies.' },
    { title: 'Cart & Orders', desc: 'Add to cart, adjust quantities, and place orders seamlessly.' },
    { title: 'Local Payments', desc: 'Khalti/eSewa verification for a smooth checkout experience.' },
  ];
  const icons = [QrCode, Gift, BarChart3, Database, TrendingUp, Bell];
  const id = disableId ? undefined : sectionId;

  return (
    <section
      id={id}
      className={`max-w-[1910px] mx-auto md:py-24 py-20 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-[1910px] mx-auto">
        {/* Section Header */}
        <RevealOnScroll direction="up" className="text-center relative z-10  lg:mb-9 mb-6">
          <h2 className="text-3xl font-poppins sm:text-4xl md:text-6xl lg:text-[67px] font-extrabold host-grotesk mb-4 sm:mb-6 lg:mb-8">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-[22px] leading-tight font-semibold host-grotesk  max-w-[545px] mx-auto px-2">
            Everything you need to revolutionize your book shopping experience.
          </p>
        </RevealOnScroll>

        {/* Large Screens: Horizontal scrolling rows */}
        <div className="hidden lg:block">
          {/* First Row */}
          <RevealOnScroll direction="up" delay={0.05} className="mb-1 overflow-hidden">
            <div className="flex gap-5 scroll-left">
              {[...items, ...items].map((feature, index) => {
                const Icon = icons[index % icons.length];
                return (
                <div
                  key={`row1-${index}`}
                  className="relative flex-shrink-0 max-w-[450px] h-[350px] rounded-xl overflow-hidden border backdrop-blur bg-black/30 p-8 text-white"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-10 mb-9">
                      <div className="w-40 h-40 p-5 bg-white/20 border border-white/30 rounded-[32px] flex items-center justify-center">
                        <Icon className="w-28 h-28 text-white" />
                      </div>
                      <h3 className="text-2xl md:text-[30px] font-extrabold host-grotesk leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-base md:text-[20px] font-semibold host-grotesk text-center text-white/90">
                      {feature.desc}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </RevealOnScroll>

          {/* Second Row */}
          <RevealOnScroll direction="up" delay={0.1} className="lg:mb-8 overflow-hidden">
            <div className="flex gap-5 scroll-left-second">
              {[...items.slice(3), ...items.slice(0, 3), ...items.slice(3)].map((feature, index) => {
                const Icon = icons[(index + 3) % icons.length];
                return (
                <div
                  key={`row2-${index}`}
                  className="relative flex-shrink-0 max-w-[450px] h-[350px] rounded-xl overflow-hidden border backdrop-blur bg-black/30 p-8 text-white"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-9 mb-9">
                      <div className="w-40 h-40 p-5 bg-white/20 border border-white/30 rounded-[32px] flex items-center justify-center">
                        <Icon className="w-28 h-28 text-white" />
                      </div>
                      <h3 className="text-2xl md:text-[30px] font-extrabold host-grotesk leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-base md:text-[20px] font-semibold host-grotesk text-center text-white/90">
                      {feature.desc}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>

        {/* Medium Screens: 2x3 Grid */}
        <RevealOnScroll direction="up" className="hidden md:block lg:hidden">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {items.map((feature, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div
                  key={`md-${index}`}
                  className="relative rounded-xl overflow-hidden border backdrop-blur bg-black/30 p-6 h-[280px] text-white flex-1 min-w-[240px] max-w-[340px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 p-3 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold host-grotesk leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm font-semibold host-grotesk text-white/90">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>

        {/* Small Screens: Single Column */}
        <RevealOnScroll direction="up" className="block md:hidden">
          <div className="space-y-4 mb-6">
            {items.map((feature, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div key={`sm-${index}`} className="relative rounded-xl overflow-hidden border backdrop-blur bg-black/30 p-5 text-white">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 p-2 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-extrabold host-grotesk leading-tight">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-sm font-semibold host-grotesk text-white/90">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>

      {/* CSS for animations - only applied on large screens */}
      <style>
        {`
        @media (min-width: 1024px) {
          .scroll-left {
            animation: scroll-left 30s linear infinite;
          }
          .scroll-left-second {
            animation: scroll-right 30s linear infinite;
          }
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        }
        `}
      </style>
    </section>
  );
}
