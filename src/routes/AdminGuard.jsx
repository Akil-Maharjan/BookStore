import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.js";

export const AdminGuard = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};
