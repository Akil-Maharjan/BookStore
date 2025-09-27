import React from 'react';
import { motion as Motion, useAnimationControls } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '../api/cart.js';
import toast from 'react-hot-toast';

const BookCard = ({ book }) => {
  const { _id, title, author, price_npr, coverUrl } = book;
  const qc = useQueryClient();
  const cartButtonControls = useAnimationControls();
  const cartIconControls = useAnimationControls();

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

  const addMut = useMutation({
    mutationFn: () => addToCart(_id, 1),
    onSuccess: () => {
      toast.success('Added to cart');
      qc.invalidateQueries({ queryKey: ['cart'] });
      triggerCartSuccess();
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to add to cart'),
    onMutate: () => {
      cartButtonControls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.3, ease: 'easeInOut' },
      });
      cartIconControls.start({
        rotate: [0, -15, 15, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      });
    },
  });

  const handleAddToCart = () => {
    if (addMut.isPending) return;
    addMut.mutate();
  };
  return (
    <article className="rounded-xl  overflow-hidden border  backdrop-blur hover:shadow-lg hover:shadow-black/30 transition" itemScope itemType="https://schema.org/Book">
      <Link to={`/books/${_id}`} onClick={() => scrollTo({top: 0, behavior: 'smooth'})} className="block">
       
        <img src={coverUrl || '/placeholder.svg'} alt={title} className="h-60 w-full object-fit" />
      </Link>
      <div className="p-3 flex flex-col justify-between  gap-1">
        <h3 className="text-base font-poppins font-semibold line-clamp-1" itemProp="name">{title}</h3>
        <p className="text-sm font-poppins">by <span itemProp="author">{author}</span></p>
        <p className="text-brand font-bold mt-1 font-poppins" itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <span itemProp="priceCurrency" content="NPR">Rs.</span>
          <span className="ml-1 font-inter" itemProp="price">{Number(price_npr ?? 0)}</span>
        </p>
        <div className="flex gap-2 mt-2">
          <Motion.button
            type="button"
            animate={cartButtonControls}
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            disabled={addMut.isPending}
            aria-busy={addMut.isPending}
            className="px-3 py-2 rounded font-poppins cursor-pointer bg-brand hover:bg-brand-dark text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Motion.span
              animate={cartIconControls}
              className="inline-flex gap-2 truncate max-w-20 "
              style={{ transformOrigin: 'center' }}
            >
              🛒   <p hover:tooltip="Add to Cart" className="font-poppins truncate">{addMut.isPending ? 'Adding…' : 'Add to Cart'}</p>
            </Motion.span >
          
          </Motion.button>
          <Link to={`/books/${_id}`} onClick={() => scrollTo({top: 0, behavior: 'smooth'})} className="px-3 py-2 rounded border  text-sm">Details</Link>
        </div>
      </div>
    </article>
  );
};

export default BookCard;
