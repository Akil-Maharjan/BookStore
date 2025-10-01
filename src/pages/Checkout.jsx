import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Paper,
  Stack,
  Box,
  Divider,
  Button,
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
  const [esewaDetails, setEsewaDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [khaltiDetails, setKhaltiDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
  });
  const [paymentError, setPaymentError] = useState('');

  const items = useMemo(() => cart?.items || [], [cart?.items]);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.book?.price_npr ?? 0) * Number(item.quantity ?? 0),
        0
      ),
    [items]
  );
  const total = useMemo(() => Number(subtotal) + Number(shippingFee ?? 0), [subtotal, shippingFee]);

  const createOrderMut = useMutation({
    mutationFn: (payload) => createOrder(payload),
  });

  useEffect(() => {
    setPaymentError('');
  }, [paymentMethod]);

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
      const orderItems = items.map((item) => ({
        book: item.book._id,
        title: item.book.title,
        price_npr: Number(item.book?.price_npr ?? 0),
        quantity: Number(item.quantity ?? 0),
      }));

      const orderPayload = {
        paymentMethod,
        shipping: Number(shippingFee ?? 0),
        subtotal: Number(subtotal),
        total: Number(total),
        items: orderItems,
      };

      const order = await createOrderMut.mutateAsync(orderPayload);
      invalidateOrderQueries();

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
      navigate('/orders', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to initiate checkout');
    }
  };

  const isProcessing = createOrderMut.isPending;

  const handleEsewaSubmit = async (event) => {
    event.preventDefault();
    const { fullName, phone, email } = esewaDetails;
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setPaymentError('Please provide your full name, phone number, and email to continue with eSewa.');
      return;
    }
    setPaymentError('');
    await handleCreateOrder();
  };

  const handleKhaltiSubmit = async (event) => {
    event.preventDefault();
    const { fullName, phone, email } = khaltiDetails;
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setPaymentError('Please provide your full name, phone number, and email to continue with Khalti.');
      return;
    }
    setPaymentError('');
    await handleCreateOrder();
  };

  const handleCodSubmit = async () => {
    setPaymentError('');
    await handleCreateOrder();
    scrollTo({top: 0, behavior: 'smooth'});
  };

  if (isLoading) {
    return (
      <div className="relative max-w-[1910px]  bg-slate-950 py-16">
        <Background />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Paper
            elevation={0}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 4, md: 6 },
              borderRadius: '24px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'white',
              backdropFilter: 'blur(18px)',
            }}
          >
            <Typography variant="h5">Loading checkout…</Typography>
          </Paper>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="relative max-w-[1910px] bg-slate-950 py-16">
        <Background />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Paper
            elevation={0}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 4, md: 6 },
              borderRadius: '24px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'white',
              backdropFilter: 'blur(18px)',
            }}
          >
            <Alert severity="info" sx={{ mb: 3 }}>
              Your cart is empty. Add books to your cart before checking out.
            </Alert>
            <Button variant="contained" onClick={() => navigate('/books')}>
              Browse Books
            </Button>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <div className="relative  max-w-[1550px] mx-auto bg-slate-950 py-16">
      <Background />
      <div className="relative z-10 mx-auto flex w-full  flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 text-white">
          <span className="text-xs uppercase tracking-[0.45em] text-emerald-300/80">Checkout</span>
          <h1 className="text-3xl font-semibold sm:text-4xl lg:text-5xl">Payment &amp; Confirmation</h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Review your order details, pick a delivery preference, and choose how you would like to pay.
          </p>
        </div>

        <div className="flex w-full flex-col gap-6 xl:gap-10 lg:flex-row">
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              borderRadius: '26px',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              color: 'white',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: '1 1 60%',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              {items.map((item) => (
                <Box key={item.book._id} display="flex" justifyContent="space-between" alignItems="center">
                  <div className="flex flex-col border-b border-white/10 pb-2 pr-4">
                    <Typography variant="subtitle1">{item.book.title}</Typography>
                    <Typography variant="caption" color="white">
                      Qty: {item.quantity} · Unit: {formatCurrency(item.book.price_npr || 0)}
                    </Typography>
                  </div>
                  <Typography variant="subtitle1">
                    {formatCurrency((item.book.price_npr || 0) * item.quantity)}
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

          <Paper
            elevation={0}
            sx={{
              flex: '1 1 40%',
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 4 },
              borderRadius: '26px',
              backgroundColor: 'rgba(15, 23, 42, 0.82)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="flex h-full flex-col justify-between gap-6 text-white">
              <div className="space-y-3">
                <p className="text-[11px] font-inter uppercase tracking-[0.45em] text-emerald-300/80">
                  Choose Method
                </p>
                <div className="flex rounded-2xl border border-white/10 bg-slate-900/40 p-1">
                  {paymentOptions.map((option) => {
                    const isActive = paymentMethod === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPaymentMethod(option.value)}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-poppins transition md:text-base ${
                          isActive
                            ? 'bg-emerald-400 text-slate-900 shadow-[0_15px_35px_rgba(16,185,129,0.35)]'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:p-5">
                {paymentMethod === 'esewa' && (
                  <form onSubmit={handleEsewaSubmit} className="space-y-4 font-inter text-slate-100">
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={esewaDetails.fullName}
                        onChange={(event) =>
                          setEsewaDetails((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        placeholder="Enter the name on your eSewa account"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        disabled={isProcessing}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={esewaDetails.phone}
                        onChange={(event) =>
                          setEsewaDetails((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        placeholder="eSewa registered phone"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        disabled={isProcessing}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={esewaDetails.email}
                        onChange={(event) =>
                          setEsewaDetails((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="Receipt email"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        disabled={isProcessing}
                        autoComplete="email"
                      />
                    </div>
                    {paymentError && (
                      <p className="text-sm font-inter text-rose-300">{paymentError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-400 px-5 py-2.5 font-poppins text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing…' : 'Proceed with eSewa'}
                    </button>
                  </form>
                )}

                {paymentMethod === 'khalti' && (
                  <form onSubmit={handleKhaltiSubmit} className="space-y-4 font-inter text-slate-100">
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={khaltiDetails.fullName}
                        onChange={(event) =>
                          setKhaltiDetails((prev) => ({ ...prev, fullName: event.target.value }))
                        }
                        placeholder="Name on your Khalti account"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60"
                        disabled={isProcessing}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={khaltiDetails.phone}
                        onChange={(event) =>
                          setKhaltiDetails((prev) => ({ ...prev, phone: event.target.value }))
                        }
                        placeholder="Khalti registered phone"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60"
                        disabled={isProcessing}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-poppins uppercase tracking-wide text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={khaltiDetails.email}
                        onChange={(event) =>
                          setKhaltiDetails((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="Receipt email"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60"
                        disabled={isProcessing}
                        autoComplete="email"
                      />
                    </div>
                    {paymentError && (
                      <p className="text-sm font-inter text-rose-300">{paymentError}</p>
                    )}
                    <button

                      type="submit"
                      className="w-full rounded-xl bg-slate-100 px-5 py-2.5 font-poppins text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isProcessing || !khaltiReady}
                    >
                      {isProcessing ? 'Processing…' : khaltiReady ? 'Pay via Khalti' : 'Loading Khalti…'}
                    </button>
                  </form>
                )}

                {paymentMethod === 'cod' && (
                  <div className="space-y-4 font-inter text-slate-200">
                    <p className="text-sm">
                      Receive your books first and pay in cash upon delivery. Our support team will reach out to
                      confirm your order and delivery window.
                    </p>
                    {paymentError && (
                      <p className="text-sm font-inter text-rose-300">{paymentError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCodSubmit}
                      className="w-full rounded-xl bg-emerald-400 px-5 py-2.5 font-poppins text-sm font-semibold text-slate-900 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Placing order…' : 'Place Order (COD)'}
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 sm:p-5">
                <h3 className="text-lg font-poppins">Delivery Preference</h3>
                <p className="mt-1 text-xs font-inter uppercase tracking-[0.3em] text-slate-400">
                  Choose what suits you best
                </p>
                <div className="mt-4 space-y-2">
                  {shippingOptions.map((option) => {
                    const active = Number(shippingFee) === Number(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setShippingFee(option.value)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                          active
                            ? 'border-emerald-400/80 bg-emerald-400/10 text-white shadow-[0_12px_30px_rgba(16,185,129,0.2)]'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:border-emerald-300/60 hover:bg-white/10'
                        }`}
                        disabled={isProcessing}
                      >
                        <span className="font-inter text-sm sm:text-base">{option.label}</span>
                        <span className="font-poppins text-sm">
                          {option.value ? `+ ${formatCurrency(option.value)}` : 'Free'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 font-inter text-sm text-emerald-100">
                <p>
                  Payments are processed using trusted Nepali gateways. Your sensitive details stay secure, and you
                  can always switch methods before confirming the order.
                </p>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
}
