import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserRole from '../hooks/useUserRole';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { updateUserRole, userRole, isLoading: isRoleLoading } = useUserRole();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const hasRedirected = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Redirect if user already has a role
  useEffect(() => {
    if (userRole && !hasRedirected.current && !isRoleLoading && isMounted.current) {
      console.log('User already has role:', userRole);
      hasRedirected.current = true;
      // Use window.location for a full page reload
      window.location.href = `/${userRole}`;
    }
  }, [userRole, isRoleLoading]);

  const handleRoleSelect = async (role) => {
    if (isUpdating) return;
    
    try {
      console.log('Starting role selection for:', role);
      setIsUpdating(true);
      setError(null);
      
      const success = await updateUserRole(role);
      console.log('Role update success:', success);
      
      if (success && isMounted.current) {
        console.log('Role updated successfully, navigating to:', `/${role}`);
        // Use window.location for a full page reload
        window.location.href = `/${role}`;
      } else {
        console.error('Role update failed');
        if (isMounted.current) {
          setError('Failed to update role. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error in handleRoleSelect:', err);
      if (isMounted.current) {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsUpdating(false);
      }
    }
  };

  // Show loading state only while initially checking role
  if (isRoleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user already has a role, show redirecting state
  if (userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show role selection if no role is set
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Select Your Role
          </h2>
        </div>
        {error && (
          <div className="text-red-500 text-center text-sm">
            {error}
          </div>
        )}
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleRoleSelect('employee')}
            disabled={isUpdating}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Employee'}
          </button>
          <button
            onClick={() => handleRoleSelect('manager')}
            disabled={isUpdating}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Manager'}
          </button>
          <button
            onClick={() => handleRoleSelect('leadership')}
            disabled={isUpdating}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Leadership'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 