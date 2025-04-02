
import React from 'react';

import { Navigate } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

const RoleBasedRoute = ({ children, allowedRoles }) => {

  const { userDb, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  // If no role is set, redirect to role selection
  if (!userDb.role) {
    console.log("no role after selection")
    return <Navigate to="/role-selection" replace />;
  }

  if (allowedRoles.includes(userDb.role)) {
    // Role is allowed; render the component
    return children;
  } else {
    // Role is not allowed; redirect user to their appropriate dashboard
    console.warn(`Role '${userDb.role}' not allowed here. Redirecting...`);
    return <Navigate to={`/${userDb.role}`} replace />;
  }

  
};

export default RoleBasedRoute;
