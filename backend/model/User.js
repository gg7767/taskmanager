const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true  // Remove whitespace
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  password: String,
  role: {
    type: String,
    default: null,
    enum: [null, 'employee', 'manager', 'leadership']
  },
  pendingTasks: {
    type: Number,
    default: 0,
    min: 0
  },
  completedTasks: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  // Prevent multiple documents with the same clerkId
  autoIndex: true
});

// Ensure unique index on clerkId
UserSchema.index({ clerkId: 1 }, { 
  unique: true, 
  background: true  // Build index in the background
});

// Pre-save hook to handle potential duplicates
UserSchema.pre('save', async function(next) {
  try {
    // Check if a user with this clerkId already exists
    const existingUser = await this.constructor.findOne({ 
      clerkId: this.clerkId 
    });

    if (existingUser && !existingUser._id.equals(this._id)) {
      // If existing user is found and it's not the current document
      const error = new Error('User with this Clerk ID already exists');
      error.code = 11000;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;