import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = useSelector((state) => state.user.currentUser);

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // User's role is not authorized, redirect to home page
    return <Navigate to="/home" replace />;
  }

  // Authorized, render children
  return children;
};

export default ProtectedRoute;
