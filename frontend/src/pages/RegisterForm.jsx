import React, { useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import {useContext} from 'react';
import {UserContext} from '../UserContext'
import axios from "axios";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment"; // Import InputAdornment
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MenuItem from "@mui/material/MenuItem";

const RegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [emailError, setEmailError] = useState(false);
  const [firstNameError, setFirstNameError] = useState(false);
  const [lastNameError, setLastNameError] = useState(false);
  const [roleError, setRoleError] = useState(false);
  const handleEmailInput = () => {
    setEmailError(false);
  };

  const handlePasswordInput = () => {
    setPasswordError(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRoleInput = () => {
    setRoleError(false);
  };

  const handleFirstNameInput = () => {
    setFirstNameError(false);
  };

  const handleLastNameInput = () => {
    setLastNameError(false);
  };
  

  const navigate = useNavigate();
  const {user}= useContext(UserContext);
  function handleRegister(e) {
    e.preventDefault();
    console.log(firstName, lastName, email, password, role);
    const isFirstNameBlank = !firstName.trim();
    const isLastNameBlank = !lastName.trim();
    const isEmailBlank = !email.trim();
    const isPasswordBlank = !password.trim();
    const isRoleBlank = !role.trim();
    setFirstNameError(isFirstNameBlank);
    setLastNameError(isLastNameBlank);
    setEmailError(isEmailBlank);
    setPasswordError(isPasswordBlank);
    setRoleError(isRoleBlank);
    //check if all the fields are filled
   if(isFirstNameBlank || isLastNameBlank || isEmailBlank || isPasswordBlank || isRoleBlank){
    return;
   }
    axios
      .post("/register", {
        firstName,
        lastName,
        email,
        password,
        role
      }).then(()=>{
        
      })
      .catch((error) => {
        console.log(error);
      });

     
  }
  return (
    // <div className="mt-24">
    //   <h1 className="text-4xl text-center font-medium mb-4">Register an Employee</h1>
    //   <form className="max-w-lg mx-auto" onSubmit={handleRegister}>
    //     <input
    //       className="w-full border my-1 py-2 px-3 rounded-2xl"
    //       type="text"
    //       placeholder="Enter employee name"
    //       value={name}
    //       onChange={(e) => setName(e.target.value)}
    //     />
    //     <input
    //       className="w-full border my-1 py-2 px-3 rounded-2xl"
    //       type="email"
    //       placeholder="Enter employee email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //     />
    //     <input
    //       className="w-full border my-1 py-2 px-3 rounded-2xl"
    //       type="password"
    //       placeholder="Set employee password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //     />
    //     <button className="w-full">
    //       <Button variant="contained" sx={{"padding":"0.5rem","borderRadius":"1rem","width":"100%"}}>Register</Button>
    //     </button>
    //     <p className="text-center">Already have an account? <Link to='/login' className="text-blue-500">Login</Link></p>
    //   </form>
    // </div>
    <div>
      <h1 className="text-4xl text-center mt-10 font-medium">Register</h1>
      <Box component="form" autoComplete="off" sx={{ marginTop: "2rem" }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%" ,maxWidth: "32rem"}}>
            <TextField
              id="outlined-basic"
              type="text"
              required
              error={firstNameError}
              helperText={firstNameError ? "First name cannot be blank" : ""}
              autoFocus={true}
              label="First Name"
              variant="outlined"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              onInput={handleFirstNameInput}
              sx={{ width: "100%"}}
            />
            <TextField
              id="outlined-basic"
              type="text"
              required
              error={lastNameError}
              helperText={lastNameError ? "Last name cannot be blank" : ""}
              label="Last Name"
              variant="outlined"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              onInput={handleLastNameInput}
              sx={{ width: "100%"}}
            />
          </Stack>
          <TextField
            id="outlined-basic"
            type="email"
            required
            label="Email"
            variant="outlined"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onInput={handleEmailInput}
            error={emailError}
            helperText={emailError ? "Email cannot be blank" : ""}
            sx={{ width: "100%", maxWidth: "32rem" }}
          />
          <TextField
            id="outlined-multiline-static"
            label="Password"
            required
            type={showPassword ? "text" : "password"} // Toggle password visibility
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onInput={handlePasswordInput}
            error={passwordError}
            helperText={passwordError ? "Password cannot be blank" : ""}
            sx={{ width: "100%", maxWidth: "32rem" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Role */}
          {/* <FormControl sx={{ width: "100%", maxWidth: "32rem" }} required error={roleError} helperText={roleError ? "Role cannot be blank" : ""}>
            <InputLabel>Role</InputLabel>
            
            <Select
              label="Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
            </Select>
          </FormControl> */}
          <TextField
            id="outlined-basic"
            required
            select
            sx={{ width: "100%", maxWidth: "32rem" }}
            label="Role"
            variant="outlined"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            // onInput={handleRoleInput}
            error={roleError}
            helperText={roleError ? "Role cannot be blank" : ""}
          >
            <MenuItem value="Employee" defaultChecked>Employee</MenuItem>
            <MenuItem value="Manager">Manager</MenuItem>
          </TextField>
          <Button
            variant="contained"
            sx={{ width: "100%", maxWidth: "32rem" }}
            onClick={handleRegister}
          >
            Register
          </Button>
          <p className="text-center">Already have an account? <Link to='/login' className="text-blue-500">Login</Link></p>
        </Stack>
      </Box>
    </div>
  );
};

export default RegisterForm;
