console.log("Starting backend server...");
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

app.use(express.json());

app.use(cookieParser());

app.get("/test", (req, res) => {
  res.json("test ok");
});
mongoose.connect(process.env.MONGO_URL);

app.post("/register", async (req, res) => {
  try {

    const { firstName, lastName, email, password, role } = req.body;
    // console.log(firstName)
    // console.log(lastName)
    // console.log(role)
    await User.create({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 10),
      role,
      pendingTasks:0,
      completedTasks:0,
    });
    res.json({ firstName, lastName, email, password, role });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      console.log(userDoc)
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign(
          { email: userDoc.email, id: userDoc._id },
          jwtSecret,
          {},
          (err, token) => {
            if (err) throw err;
            res.cookie("token", token).status(200).json("pass ok");
          }
        );
      } else {
        res.status(422).json("pass not ok");
      }
    } else {
      res.status(422).json("user not found");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      const { firstName, lastName, email, _id, role, pendingTasks, completedTasks } = await User.findById(userDoc.id);
      res.json({ firstName, lastName, email, _id, role, pendingTasks, completedTasks });
    });
  } else {
    res.json(null);
  }
});

app.get("/employee", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      const { name } = await User.findById(userDoc.id);
      res.json(await User.find({ Role: "Employee", manager: name }));
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("logout success");
});

app.post("/createTask", async (req, res) => {
  const { name, description, deadline, user } = req.body;
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      const userD = await User.findById(user);
      let pTasks = userD.pendingTasks+1;
      await userD.updateOne({pendingTasks:pTasks})
      const userName = userD.name;
      const managerD = await User.findById(userDoc.id);
      const managerName = managerD.name;
      res.json(
        await Task.create({
          name,
          description,
          deadline,
          user,
          manager: userDoc.id,
          completed: false,
          userName,
          managerName,
        })
      );
    });
  } else {
    res.json(null);
  }
});

app.get("/allTasks", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      res.json(await Task.find({ manager: userDoc.id }));
    });
  } else {
    res.json(null);
  }
});
//test comment
app.get("/allTasks2", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      res.json(await Task.find({ user: userDoc.id, completed: false }));
    });
  } else {
    res.json(null);
  }
});

app.get("/allTasks3", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
      if (error) throw error;
      res.json(await Task.find({ user: userDoc.id, completed: true }));
    });
  } else {
    res.json(null);
  }
});

app.post("/taskUser", async (req, res) => {
  const { id } = req.body;
  const user = await User.findById(id);
  if (user) {
    const name = user.name;
    res.send({ name });
  } else {
    res.send(null);
  }
});

app.post("/deleteTask", async (req, res) => {
  const { id } = req.body;
  //console.log(req.body);
  //console.log(id)
  try {
    const task = await Task.findById(id);
    const userD = await User.findById(task.user);
    console.log(userD)
    if(task.completed){
      await userD.updateOne({completedTasks:userD.completedTasks-1})
    }
    else{
      await userD.updateOne({pendingTasks:userD.pendingTasks-1})
    }
    res.send(await Task.findByIdAndDelete(id));
  } catch (error) {
    console.log(error);
  }
});

app.post("/completeTask", async(req, res)=>{
  const {id} = req.body;
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (error, userDoc) => {
    if (error) throw error;
    const userD = await User.findById(userDoc.id);
    await userD.updateOne({pendingTasks:userD.pendingTasks-1, completedTasks:userD.completedTasks+1});
    await Task.findByIdAndUpdate(id, {completed:true});
    res.send({message:"completed sucessfully"})
  })
})

app.post("/deleteEmployee", async (req, res) => {
  const { id } = req.body;
  try {
    // Find the employee by their ID and delete them
    const deletedEmployee = await User.findByIdAndDelete(id);
    if (deletedEmployee) {
      res.json({ message: "Employee deleted successfully" });
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/employee/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await User.findById(id);
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.put("/updateEmployee/:id", async (req, res) => {
  const { id } = req.params;
  const updatedEmployeeData = req.body;
  
  try {
    // Find the employee by their ID and update their data
    const updatedEmployee = await User.findByIdAndUpdate(id, updatedEmployeeData, {
      new: true, // Return the updated employee data
    });

    if (updatedEmployee) {
      res.json(updatedEmployee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/updateEmployee/:id", async (req, res) => {
  const { id } = req.params;
  const updatedEmployeeData = req.body;
  
  // Check if there is a password field in the request body
  if (updatedEmployeeData.password) {
    // Hash the password before updating
    updatedEmployeeData.password = bcrypt.hashSync(updatedEmployeeData.password, 10);
  }

  try {
    // Find the employee by their ID and update their data
    const updatedEmployee = await User.findByIdAndUpdate(id, updatedEmployeeData, {
      new: true, // Return the updated employee data
    });

    if (updatedEmployee) {
      res.json(updatedEmployee);
    } else {
      res.status(404).json({ message: "Employee not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
