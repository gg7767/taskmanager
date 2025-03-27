import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { userRole, isLoading } = useUserRole();
  console.log(userRole)
  console.log(isLoading)
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