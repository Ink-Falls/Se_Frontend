import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Higher Order Component that restricts access to certain roles
 *
 * @param {React.Component} Component - The component to wrap
 * @param {string[]} allowedRoles - Array of roles allowed to access this component
 * @returns {React.Component} - The wrapped component with role-based access control
 */
const withAuth = (Component, allowedRoles = []) => {
  const WithAuthComponent = (props) => {
    const { user, isAuthenticated } = useAuth();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // If authenticated but role is not allowed, redirect to unauthorized page
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user?.role?.toLowerCase())
    ) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Otherwise, render the protected component
    return <Component {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
