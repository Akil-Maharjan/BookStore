import React from 'react';
import { Skeleton, Stack, Paper, Box } from '@mui/material';

export default function CartSkeleton({ items = 3 }) {
  return (
    <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
      <Skeleton variant="text" animation="wave" sx={{ fontSize: 40, width: '40%', bgcolor: 'rgba(148,163,184,0.18)' }} />
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.85))',
          borderRadius: 4,
          border: '1px solid rgba(148, 163, 184, 0.12)',
          boxShadow: '0 24px 40px -24px rgba(15, 23, 42, 0.8)',
          overflow: 'hidden',
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Stack spacing={3}>
          {Array.from({ length: items }).map((_, idx) => (
            <Box key={idx} display="grid" gap={2} sx={{ gridTemplateColumns: { xs: '1fr', sm: '140px 1fr 120px' }, alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                animation="wave"
                width={120}
                height={120}
                sx={{ bgcolor: 'rgba(148,163,184,0.18)', borderRadius: 3 }}
              />
              <Stack spacing={1.2}>
                <Skeleton variant="text" animation="wave" sx={{ fontSize: 22, width: '70%', bgcolor: 'rgba(148,163,184,0.16)' }} />
                <Skeleton variant="text" animation="wave" sx={{ fontSize: 16, width: '40%', bgcolor: 'rgba(148,163,184,0.16)' }} />
                <Skeleton variant="rounded" animation="wave" height={40} sx={{ width: 180, bgcolor: 'rgba(148,163,184,0.14)', borderRadius: 2 }} />
              </Stack>
              <Skeleton variant="text" animation="wave" sx={{ fontSize: 20, width: '60%', bgcolor: 'rgba(148,163,184,0.16)', justifySelf: { sm: 'end' } }} />
            </Box>
          ))}
        </Stack>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
          borderRadius: 4,
          border: '1px solid rgba(148, 163, 184, 0.18)',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Stack spacing={2}>
          <Skeleton variant="text" animation="wave" sx={{ fontSize: 24, width: '50%', bgcolor: 'rgba(148,163,184,0.18)' }} />
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="rounded" animation="wave" height={36} sx={{ width: '100%', bgcolor: 'rgba(148,163,184,0.12)', borderRadius: 2 }} />
          ))}
          <Skeleton variant="rounded" animation="wave" height={48} sx={{ width: 220, bgcolor: 'rgba(148,163,184,0.16)', borderRadius: 3 }} />
        </Stack>
      </Paper>
    </Stack>
  );
}
