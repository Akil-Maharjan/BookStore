import React from 'react';

// Decorative bookshelf animation using pure CSS
const Bookshelf = () => {
  return (
    <section className="bookshelf hidden md:block" aria-hidden="true">
      <div className="shelf">
        <div className="book b1" />
        <div className="book b2" />
        <div className="book b3" />
        <div className="book b4" />
        <div className="book b5" />
        <div className="book b6" />
        <div className="lamp">
          <span className="light" />
        </div>
      </div>
    </section>
  );
};

export default Bookshelf;
