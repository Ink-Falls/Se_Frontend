import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
