import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Gift, BarChart3, Database, TrendingUp, Bell, ShoppingBag } from 'lucide-react';
import BookGrid from '../components/BookGrid.jsx';
import Features from './Features.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import Background from '../components/Background.jsx';
import RevealOnScroll from '../components/RevealOnScroll.jsx';

const Home = () => {
  
  return (
    <main className='max-w-[120rem] mx-auto' id="main" role="main">
      {/* Hero (full-bleed with background image and overlayed content) */}
      <section className="relative  mx-auto py-30 md:py-20 lg:py-0  flex">
        {/* Background image */}
        <Background />
        {/* Overlay to improve text contrast */}
        <div className="absolute inset-0  " aria-hidden="true" />
        {/* Decorative PNG (hidden to avoid conflict with content image) */}
     
        {/* Content */}
        <div className="relative z-10 flex-1">
          <div className="max-w-[1640px] mx-auto px-6 h-full  flex  items-center">
            <div className="w-full flex flex-col  lg:flex-row  items-center gap-8 md:gap-12 lg:gap-16">
              {/* Text (below image on md, left on lg) */}
              <RevealOnScroll direction="right" delay={0.1} className="flex-1 w-full 2xl:ml-10 lg:-mt-20 xl:-mt-25 lg:max-w-3xl lg:text-left  text-center  ">
                <h1 id="hero-heading" className=" text-[2rem] font-poppins  md:text-[2rem] lg:text-[3rem] xl:text-[4rem] 2xl:text-[5rem] font-extrabold leading-tight drop-shadow-sm">
                  Discover Your Next Great Book
                </h1>
                <p className="mt-6 font-semibold  font-inter text-lg md:text-2xl max-w-5xl mx-auto md:mx-0">
                  Find the best collection of books from classic to contemporary. 
                </p>
                <div className="mt-10  flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <Link to="/books"   className="px-6 group  py-3.5 rounded-2xl font-inter bg-rose-500 flex gap-2  text-lg  font-semibold hover:opacity-90">Shop Now <ShoppingBag className="group-hover:scale-[1.1] group-active:animate-ping"  /></Link>
                  <button onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop ?? 0, behavior: 'smooth' })} className="px-6 py-3.5 cursor-pointer rounded-2xl font-inter bg-white/90 text-slate-900 text-lg font-semibold hover:bg-white">Explore Features</button>
                </div>
              </RevealOnScroll>
              {/* Image (top on md, right on lg) */}
              <RevealOnScroll direction="left" className="flex-1 w-full flex items-start md:items-center justify-center lg:justify-end">
                <img
                  src="https://www.freebooksy.com/wp-content/uploads/sites/6/2021/11/Book-lover-bro.svg"
                  alt="Showcase of books"
                  className="object-contain  drop-shadow-2xl"
                  loading="eager"
                />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section id="books" className="px-0 pt-0 md:py-20 ">
        <RevealOnScroll direction="up">
          <BookGrid />
        </RevealOnScroll>
      </section>
      <section id="about" className="px-0 pt-0 py-30 ">
        <RevealOnScroll direction="up" delay={0.05}>
          <About />
        </RevealOnScroll>
      </section>
      <section id="features" className="px-0  pt-0 py-30 ">
        <RevealOnScroll direction="up" delay={0.05}>
          <Features />
        </RevealOnScroll>
      </section>
      <section id="contact" className="px-0  scroll-mt-40 pt-0 py-30 ">
        <RevealOnScroll direction="up" delay={0.05}>
          <Contact />
        </RevealOnScroll>
      </section>
      {/* End homepage sections */}
    </main>
  );
};

export default Home;
