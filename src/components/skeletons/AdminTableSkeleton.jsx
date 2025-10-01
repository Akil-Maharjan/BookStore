import React from 'react';
import { TableRow, TableCell, Skeleton } from '@mui/material';

const defaultColumns = [
  { width: '35%' },
  { width: '20%' },
  { width: '15%' },
  { width: '15%' },
  { width: '15%', align: 'right' },
];

export default function AdminTableSkeleton({ rows = 6, columns = defaultColumns, height = 24 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} hover>
          {columns.map((col, colIndex) => (
            <TableCell key={colIndex} align={col.align} sx={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
              <Skeleton
                variant="rounded"
                animation="wave"
                height={height}
                sx={{
                  width: col.width || '100%',
                  bgcolor: 'rgba(148,163,184,0.18)',
                  borderRadius: 2,
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
