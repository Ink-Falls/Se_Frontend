import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { validateAuth, getUserRole } from '../utils/auth';

// Whitelist of routes that don't need auth checking
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
  const [state, setState] = useState({
    loading: true,
    authenticated: false,
    error: null
  });

  const checkAuth = useCallback(async () => {
    // Skip auth check for public routes
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      location.pathname.toLowerCase().startsWith(route.toLowerCase())
    );

    if (isPublicRoute) {
      setState({ loading: false, authenticated: false, error: null });
      return;
    }

    try {
      const data = await validateAuth();
      
      if (data.valid) {
        const userRole = getUserRole();
        const dashboard = getDashboardByRole(userRole);
        setState({
          loading: false,
          authenticated: true,
          redirectTo: dashboard,
          error: null
        });
      } else {
        setState({
          loading: false,
          authenticated: false,
          error: null
        });
      }
    } catch (error) {
      setState({
        loading: false,
        authenticated: false,
        error: error.message
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (state.authenticated && state.redirectTo) {
    return <Navigate to={state.redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default PublicRoute;
