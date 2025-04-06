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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import useUserRole from "../hooks/useUserRole";

const ManagerHome = () => {
  const { user } = useUser();
  const { userDb } = useUserRole();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const defaultTab = parseInt(query.get("tab")) || 0;
  const [tab, setTab] = useState(defaultTab);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeesWithDetails = async () => {
      try {
        const res = await axios.get(`/api/employees/manager/${userDb._id}`);
        const employees = res.data;

        const enriched = await Promise.all(
          employees.map(async (emp) => {
            const clerkName = await axios.get(`/api/clerk/user/${emp.clerkId}`).then(res => {
              const c = res.data;
              return c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : emp.email.split("@")[0];
            }).catch(() => emp.email.split("@")[0]);

            const pending = await axios.get(`/api/tasks/user/${emp._id}/pending-count`).then(r => r.data.count).catch(() => 0);
            const completed = await axios.get(`/api/tasks/user/${emp._id}/completed-count`).then(r => r.data.count).catch(() => 0);

            return { ...emp, name: clerkName, pendingTasks: pending, completedTasks: completed };
          })
        );

        setEmployees(enriched);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`/api/tasks/manager/${userDb._id}`);
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    if (userDb && userDb._id) {
      fetchEmployeesWithDetails();
      fetchTasks();
    }
  }, [userDb]);

  const handleTabChange = (e, newVal) => {
    setTab(newVal);
    const queryParams = new URLSearchParams(location.search);
    queryParams.set("tab", newVal);
    navigate({ search: queryParams.toString() });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/tasks/${selectedTaskId}`);
      setTasks(prev => prev.filter(t => t._id !== selectedTaskId));
      setConfirmOpen(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", position: "relative", bgcolor: "#f8f9fa" }}>
      <Typography variant="h4" gutterBottom align="center">
        Welcome, Manager
      </Typography>

      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="Employees" />
        <Tab label="Tasks" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1100, mx: "auto" }}>
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
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1100, mx: "auto" }}>
          {tasks.length === 0 ? (
            <Box sx={{ textAlign: "center", p: 4 }}>
              <Typography variant="h6" color="text.secondary">No tasks created yet.</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f1f1f1' }}>
                  <TableCell><strong>Task</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Deadline</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.userName}</TableCell>
                    <TableCell>
                      <Chip
                        label={task.completed ? "Completed" : "Pending"}
                        color={task.completed ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => navigate(`/manager/create-task?tab=1&edit=${task._id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => {
                        setSelectedTaskId(task._id);
                        setConfirmOpen(true);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton color="info" onClick={() => navigate(`/task/${task._id}/discussion`)}>
                        <ChatBubbleOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this task?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

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
        onClick={() =>
          tab === 0
            ? navigate("/manager/add-employee?tab=0")
            : navigate("/manager/create-task?tab=1")
        }
      >
        {tab === 0 ? "Add Employee" : "Create Task"}
      </Button>
    </Box>
  );
};

export default ManagerHome;
