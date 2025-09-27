import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Typography, Paper, Stack, CircularProgress, Button, Alert } from '@mui/material';
import toast from 'react-hot-toast';
import Background from '../../components/Background.jsx';
import { verifyEsewaPayment } from '../../api/payments.js';

export default function EsewaSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const orderId = searchParams.get('orderId') || searchParams.get('oid') || '';
  const refId = searchParams.get('refId') || '';
  const amt = searchParams.get('amt') || undefined;

  const missingParams = useMemo(() => !orderId || !refId, [orderId, refId]);

  const verifyMut = useMutation({
    mutationFn: () => verifyEsewaPayment({ orderId, refId, amt }),
    onSuccess: () => {
      toast.success('eSewa payment verified');
      qc.invalidateQueries({ queryKey: ['orders', { scope: 'mine' }] });
      qc.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to verify eSewa payment');
    },
  });

  useEffect(() => {
    if (missingParams) return;
    verifyMut.mutate();
  }, [missingParams, verifyMut]);

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Typography variant="h4" gutterBottom>
          eSewa Payment Confirmation
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            {missingParams && (
              <Alert severity="error">
                Missing payment confirmation details. Please contact support if the problem persists.
              </Alert>
            )}
            {!missingParams && verifyMut.isPending && (
              <Stack direction="row" alignItems="center" spacing={2}>
                <CircularProgress size={28} />
                <Typography>Verifying your payment…</Typography>
              </Stack>
            )}
            {verifyMut.isSuccess && (
              <Alert severity="success">
                Your payment has been verified. Thank you for your purchase!
              </Alert>
            )}
            {verifyMut.isError && !verifyMut.isPending && (
              <Alert severity="error">
                {verifyMut.error?.response?.data?.message || 'Unable to verify payment. Please reach out to support.'}
              </Alert>
            )}
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => navigate('/orders')}>
                View My Orders
              </Button>
              <Button variant="outlined" onClick={() => navigate('/books')}>
                Continue Shopping
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </div>
    </Container>
  );
}
