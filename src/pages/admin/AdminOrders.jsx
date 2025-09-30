import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Toolbar,
  TextField,
  Menu,
  Divider,
  TablePagination,
} from '@mui/material';
import dayjs from 'dayjs';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../api/orders.js';
import Background from '../../components/Background.jsx';
import { confirmToast } from '../../utils/confirmToast.jsx';
import toast from 'react-hot-toast';
import OrderDetailDialog from '../../components/OrderDetailDialog.jsx';

const palette = {
  primaryText: 'rgba(226,232,255,0.92)',
  secondaryText: 'rgba(148,163,209,0.75)',
  headerText: 'rgba(226,232,255,0.88)',
  dangerText: '#fca5a5',
};

const statusChipStyles = (status) => {
  switch (status) {
    case 'pending':
    case 'shipping':
      return {
        color: '#ffffff',
        bgcolor: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.35)',
      };
    case 'paid':
    case 'completed':
    case 'shipped':
      return {
        color: '#bbf7d0',
        bgcolor: 'rgba(34,197,94,0.12)',
        border: '1px solid rgba(74,222,128,0.28)',
      };
    case 'failed':
    case 'cancelled':
      return {
        color: '#fecaca',
        bgcolor: 'rgba(248,113,113,0.12)',
        border: '1px solid rgba(248,113,113,0.28)',
      };
    default:
      return {
        color: palette.primaryText,
        bgcolor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.16)',
      };
  }
};

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

  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const tableScrollRef = useRef(null);

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

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const needle = search.trim().toLowerCase();
    return orders.filter((order) => {
      const customer = `${order.user?.name || ''} ${order.user?.email || ''}`.toLowerCase();
      const orderId = order._id?.toLowerCase() ?? '';
      return customer.includes(needle) || orderId.includes(needle);
    });
  }, [orders, search]);

  const displayedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  useEffect(() => {
    const pageCount = Math.ceil(filteredOrders.length / rowsPerPage);
    if (pageCount > 0 && page >= pageCount) {
      setPage(pageCount - 1);
    }
    if (pageCount === 0 && page !== 0) {
      setPage(0);
    }
  }, [filteredOrders.length, page, rowsPerPage]);

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;

    const handlePointerDown = (event) => {
      if (isDesktop()) return;
      isDragging = true;
      startX = event.clientX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = 'grabbing';
      el.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      el.scrollLeft = scrollLeft - delta;
    };

    const endDrag = (event) => {
      if (!isDragging) return;
      isDragging = false;
      el.style.cursor = '';
      el.releasePointerCapture?.(event.pointerId);
    };

    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointerleave', endDrag);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointerleave', endDrag);
    };
  }, []);

  const handleOpenMenu = (event, order) => {
    setMenuAnchor(event.currentTarget);
    setActiveOrder(order);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleViewDetails = () => {
    setDetailOpen(true);
    handleCloseMenu();
  };

  const handleDeleteOrder = async () => {
    if (!activeOrder) return;
    handleCloseMenu();
    const ok = await confirmToast({ message: 'Delete this order?', confirmText: 'Delete' });
    if (ok) deleteMut.mutate(activeOrder._id);
  };

  return (
    <div className='max-w-[96rem] py-10 w-full mx-auto'>
      <Background />
      <Box
        className=" relative z-10"
        
      >
        <Typography
          variant="h3"
          gutterBottom
          fontFamily="Poppins, sans-serif"
          fontWeight={600}
          sx={{ color: palette.primaryText, mb: 1 }}
        >
          Admin Orders
        </Typography>
        {isLoading && <Typography variant="body1" sx={{ color: palette.secondaryText }}>Loading orders…</Typography>}
        {isError && (
          <Typography variant="body1" sx={{ color: palette.dangerText }}>
            {error?.response?.data?.message || 'Failed to load orders'}
          </Typography>
        )}
        {!isLoading && !orders.length && (
          <Typography variant="body1" sx={{ color: palette.secondaryText }}>
            No orders yet.
          </Typography>
        )}
        {orders.length > 0 && (
          <Paper
            sx={{
              bgcolor: '#0f172a',
              color: 'white',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
              fontFamily: 'Poppins, sans-serif',
              py: 4,
              boxShadow: '0 18px 40px rgba(15,23,42,0.45)',
              px: { xs: 2, md: 3 },
              '& .MuiToolbar-root': {
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                px: 0,
                py: { xs: 1.5, md: 2 },
              },
            }}
          >
            <Toolbar>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: palette.primaryText }}>
                  All Orders
                </Typography>
                <Typography variant="body2" sx={{ color: palette.secondaryText }}>
                  Your most recent orders list
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <TextField
                size="small"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer or order ID"
                sx={{
                  minWidth: { xs: '100%', sm: 260 },
                  bgcolor: 'rgba(15,23,42,0.9)',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.14)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.5)',
                    opacity: 1,
                  },
                }}
              />
            </Toolbar>
            <Box
              ref={tableScrollRef}
              className="hide-scroll-sm"
              sx={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                cursor: { xs: 'grab', md: 'default' },
              }}
            >
              <Table
                size="medium"
                sx={{
                  minWidth: 960,
                  '& th': {
                    py: 2,
                    px: 3,
                    color: palette.headerText,
                    fontWeight: 600,
                    letterSpacing: '0.015em',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  },
                  '& td': {
                    py: 2.4,
                    px: 3,
                    verticalAlign: 'top',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Totals</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Placed</TableCell>
                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedOrders.map((order) => {
                    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                    return (
                      <TableRow
                        key={order._id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                        }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#ffffff' }}>
                            #{order._id?.slice(-6) || order._id}
                          </Typography>
                          <Typography variant="body2" sx={{ color: palette.secondaryText }}>
                            Payment: {order.payment?.method?.toUpperCase() || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} sx={{ color: '#ffffff' }}>
                            {order.user?.name || 'Unknown user'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: palette.secondaryText }}>
                            {order.user?.email || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          
                          <Typography variant="body2" sx={{ color: '#ffffff' }}>
                            {order.items?.[0]?.book?.title || order.items?.[0]?.title || '—'}
                            {totalItems > 1 ? ' +' + (totalItems - 1) : ''}
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ color: palette.secondaryText }}>
                            {totalItems} item{totalItems === 1 ? '' : 's'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                         
                          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#ffffff' }}>
                            {formatCurrency(order.total)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: palette.secondaryText }}>
                            Subtotal: {formatCurrency(order.subtotal)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip
                              label={order.status}
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: 'capitalize',
                                fontWeight: 600,
                                letterSpacing: '0.01em',
                                px: 0.5,
                                ...statusChipStyles(order.status),
                              }}
                            />
                            <FormControl size="small" sx={{ minWidth: 160, '& .MuiInputBase-root': { color: '#ffffff' } }}>
                              <InputLabel sx={{ color: 'rgba(226,232,255,0.7)' }}>Status</InputLabel>
                              <Select
                                label="Status"
                                value={order.status}
                                disabled={statusMut.isPending}
                                onChange={(e) => statusMut.mutate({ id: order._id, status: e.target.value })}
                                sx={{
                                  color: '#ffffff',
                                  '& .MuiSvgIcon-root': { color: '#ffffff' },
                                }}
                              >
                                {adminStatusOptions.map((status) => (
                                  <MenuItem key={status} value={status}>
                                    {statusLabel[status] || status}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: palette.primaryText }}>
                            {dayjs(order.createdAt).format('MMM D, YYYY')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: palette.secondaryText }}>
                            {dayjs(order.createdAt).format('h:mm A')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(event) => handleOpenMenu(event, order)}
                            sx={{
                              color: '#ffffff',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                color: '#c7d2fe',
                                bgcolor: 'rgba(255,255,255,0.08)',
                              },
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[rowsPerPage]}
              onRowsPerPageChange={() => {}}
              sx={{
                color: 'white',
                px: 2,
                '& .MuiTablePagination-actions .MuiIconButton-root': {
                  color: '#ffffff',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                  },
                },
                
              }}
            />
          </Paper>
        )}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              bgcolor: '#10182b',
              color: 'white',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: 180,
              fontFamily: 'Poppins, sans-serif',
            },
          }}
        >
          <MenuItem onClick={handleViewDetails}>View details</MenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
          <MenuItem onClick={handleDeleteOrder} disabled={deleteMut.isPending} sx={{ color: '#f87171' }}>
            Delete order
          </MenuItem>
        </Menu>
        <OrderDetailDialog
          open={detailOpen}
          order={activeOrder}
          onClose={() => setDetailOpen(false)}
          showCustomer
          statusColorGetter={statusColor}
        />
      </Box>
   </div>
  );
}
