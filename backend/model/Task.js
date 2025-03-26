const mongoose = require('mongoose');
const UserModel = require('./User');
const {Schema} = mongoose;

const TaskSchema = new Schema({
    name:String,
    description: String,
    deadline: Date,
    completed: Boolean,
    user: mongoose.ObjectId,
    manager: mongoose.ObjectId,
    userName: String,
    managerName: String
})

TaskSchema.path('user').ref(UserModel);
TaskSchema.path('manager').ref(UserModel)

const TaskModel = mongoose.model('Task', TaskSchema);

module.exports = TaskModel;