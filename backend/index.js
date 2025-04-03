console.log("Starting backend server...");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const axios = require("axios");
const User = require("./model/User");
const Task = require("./model/Task");
const { requireAuth } = require("@clerk/express"); // ✅ Correct usage
require("dotenv").config();



app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(session({
  secret: 'abcd',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

mongoose.connect(process.env.MONGO_URL);

// ✅ Test Route
app.get("/test", (req, res) => {
  res.json("test ok");
});

// ✅ Get available employees (unassigned)
// Add this before your other routes
app.get(["/api/users/available-employees", "/available-employees"], async (req, res) => {
  console.log("🔥 Endpoint hit! Request path:", req.path);
  
  try {
    const employees = await User.find({
      $or: [
        { role: 'employee' },
        { role: null }
      ],
      managerId: { $exists: false }
    }).lean();

    console.log("📊 Found employees:", employees);
    res.status(200).json(employees || []);
    
  } catch (error) {
    console.error("💥 Database error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clerk/user/:clerkId", async (req, res) => {
  try {
    const { clerkId } = req.params;

    const response = await axios.get(`https://api.clerk.dev/v1/users/${clerkId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching Clerk user:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch user from Clerk" });
  }
});

// ✅ Get user by clerkId
app.get("/api/users/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create or get user
app.post("/api/users", async (req, res) => {
  const { clerkId, email } = req.body;

  try {
    const existingUser = await User.findOne({ clerkId });

    if (existingUser) {
      console.log("User already exists:", existingUser);
      return res.status(200).json(existingUser);
    }

    const newUser = new User({ clerkId, email });
    await newUser.save();

    console.log("New user created:", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("POST user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update user role
app.put('/api/users/:clerkId', async (req, res) => {
  const { role } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.clerkId },
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('PUT user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Assign an employee to a manager
app.post("/api/users/assign-employee", async (req, res) => {
  const { managerId, employeeId } = req.body;

  if (!managerId || !employeeId) {
    return res.status(400).json({ message: "Both managerId and employeeId are required" });
  }

  try {
    const employee = await User.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    if (employee.managerId) {
      return res.status(400).json({ message: "Employee already assigned to a manager" });
    }

    employee.managerId = managerId;
    await employee.save();

    res.status(200).json({ message: "Employee assigned successfully", employee });
  } catch (error) {
    console.error("Error assigning employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get employees by managerId
app.get("/api/employees/manager/:managerId", async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.params.managerId });
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees by manager:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Start server
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
