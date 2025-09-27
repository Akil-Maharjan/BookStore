import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../api/books.js';
import { Link, useSearchParams } from 'react-router-dom';
import SkeletonBookCard from '../components/SkeletonBookCard.jsx';
import Background from '../components/Background.jsx';

const categories = ['All', 'Fiction', 'Non-fiction', 'Fantasy', 'Sci-Fi', 'Biography', 'General'];

export default function Books() {
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  // keep input synced with URL (?q=)
  useEffect(() => {
    const qp = searchParams.get('q') || '';
    setQ(qp);
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['books', { q, category, page, sort }],
    queryFn: () =>
      fetchBooks({
        q: q || undefined,
        category: category === 'All' ? undefined : category,
        page,
        sort: sort === 'default' ? undefined : sort,
      }),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const pages = data?.pages || 1;

  return (
    <div className="max-w-[1550px]  mx-auto px-4 py-8">
      
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
      <Background />
        <div className="flex-1  relative z-10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books..."
            className="w-[30rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:ring-slate-600"
          />
        </div>
        <div className="relative z-10 flex gap-2">
         
          <div>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="default">Sort by</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* category pills */}
      <div className="mb-6 overflow-x-auto scroll-hide relative z-10">
        <div className="flex gap-2 w-max">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1); }}
              className={`px-4 py-2 rounded-full bg-slate-800 cursor-pointer  border text-sm hover:text-black ${category === c ? '  border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 relative z-10">
        {isLoading
          ? Array.from({ length: 12 }).map((_, idx) => (
              <SkeletonBookCard key={idx} />
            ))
          : items.map((b) => (
              <article
                key={b._id}
                className="rounded-xl overflow-hidden border backdrop-blur border-white/10 hover:shadow-lg hover:shadow-black/30 transition "
              >
                <Link
                  to={`/books/${b._id}`}
                  onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
                  className="block"
                >
                  <div className="relative w-full h-60">
                  <img
                    className="w-full h-60 object-fit  "
                    src={b.coverUrl || '/placeholder.svg'}
                    alt={b.title}
                  />
                  </div>
                </Link>
                <div className="p-3 flex flex-col gap-2">
                  <h3 className="text-base font-poppins font-semibold line-clamp-1 text-white">{b.title}</h3>
                  <p className="text-sm font-poppins text-white/70">{b.author}</p>
                  {(b.price_npr != null) && (
  <p className="text-brand font-bold mt-1 font-poppins">
    Rs. {Number(b.price_npr ?? 0).toLocaleString()}
  </p>
)}
                  {b.category != null && (
                    <p className="text-xs font-poppins text-white/50 uppercase tracking-wide">{b.category}</p>
                  )}
                  <Link
                    to={`/books/${b._id}`}
                    onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
                    className="mt-2 inline-flex justify-center items-center gap-2 rounded border border-white/20 px-3 py-2 text-sm font-poppins text-white/80 hover:text-white hover:border-white/40 transition"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
      </div>

      {pages > 1 && (
        <div className="flex  justify-center mt-4 gap-1 relative z-10">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => { setPage(i + 1); scrollTo({top: 0, behavior: 'smooth'}) }} className={`px-3 py-1  bg-slate-800 cursor-pointer rounded border ${page === i + 1 ? 'bg-brand text-white border-brand' : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
