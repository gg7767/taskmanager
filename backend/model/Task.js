const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    deadline: Date,
    completed: { type: Boolean, default: false },

    // Change 'user' to 'users' as an array
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Manager stays a single user
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Optional cached fields for display purposes
    userNames: [String],
    managerName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
