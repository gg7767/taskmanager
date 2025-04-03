// src/pages/AddEmployee.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Checkbox,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Stack,
  TextField,
  Button,
  useTheme,
  Grid
} from "@mui/material";
import axios from "axios";
import useUserRole from "../hooks/useUserRole";
import { useUser, useOrganization } from "@clerk/clerk-react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Person, Email, Work } from "@mui/icons-material";

const AddEmployee = () => {
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { userDb } = useUserRole();
  const { user } = useUser();
  const { organization } = useOrganization();
  const theme = useTheme();

  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/users/available-employees", { withCredentials: true });

        const employees = await Promise.all(res.data.map(async emp => {
          const clerkRes = await axios.get(`/api/clerk/user/${emp.clerkId}`);
          const clerkUser = clerkRes.data;

          return {
            ...emp,
            name: clerkUser.first_name && clerkUser.last_name
              ? `${clerkUser.first_name} ${clerkUser.last_name}`
              : emp.email.split('@')[0],
            initials: clerkUser.first_name?.charAt(0) + (clerkUser.last_name?.charAt(0) || emp.email.charAt(0)).toUpperCase(),
            imageUrl: clerkUser.image_url
          };
        }));

        setAvailableEmployees(employees);
        setFilteredEmployees(employees);
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to load available employees", {
          position: "bottom-left",
          autoClose: 3000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableEmployees();
  }, [user]);

  useEffect(() => {
    const filtered = availableEmployees.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, availableEmployees]);

  const handleToggle = (employeeId) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
    );
  };

  const handleSubmit = async () => {
    try {
      await Promise.all(selectedEmployeeIds.map(id =>
        axios.post("/api/users/assign-employee", {
          managerId: userDb._id,
          employeeId: id,
        })
      ));

      toast.success("Employees assigned successfully", {
        position: "bottom-left",
        autoClose: 3000
      });
      window.location.href = "/manager";
    } catch (err) {
      console.error("Error assigning employees:", err);
      toast.error("Failed to assign employees", {
        position: "bottom-left",
        autoClose: 3000
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'manager': return 'primary';
      case 'employee': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Typography variant="h4" fontWeight="bold" mb={4} textAlign="center">
        Assign Employees
      </Typography>

      <Box maxWidth={500} mx="auto" mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper elevation={3} sx={{ borderRadius: 3, maxWidth: 700, mx: 'auto', p: 2 }}>
            <List>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <React.Fragment key={employee._id}>
                    <ListItem alignItems="flex-start" sx={{ width: '100%', alignItems: 'center' }}>
                      <Grid container alignItems="center">
                        <Grid item>
                          <Checkbox
                            checked={selectedEmployeeIds.includes(employee._id)}
                            onChange={() => handleToggle(employee._id)}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item>
                          <ListItemAvatar>
                            <Avatar
                              src={employee.imageUrl || undefined}
                              sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}
                            >
                              {employee.initials}
                            </Avatar>
                          </ListItemAvatar>
                        </Grid>
                        <Grid item xs>
                          <ListItemText
                            primary={
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6">{employee.name}</Typography>
                                <Chip label={employee.role || 'employee'} color={getRoleColor(employee.role)} size="small" icon={<Work fontSize="small" />} />
                              </Stack>
                            }
                            secondary={
                              <Box mt={1}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Email fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">{employee.email}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={2} mt={1.5}>
                                  <Chip label={`${employee.pendingTasks} pending tasks`} variant="outlined" size="small" />
                                  <Chip label={`${employee.completedTasks} completed`} variant="outlined" size="small" color="success" />
                                </Stack>
                              </Box>
                            }
                            sx={{ ml: 2 }}
                          />
                        </Grid>
                      </Grid>
                    </ListItem>
                    {index < filteredEmployees.length - 1 && <Divider variant="inset" />}
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Person sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No unassigned employees available</Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>All employees have been assigned to managers</Typography>
                </Box>
              )}
            </List>
          </Paper>

          {selectedEmployeeIds.length > 0 && (
            <Box maxWidth={700} mx="auto" mt={4} textAlign="center">
              <Typography variant="subtitle1" gutterBottom>
                Selected Employees: {selectedEmployeeIds.length}
              </Typography>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Assign Selected Employees
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AddEmployee;
