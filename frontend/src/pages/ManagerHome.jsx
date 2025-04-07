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
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  Fade,
  TextField,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeesWithDetails = async () => {
      try {
        const res = await axios.get(`/api/employees/manager/${userDb._id}`);
        const employees = res.data;

        const enriched = await Promise.all(
          employees.map(async (emp) => {
            const clerkName = await axios
              .get(`/api/clerk/user/${emp.clerkId}`)
              .then((res) => {
                const c = res.data;
                return c.first_name && c.last_name
                  ? `${c.first_name} ${c.last_name}`
                  : emp.email.split("@")[0];
              })
              .catch(() => emp.email.split("@")[0]);

            const pending = await axios
              .get(`/api/tasks/user/${emp._id}/pending-count`)
              .then((r) => r.data.count)
              .catch(() => 0);
            const completed = await axios
              .get(`/api/tasks/user/${emp._id}/completed-count`)
              .then((r) => r.data.count)
              .catch(() => 0);

            return {
              ...emp,
              name: clerkName,
              pendingTasks: pending,
              completedTasks: completed,
            };
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
      setTasks((prev) => prev.filter((t) => t._id !== selectedTaskId));
      setConfirmOpen(false);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Task", "Description", "Assigned To", "Status", "Deadline"],
      ...filteredTasks.map((t) => [
        t.name,
        t.description,
        t.userName,
        t.completed ? "Completed" : "Pending",
        new Date(t.deadline).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tasks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? task.completed : !task.completed);
    const matchesAssignee =
      assigneeFilter === "all" || task.userName === assigneeFilter;
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesAssignee && matchesSearch;
  });

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
        <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1000, mx: "auto" }}>
          {employees.length === 0 ? (
            <Typography align="center">No employees found.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f1f1f1" }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Pending Tasks</strong></TableCell>
                  <TableCell><strong>Completed Tasks</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.pendingTasks}</TableCell>
                    <TableCell>{emp.completedTasks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}


      {tab === 1 && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1200, mx: "auto" }}>
          <Stack spacing={2} mb={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap" justifyContent="space-between">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                    IconComponent={FilterAltIcon}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>

                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="assignee-label">Assignee</InputLabel>
                  <Select
                    labelId="assignee-label"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    label="Assignee"
                    IconComponent={PersonIcon}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {[...new Set(tasks.map((t) => t.userName))].map((name) => (
                      <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Stack direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />

                <Tooltip title="Reset filters">
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setStatusFilter("all");
                      setAssigneeFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Reset
                  </Button>
                </Tooltip>

                <Tooltip title="Export CSV">
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                  >
                    Export
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>

            {filteredTasks.length === 0 ? (
              <Typography textAlign="center" mt={3}>
                No tasks found.
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1f1f1" }}>
                    <TableCell><strong>Task</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Assigned To</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Deadline</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task._id} hover>
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
                      <TableCell>
                        {new Date(task.deadline).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Tooltip title="Edit Task">
                            <IconButton color="primary" onClick={() => navigate(`/manager/create-task?tab=1&edit=${task._id}`)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Task">
                            <IconButton color="error" onClick={() => {
                              setSelectedTaskId(task._id);
                              setConfirmOpen(true);
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Discussion">
                            <IconButton color="info" onClick={() => navigate(`/task/${task._id}/discussion`)}>
                              <ChatBubbleOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
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