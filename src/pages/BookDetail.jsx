import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBook, fetchBooks } from '../api/books.js';
import { getReviews, addOrUpdateReview, deleteMyReview } from '../api/reviews.js';
import { addToCart } from '../api/cart.js';
import { useAuth } from '../store/auth.js';
import { motion as Motion, useAnimationControls } from 'framer-motion';
import toast from 'react-hot-toast';
import SkeletonBookDetail from '../components/SkeletonBookDetail.jsx';
import Background from '../components/Background.jsx';
import { Star, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';


export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const cartButtonControls = useAnimationControls();
  const cartIconControls = useAnimationControls();
  const reviewButtonControls = useAnimationControls();
  const reviewIconControls = useAnimationControls();

  const triggerCartSuccess = React.useCallback(() => {
    cartButtonControls.start({
      scale: [1, 1.08, 1],
      boxShadow: [
        '0 0 0 rgba(0,0,0,0)',
        '0 0 16px rgba(59,130,246,0.45)',
        '0 0 0 rgba(0,0,0,0)'
      ],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
    cartIconControls.start({
      y: [0, -10, 0],
      scale: [1, 1.25, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
  }, [cartButtonControls, cartIconControls]);

  const triggerReviewSuccess = React.useCallback(() => {
    reviewButtonControls.start({
      scale: [1, 1.08, 1],
      boxShadow: [
        '0 0 0 rgba(0,0,0,0)',
        '0 0 16px rgba(244,114,182,0.45)',
        '0 0 0 rgba(0,0,0,0)'
      ],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
    reviewIconControls.start({
      y: [0, -8, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, ease: 'easeOut' },
    });
  }, [reviewButtonControls, reviewIconControls]);

  const { data: book, isLoading } = useQuery({ queryKey: ['book', id], queryFn: () => fetchBook(id) });
  const { data: reviews = [] } = useQuery({ queryKey: ['reviews', id], queryFn: () => getReviews(id) });
  const { data: allBooks } = useQuery({
    queryKey: ['book-adjacents-all'],
    queryFn: async () => {
      const limit = 50;
      let page = 1;
      const items = [];
      while (true) {
        const res = await fetchBooks({ limit, page });
        const pageItems = res?.items || [];
        if (!pageItems.length) break;
        items.push(...pageItems);
        const totalPages = res?.pages ?? 1;
        if (page >= totalPages) break;
        page += 1;
      }
      return { items };
    },
    enabled: Boolean(book?._id),
    staleTime: 5 * 60 * 1000,
  });

  const { nextBook } = React.useMemo(() => {
    const items = allBooks?.items || [];
    if (!book) return { nextBook: null };
    const idx = items.findIndex((item) => item._id === book._id);
    if (idx === -1) return { nextBook: null };
    return {
      nextBook: idx < items.length - 1 ? items[idx + 1] : null,
    };
  }, [allBooks, book]);

  const handleEdit = (review) => {
    setIsEditing(true);
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment || '');
    setHoverRating(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingReviewId(null);
    setRating(5);
    setComment('');
    setHoverRating(null);
  };
  const addToCartMut = useMutation({
    mutationFn: () => addToCart(id, qty),
    onSuccess: () => {
      toast.success('Added to cart');
      qc.invalidateQueries({ queryKey: ['cart'] });
      triggerCartSuccess();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    },
    onMutate: () => {
      cartButtonControls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      });
      cartIconControls.start({
        rotate: [0, -12, 12, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    },
  });

  const reviewMut = useMutation({
    mutationFn: (payload) => addOrUpdateReview(id, payload),
    onSuccess: (_, variables) => {
      const wasEditing = Boolean(variables?.reviewId);
      toast.success(wasEditing ? 'Review updated' : 'Review submitted');
      setIsEditing(false);
      setEditingReviewId(null);
      setRating(5);
      setComment('');
      setHoverRating(null);
      qc.invalidateQueries({ queryKey: ['reviews', id] });
      triggerReviewSuccess();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit review'),
    onMutate: () => {
      reviewButtonControls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      });
      reviewIconControls.start({
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    },
  });

  const deleteReviewMut = useMutation({
    mutationFn: ({ reviewId }) => deleteMyReview(id, reviewId),
    onSuccess: () => {
      toast.success('Review deleted');
      setIsEditing(false);
      setEditingReviewId(null);
      setRating(5);
      setComment('');
      setHoverRating(null);
      qc.invalidateQueries({ queryKey: ['reviews', id] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete review'),
  });

  const isSubmitDisabled =
    reviewMut.isPending ||
    !comment.trim() ||
    rating < 1 ||
    (isEditing && !editingReviewId);

  const submitLabel = isEditing ? 'Update' : 'Submit';
  const handleAddToCart = () => {
    if (addToCartMut.isPending) return;
    addToCartMut.mutate();
  };

  const handleSubmitReview = () => {
    if (isSubmitDisabled) return;
    reviewMut.mutate({ rating, comment: comment.trim(), reviewId: isEditing ? editingReviewId : undefined });
  };

  const goToBook = (bookId) => {
    if (!bookId) return;
    navigate(`/books/${bookId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) return <SkeletonBookDetail />;
  if (!book) return <div className="max-w-[96rem] mx-auto px-4 py-8">Not found</div>;

  return (
    <div className="max-w-[96rem] xl:pr-20 lg:pr-10 md:pr-8 pr-4  mx-auto px-4 py-8">
      <Background />
      <div className="flex flex-wrap justify-between items-center gap-3 relative z-10 mb-6">
        <Link
          to="/books"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-poppins text-white/80 hover:text-white hover:border-white/40"
        >
          ← Back to books
        </Link>
        <button
          type="button"
          onClick={() => goToBook(nextBook?._id)}
          disabled={!nextBook}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-poppins text-white/80 hover:text-white hover:border-white/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nextBook ? nextBook.title : 'No next'}
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-1 relative z-10 md:grid-cols-2 gap-6">
        <div> 
          <div className="rounded-xl overflow-hidden h-200 border border-white/10 bg-white/5">
            <img src={book.coverUrl || '/placeholder.svg'} alt={book.title} className="w-full h-200 object-fit" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-poppins md:text-5xl font-bold mb-2">{book.title}</h1>
          <p className="text-white/70 font-poppins mb-2">by {book.author}</p>
          <div className="text-sm text-white/70 mb-2"><p className="font-semibold font-poppins">Category: {book.category}</p></div>
          <div className="flex font-poppins items-center gap-3 text-sm text-white/70">
            <span>Rating: {book.ratings || 0}/5</span>
            <span>({book.numReviews || 0} reviews)</span>
          </div>
          <div className="text-3xl md:text-4xl font-inter font-bold mt-4">Rs. {book.price_npr}</div>
          <p className="mt-3 leading-relaxed text-2xl font-poppins">{book.description}</p>
          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm font-poppins">Qty</label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)||1))} className="w-24 rounded border border-white/20 bg-slate-900 px-3 py-2" />
            <Motion.button
              type="button"
              animate={cartButtonControls}
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              disabled={addToCartMut.isPending}
              aria-busy={addToCartMut.isPending}
              className="px-4 py-2 rounded bg-brand cursor-pointer text-white hover:bg-brand-dark flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Motion.span  animate={cartIconControls} style={{ display: 'inline-block', transformOrigin: 'center' }}>🛒</Motion.span>
              <p className="font-poppins">{addToCartMut.isPending ? 'Adding…' : 'Add to Cart'}</p>
            </Motion.button>
          </div>
        </div>
      </div>

      <div className="my-6  h-px bg-white/10 " />

      <h2 className="text-2xl font-poppins relative z-10 font-semibold mb-3">Reviews</h2>
<div className="space-y-4 relative z-10">
  {reviews.map((r) => (
    <div
      key={r._id}
      className="rounded-xl border border-white/10 bg-slate-900/70 p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <span className="font-semibold font-poppins">{r.user?.name || "User"}</span>
          <span className="text-xs text-white/50">
            {r.createdAt ? format(new Date(r.createdAt), "MMM dd, yyyy") : ""}
          </span>
        </div>
        {user && r.user && user._id === r.user._id && (
          <div className="flex gap-3 text-sm">
            <button
              className="text-blue-400 hover:text-blue-300 font-poppins"
              onClick={() => handleEdit(r)}
            >
              Edit
            </button>
            <button
              className="text-red-400 hover:text-red-300 font-poppins disabled:opacity-50"
              onClick={() => deleteReviewMut.mutate({ reviewId: r._id })}
              disabled={deleteReviewMut.isPending}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-white/30"}
          />
        ))}
      </div>

      <p className="text-sm text-white/90 leading-relaxed">{r.comment}</p>
    </div>
  ))}
</div>

      {user && (
        <div className="rounded border border-white/10 bg-slate-900 p-3 mt-4 relative z-10">
          <h3 className="font-semibold font-poppins mb-2">Write a review</h3>
          <div className="flex flex-col gap-2  sm:items-start">
            <div className="flex items-center gap-3">
              <label className="text-sm font-poppins">Rating</label>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const starValue = idx + 1;
                  const isActive = hoverRating !== null ? starValue <= hoverRating : starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      className="p-1 rounded transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/60"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      onFocus={() => setHoverRating(starValue)}
                      onBlur={() => setHoverRating(null)}
                      onClick={() => setRating(starValue)}
                      aria-label={`Set rating to ${starValue}`}
                    >
                      <Star
                        size={22}
                        className={isActive ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-poppins text-white/70">{rating}/5</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts"
              className="w-full font-poppins rounded border border-white/20 bg-slate-900 px-3 py-2 min-h-[96px]"
            />
            <div className="flex flex-col font-poppins sm:flex-row gap-2 sm:items-center">
              <Motion.button
                type="button"
                animate={reviewButtonControls}
                whileTap={{ scale: 0.94 }}
                className="px-4 py-2 rounded cursor-pointer bg-brand text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2"
                onClick={handleSubmitReview}
                disabled={isSubmitDisabled}
                aria-busy={reviewMut.isPending}
              >
                <p className="font-poppins font-semibold border border-white/20 flex gap-3 bg-slate-900 px-3 py-2">
                <Motion.span  animate={reviewIconControls} style={{ display: 'inline-block', transformOrigin: 'center' }}>✍️</Motion.span>
                {reviewMut.isPending ? 'Submitting…' : submitLabel}</p>
              </Motion.button>
              {isEditing && (
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-white/20 text-white/80 hover:text-white hover:border-white/40 w-full sm:w-auto"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
         
        </div>
      )}
    </div>
  );
}
