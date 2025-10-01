import React from 'react';
import { Skeleton, Stack } from '@mui/material';

export default function PageHeadingSkeleton({ lines = 2, width = ['60%', '40%'] }) {
  return (
    <Stack spacing={1.5} sx={{ maxWidth: 480 }}>
      <Skeleton
        variant="text"
        animation="wave"
        sx={{ fontSize: 40, width: width[0] ?? '60%', bgcolor: 'rgba(148,163,184,0.18)' }}
      />
      {Array.from({ length: lines - 1 }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          animation="wave"
          sx={{ fontSize: 20, width: width[idx + 1] ?? '50%', bgcolor: 'rgba(148,163,184,0.14)' }}
        />
      ))}
    </Stack>
  );
}
