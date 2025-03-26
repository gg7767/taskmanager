import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment"; // Import InputAdornment
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    const isEmailBlank = !email.trim();
    const isPasswordBlank = !password.trim();

    setEmailError(isEmailBlank);
    setPasswordError(isPasswordBlank);

    if (isEmailBlank || isPasswordBlank) {
      return;
    }

    axios
      .post("/login", { email, password })
      .then(() => {
        navigate("/");
        navigate(0)
      })
      .catch((error) => {
        console.log(error);
        toast.error("Incorrect username or password. Please try again.",{
          position:toast.POSITION.BOTTOM_LEFT,
          autoClose: 1500,
        });
      });
  }

  const handleEmailInput = () => {
    setEmailError(false);
  };

  const handlePasswordInput = () => {
    setPasswordError(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <h1 className="text-4xl text-center mt-10 font-medium">Login</h1>
      <Box component="form" autoComplete="off" sx={{ marginTop: "2rem" }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <TextField
            id="outlined-basic"
            type="email"
            required
            autoFocus={true}
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
          <Button
            variant="contained"
            sx={{ width: "100%", maxWidth: "32rem" }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <p className="text-center">Don't have an account? <Link to='/register' className="text-blue-500">Register</Link></p>
        </Stack>
      </Box>
    </div>
  );
};

export default LoginForm;
