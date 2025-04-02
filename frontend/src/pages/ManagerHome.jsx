import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Employees from "./Employees"
import TaskList from "./TaskList";

const ManagerHome = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div>
      <div className="text-3xl font-semibold text-center my-4 mb-2 py-2">
        Manager Dashboard
      </div>
      <div>
       
      <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Employees" />
            <Tab label="Tasks" />
        </Tabs>
      </div>
      {value === 0 && <Employees/>}
      {value === 1 && <TaskList/>}
    </div>
  );
};

export default ManagerHome;
