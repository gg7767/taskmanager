const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {type: String, unique: true},
    password: String,
    role: {type: String, default: 'Employee'},
    manager: String,
    pendingTasks: Number,
    completedTasks: Number,
});

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel;