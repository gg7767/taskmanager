console.log("Starting backend server...");
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const axios = require("axios");
const User = require("./model/User");
const Task = require("./model/Task");
const Comment = require("./model/Comment");

const { requireAuth } = require("@clerk/express");
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

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get(["/api/users/available-employees", "/available-employees"], async (req, res) => {
  try {
    const employees = await User.find({
      $or: [
        { role: 'employee' },
        { role: null }
      ],
      managerId: { $exists: false }
    }).lean();

    res.status(200).json(employees || []);
  } catch (error) {
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
    res.status(500).json({ error: "Failed to fetch user from Clerk" });
  }
});

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
    const existingUser = await User.findOne({ clerkId });
    if (existingUser) return res.status(200).json(existingUser);

    const newUser = new User({ clerkId, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

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
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/users/assign-employee", async (req, res) => {
  const { managerId, employeeId } = req.body;
  if (!managerId || !employeeId) return res.status(400).json({ message: "Both managerId and employeeId are required" });

  try {
    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.managerId) return res.status(400).json({ message: "Employee already assigned to a manager" });

    employee.managerId = managerId;
    await employee.save();
    res.status(200).json({ message: "Employee assigned successfully", employee });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/employees/manager/:managerId", async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.params.managerId });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { name, description, deadline, users, managerId, completed = false, managerName } = req.body;

    if (!name || !description || !deadline || !users?.length || !managerId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employeeDocs = await User.find({ _id: { $in: users } });
    const userNames = employeeDocs.map((u) => u.email.split("@")[0]);

    const newTask = new Task({
      name,
      description,
      deadline,
      completed,
      users,
      manager: managerId,
      userNames,
      managerName,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Failed to create task:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/api/tasks/manager/:managerId", async (req, res) => {
  try {
    const tasks = await Task.find({ manager: req.params.managerId }).lean();

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const userAvatars = await Promise.all(
          (task.users || []).map(async (userId) => {
            const user = await User.findById(userId);
            if (!user || !user.clerkId) return null;

            try {
              const clerkRes = await axios.get(
                `https://api.clerk.dev/v1/users/${user.clerkId}`,
                {
                  headers: {
                    Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                  },
                }
              );

              const clerk = clerkRes.data;
              return {
                name:
                  clerk.first_name && clerk.last_name
                    ? `${clerk.first_name} ${clerk.last_name}`
                    : user.email.split("@")[0],
                avatar: clerk.image_url,
              };
            } catch (err) {
              return {
                name: user.email.split("@")[0],
                avatar: null,
              };
            }
          })
        );

        return {
          ...task,
          userAvatars: userAvatars.filter(Boolean),
        };
      })
    );

    res.status(200).json(enrichedTasks);
  } catch (error) {
    console.error("Error fetching enriched tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/tasks/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });
    const tasks = await Task.find({ users: user._id });
    let managerClerkId = null;
    if (user.managerId) {
      const manager = await User.findById(user.managerId);
      managerClerkId = manager?.clerkId || null;
    }
    res.status(200).json({ tasks, managerClerkId });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/task/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId).lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Populate basic info for users if needed (optional enhancement)
    const enrichedUsers = await Promise.all(
      (task.users || []).map(async (userId) => {
        const user = await User.findById(userId).lean();
        if (!user) return null;
        return {
          _id: user._id,
          email: user.email,
          clerkId: user.clerkId,
        };
      })
    );

    res.status(200).json({
      ...task,
      users: enrichedUsers.filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/task/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { name, description, deadline, users, managerId, completed = false } = req.body;

  if (!name || !description || !deadline || !users?.length || !managerId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.name = name;
    task.description = description;
    task.deadline = deadline;
    task.users = users;
    task.manager = managerId;
    task.completed = completed;

    await task.save();

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error("Failed to update task:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/api/tasks/user/:userId/pending-count", async (req, res) => {
  try {
    const count = await Task.countDocuments({ user: req.params.userId, completed: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting pending tasks" });
  }
});

app.get("/api/tasks/user/:userId/completed-count", async (req, res) => {
  try {
    const count = await Task.countDocuments({ user: req.params.userId, completed: true });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting completed tasks" });
  }
});

app.put("/api/tasks/complete/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = true;
    await task.save();

    res.status(200).json({ message: "Task marked as complete", task });
  } catch (error) {
    console.error("Error marking task complete:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.delete("/api/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// GET comments for a task
app.get("/api/task/:taskId/comments", async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get("/api/comments/task/:taskId", async (req, res) => {
  try {

    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: 1 })
      .populate("user", "email clerkId")
      .lean();

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/comments", async (req, res) => {
  const { taskId, userId, text } = req.body;

  if (!taskId || !userId || !text) {
    console.log("⚠️ Missing fields", { taskId, userId, text });
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newComment = new Comment({ taskId, userId, text });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error posting comment:", err);
    res.status(500).json({ message: "Failed to post comment" });
  }
});


app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
