import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Typography, Paper, Stack, Box, Chip, Button, Tooltip, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Background from '../components/Background.jsx';
import { getMyOrders, updateOrderStatus, deleteOrder } from '../api/orders.js';
import { confirmToast } from '../utils/confirmToast.jsx';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const statusColor = (status) => {
  switch (status) {
    case 'shipping':
      return 'info';
    case 'completed':
    case 'shipped':
      return 'success';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const statusDescription = {
  pending: 'Awaiting payment confirmation.',
  shipping: 'Payment confirmed. Your order is being prepared/shipped.',
  shipped: 'Order shipped. Delivery on the way.',
  completed: 'Order completed. Thank you!',
  failed: 'Payment failed. Please retry.',
  cancelled: 'Order cancelled.',
};

export default function Orders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders', { scope: 'mine' }],
    queryFn: () => getMyOrders(),
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to load orders');
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order updated');
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'admin' }] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      toast.success('Order removed');
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'admin' }] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete order');
    },
  });

  const renderActions = (order) => {
    const canComplete = ['shipping', 'shipped'].includes(order.status);
    const canCancel = ['pending', 'shipping'].includes(order.status);
    const canDelete = ['pending', 'shipping', 'cancelled', 'failed', 'completed'].includes(order.status);

    return (
      <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
        {canComplete && (
          <Button
            variant="contained"
            size="small"
            disabled={statusMut.isPending}
            onClick={() => statusMut.mutate({ id: order._id, status: 'completed' })}
          >
            Mark as Received
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outlined"
            size="small"
            color="warning"
            disabled={statusMut.isPending}
            onClick={() => statusMut.mutate({ id: order._id, status: 'cancelled' })}
          >
            Cancel Order
          </Button>
        )}
        {canDelete && (
          <Tooltip title="Remove this order from your history">
            <span>
              <Button
                variant="text"
                size="small"
                color="error"
                disabled={deleteMut.isPending}
                onClick={async () => {
                  const ok = await confirmToast({ message: 'Remove this order from history?', confirmText: 'Remove' });
                  if (ok) deleteMut.mutate(order._id);
                }}
              >
                Delete Order
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>
    );
  };

  const sortedOrders = useMemo(() => orders, [orders]);

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Typography variant="h4" gutterBottom>
          Your Orders
        </Typography>
        {isLoading && <Typography variant="body1">Loading orders…</Typography>}
        {isError && (
          <Typography variant="body1" color="error">
            {error?.response?.data?.message || 'Failed to load orders'}
          </Typography>
        )}
        {!isLoading && orders.length === 0 && (
          <Typography variant="body1">You have not placed any orders yet.</Typography>
        )}
        <Stack spacing={2}>
          {sortedOrders.map((order) => (
            <Paper key={order._id} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <div>
                  <Typography variant="subtitle1">Order #{order._id.slice(-6)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Placed {dayjs(order.createdAt).format('MMM D, YYYY h:mm A')}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={order.status} color={statusColor(order.status)} />
                </Stack>
              </Box>
              {statusDescription[order.status] && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {statusDescription[order.status]}
                </Typography>
              )}
              <Stack spacing={1} mt={2}>
                {order.items?.map((item, idx) => {
                  const unitPrice = item.price ?? item.book?.price ?? 0;
                  const quantity = item.quantity ?? 0;
                  const lineTotal = unitPrice * quantity;
                  return (
                    <Box key={idx} display="flex" justifyContent="space-between" borderBottom="1px solid rgba(255,255,255,0.08)" pb={1}>
                      <div>
                        <Typography variant="body2" fontWeight={600}>
                          {item.book?.title || item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Qty: {quantity}
                        </Typography>
                      </div>
                      <Typography variant="body2">
                        {formatCurrency(lineTotal)}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Box display="flex" justifyContent="flex-end" mt={2} gap={3}>
                <Typography variant="body2">Subtotal: {formatCurrency(order.subtotal)}</Typography>
                <Typography variant="body2">Shipping: {formatCurrency(order.shipping)}</Typography>
                <Typography variant="subtitle1">Total: {formatCurrency(order.total)}</Typography>
              </Box>
              {renderActions(order)}
            </Paper>
          ))}
        </Stack>
      </div>
    </Container>
  );
}
