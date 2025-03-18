import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import tokenService from '../services/tokenService';

// Whitelist of public routes
const PUBLIC_ROUTES = [
  '/login',
  '/Enrollment',
  '/Enrollment/New', 
  '/ForgotPassword',
  '/EnrollConfirm',
  '/VerifyCode',
  '/ChangePassword',
  '/PasswordConfirm'
];

const getDashboardByRole = (role) => {
  switch (role?.toLowerCase()) {
    case 'teacher':
    case 'student_teacher':
      return '/Teacher/Dashboard';
    case 'learner':
      return '/Learner/Dashboard';
    case 'admin':
      return '/Admin/Dashboard';
    default:
      return '/login';
  }
};

export const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  // Skip auth check for public routes
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );

  if (isPublicRoute) {
    return children;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return children;
};

export default PublicRoute;
