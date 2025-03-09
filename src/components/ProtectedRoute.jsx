import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const location = useLocation();
  
  if (isAuthenticated()) {
    // Redirect to dashboard if user is already logged in
    return <Navigate to="/Admin/Dashboard" state={{ from: location }} replace />;
  }

  return children;
};
