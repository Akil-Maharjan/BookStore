import React from 'react';

export default function Background({
  src = 'https://i.ibb.co/x8sbcLDm/pngfind-com-old-book-png-2340673.png',
  alt = 'Books and reading — background',
  className = '',
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`fixed inset-0 w-full h-full -z-10 pointer-events-none select-none blur-sm bg-slate-800 object-contain ${className}`}
      fetchpriority="high"
      aria-hidden="true"
    />
  );
}
