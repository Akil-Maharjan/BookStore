import React from 'react';

const Footer = () => {
  const handleSubscribe = (event) => {
    event.preventDefault();
  };

  return (
    <footer
      role="contentinfo"
      className="mt-16"
    >
      <div className="relative bg-slate-900  md:pr-20 max-w-[1910px] mx-auto  border-white/10  text-neutral-200">
        <div className="pointer-events-none  absolute inset-0 opacity-60">
          <div className="absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-[140px]" />
          <div className="absolute -bottom-32 right-1/3  w-full rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <div className="relative  z-10 mx-auto max-w-screen-2xl px-6 py-10 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">BookStore</h2>
                <p className="mt-3 max-w-md text-sm text-neutral-400">
                  Discover your next great read with curated recommendations, personalized shelves, and a vibrant community of book lovers.
                </p>
              </div>

              <div className="flex items-center gap-4 text-neutral-400">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  aria-label="Facebook"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12.07C22 6.49 17.52 2 11.94 2S2 6.49 2 12.07c0 4.99 3.66 9.13 8.44 9.93v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.51-3.62.71 0 1.63.12 1.63.12v2.26h-.92c-.91 0-1.2.57-1.2 1.15v1.38h2.56l-.41 2.9h-2.15V22c4.78-.8 8.44-4.94 8.44-9.93Z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  aria-label="Instagram"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect width="14" height="14" x="5" y="5" rx="4" />
                    <path d="M15.5 8.5h.01" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                </a>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  aria-label="X (formerly Twitter)"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 3.5h3.356l-7.33 8.366L22 20.5h-5.125l-4.01-5.24-4.6 5.24H4.91l7.857-8.955L2 3.5h5.29l3.623 4.793L18.244 3.5Zm-1.262 15.33h1.86L7.134 5.95H5.143l11.84 12.88Z" />
                  </svg>
                </a>
                <a
                  href="mailto:hello@bookstore.com"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                  aria-label="Email"
                >
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
                    <path d="m4 7 8 5 8-5" />
                  </svg>
                </a>
              </div>
            </div>

            <nav aria-label="Explore" className="space-y-4 text-sm">
              <h3 className="font-semibold uppercase tracking-wide text-neutral-200">Explore</h3>
              <ul className="space-y-3 text-neutral-400">
                <li>
                  <a className="transition hover:text-white" href="#popular">Popular Titles</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#genres">Genres</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#authors">Authors</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#new-arrivals">New Arrivals</a>
                </li>
              </ul>
            </nav>

            <nav aria-label="Support" className="space-y-4 text-sm">
              <h3 className="font-semibold uppercase tracking-wide text-neutral-200">Support</h3>
              <ul className="space-y-3 text-neutral-400">
                <li>
                  <a className="transition hover:text-white" href="#faq">FAQs</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#shipping">Shipping & Returns</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#support">Customer Care</a>
                </li>
                <li>
                  <a className="transition hover:text-white" href="#privacy">Privacy Policy</a>
                </li>
              </ul>
            </nav>

            <div className="space-y-4 text-sm">
              <h3 className="font-semibold uppercase tracking-wide text-neutral-200">Stay Updated</h3>
              <p className="text-neutral-400">
                Join our newsletter for fresh releases, staff picks, and exclusive offers delivered straight to your inbox.
              </p>
              <form className="flex flex-col gap-3 xl:flex-row" onSubmit={handleSubscribe}>
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                >
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-neutral-500">
                We respect your privacy. Read our <a className="underline decoration-dotted underline-offset-4 hover:text-white" href="#privacy">privacy policy</a>.
              </p>
            </div>
          </div>

          <div className="mt-16 flex flex-col gap-4 border-t border-white/5 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} BookStore. Crafted with passion for readers everywhere.</p>
            <div className="flex flex-wrap items-center gap-5">
              <a className="transition hover:text-white" href="#terms">
                Terms
              </a>
              <a className="transition hover:text-white" href="#privacy">
                Privacy
              </a>
              <a className="transition hover:text-white" href="#cookies">
                Cookies
              </a>
              <a className="transition hover:text-white" href="#accessibility">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
