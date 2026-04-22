import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, requireManagerAccount }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />; // Redirect unauthenticated users to home/login
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect users without the required role
  }

  if (requireManagerAccount && !user.managerAccount) {
    return <Navigate to="/manager" replace />;
  }

  return children;
};

export default ProtectedRoute;
