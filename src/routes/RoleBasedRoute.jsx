import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

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

// Role-based access control (RBAC)
export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole();
  
  if (!userRole || !allowedRoles.includes(userRole.toLowerCase())) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};
