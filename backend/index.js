console.log("Starting backend server...");
const clerkMiddleware = require('@clerk/express')
const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");
const User = require("./model/User");
const session = require('express-session');
const Task = require("./model/Task");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const datefns = require("date-fns");
const jwtSecret = "fsjflsakdjiwoejflsdkjfow4u938247509weuqr98q23utowqig";

require("dotenv").config();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(session({
  secret: 'abcd',  // use a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // use true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax' // or 'none' if frontend and backend are on different domains with HTTPS
  }
}));

app.use(clerkMiddleware.clerkMiddleware())

app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Allow frontend dev server
  methods: ['GET', 'POST', 'PUT'],
  credentials: true,
}));

// Preflight route to handle OPTIONS requests

app.get("/test", (req, res) => {
  res.json("test ok");
});
mongoose.connect(process.env.MONGO_URL);

// ✅ GET user by clerkId
app.get("/api/users/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/users", async (req, res) => {
  const { clerkId, email } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $setOnInsert: {
          email,
          role: null,
          pendingTasks: 0,
          completedTasks: 0,
        },
      },
      { new: true, upsert: true } // 👈 ensures atomic insert if not exists
    );

    if (user.wasNew) {
      console.log("New user created:", user);
    } else {
      console.log("User already exists:", user);
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("POST user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


// Create user profile if not exists
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

// Update user role
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

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});

