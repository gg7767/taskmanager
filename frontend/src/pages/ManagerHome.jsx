import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import useUserRole from "../hooks/useUserRole";
import axios from "axios";

const ManagerHome = () => {
  const { userDb } = useUserRole();
  const [value, setValue] = useState(0);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/api/users/employees");
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleEdit = (id) => {
    navigate(`/updateEmployee/${id}`);
  };

  return (
    <Box sx={{ p: 3, position: "relative", minHeight: "100vh", backgroundColor: "#f7f7f7" }}>
      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        Welcome, {userDb?.role?.charAt(0).toUpperCase() + userDb?.role?.slice(1)}
      </Typography>

      <Tabs
        value={value}
        onChange={handleChange}
        centered
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 4 }}
      >
        <Tab label="Employees" />
        <Tab label="Tasks" />
      </Tabs>

      {value === 0 && (
        <Paper elevation={3} sx={{ p: 3, width: "100%", minHeight: "60vh", overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Pending Tasks</strong></TableCell>
                <TableCell><strong>Completed Tasks</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name || "N/A"}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.pendingTasks}</TableCell>
                    <TableCell>{emp.completedTasks}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleEdit(emp._id)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ borderBottom: "none" }}>
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
                      <Typography variant="h6" gutterBottom>
                        No Employees Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Once you add employees, they'll appear here.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Box sx={{ position: "fixed", bottom: 32, right: 32 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          sx={{ borderRadius: "24px", px: 3, boxShadow: 3 }}
          onClick={() => navigate("/createTask")}
        >
          Add Employee
        </Button>
      </Box>

      {value === 1 && (
        <Typography variant="body1" textAlign="center">
          Tasks tab coming soon...
        </Typography>
      )}
    </Box>
  );
};

export default ManagerHome;
