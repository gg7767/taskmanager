const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    clerkId: {
        type: String,
        unique: true,
        required: true
    },
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ['employee', 'manager', 'leadership', null],
        default: null
    },
    manager: String,
    pendingTasks: {
        type: Number,
        default: 0
    },
    completedTasks: {
        type: Number,
        default: 0
    }
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;