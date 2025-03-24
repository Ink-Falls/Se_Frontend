import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};
