// src/pages/ManagerHome.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUserRole from "../hooks/useUserRole";

const ManagerHome = () => {
  const { user } = useUser();
  const { userDb } = useUserRole();
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeesWithNames = async () => {
      try {
        const res = await axios.get(`/api/employees/manager/${userDb._id}`);
        const employees = res.data;

        const withNames = await Promise.all(employees.map(async (emp) => {
          try {
            const clerkRes = await axios.get(`/api/clerk/user/${emp.clerkId}`);
            const clerkData = clerkRes.data;
            return {
              ...emp,
              name: clerkData.first_name && clerkData.last_name
                ? `${clerkData.first_name} ${clerkData.last_name}`
                : emp.email.split("@")[0],
            };
          } catch (err) {
            console.error("Clerk fetch error for user", emp.clerkId, err);
            return {
              ...emp,
              name: emp.email.split("@")[0]
            };
          }
        }));

        setEmployees(withNames);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    if (userDb && userDb._id) {
      fetchEmployeesWithNames();
    }
  }, [userDb]);

  return (
    <Box sx={{ p: 4, minHeight: "100vh", position: "relative", bgcolor: "#f8f9fa" }}>
      <Typography variant="h4" gutterBottom align="center">
        Welcome, Manager
      </Typography>

      <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1100, mx: "auto" }}>
        {employees.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 300,
            }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/3595/3595455.png"
              alt="No employees"
              width={120}
              style={{ marginBottom: 16 }}
            />
            <Typography variant="h6" color="text.secondary">
              No employees assigned yet
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f1f1f1' }}>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Pending Tasks</strong></TableCell>
                <TableCell><strong>Completed Tasks</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp._id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.pendingTasks}</TableCell>
                  <TableCell>{emp.completedTasks}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="primary" size="small">
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          borderRadius: "50px",
          textTransform: "none",
          px: 3,
          py: 1.5,
        }}
        onClick={() => navigate("/manager/add-employee")}
      >
        Add Employee
      </Button>
    </Box>
  );
};

export default ManagerHome;
