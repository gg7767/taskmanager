import {React} from 'react'
import {
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
  } from "@mui/material";


const EmployeeTable = (props) => {

  return (
    <div>
      <Paper elevation={3} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 1000, mx: "auto" }}>
          {props.employees.length === 0 ? (
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
                {props.employees.map((emp) => (
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
    </div>
  )
}

export default EmployeeTable
