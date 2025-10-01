import React from 'react';
import { Skeleton, Grid, Stack, Box, Typography } from '@mui/material';

export default function AdminFormSkeleton() {
  const field = (width = '100%', height = 56) => (
    <Skeleton
      variant="rounded"
      animation="wave"
      height={height}
      sx={{
        width,
        bgcolor: 'rgba(148,163,184,0.18)',
        borderRadius: 2,
      }}
    />
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.6 }}>
          Loading
        </Typography>
        <Skeleton variant="text" animation="wave" width={240} height={44} sx={{ bgcolor: 'rgba(148,163,184,0.18)' }} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
        <Grid item xs={12}>{field('100%', 120)}</Grid>
        <Grid item xs={12} sm={6}>{field()}</Grid>
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        {field('180px', 48)}
        {field('160px', 48)}
      </Stack>
    </Stack>
  );
}
