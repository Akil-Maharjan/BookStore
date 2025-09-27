import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Typography, Paper, Stack, Alert, Button } from '@mui/material';
import Background from '../../components/Background.jsx';

export default function EsewaFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId') || searchParams.get('oid') || '';
  const message = searchParams.get('message') || 'The payment was not completed.';

  return (
    <Container sx={{ py: 4 }}>
      <Background />
      <div className="relative z-10">
        <Typography variant="h4" gutterBottom>
          eSewa Payment Failed
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Alert severity="error">
              {message}
              {orderId && (
                <>
                  {' '}
                  (Order reference: <strong>{orderId}</strong>)
                </>
              )}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              If this was unexpected, you may try the payment again or choose a different payment method.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => navigate('/checkout')}>
                Retry Payment
              </Button>
              <Button variant="outlined" onClick={() => navigate('/cart')}>
                Return to Cart
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </div>
    </Container>
  );
}
