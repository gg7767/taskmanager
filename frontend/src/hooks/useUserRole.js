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
