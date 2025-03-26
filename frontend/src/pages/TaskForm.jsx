import React, { useState, useEffect } from "react";
import { Button, FormHelperText } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { toast } from "react-toastify";

const TaskForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [user, setUser] = useState("");
  const [nameError, setNameError] = useState(false);
  const[descError, setDescError] = useState(false);
  const [userError, setUserError] = useState(false);
  const navigate = useNavigate();

  function handleCreateTask(e) {
    const isNameBlank = !name.trim();
    const isDescBlank = !description.trim();
    const isUserBlank = !user.trim();

    setNameError(isNameBlank);
    setDescError(isDescBlank);
    setUserError(isUserBlank);

    if(isNameBlank || isUserBlank || isDescBlank){
      return;
    }

    e.preventDefault();
    const data = { name, description, deadline, user };
    axios
      .post("/createTask", data)
      .then((response) => {
        toast.success("Task created successfully", {
          position: "bottom-left",
          autoClose: 3000,
        });
        navigate("/manager");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const [employee, setEmployee] = useState([]);

  useEffect(() => {
    axios.get("/employee").then((response) => {
      setEmployee(response.data);
    });
  }, []);

  const handleChange = (event) => {
    setUserError(false);
    setUser(event.target.value);
  };

  const handleNameInput = () => {
    setNameError(false);
  }

  const handleDescInput = () => {
    setDescError(false);
  }

  return (
    <div>
      <div>
        <h1 className="text-4xl  text-center mt-5 font-medium">
          Create a task
        </h1>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ marginTop: "2rem" }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <TextField
              id="outlined-basic"
              label="Task Name"
              variant="outlined"
              value={name}
              onChange={(event)=>setName(event.target.value)}
              onInput ={handleNameInput}
              error= {nameError}
              helperText={nameError ? "Task name should not be blank" : ""}
              sx={{ width: "100%", maxWidth: "42rem" }}
            />
            <TextField
              id="outlined-multiline-static"
              label="Task Description"
              multiline
              rows={4}
              value={description}
              onChange={(event)=>setDescription(event.target.value)}
              onInput= {handleDescInput}
              error = {descError}
              helperText = {descError ? "Task description should not be blank": ""}
              sx={{ width: "100%", maxWidth: "42rem" }}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select a deadline"
                value={deadline}
                onChange={(value)=>setDeadline(value)}
                disablePast = {true}
                sx={{ width: "100%", maxWidth: "42rem" }}
              />
            </LocalizationProvider>
            <FormControl sx={{ width: "100%", maxWidth: "42rem" }} error={userError}>
              <InputLabel
                id="demo-simple-select-label"
                sx={{ width: "100%", maxWidth: "42rem" }}
              >
                Employee
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={user}
                label="Employee"
                onChange={handleChange}
              >
                {employee.map((emp) => (
                  <MenuItem value={emp._id}>{emp.name}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{userError ? "Please select a user": ""}</FormHelperText>
            </FormControl>
            <Button
              variant="contained"
              sx={{ width: "100%", maxWidth: "42rem" }}
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </Stack>
        </Box>
      </div>
    </div>
  );
};

export default TaskForm;
