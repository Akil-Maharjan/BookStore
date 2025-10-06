import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '../api/cart.js';
import toast from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../store/auth.js';

const BookCard = ({ book }) => {
  const { _id, title, author, price_npr, category, coverUrl } = book;
  const user = useAuth((s) => s.user);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardId = useMemo(() => `book-card-${_id}`, [_id]);

  const coverImage = coverUrl || '/placeholder.svg';
  const formattedPrice = Number(price_npr ?? 0).toLocaleString();

  const addMut = useMutation({
    mutationFn: () => addToCart(_id, 1),
    onSuccess: () => {
      toast.success('Added to cart', { duration: 2000 });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add to cart'),
  });

  const handleAddToCart = () => {
    if (addMut.isPending) return;

    if (!user) {
      navigate('/login');
      scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    addMut.mutate();
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  const isMdUp = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

  useEffect(() => {
    const handleResize = () => {
      if (isMdUp()) {
        setIsExpanded(false);
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

  const goToDetails = () => {
    scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/books/${_id}`);
  };

  const handleImageClick = (event) => {
    if (!isMdUp()) {
      event.preventDefault();
      setIsExpanded((prev) => {
        const next = !prev;
        if (next) {
          window.dispatchEvent(
            new CustomEvent('book-card-expanded', { detail: cardId })
          );
        }
        return next;
      });
      return;
    }

    scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOverlayClick = (event) => {
    if (event.target !== event.currentTarget) return;

    if (isMdUp()) {
      goToDetails();
    } else {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleExternalExpand = (event) => {
      if (event.detail !== cardId) {
        setIsExpanded(false);
      }
    };

    window.addEventListener('book-card-expanded', handleExternalExpand);
    return () => window.removeEventListener('book-card-expanded', handleExternalExpand);
  }, [cardId]);

  return (
    <article
      className="group relative rounded-xl max-w-[22rem] h-[550px] flex flex-col justify-center w-full overflow-hidden border backdrop-blur border-white hover:border-white/50 shadow-lg hover:shadow-white/30 transition-all duration-500"
      itemScope
      itemType="https://schema.org/Book"
      aria-expanded={isExpanded}
    >
      <Link
        to={`/books/${_id}`}
        onClick={handleImageClick}
        className="block h-full"
      >
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
          itemProp="image"
        />
      </Link>

      <div
        className={`absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/15 backdrop-blur-sm transition-opacity duration-500 pointer-events-none ${
          isExpanded ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
        }`}
      />

      <div
        className={`absolute inset-0 flex flex-col justify-end min-h-full px-0 pt-10 pb-4 gap-4 transition-all duration-500 overflow-y-auto md:overflow-visible md:pt-8 md:pb-5 ${
          isExpanded
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-8 opacity-0 md:pointer-events-none md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100'
        }`}
        onClick={handleOverlayClick}
      >
        <div className="flex flex-col gap-3 w-full bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-5 text-white shadow-lg md:shadow-none">
          <h3 className="text-2xl font-poppins font-bold line-clamp-2" itemProp="name">
            {title}
          </h3>
          <p className="text-md flex flex-wrap gap-2 font-medium text-white/70 font-poppins">
            by
            <span className="font-bold text-white" itemProp="author">
              &quot;{author}&quot;
            </span>
          </p>
          {category && (
            <p className="text-md text-white/70 font-poppins">
              {category}
            </p>
          )}
          <p
            className="text-brand flex gap-2 font-bold font-poppins"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <span itemProp="priceCurrency" content="NPR">
              Rs.
            </span>
            <span className="font-inter" itemProp="price">
              {formattedPrice}
            </span>
          </p>
        </div>

        <div className="flex justify-between gap-2 px-4 sm:px-6 mb-8 md:mb-0">
          <div className="relative">
            <Motion.button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                if (!addMut.isPending) {
                  handleAddToCart();
                }
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
              }}
              disabled={addMut.isPending}
              aria-busy={addMut.isPending}
              className="group relative rounded cursor-pointer overflow-hidden font-poppins bg-transparent text-sm flex items-center disabled:opacity-60 disabled:cursor-not-allowed w-full"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Motion.span
                className="flex border bg-slate-900 hover:bg-slate-500 w-full items-center justify-between border-white/50 rounded px-3 py-2 gap-2"
                style={{ transformOrigin: 'center' }}
              >
                <Motion.span
                  animate={clicked ? { x: 150, rotate: -30 } : { x: 0, rotate: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="shrink-0"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Motion.span>
                <Motion.p
                  animate={clicked ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="flex-1 font-poppins truncate text-center"
                  title="Add to Cart"
                >
                  {addMut.isPending ? 'Adding…' : 'Add to Cart'}
                </Motion.p>
              </Motion.span>
            </Motion.button>
          </div>

          <Link
            to={`/books/${_id}`}
            onClick={(event) => {
              event.stopPropagation();
              scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="px-9 flex items-center justify-center text-center rounded border bg-slate-900 hover:bg-slate-500 text-sm"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
