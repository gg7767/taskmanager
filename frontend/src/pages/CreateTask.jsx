import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
  IconButton,
  Fade,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import useUserRole from "../hooks/useUserRole";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateTask = () => {
  const { userDb } = useUserRole();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    deadline: "",
    users: [],
    completed: false,
  });
  const [showForm, setShowForm] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchEmployeesWithNames = async () => {
      try {
        const res = await axios.get(`/api/employees/manager/${userDb._id}`);
        const employees = res.data;

        const enriched = await Promise.all(
          employees.map(async (emp) => {
            try {
              const clerkRes = await axios.get(`/api/clerk/user/${emp.clerkId}`);
              const clerk = clerkRes.data;
              return {
                ...emp,
                fullName: clerk.first_name && clerk.last_name
                  ? `${clerk.first_name} ${clerk.last_name}`
                  : emp.email.split("@")[0],
              };
            } catch (err) {
              return {
                ...emp,
                fullName: emp.email.split("@")[0],
              };
            }
          })
        );

        setEmployees(enriched);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    const editId = query.get("edit");
    if (editId) {
      setIsEdit(true);
      setTaskId(editId);
      axios.get(`/api/task/${editId}`).then(res => {
        const task = res.data;
        setForm({
          name: task.name,
          description: task.description,
          deadline: task.deadline.split("T")[0],
          users: task.users?.map(u => u._id) || [],
          completed: task.completed,
        });
      }).catch(err => {
        console.error("Failed to fetch task for editing:", err);
        toast.error("Unable to load task details.");
      });
    }

    if (userDb && userDb._id) {
      fetchEmployeesWithNames();
    }
  }, [userDb]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "completed" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.deadline || form.users.length === 0) {
      toast.error("Please fill in all required fields.", {
        position: "bottom-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const estOffset = -5 * 60;
      const rawDate = new Date(`${form.deadline}T00:00:00`);
      const estDate = new Date(rawDate.getTime() - estOffset * 60000);
      const estDeadline = estDate.toISOString();

      const payload = {
        name: form.name,
        description: form.description,
        deadline: estDeadline,
        users: form.users,
        managerId: userDb._id,
        completed: form.completed,
      };

      if (isEdit) {
        await axios.put(`/api/task/${taskId}`, payload);
        toast.success("Task updated successfully!", {
          position: "bottom-center",
          autoClose: 3000,
        });
      } else {
        await axios.post("/api/tasks", payload);
        toast.success("Task created successfully!", {
          position: "bottom-center",
          autoClose: 3000,
        });
      }

      setTimeout(() => navigate("/manager?tab=1"), 1000);
    } catch (err) {
      console.error("Failed to submit task:", err);
      toast.error("Failed to submit task.", {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <Fade in={showForm}>
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
        <IconButton
          onClick={() => {
            setShowForm(false);
            setTimeout(() => navigate("/manager?tab=1"), 300);
          }}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" mb={3} textAlign="center">
          {isEdit ? "Edit Task" : "Create New Task"}
        </Typography>

        <Paper elevation={3} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Task Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={5}
              margin="normal"
              required
            />

            <TextField
              label="Deadline"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="users-label">Assign To</InputLabel>
              <Select
                labelId="users-label"
                multiple
                name="users"
                value={form.users}
                onChange={(e) => setForm((prev) => ({ ...prev, users: e.target.value }))}
                input={<OutlinedInput label="Assign To" />}
                renderValue={(selected) => (
                  employees
                    .filter((e) => selected.includes(e._id))
                    .map((e) => e.fullName)
                    .join(", ")
                )}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    <Checkbox checked={form.users.includes(emp._id)} />
                    <ListItemText primary={emp.fullName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              select
              label="Status"
              name="completed"
              value={form.completed.toString()}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="false">Pending</MenuItem>
              <MenuItem value="true">Completed</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              {isEdit ? "Update Task" : "Create Task"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Fade>
  );
};

export default CreateTask;
