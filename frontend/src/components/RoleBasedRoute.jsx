import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const { userRole, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && userRole && !allowedRoles.includes(userRole)) {
      window.location.href = `/${userRole}`;
    }
  }, [userRole, isLoading, allowedRoles]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userRole) {
    return <Navigate to="/role-selection" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default RoleBasedRoute; 