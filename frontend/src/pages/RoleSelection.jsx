
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import useUserRole from "../hooks/useUserRole";
import axios from "axios";

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { userDb, isLoading, refetchUser } = useUserRole();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && userDb?.role) {
      navigate(`/${userDb.role}`);
    }
  }, [isLoading, userDb, navigate]);

  const handleRoleSelect = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}`, { role: selectedRole });
      await refetchUser();
      navigate(`/${selectedRole}`);
    } catch (err) {
      console.error("Error updating role:", err);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>

      </div>
    );
  }


  return (
    <div className="flex justify-center items-center h-screen bg-gray-50 transition-opacity duration-500">
      <div className="p-8 bg-white rounded-2xl shadow-lg text-center w-80">
        <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
        <div className="flex flex-col gap-4">
          {["employee", "manager", "leadership"].map((role) => (
            <button
              key={role}
              className={`px-6 py-2 rounded-full border-2 font-medium capitalize transition-all duration-300 ${
                selectedRole === role
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
        <button
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
          onClick={handleRoleSelect}
          disabled={!selectedRole || loading}
        >
          {loading ? "Assigning..." : "Confirm Role"}
        </button>

      </div>
    </div>
  );
};


export default RoleSelection;

