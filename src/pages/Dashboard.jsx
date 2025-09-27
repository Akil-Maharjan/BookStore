import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth.js';
import Background from '../components/Background.jsx';

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();
  const admin = isAdmin();
  if (loading) return null;

  const buttonSx = {
    mt: 2,
    px: 3,
    py: 1.5,
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 600,
    backgroundColor: '#f43f5e',
    boxShadow: '0 10px 20px -12px rgba(244,63,94,0.65)',
    '&:hover': {
      backgroundColor: '#fb7185',
      boxShadow: '0 12px 24px -10px rgba(244,63,94,0.75)',
    },
  };

  const outlinedButtonSx = {
    ...buttonSx,
    backgroundColor: 'transparent',
    border: '1px solid rgba(248,113,113,0.6)',
    color: '#f8fafc',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'rgba(248,113,113,0.1)',
      borderColor: '#fb7185',
      boxShadow: 'none',
    },
  };

  const textButtonSx = {
    ...buttonSx,
    backgroundColor: 'rgba(148,163,184,0.1)',
    color: '#f8fafc',
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: 'rgba(148,163,184,0.18)',
      boxShadow: 'none',
    },
    '&:disabled': {
      backgroundColor: 'rgba(148,163,184,0.1)',
      color: '#f8fafc',
      cursor: 'not-allowed',
    },
  };

  const cardSx = {
    p: 3,
    height: '100%',
    borderRadius: 3,
    background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(30,41,59,0.8))',
    border: '1px solid rgba(148,163,184,0.25)',
    color: '#e2e8f0',
    boxShadow: '0 18px 36px -20px rgba(15,23,42,0.8)',
  };

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ py: 6 }}
      maxWidth="lg"
    >
      <Background />
      <div className="relative z-10">
      <Typography variant="h4" sx={{ color: '#f8fafc', fontWeight: 700 }} gutterBottom>
        Welcome{user ? `, ${user.name}` : ''}
      </Typography>
     

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={cardSx}>
            <Typography variant="h6">Browse Books</Typography>
            <Typography variant="body2" color="white">Explore our collection and add to your cart.</Typography>
            <Button variant="contained"  sx={buttonSx} component={Link} to="/books">Go to Books</Button>
          </Paper>
        </Grid>

        {!admin && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Your Orders</Typography>
                <Typography variant="body2" color="white">Track your past purchases and statuses.</Typography>
                <Button variant="contained"  sx={buttonSx} component={Link} to="/orders">View Orders</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Your Cart</Typography>
                <Typography variant="body2" color="white">View and manage items in your cart.</Typography>
                <Button variant="contained"  sx={buttonSx} component={Link} to="/cart">View Cart</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Wishlist</Typography>
                <Typography variant="body2" color="white">Save books you love to revisit later. Coming soon!</Typography>
                <Button variant="text" sx={{ ...textButtonSx, mt: 2 }}  disabled>Launching Soon</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Account & Settings</Typography>
                <Typography variant="body2" color="white">Manage addresses, payment options, and profile details.</Typography>
                <Button variant="contained"  sx={buttonSx} component={Link} to="/dashboard#account">Edit Profile</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Reading Goals</Typography>
                <Typography variant="body2" color="white">Set personal goals and track your reading habits. Coming soon!</Typography>
                <Button variant="text" sx={{ ...textButtonSx, mt: 2 }} disabled>In Planning</Button>
              </Paper>
            </Grid>
          </>
        )}

        {admin && (
          <>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Orders</Typography>
                <Typography variant="body2" color="white">Review all orders placed by users.</Typography>
                <Button variant="outlined" sx={outlinedButtonSx} component={Link} to="/admin/orders">View Orders</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Admin Panel</Typography>
                <Typography variant="body2" color="white">Add, edit, or delete books.</Typography>
                <Button variant="contained" sx={buttonSx} component={Link} to="/admin/books">Manage Books</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Sales Overview</Typography>
                <Typography variant="body2" color="white">Monitor revenue trends and best-selling titles. Dashboard coming soon.</Typography>
                <Button variant="text" sx={{ ...textButtonSx, mt: 2 }} disabled>In Development</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Customer Messages</Typography>
                <Typography variant="body2" color="white">Review user feedback and support tickets.</Typography>
                <Button variant="text" sx={{ ...textButtonSx, mt: 2 }} disabled>Coming Soon</Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={cardSx}>
                <Typography variant="h6">Inventory Alerts</Typography>
                <Typography variant="body2" color="white">Stay updated on low-stock and restocking needs.</Typography>
                <Button variant="text" sx={{ ...textButtonSx, mt: 2 }} disabled>Planning Stage</Button>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      </div>
    </Container>
  );
}
