import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Books from './pages/Books.jsx';
import BookDetail from './pages/BookDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import EsewaSuccess from './pages/payment/EsewaSuccess.jsx';
import EsewaFailure from './pages/payment/EsewaFailure.jsx';
import About from './pages/About.jsx';
import Features from './pages/Features.jsx';
import Contact from './pages/Contact.jsx';
import AdminBooksList from './pages/admin/AdminBooksList.jsx';
import AdminBookForm from './pages/admin/AdminBookForm.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminGuard } from './routes/AdminGuard.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/payment/esewa/success" element={<ProtectedRoute><EsewaSuccess /></ProtectedRoute>} />
      <Route path="/payment/esewa/failure" element={<ProtectedRoute><EsewaFailure /></ProtectedRoute>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Admin area but not separate /admin landing; pages guarded and navigated by role */}
      <Route path="/admin/books" element={<AdminGuard><AdminBooksList /></AdminGuard>} />
      <Route path="/admin/books/new" element={<AdminGuard><AdminBookForm mode="create" /></AdminGuard>} />
      <Route path="/admin/books/:id/edit" element={<AdminGuard><AdminBookForm mode="edit" /></AdminGuard>} />
      <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
