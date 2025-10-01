import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Divider,
  Chip,
  Grid,
  Avatar,
} from '@mui/material';
import dayjs from 'dayjs';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const defaultStatusColor = (status) => {
  switch (status) {
    case 'completed':
    case 'paid':
    case 'shipped':
      return 'success';
    case 'shipping':
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

export default function OrderDetailDialog({
  open,
  order,
  onClose,
  showCustomer = false,
  statusColorGetter,
  statusDescription,
  renderActions,
}) {
  if (!order) return null;

  const statusColor = statusColorGetter || defaultStatusColor;
  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const description = statusDescription?.[order.status];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a',
          color: 'white',
          borderRadius: 3,
          fontFamily: 'Poppins, sans-serif',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>Order #{order._id?.slice(-6) || order._id}</DialogTitle>
      <DialogContent
        dividers
        className="scroll-hide"
        sx={{
          borderColor: 'rgba(255,255,255,0.08)',
          maxHeight: { xs: '70vh', sm: '75vh' },
          overflowY: 'auto',
        }}
      >
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Placed On
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.createdAt ? dayjs(order.createdAt).format('MMMM D, YYYY h:mm A') : '—'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Status
              </Typography>
              <Chip label={order.status} color={statusColor(order.status)} size="small" />
            </Stack>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Items
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {totalItems}
              </Typography>
            </Box>
          </Stack>

          {description && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {description}
            </Typography>
          )}

          {showCustomer && order.user && (
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }} gutterBottom>
                Customer
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.user?.name || 'Unknown user'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {order.user?.email || '—'}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }} gutterBottom>
                Payment
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.payment?.method?.toUpperCase() || '—'}
              </Typography>
              {order.payment?.transactionId && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Transaction ID: {order.payment.transactionId}
                </Typography>
              )}
              {order.payment?.completedAt && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Completed: {dayjs(order.payment.completedAt).format('MMM D, YYYY h:mm A')}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }} gutterBottom>
                Order Summary
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2">Subtotal: {formatCurrency(order.subtotal)}</Typography>
                <Typography variant="body2">Shipping: {formatCurrency(order.shipping)}</Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Total: {formatCurrency(order.total)}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.7 }} gutterBottom>
              Items
            </Typography>
            <Stack spacing={2}>
              {(order.items || []).map((item, idx) => {
                const quantity = item.quantity || 0;
                const unitPrice = item.price_npr ?? item.book?.price_npr ?? 0;
                const lineTotal = quantity * Number(unitPrice || 0);
                return (
                  <Box
                    key={`${item.book?._id || item.title || idx}-${idx}`}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.08)',
                      bgcolor: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" gap={2} flexWrap="wrap">
                      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ minWidth: 0 }}>
                        <Avatar
                          variant="rounded"
                          src={item.book?.coverUrl}
                          alt={item.book?.title || item.title}
                          sx={{
                            width: 64,
                            height: 96,
                            borderRadius: 1.5,
                            bgcolor: 'rgba(15,23,42,0.4)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: 28,
                          }}
                        >
                          {item.book?.title?.[0]?.toUpperCase() || item.title?.[0]?.toUpperCase() || '📘'}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body1" fontWeight={600} noWrap title={item.book?.title || item.title}>
                            {item.book?.title || item.title}
                          </Typography>
                          {item.book?.author && (
                            <Typography variant="body2" sx={{ opacity: 0.75 }} noWrap title={item.book.author}>
                              {item.book.author}
                            </Typography>
                          )}
                          <Typography variant="body2" sx={{ opacity: 0.75 }}>
                            Qty: {quantity}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack textAlign={{ xs: 'left', sm: 'right' }}>
                        <Typography variant="body2" sx={{ opacity: 0.75 }}>
                          Unit: {formatCurrency(unitPrice)}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {formatCurrency(lineTotal)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Box>
          {typeof renderActions === 'function' && (
            <Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {renderActions(order)}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
