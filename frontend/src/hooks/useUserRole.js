import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const useUserRole = () => {
  const { isSignedIn, userId } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasCheckedRole = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      // Only check role if we haven't already
      if (hasCheckedRole.current) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Checking user role for userId:', userId);
        const response = await axios.get('/profile', {
          headers: {
            'x-user-id': userId
          }
        });
        
        if (isMounted.current) {
          console.log('Profile response:', response.data);
          if (response.data) {
            // Set the role (even if null)
            setUserRole(response.data.role);
            console.log('Set user role to:', response.data.role);
            hasCheckedRole.current = true;
          }
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Error checking role:', err);
          setError(err.message);
          setUserRole(null);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkUserRole();
  }, [isSignedIn, userId]);

  const updateUserRole = async (newRole) => {
    try {
      console.log('Updating role to:', newRole, 'for userId:', userId);
      const response = await axios.put(`/updateEmployee/${userId}`, { role: newRole });
      console.log('Update response:', response.data);
      
      if (response.data && isMounted.current) {
        setUserRole(newRole);
        localStorage.setItem('userRole', newRole);
        console.log('Role updated successfully');
        return true;
      }
      console.log('Role update failed - no response data');
      return false;
    } catch (err) {
      console.error('Error updating role:', err);
      if (isMounted.current) {
        setError(err.message);
      }
      return false;
    }
  };

  return { userRole, isLoading, error, updateUserRole };
};

export default useUserRole; 