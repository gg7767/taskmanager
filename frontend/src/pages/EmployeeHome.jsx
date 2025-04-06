import React, { useState, useEffect } from 'react';
import {
  Box, Tab, Tabs, Typography, Paper, Chip, Grid,
  IconButton, Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const EmployeeHome = () => {
  const { user } = useUser();
  const [value, setValue] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [managerName, setManagerName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasksAndManager = async () => {
      try {
        const res = await axios.get(`/api/tasks/${user?.id}`);
        const { tasks, managerClerkId } = res.data;

        let displayName = "Unassigned";

        if (managerClerkId) {
          try {
            const clerkRes = await axios.get(`/api/clerk/user/${managerClerkId}`);
            const clerkUser = clerkRes.data;
            displayName = clerkUser.first_name && clerkUser.last_name
              ? `${clerkUser.first_name} ${clerkUser.last_name}`
              : clerkUser.email.split("@")[0];
          } catch (clerkErr) {
            console.warn("Failed to fetch manager name from Clerk:", clerkErr);
          }
        }

        setTasks(tasks);
        setManagerName(displayName);
      } catch (err) {
        console.error("Failed to fetch employee tasks or manager info:", err);
      }
    };

    if (user?.id) {
      fetchTasksAndManager();
    }
  }, [user]);

  const handleComplete = async (taskId) => {
    try {
      await axios.put(`/api/tasks/complete/${taskId}`);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, completed: true } : t));
    } catch (err) {
      console.error("Failed to mark task as complete:", err);
    }
  };

  const handleCardClick = (taskId) => {
    navigate(`/task/${taskId}/discussion`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" align="center" sx={{ my: 3 }}>Welcome, Employee</Typography>
      <Tabs value={value} onChange={(e, newValue) => setValue(newValue)} centered>
        <Tab label="Pending Tasks" />
        <Tab label="Completed Tasks" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <Grid container spacing={2}>
          {tasks.filter(task => !task.completed).map((task, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => handleCardClick(task._id)}
              >
                <Typography variant="h6">{task.name}</Typography>
                <Typography>Description: {task.description}</Typography>
                <Typography>Manager: {managerName}</Typography>
                <Typography>Deadline: {format(new Date(task.deadline), 'PPP')}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Chip label="Pending" color="warning" />
                  <Tooltip title="Mark as complete" arrow>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click
                        handleComplete(task._id);
                      }}
                      sx={{ border: '1.5px solid green', color: 'green', p: 0.5 }}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={2}>
          {tasks.filter(task => task.completed).map((task, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 }
                }}
                onClick={() => handleCardClick(task._id)}
              >
                <Typography variant="h6">{task.name}</Typography>
                <Typography>Description: {task.description}</Typography>
                <Typography>Manager: {managerName}</Typography>
                <Typography>Deadline: {format(new Date(task.deadline), 'PPP')}</Typography>
                <Chip label="Completed" color="success" sx={{ mt: 2 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default EmployeeHome;
