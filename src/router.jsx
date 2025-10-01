import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AdminGuard } from './routes/AdminGuard.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Books = lazy(() => import('./pages/Books.jsx'));
const BookDetail = lazy(() => import('./pages/BookDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const EsewaSuccess = lazy(() => import('./pages/payment/EsewaSuccess.jsx'));
const EsewaFailure = lazy(() => import('./pages/payment/EsewaFailure.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Features = lazy(() => import('./pages/Features.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const AdminBooksList = lazy(() => import('./pages/admin/AdminBooksList.jsx'));
const AdminBookForm = lazy(() => import('./pages/admin/AdminBookForm.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));

const RouteFallback = () => (
  <div className="flex items-center justify-center py-32 text-slate-300">
    Loading…
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
