import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBooks } from '../api/books.js';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SkeletonBookCard from '../components/SkeletonBookCard.jsx';
import Background from '../components/Background.jsx';
import { addToCart } from '../api/cart.js';
import toast from 'react-hot-toast';
import { useAnimationControls, motion as Motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../store/auth.js';

const categories = ['All', 'Fiction', 'Non-fiction', 'Fantasy', 'Sci-Fi', 'Biography', 'General'];

export default function Books() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const qc = useQueryClient();
  const [clickedCard, setClickedCard] = useState(null);
  const user = useAuth((s) => s.user);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cartButtonControls = useAnimationControls();
  const cartIconControls = useAnimationControls();

  const [addingBookId, setAddingBookId] = useState(null);

  const topAnchorRef = React.useRef(null);
  const hasScrolledOnPageChangeRef = React.useRef(false);

  const triggerCartSuccess = React.useCallback(() => {
    cartButtonControls.start({
      scale: [1, 1.08, 1],
      boxShadow: [
        '0 0 0 rgba(0,0,0,0)',
        '0 0 16px rgba(59,130,246,0.45)',
        '0 0 0 rgba(0,0,0,0)',
      ],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
    cartIconControls.start({
      y: [0, -10, 0],
      scale: [1, 1.25, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
  }, [cartButtonControls, cartIconControls]);
  const scrollPageTop = React.useCallback(() => {
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => {
      if (topAnchorRef.current) {
        topAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
  }, []);
  const triggerClick = (bookId) => {
    if (addingBookId) return;
    handleAddToCart(bookId);
    setClickedCard(bookId);
    setTimeout(() => setClickedCard(null), 600);
  };

  const dismissAfterOneSecond = (toastId) => {
    if (!toastId) return;
    setTimeout(() => toast.dismiss(toastId), 1000);
  };

  const addMut = useMutation({
    mutationFn: (bookId) => addToCart(bookId, 1),
    onMutate: (bookId) => {
      setAddingBookId(bookId);
      cartButtonControls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      });
      cartIconControls.start({
        rotate: [0, -15, 15, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    },
    onSuccess: () => {
     const toastId = toast.success('Added to cart');
     dismissAfterOneSecond(toastId);
      qc.invalidateQueries({ queryKey: ['cart'] });
      triggerCartSuccess();
    },
    onError: (err) => { toast.error(err?.response?.data?.message || 'Failed to add to cart'); },
    onSettled: () => {
      setAddingBookId(null);
      dismissAfterOneSecond();
    },
  });

  const handleAddToCart = (bookId) => {
    if (addingBookId) return;

    if (!user) {
      navigate('/login');
      scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    addMut.mutate(bookId);
  };

  useEffect(() => {
    const qp = searchParams.get('q') || '';
    setQ(qp);
    setDebouncedQ(qp);
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
    }, 350);
    return () => clearTimeout(handler);
  }, [q]);

  const normalizedQuery = debouncedQ.trim().toLowerCase();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['books', { q: debouncedQ, category, page, sort }],
    queryFn: () =>
      fetchBooks({
        q: debouncedQ || undefined,
        category: category === 'All' ? undefined : category,
        page,
        sort: sort === 'default' ? undefined : sort,
      }),
    keepPreviousData: true,
  });

  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    if (!normalizedQuery) return items;
    return items.filter((b) => {
      const title = b.title?.toLowerCase() || '';
      const author = b.author?.toLowerCase() || '';
      const categoryName = b.category?.toLowerCase() || '';
      return (
        title.includes(normalizedQuery) ||
        author.includes(normalizedQuery) ||
        categoryName.includes(normalizedQuery)
      );
    });
  }, [data?.items, normalizedQuery]);
  const pages = data?.pages || 1;

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    const items = data?.items || [];
    return items
      .filter((b) => {
        const title = b.title?.toLowerCase() || '';
        const author = b.author?.toLowerCase() || '';
        const categoryName = b.category?.toLowerCase() || '';
        return title.includes(normalizedQuery) || author.includes(normalizedQuery) || categoryName.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [data?.items, normalizedQuery]);

  React.useEffect(() => {
    if (!hasScrolledOnPageChangeRef.current) {
      hasScrolledOnPageChangeRef.current = true;
      return;
    }
    scrollPageTop();
  }, [page, scrollPageTop]);

  return (
    <div className="max-w-[1550px] overflow-x-hidden mx-auto px-4 py-8">
      <span ref={topAnchorRef} className="block h-0" aria-hidden="true" />
      <div className="flex flex-col  sm:flex-row gap-3 sm:items-center mb-4">
        <Background />
        <div className="flex-1 relative z-10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books..."
            className="max-w-[30rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:ring-slate-600"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute max-w-[30rem] w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:bg-slate-900 dark:border-slate-700 z-30 mt-2">
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {suggestions.map((item) => (
                  <li key={item._id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 flex flex-col hover:bg-slate-100 dark:hover:bg-slate-800"
                      onMouseDown={() => {
                        setQ(item.title || '');
                        setDebouncedQ(item.title || '');
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-100">{item.title}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.author}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="relative z-10 flex gap-2 mt-2 sm:mt-0">
          <div>
            <select
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
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
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full bg-slate-800 cursor-pointer border text-sm hover:text-black ${
                category === c
                  ? 'border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                  : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid place-self-center sm:place-self-auto mb-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
        {isLoading || isFetching
          ? Array.from({ length: 12 }).map((_, idx) => <SkeletonBookCard key={idx} />)
          : filteredItems.length > 0
            ? filteredItems.map((b) => (
                <article
                  key={b._id}
                  className="rounded-xl max-w-[22rem] flex flex-col justify-center w-full overflow-hidden border-2 backdrop-blur border-white hover:border-white/50 hover:shadow-lg hover:shadow-black/30 transition"
                >
                  <Link
                    to={`/books/${b._id}`}
                    onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
                    className="block"
                  >
                    <div className="relative w-full h-80">
                      <img
                        className="w-full h-full sm:object-fit"
                        src={b.coverUrl || '/placeholder.svg'}
                        alt={b.title}
                      />
                    </div>
                  </Link>
                  <div className="p-3 flex flex-col gap-2">
                    <h3 className="text-2xl mb-1 font-poppins font-bold line-clamp-1 text-white">
                      {b.title}
                    </h3>
                    <p className="text-md font-poppins mb-1 flex gap-2 font-medium text-white/70">
                      by
                      <span className="font-bold text-white">&quot;{b.author}&quot;</span>
                    </p>
                    {b.category != null && (
                      <p className="text-xs font-poppins mb-2 text-white/50 uppercase tracking-wide">
                        {b.category}
                      </p>
                    )}
                    {b.price_npr != null && (
                      <p className="text-brand text-md font-bold mt-1 mb-5 flex gap-2 font-poppins">
                        <span className="font-poppins">Rs.</span>{' '}
                        {Number(b.price_npr ?? 0).toLocaleString()}
                      </p>
                    )}
                    <div className="flex justify-between gap-2">
                      <div className="flex gap-2">
                        <Motion.button
                          type="button"
                          onClick={() => triggerClick(b._id)}
                          disabled={addingBookId === b._id}
                          aria-busy={addingBookId === b._id}
                          className="group rounded overflow-hidden font-poppins bg-brand hover:bg-brand-dark text-sm flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Motion.span
                            className="group flex border bg-slate-900 hover:bg-slate-500 w-[150px] cursor-pointer items-center justify-between border-white/50 rounded px-3 py-2 gap-2"
                            style={{ transformOrigin: 'center' }}
                          >
                            <Motion.span
                              animate={
                                clickedCard === b._id
                                  ? { x: 150, rotate: -30 }
                                  : { x: 0, rotate: 0 }
                              }
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                              className="shrink-0"
                            >
                              <ShoppingCart className="w-5 h-5" />
                            </Motion.span>
                            <Motion.p
                              animate={
                                clickedCard === b._id
                                  ? { opacity: 0 }
                                  : { opacity: 1 }
                              }
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="flex-1 font-poppins truncate text-center"
                              title="Add to Cart"
                            >
                              {addingBookId === b._id ? 'Adding…' : 'Add to Cart'}
                            </Motion.p>
                          </Motion.span>
                        </Motion.button>
                      </div>
                      <Link
                        to={`/books/${b._id}`}
                        onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex rounded-md cursor-pointer justify-center items-center gap-2 border border-white/20 px-6 py-2 text-sm font-poppins text-white/80 hover:text-white bg-slate-900 hover:bg-slate-500 hover:border-white/40 transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            : (
                <div className="col-span-full text-center py-16 text-white/70">
                  No books found.
                </div>
              )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center mt-4 gap-1 relative z-10">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setPage(i + 1);
                scrollPageTop();
              }}
              className={`px-3 py-1 bg-slate-800 cursor-pointer rounded border ${
                page === i + 1
                  ? 'bg-brand text-white border-brand'
                  : 'border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
