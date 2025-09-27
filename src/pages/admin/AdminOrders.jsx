import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/orders.js';
import Background from '../../components/Background.jsx';
import { confirmToast } from '../../utils/confirmToast.jsx';
import toast from 'react-hot-toast';

const statusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'shipped':
    case 'completed':
      return 'primary';
    case 'failed':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const adminStatusOptions = ['pending', 'shipping', 'shipped', 'completed', 'cancelled', 'failed'];

const statusLabel = {
  pending: 'Pending payment',
  shipping: 'Processing/Shipping',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['orders', { scope: 'admin' }],
    queryFn: () => getAllOrders(),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'admin' }] });
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to update order'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      toast.success('Order deleted');
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'admin' }] });
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to delete order'),
  });

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Typography variant="h4" gutterBottom>
          Orders
        </Typography>
        {isLoading && <Typography variant="body1">Loading orders…</Typography>}
        {isError && (
          <Typography variant="body1" color="error">
            {error?.response?.data?.message || 'Failed to load orders'}
          </Typography>
        )}
        {!isLoading && !orders.length && (
          <Typography variant="body1">No orders yet.</Typography>
        )}
        {orders.length > 0 && (
          <Paper sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Placed At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{order.user?.name || 'Unknown user'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.user?.email || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={1}>
                        {order.items?.map((item, idx) => {
                          const unitPrice = item.price ?? item.book?.price ?? 0;
                          const quantity = item.quantity ?? 0;
                          const lineTotal = unitPrice * quantity;
                          return (
                            <Box key={idx}>
                              <Typography variant="body2" fontWeight={600}>
                                {item.book?.title || item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Quantity: {quantity}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Unit price: {formatCurrency(unitPrice)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Line total: {formatCurrency(lineTotal)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">Subtotal: {formatCurrency(order.subtotal)}</Typography>
                      <Typography variant="body2">Shipping: {formatCurrency(order.shipping)}</Typography>
                      <Typography variant="subtitle2">Total: {formatCurrency(order.total)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.payment?.method?.toUpperCase() || '—'}</Typography>
                      {order.payment?.transactionId && (
                        <Typography variant="caption" color="text.secondary">
                          Txn: {order.payment.transactionId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={order.status} color={statusColor(order.status)} size="small" />
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            label="Status"
                            value={order.status}
                            disabled={statusMut.isPending}
                            onChange={(e) => statusMut.mutate({ id: order._id, status: e.target.value })}
                          >
                            {adminStatusOptions.map((status) => (
                              <MenuItem key={status} value={status}>
                                {statusLabel[status] || status}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton
                          aria-label="Delete order"
                          color="error"
                          size="small"
                          disabled={deleteMut.isPending}
                          onClick={async () => {
                            const ok = await confirmToast({ message: 'Delete this order?', confirmText: 'Delete' });
                            if (ok) deleteMut.mutate(order._id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(order.createdAt).format('MMM D, YYYY h:mm A')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </div>
    </Container>
  );
}
