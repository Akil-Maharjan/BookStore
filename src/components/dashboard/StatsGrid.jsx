import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

const getIconWrapperSx = (accent) => ({
  width: 48,
  height: 48,
  borderRadius: '999px',
  background: `${accent}26`,
  color: accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export default function StatsGrid({ cards, fonts, surfaceSx }) {
  const statCardSx = {
    ...surfaceSx,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: { xs: 140, sm: 160 },
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 2.5 },
        gridTemplateColumns: {
          xs: 'repeat(1, minmax(0, 1fr))',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {cards.map((card) => {
        const { icon: Icon, label, value, helper, accent = '#f87171' } = card;
        return (
          <Paper key={label} sx={statCardSx}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack spacing={0.5}>
                <Typography
                  variant="body2"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'rgba(226,232,240,0.7)',
                    fontFamily: fonts.body,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#f8fafc',
                    fontFamily: fonts.numeric,
                    fontSize: { xs: '1.75rem', sm: '2.125rem' },
                  }}
                >
                  {value}
                </Typography>
                {helper && (
                  <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.7)', fontFamily: fonts.body }}>
                    {helper}
                  </Typography>
                )}
              </Stack>
              <Box sx={getIconWrapperSx(accent)}>
                <Icon size={24} />
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
