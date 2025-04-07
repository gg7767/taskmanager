import { React, useState } from 'react'
import {
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  TextField,
  InputAdornment,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";

const TaskTable = (props) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  const filteredTasks = props.tasks.filter((task) => {
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

  return (
    <div>
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
                  {[...new Set(props.tasks.map((t) => t.userName))].map((name) => (
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
            <Typography textAlign="center" mt={3}>No tasks found.</Typography>
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
                    <TableCell>
                      <Stack direction="row" spacing={-1}>
                        {task.userAvatars?.map((u, i) => (
                          <Tooltip key={i} title={u.name} placement="top">
                            <Avatar
                              src={u.avatar}
                              alt={u.name}
                              sx={{ width: 32, height: 32, border: '2px solid white' }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.completed ? "Completed" : "Pending"}
                        color={task.completed ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(task.deadline).toLocaleDateString()}</TableCell>
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
    </div>
  )
}

export default TaskTable;
