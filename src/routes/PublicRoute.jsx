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

export const PublicRoute = ({ children }) => {
  const location = useLocation();
  
  if (isAuthenticated()) {
    const userRole = getUserRole();
    const dashboard = getDashboardByRole(userRole);
    return <Navigate to={dashboard} state={{ from: location }} replace />;
  }

  return children;
};
