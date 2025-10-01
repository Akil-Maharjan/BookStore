import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBooks } from '../api/books.js';
import BookCard from './BookCard.jsx';
import SkeletonBookCard from './SkeletonBookCard.jsx';

const BookGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bookGrid'],
    queryFn: () => fetchBooks({ limit: 5 }),
    keepPreviousData: true,
  });

  const items = data?.items || [];

  return (
    <section aria-labelledby="books-heading" className="py-10 lg:py-20 overflow-x-hidden">
      <div className="max-w-[1550px] mx-auto px-4">
        
        <header className="mb-4 relative z-10" >
          <h2 id="books-heading" className="text-3xl font-poppins text-center sm:text-4xl md:text-6xl lg:text-[67px] font-extrabold host-grotesk mb-4">Featured Books</h2>
          <p className="text-center text-xl">Explore our selection of popular titles.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 mt-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" role="list">
            {Array.from({ length: 8 }).map((_, i) => (
              <div role="listitem" key={i}>
                <SkeletonBookCard />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-white/70">No books found.</div>
        ) : (
          <div className="grid place-self-center sm:place-self-auto  mt-10 grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list">
            {items.map((book) => (
              <div role="listitem" key={book._id}>
                <BookCard book={book} />  
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BookGrid;
