
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useUserRole = () => {
  const { user } = useUser();
  const [userDb, setUserDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // 1. Try to fetch user
      const res = await axios.get(`/api/users/${user.id}`);
      setUserDb(res.data);
      setIsLoading(false);
    } catch (err) {
      if (err.response?.status === 404) {
        console.log("User not found. Creating...");

        try {
          await axios.post("/api/users", {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
          });

          console.log("User created. Waiting briefly before fetching...");

          // Wait before re-fetching to give MongoDB time
          setTimeout(async () => {
            try {
              const retryRes = await axios.get(`/api/users/${user.id}`);
              setUserDb(retryRes.data);
            } catch (retryErr) {
              console.error("Retry fetch failed:", retryErr);
            } finally {
              setIsLoading(false);
            }
          }, 500); // delay before fetch
        } catch (createErr) {
          console.error("Error creating user:", createErr);
          setIsLoading(false);
        }
      } else {
        console.error("Fetch failed:", err);
        setIsLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchUser();
  }, [user, fetchUser]);

  return { userDb, isLoading, refetchUser: fetchUser };
};

export default useUserRole;
=======
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



