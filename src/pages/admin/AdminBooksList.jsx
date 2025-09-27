import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBooks, deleteBook } from '../../api/books.js';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TableContainer, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import toast from 'react-hot-toast';
import { confirmToast } from '../../utils/confirmToast.jsx';
import Background from '../../components/Background.jsx';

const HeadCell = styled(TableCell)(({ theme }) => ({
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: theme.typography.pxToRem(12),
  fontWeight: 900,
  color: 'black',
  borderBottom: `1px solid black`,
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(15,23,42,0.6))'
    : 'linear-gradient(135deg, rgba(226,232,240,0.7), rgba(241,245,249,0.9))',
}));

const BodyCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.25)'}`,
  color: 'white',
  fontSize: theme.typography.pxToRem(14),
}));

export default function AdminBooksList() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['books', { admin: true }], queryFn: () => fetchBooks({ limit: 100 }) });
  const items = data?.items || [];

  const delMut = useMutation({
    mutationFn: (id) => deleteBook(id),
    onSuccess: () => {
      toast.success('Book deleted');
      qc.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Delete failed');
    },
  });

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Manage Books</Typography>
        <Button variant="contained" component={Link} to="/admin/books/new">Add Book</Button>
      </Box>

      <TableContainer
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.65))',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 36px -18px rgba(15,23,42,0.65)',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeadCell>Title</HeadCell>
              <HeadCell>Author</HeadCell>
              <HeadCell align="right">Price</HeadCell>
              <HeadCell align="center">Stock</HeadCell>
              <HeadCell align="right">Actions</HeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((b) => (
              <TableRow
                key={b._id}
                hover
                sx={{
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    background: 'rgba(148, 163, 184, 0.08)',
                  },
                }}
              >
                <BodyCell sx={{ fontWeight: 600 }}>{b.title}</BodyCell>
                <BodyCell>{b.author}</BodyCell>
                <BodyCell align="right">Rs. {b.price ?? '—'}</BodyCell>
                <BodyCell align="center">
                  <Chip
                    size="small"
                    label={typeof b.stock === 'number' ? `${b.stock} in stock` : '—'}
                    color={b.stock > 5 ? 'success' : b.stock > 0 ? 'warning' : 'error'}
                    variant="outlined"
                  />
                </BodyCell>
                <BodyCell align="right">
                  <IconButton component={Link} to={`/admin/books/${b._id}/edit`} color="primary" size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const ok = await confirmToast({ message: `Delete book "${b.title}"? This action cannot be undone.`, confirmText: 'Delete' });
                      if (ok) delMut.mutate(b._id);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </BodyCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </div>
    </Container>
  );
}
