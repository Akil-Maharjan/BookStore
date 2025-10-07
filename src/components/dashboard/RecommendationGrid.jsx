import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Chip, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';




const cardSx = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: { xs: 2, md: 2.25 },
  borderRadius: 3,
  background: 'linear-gradient(165deg, rgba(15,23,42,0.9), rgba(15,23,42,0.75))',
  border: '1px solid rgba(148,163,184,0.18)',
  color: '#e2e8f0',
  boxShadow: '0 18px 40px -26px rgba(15,23,42,0.75)',
  textDecoration: 'none',
  minHeight: 260,
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 28px 44px -24px rgba(248,113,113,0.6)',
  },
};

const coverWrapperSx = {
  position: 'relative',
  borderRadius: 2,
  overflow: 'hidden',
  aspectRatio: '3 / 4',
  boxShadow: '0 18px 36px -26px rgba(15,23,42,0.65)',
};

const gridSx = {
  display: 'grid',
  gap: { xs: 1.75, md: 2.25 },
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    md: 'repeat(3, minmax(0, 1fr))',
  },
};

function RecommendationCard({ book, fonts, isAdminView, formatCurrency }) {
  return (
    <Paper component={Link} to={`/books/${book._id}`} sx={cardSx}>
      <Box sx={coverWrapperSx}>
        <img
          src={book.coverUrl || '/placeholder.svg'}
          alt={book.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Box>
      
      <Stack spacing={1} alignItems="flex-start">
        <Chip
          label={book.category || (isAdminView ? 'Inventory' : 'Featured')}
          size="small"
          sx={{
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            letterSpacing: '0.08em',
            fontFamily: fonts.body,
            backgroundColor: 'rgba(248,113,113,0.14)',
            color: '#fda4af',
            borderRadius: '999px',
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#f8fafc',
            fontFamily: fonts.heading,
            lineHeight: 1.2,
          }}
        >
          {book.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'rgba(226,232,240,0.75)', fontFamily: fonts.body }}
        >
          {isAdminView ? `Stock: ${book.stock ?? '—'}` : book.author || 'Unknown author'}
        </Typography>
        {book.description && (
          <Typography
            variant="caption"
            sx={{ color: 'rgba(226,232,240,0.6)', fontFamily: fonts.body, lineHeight: 1.6 }}
            className="line-clamp-2"
          >
            {book.description}
          </Typography>
        )}
      </Stack>
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(148,163,184,0.18)', mb: 1 }} />
        <Typography
          variant="subtitle1"
          sx={{ color: '#f8fafc', fontFamily: fonts.numeric, fontWeight: 600 }}
        >
          {formatCurrency(book.price_npr)}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(226,232,240,0.65)', fontFamily: fonts.body }}>
          {book.publisher || book.category || 'General'}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function RecommendationGrid({ books, loading, isAdminView, fonts, formatCurrency, limit = 4 }) {
  const displayBooks = limit ? books.slice(0, limit) : books;

  if (loading) {
    return (
      <Box sx={gridSx}>
        {[...Array(limit || 4)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rounded"
            height={260}
            animation="wave"
            sx={{ backgroundColor: 'rgba(148,163,184,0.16)', borderRadius: 3 }}
          />
        ))}
      </Box>
    );
  }

  if (!displayBooks.length) {
    return (
      <Typography variant="body2" sx={{ mt: 2, color: 'rgba(226,232,240,0.7)', fontFamily: fonts.body }}>
        {isAdminView
          ? 'No inventory highlights yet. Add or import books to see insights here.'
          : 'We will recommend books for you once you start browsing and purchasing.'}
      </Typography>
    );
  }

  return (
    <Box sx={gridSx}>
      {displayBooks.map((book) => (
        <RecommendationCard
          key={book._id}
          book={book}
          fonts={fonts}
          isAdminView={isAdminView}
          formatCurrency={formatCurrency}
        />
      ))}
    </Box>
  );
}
