
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import EditIcon from "@mui/icons-material/Edit"; // Import the Edit icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import the Delete icon
import { Button, IconButton } from "@mui/material";
import axios from "axios";
import { toast } from 'react-toastify';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const [employee, setEmployee] = useState([]);
  const navigate = useNavigate();
  function handleCreate() {
    navigate("/register");
  }

  const handleUpdateEmployee = (employeeId) => {
    navigate(`/updateEmployee/${employeeId}`);
  };

  const handleDeleteEmployee = (employeeId) => {
    axios
      .post("/deleteEmployee", { id: employeeId })
      .then((response) => {
        // Employee deleted successfully
        toast.success("Employee deleted successfully", {
          position: toast.POSITION.BOTTOM_LEFT, // You can adjust the position as needed
          autoClose: 3000,
        });
  
        // Fetch the updated employee list
        axios.get("/employee").then((response) => {
          setEmployee(response.data);
        });
      })
      .catch((error) => {
        // Handle errors, e.g., show an error message to the user
        console.error(error);
        toast.error("Error deleting employee", {
          position: toast.POSITION.BOTTOM_LEFT,
        });
      });
  };

  // useEffect(() => {
  //   axios.get("/employee").then((response) => {
  //     setEmployee(response.data);
  //   });
  // }, []);
  return (
    <div>
          <div className="mt-5 mx-4">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="employee table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="center">Email</TableCell>
                    <TableCell align="center">Pending Tasks</TableCell>
                    <TableCell align="center">Completed Tasks</TableCell>
                    <TableCell align="center">Actions</TableCell> {/* New column for actions */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employee.map((emp) => (
                    <TableRow
                      key={emp._id} // Use a unique key (e.g., _id) for each employee
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell align="left" component="th" scope="row">
                        {emp.name}
                      </TableCell>
                      <TableCell align="center">{emp.email}</TableCell>
                      <TableCell align="center">{emp.pendingTasks}</TableCell>
                      <TableCell align="center">{emp.completedTasks}</TableCell>
                      <TableCell align="center">
                        {/* Buttons for updating and deleting employees */}
                        <IconButton
                          color="primary"
                          onClick={() => handleUpdateEmployee(emp._id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error" // Make the delete icon button red
                          onClick={() => handleDeleteEmployee(emp._id)}
                          sx={{ marginLeft: 4 }} // Add spacing between icons
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
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
              onClick={handleCreate}
            >
              Add Employee
            </Button>
          </div>
        </div>
  )
}

export default Employees