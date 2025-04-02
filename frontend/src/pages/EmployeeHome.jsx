// EmployeeHome.jsx - Improved
import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper, Chip } from '@mui/material';
import { format } from 'date-fns';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const EmployeeHome = () => {
  const [value, setValue] = useState(0);

  // Placeholder task data
  const tasks = [
    {
      name: "Complete Profile",
      description: "Fill out your employee details",
      deadline: new Date(),
      managerName: "Jane Doe",
      completed: false
    },
    {
      name: "Weekly Report",
      description: "Submit your weekly progress report",
      deadline: new Date(),
      managerName: "John Smith",
      completed: true
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" align="center" sx={{ my: 3 }}>Welcome, Employee</Typography>
      <Tabs value={value} onChange={(e, newValue) => setValue(newValue)} centered>
        <Tab label="Pending Tasks" />
        <Tab label="Completed Tasks" />
      </Tabs>

      <TabPanel value={value} index={0}>
        {tasks.filter(task => !task.completed).map((task, i) => (
          <Paper key={i} elevation={3} sx={{ p: 2, m: 1 }}>
            <Typography variant="h6">{task.name}</Typography>
            <Typography>Description: {task.description}</Typography>
            <Typography>Manager: {task.managerName}</Typography>
            <Typography>Deadline: {format(new Date(task.deadline), 'PPP')}</Typography>
            <Chip label="Pending" color="warning" sx={{ mt: 1 }} />
          </Paper>
        ))}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {tasks.filter(task => task.completed).map((task, i) => (
          <Paper key={i} elevation={3} sx={{ p: 2, m: 1 }}>
            <Typography variant="h6">{task.name}</Typography>
            <Typography>Description: {task.description}</Typography>
            <Typography>Manager: {task.managerName}</Typography>
            <Typography>Deadline: {format(new Date(task.deadline), 'PPP')}</Typography>
            <Chip label="Completed" color="success" sx={{ mt: 1 }} />
          </Paper>
        ))}
      </TabPanel>
    </Box>
  );
};

export default EmployeeHome;