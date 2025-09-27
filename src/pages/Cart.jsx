import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../api/cart.js';
import { Container, Box, Typography, Paper, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast.jsx';
import Background from '../components/Background.jsx';

export default function Cart() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: getCart });

  const updateMut = useMutation({
    mutationFn: ({ bookId, quantity }) => updateCartItem(bookId, quantity),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update item'),
  });

  const removeMut = useMutation({
    mutationFn: (bookId) => removeCartItem(bookId),
    onSuccess: () => {
      toast.success('Item removed');
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to remove item'),
  });

  const clearMut = useMutation({
    mutationFn: () => clearCart(),
    onSuccess: () => {
      toast.success('Cart cleared');
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to clear cart'),
  });

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, i) => sum + (i.book?.price || 0) * i.quantity, 0);

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <Typography className="relative z-10" variant="h4" gutterBottom>Shopping Cart</Typography>
      <div className="relative z-10">
      {items.length === 0 ? (
        <Typography className="relative z-10">Your cart is empty.</Typography>
      ) : (
        <>
          {items.map((i) => (
            <Paper key={i.book._id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Link to={`/books/${i.book._id}`} onClick={() => scrollTo({top: 0, behavior: 'smooth'})}>
                <img className="rounded cursor-pointer" src={i.book.coverUrl || '/placeholder.svg'} alt={i.book.title} width={64} height={64} style={{ borderRadius: 8, objectFit: 'cover' }} />
                </Link>
                <Box>
                  <Typography variant="subtitle1">{i.book.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Rs. {i.book.price}</Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => updateMut.mutate({ bookId: i.book._id, quantity: Math.max(0, i.quantity - 1) })}><RemoveIcon /></IconButton>
                <Typography>{i.quantity}</Typography>
                <IconButton onClick={() => updateMut.mutate({ bookId: i.book._id, quantity: i.quantity + 1 })}><AddIcon /></IconButton>
                <IconButton
                  color="error"
                  onClick={async () => {
                    const ok = await confirmToast({ message: `Remove "${i.book.title}" from cart?`, confirmText: 'Remove' });
                    if (ok) removeMut.mutate(i.book._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Typography variant="h6">Subtotal: Rs. {subtotal}</Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  const ok = await confirmToast({ message: 'Clear all items from cart?', confirmText: 'Clear' });
                  if (ok) clearMut.mutate();
                }}
              >
                Clear Cart
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={items.length === 0}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Payment
              </Button>
            </Box>
          </Box>
        </>
      )}
      </div>
    </Container>
  );
}
