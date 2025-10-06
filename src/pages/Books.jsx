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
  const [expandedCard, setExpandedCard] = useState(null);
  const user = useAuth((s) => s.user);
  
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

  // 🔹 consider desktop only for hover — everything else expands on click
  const isDesktop = () =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

  useEffect(() => {
    const handleResize = () => {
      if (isDesktop()) {
        setExpandedCard(null);
      }
    };
    handleResize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

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
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    },
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

  useEffect(() => {
    if (!hasScrolledOnPageChangeRef.current) {
      hasScrolledOnPageChangeRef.current = true;
      return;
    }
    scrollPageTop();
  }, [page, scrollPageTop]);

  return (
    <div className="max-w-[1550px] overflow-x-hidden mx-auto px-4 py-8">
      <span ref={topAnchorRef} className="block h-0" aria-hidden="true" />
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
        <Background />
        <div className="flex-1 relative z-10">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books..."
            className="max-w-[30rem] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:ring-slate-600"
          />
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
            ? filteredItems.map((b) => {
                const goToDetails = () => {
                  scrollTo({ top: 0, behavior: 'smooth' });
                  navigate(`/books/${b._id}`);
                };

                const isExpanded = expandedCard === b._id;

                const handleImageClick = (event) => {
                  event.preventDefault();
                  if (!isDesktop()) {
                    setExpandedCard((prev) => (prev === b._id ? null : b._id));
                    return;
                  }
                  scrollTo({ top: 0, behavior: 'smooth' });
                };

                const handleOverlayClick = (event) => {
                  if (event.target !== event.currentTarget) return;
                  if (isDesktop()) {
                    goToDetails();
                  } else {
                    setExpandedCard(null);
                  }
                };

                return (
                  <article
                    key={b._id}
                    className="group relative rounded-xl max-w-[22rem] h-[550px] flex flex-col justify-center w-full overflow-hidden border-2 backdrop-blur border-white hover:border-white/50 hover:shadow-white/30 transition-all duration-500"
                    aria-expanded={isExpanded}
                  >
                    <Link
                      to={`/books/${b._id}`}
                      onClick={handleImageClick}
                      className="block h-full"
                    >
                      <img
                        className="h-full w-full object-cover transition-transform duration-500 lg:group-hover:scale-105"
                        src={b.coverUrl || '/placeholder.svg'}
                        alt={b.title}
                      />
                    </Link>

                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/15 backdrop-blur-sm transition-opacity duration-500 pointer-events-none ${
                        isExpanded ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'
                      }`}
                    />

                    <div
                      className={`absolute inset-0 flex flex-col justify-end min-h-full px-0 pt-10 pb-4 gap-4 transition-all duration-500 overflow-y-auto lg:overflow-visible lg:pt-8 lg:pb-5 lg:gap-4 ${
                        isExpanded
                          ? 'pointer-events-auto translate-y-0 opacity-100'
                          : 'pointer-events-none translate-y-8 opacity-0 lg:pointer-events-none lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100'
                      }`}
                      onClick={handleOverlayClick}
                    >
                      <div className="flex flex-col gap-3 w-full bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-5 text-white shadow-lg lg:shadow-none">
                        <h3 className="text-2xl font-poppins font-bold line-clamp-2">
                          {b.title}
                        </h3>
                        <p className="text-md flex flex-wrap gap-2 font-medium text-white/70 font-poppins">
                          by
                          <span className="font-bold text-white">&quot;{b.author}&quot;</span>
                        </p>
                        {b.category && (
                          <p className="text-md text-white/70 font-poppins">
                            {b.category}
                          </p>
                        )}
                        {b.price_npr && (
                          <p className="text-brand flex gap-2 font-bold font-poppins">
                            <span>Rs.</span>{' '}
                            {Number(b.price_npr ?? 0).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between gap-2 px-4 sm:px-6 mb-8 lg:mb-0">
                        <Motion.button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isDesktop()) setExpandedCard(null);
                            triggerClick(b._id);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          disabled={addingBookId === b._id}
                          aria-busy={addingBookId === b._id}
                          className="group/add rounded overflow-hidden font-poppins bg-brand hover:bg-brand-dark text-sm flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Motion.span
                            className="group/add flex border bg-slate-900 hover:bg-slate-500 w-[150px] cursor-pointer items-center justify-between border-white/50 rounded px-3 py-2 gap-2"
                            style={{ transformOrigin: 'center' }}
                            onPointerDown={(event) => event.stopPropagation()}
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

                        <Link
                          to={`/books/${b._id}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isDesktop()) setExpandedCard(null);
                            scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="flex rounded-md cursor-pointer justify-center items-center gap-2 border border-white/20 px-6 py-2 text-sm font-poppins text-white/80 hover:text-white bg-slate-900 hover:bg-slate-500 hover:border-white/40 transition"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
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
