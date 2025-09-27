import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Paper,
  Stack,
  Box,
  Divider,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material';
import toast from 'react-hot-toast';
import Background from '../components/Background.jsx';
import { getCart } from '../api/cart.js';
import { createOrder } from '../api/orders.js';
import { verifyKhaltiPayment } from '../api/payments.js';

const paymentOptions = [
  { value: 'khalti', label: 'Khalti' },
  { value: 'esewa', label: 'eSewa' },
  { value: 'cod', label: 'Cash on Delivery' },
];

const shippingOptions = [
  { value: 0, label: 'Standard (Free)' },
  { value: 150, label: 'Express (+Rs. 150)' },
];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function Checkout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: cart, isLoading } = useQuery({ queryKey: ['cart'], queryFn: getCart });
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0].value);
  const [shippingFee, setShippingFee] = useState(shippingOptions[0].value);
  const [khaltiReady, setKhaltiReady] = useState(typeof window !== 'undefined' && !!window.KhaltiCheckout);

  const items = useMemo(() => cart?.items || [], [cart?.items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.book?.price || 0) * item.quantity, 0), [items]);
  const total = subtotal + Number(shippingFee);

  const createOrderMut = useMutation({
    mutationFn: (payload) => createOrder(payload),
  });

  useEffect(() => {
    if (khaltiReady || typeof document === 'undefined') return;
    const script = document.createElement('script');
    script.src = 'https://khalti.com/static/khalti-checkout.js';
    script.async = true;
    script.onload = () => setKhaltiReady(true);
    script.onerror = () => toast.error('Unable to load Khalti payment library.');
    document.body.appendChild(script);
    return () => {
      // Ensure script is not removed to allow reuse
    };
  }, [khaltiReady]);

  const esewaGatewayUrl = import.meta.env.VITE_ESEWA_GATEWAY_URL || 'https://uat.esewa.com.np/epay/main';
  const esewaMerchantCode = import.meta.env.VITE_ESEWA_MERCHANT_CODE || '';
  const khaltiPublicKey = import.meta.env.VITE_KHALTI_PUBLIC_KEY || '';

  const invalidateOrderQueries = () => {
    qc.invalidateQueries({ queryKey: ['cart'] });
    qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
  };

  const submitEsewaPayment = (order) => {
    if (!esewaMerchantCode) {
      toast.error('Missing eSewa merchant code. Set VITE_ESEWA_MERCHANT_CODE in your .env file.');
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = esewaGatewayUrl;

    const successUrl = `${window.location.origin}/payment/esewa/success?orderId=${order._id}`;
    const failureUrl = `${window.location.origin}/payment/esewa/failure?orderId=${order._id}`;

    const fields = {
      amt: Number(order.subtotal ?? subtotal ?? 0),
      psc: 0,
      pdc: Number(order.shipping ?? shippingFee ?? 0),
      txAmt: 0,
      tAmt: Number(order.total ?? total ?? 0),
      pid: order._id,
      scd: esewaMerchantCode,
      su: successUrl,
      fu: failureUrl,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    toast('Redirecting to eSewa…');
  };

  const openKhaltiCheckout = async (order) => {
    if (!khaltiPublicKey) {
      toast.error('Missing Khalti public key. Set VITE_KHALTI_PUBLIC_KEY in your .env file.');
      return;
    }
    if (!window.KhaltiCheckout) {
      toast.error('Khalti payment library is not ready. Please try again.');
      return;
    }

    const checkout = new window.KhaltiCheckout({
      publicKey: khaltiPublicKey,
      productIdentity: order._id,
      productName: `BookStore Order ${order._id.slice(-6)}`,
      productUrl: `${window.location.origin}/orders`,
      eventHandler: {
        onSuccess: async (payload) => {
          try {
            await verifyKhaltiPayment({ orderId: order._id, token: payload.token });
            toast.success('Payment verified successfully');
            invalidateOrderQueries();
            navigate('/orders', { replace: true });
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to verify Khalti payment');
          }
        },
        onError: (error) => {
          toast.error(error?.message || 'Khalti payment failed');
        },
        onClose: () => {
          // User closed the popup; keep order pending
          toast('Khalti payment cancelled. You can try again.');
        },
      },
    });

    checkout.show({ amount: Math.round((order.total || total) * 100) });
  };

  const handleCreateOrder = async () => {
    try {
      const order = await createOrderMut.mutateAsync({
        paymentMethod,
        shipping: Number(shippingFee),
      });

      if (paymentMethod === 'esewa') {
        submitEsewaPayment(order);
        return;
      }

      if (paymentMethod === 'khalti') {
        openKhaltiCheckout(order);
        return;
      }

      // COD or other future offline methods
      toast.success('Order placed successfully');
      invalidateOrderQueries();
      navigate('/orders', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate checkout');
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Background />
        <div className="relative z-10">
          <Typography variant="h5">Loading checkout…</Typography>
        </div>
      </Container>
    );
  }

  if (!items.length) {
    return (
      <Container sx={{ py: 4 }}>
        <Background />
        <div className="relative z-10">
          <Alert severity="info" sx={{ mb: 3 }}>
            Your cart is empty. Add books to your cart before checking out.
          </Alert>
          <Button variant="contained" onClick={() => navigate('/books')}>Browse Books</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Typography variant="h4" gutterBottom>
          Payment & Confirmation
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Paper sx={{ flex: 2, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              {items.map((item) => (
                <Box key={item.book._id} display="flex" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="subtitle1">{item.book.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity} · Unit: {formatCurrency(item.book.price)}
                    </Typography>
                  </div>
                  <Typography variant="subtitle1">
                    {formatCurrency((item.book.price || 0) * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Shipping</Typography>
              <Typography variant="body1">{formatCurrency(shippingFee)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" fontWeight="bold">
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{formatCurrency(total)}</Typography>
            </Box>
          </Paper>

          <Paper sx={{ flex: 1, p: 3 }}>
            <Stack spacing={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {paymentOptions.map((option) => (
                    <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
                  ))}
                </RadioGroup>
              </FormControl>

              <FormControl component="fieldset">
                <FormLabel component="legend">Shipping</FormLabel>
                <RadioGroup
                  value={String(shippingFee)}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                >
                  {shippingOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={String(option.value)}
                      control={<Radio />}
                      label={option.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={createOrderMut.isPending}
                  onClick={handleCreateOrder}
                >
                  {createOrderMut.isPending ? 'Processing…' : 'Confirm & Pay'}
                </Button>
                <Button variant="text" onClick={() => navigate('/cart')} disabled={createOrderMut.isPending}>
                  Back to Cart
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </div>
    </Container>
  );
}
