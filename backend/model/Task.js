const mongoose = require("mongoose");
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    deadline: Date,
    completed: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Optional cached names (only if needed for history/logs)
    userName: String,
    managerName: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
