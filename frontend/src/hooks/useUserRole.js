import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const useUserRole = () => {
  const { isSignedIn, userId } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isSignedIn || !userId) {
        setIsLoading(false);
        return;
      }

      // Only check role if we haven't already

      try {
        console.log('Checking user role for userId:', userId);
        const response = await axios.get('/profile', {
          headers: {
            'x-user-id': userId
          }
        });
        
        
          console.log('Profile response:', response.data);
          if (response.data) {
            // Set the role (even if null)
            setUserRole(response.data.role);
            console.log('Set user role to:', response.data.role);
          }
        
      } catch (err) {
        
          console.error('Error checking role:', err);
          setError(err.message);
          setUserRole(null);
        
      } finally {
        
        setIsLoading(false);
        
      }
    };

    checkUserRole();
  }, [isSignedIn, userId]);

  const updateUserRole = async (newRole) => {
    try {
      console.log('Updating role to:', newRole, 'for userId:', userId);
      const response = await axios.put(`/updateEmployee/${userId}`, { role: newRole });
      console.log('Update response:', response.data);
      
      if (response.data) {
        setUserRole(newRole);
        localStorage.setItem('userRole', newRole);
        console.log('Role updated successfully');
        return true;
      }
      console.log('Role update failed - no response data');
      return false;
    } catch (err) {
      console.error('Error updating role:', err);
      
      setError(err.message);
      
      return false;
    }
  };

  return { userRole, isLoading, error, updateUserRole };
};

export default useUserRole; 


