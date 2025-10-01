import React from 'react';
import { Box, Paper, Skeleton, Stack } from '@mui/material';
import PageHeadingSkeleton from './PageHeadingSkeleton.jsx';

export default function CheckoutSkeleton({ items = 3 }) {
  return (
    <div className="relative  max-w-[1550px] mx-auto bg-slate-950 py-16">
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      <div className="relative z-10 mx-auto flex w-full flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <PageHeadingSkeleton />
        <div className="flex w-full flex-col gap-6 xl:gap-10 lg:flex-row">
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              borderRadius: '26px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              color: 'white',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: '1 1 60%',
            }}
          >
            <Skeleton variant="text" animation="wave" sx={{ fontSize: 28, width: '45%', bgcolor: 'rgba(148,163,184,0.18)' }} />
            <Stack spacing={3}>
              {Array.from({ length: items }).map((_, idx) => (
                <Stack key={idx} spacing={1.5}>
                  <Skeleton variant="text" animation="wave" sx={{ fontSize: 20, width: '70%', bgcolor: 'rgba(148,163,184,0.16)' }} />
                  <Skeleton variant="text" animation="wave" sx={{ fontSize: 16, width: '40%', bgcolor: 'rgba(148,163,184,0.14)' }} />
                </Stack>
              ))}
            </Stack>
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" animation="wave" height={20} sx={{ width: '65%', bgcolor: 'rgba(148,163,184,0.14)', borderRadius: 2 }} />
              <Skeleton variant="rounded" animation="wave" height={20} sx={{ width: '55%', bgcolor: 'rgba(148,163,184,0.14)', borderRadius: 2 }} />
              <Skeleton variant="rounded" animation="wave" height={26} sx={{ width: '40%', bgcolor: 'rgba(148,163,184,0.16)', borderRadius: 2 }} />
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: '1 1 40%',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              borderRadius: '26px',
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Stack spacing={2.5}>
              <Skeleton variant="text" animation="wave" sx={{ fontSize: 16, width: '60%', bgcolor: 'rgba(148,163,184,0.16)' }} />
              <Skeleton variant="rounded" animation="wave" height={52} sx={{ width: '100%', bgcolor: 'rgba(148,163,184,0.12)', borderRadius: 4 }} />
              <Skeleton variant="rounded" animation="wave" height={160} sx={{ width: '100%', bgcolor: 'rgba(148,163,184,0.12)', borderRadius: 4 }} />
              <Skeleton variant="rounded" animation="wave" height={48} sx={{ width: 220, bgcolor: 'rgba(148,163,184,0.16)', borderRadius: 3, alignSelf: 'flex-start' }} />
            </Stack>
          </Paper>
        </div>
      </div>
    </div>
  );
}
