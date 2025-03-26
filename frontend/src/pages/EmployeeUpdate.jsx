import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";

const EmployeeUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    password: "", // Add password field
    // Add other employee fields here
  });

  useEffect(() => {
    // Fetch employee data based on the ID from the URL parameter
    axios.get(`/employee/${id}`).then((response) => {
      setEmployee(response.data);
    });
  }, [id]);

  const handleUpdateEmployee = () => {
    // Send a PUT request to update the employee data, including the password
    axios
      .put(`/updateEmployee/${id}`, employee)
      .then((response) => {
        // Employee updated successfully, show a toast message
        toast.success("Employee updated successfully", {
          position: "bottom-left",
          autoClose: 3000, // Auto close the toast after 3 seconds (adjust as needed)
        });
  
        // You can navigate back to the employee list page if needed
        navigate("/manager");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-6">Update Employee</h1>
      <form className="w-full max-w-xl mx-auto">
        <div className="mb-4">
          <TextField
            label="Name"
            fullWidth
            value={employee.name}
            onChange={(e) =>
              setEmployee({ ...employee, name: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <TextField
            label="Email"
            fullWidth
            value={employee.email}
            onChange={(e) =>
              setEmployee({ ...employee, email: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={employee.password}
            onChange={(e) =>
              setEmployee({ ...employee, password: e.target.value })
            }
          />
        </div>
        {/* Add other fields for updating */}
        <Button
          variant="contained"
          onClick={handleUpdateEmployee}
          fullWidth
          className="mt-4"
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default EmployeeUpdate;
