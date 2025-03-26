import axios from "axios";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Box, Stack, Paper, Button } from "@mui/material";
import {toast} from 'react-toastify'
import { useNavigate } from "react-router-dom";


const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("/allTasks")
      .then((response) => {
        setTasks(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleDelete(id) {
    setTasks(tasks.filter((task)=>task._id!==id))
    console.log(id)
    axios.post('/deleteTask', {id})
    .then((res)=>{
      toast.error("Task deleted successfully", {
        position: "bottom-left",
        autoClose: 3000, // Auto close the toast after 3 seconds (adjust as needed)
      });
      console.log(res.message)
    }).catch((err)=>{
      toast.error("Error deleting task", {
        position: "bottom-left",
        autoClose: 3000, // Auto close the toast after 3 seconds (adjust as needed)
      });
      console.log(err)
    })
  }

  function handleCreateTask() {
    navigate("/createTask");
  }

  return (
    <div>
      <Box>
        <Stack
          gap={2}
          direction="col"
          useFlexGap
          flexWrap="wrap"
          justifyContent="space-evenly"
          mt={4}
        >
          {tasks.length > 0 &&
            tasks.map((task) => (
              <Paper
                elevation={3}
                sx={{
                  width: "400px",
                  height: "200px",
                }}
              >
                <div className="text-xl text-center mt-2">{task.name}</div>
                <div className="text-sm text-gray-500 mt-4 ml-5">
                  - Description: {task.description}
                </div>
                <div className="text-sm text-gray-500 mt-2 ml-5">
                  - Assigned To: {task.userName}
                </div>
                <div className="text-sm text-gray-500 mt-2 ml-5">
                  - Deadline:{" "}
                  {format(new Date(task.deadline), "EEEE, dd-MM-yy")}
                </div>
                <div className="text-sm text-gray-500 mt-2 ml-5">
                  - Status: {task.completed ? "Completed" : "Not Completed"}
                </div>
                <div>
                  <Button
                    onClick={()=>{handleDelete(task._id)}}
                    style={{ float: "right", color: "red" }}
                    disableRipple={true}
                  >
                    <div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </div>
                  </Button>
                </div>
              </Paper>
            ))}
        </Stack>
      </Box>
      <div className="relative">
            <Button
              variant="contained"
              sx={{
                position: "fixed",
                bottom: 0,
                right: 0,
                marginBottom: 5,
                marginRight: 2,
              }}
              onClick={handleCreateTask}
            >
              Create new Task
            </Button>
          </div>
    </div>
    
  );
};

export default TaskList;
