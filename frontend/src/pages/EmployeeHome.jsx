import React, {  useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
//import axios from "axios";
import { Box, Stack} from "@mui/material";

const EmployeeHome = () => {
  //const [pendingTasks, setPendingTasks] = useState([]);
  //const [completedTasks, setCompletedTasks] = useState([]);
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  // useEffect(() => {
  //   axios
  //     .get("/allTasks2")
  //     .then((response) => {
  //       setPendingTasks(response.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  //   axios
  //     .get("/allTasks3")
  //     .then((response) => {
  //       setCompletedTasks(response.data);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  // function handleComplete(id) {
  //   const task2 = pendingTasks.find(function(task){ return task._id === id})
  //   completedTasks.push(task2)
  //   setPendingTasks(pendingTasks.filter((task)=>task._id!==id))
    
  //   axios
  //     .post("/completeTask", { id })
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  return (
    <div>
      <div className="text-3xl font-semibold text-center my-4 mb-2 py-2">
        Employee Dashboard
      </div>
      <div>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Pending" />
          <Tab label="Completed" />
        </Tabs>
      </div>
      {value === 0 && (
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
              {/* {pendingTasks.length > 0 &&
                pendingTasks.map((task) => (
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
                      - Assigned By: {task.managerName}
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
                        // onClick={() => {
                        //   handleComplete(task._id);
                        // }}
                        style={{ float: "right", color: "green" }}
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
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </Button>
                    </div>
                  </Paper>
                ))} */}
            </Stack>
          </Box>
        </div>
      )}

      {value === 1 && (
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
              {/* {completedTasks.length > 0 &&
                completedTasks.map((task) => (
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
                      - Assigned By: {task.managerName}
                    </div>
                    <div className="text-sm text-gray-500 mt-2 ml-5">
                      - Deadline:{" "}
                      {format(new Date(task.deadline), "EEEE, dd-MM-yy")}
                    </div>
                    <div className="text-sm text-gray-500 mt-2 ml-5">
                      - Status: {task.completed ? "Completed" : "Not Completed"}
                    </div>
                  </Paper>
                ))} */}
            </Stack>
          </Box>
        </div>
      )}
    </div>
  );
};

export default EmployeeHome;
