import React, { useState } from 'react';
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

  const goToDetails = () => {
    scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/books/${_id}`);
  };

  return (
    <article
      className="group relative rounded-xl max-w-[22rem] h-[550px] flex flex-col justify-center w-full overflow-hidden border backdrop-blur border-white hover:border-white/50 shadow-lg hover:shadow-white/30 transition-all duration-500"
      itemScope
      itemType="https://schema.org/Book"
    >
      <Link
        to={`/books/${_id}`}
        onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
        className="block h-full"
      >
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          itemProp="image"
        />
      </Link>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/75 to-slate-950/15 backdrop-blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

      <div
        className="absolute inset-0 flex flex-col justify-end px-0 pb-5 pt-8 gap-4 translate-y-8 opacity-0 transition-all duration-500 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            goToDetails();
          }
        }}
      >
        <div className="flex flex-col gap-3 w-full bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 py-5 text-white">
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

        <div className="flex justify-between gap-2 px-4 sm:px-6">
          <Motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={addMut.isPending}
            aria-busy={addMut.isPending}
            className="group/add rounded overflow-hidden font-poppins cursor-pointer bg-brand hover:bg-brand-dark text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Motion.span
              className="group/add flex border bg-slate-900 hover:bg-slate-500 w-[150px] items-center justify-between border-white rounded px-3 py-2 gap-2"
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

          <Link
            to={`/books/${_id}`}
            onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}
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
