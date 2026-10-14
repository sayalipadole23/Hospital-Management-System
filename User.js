const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'staff'],
    default: 'patient',
  },
  phone: {
    type: String,
    default: '+91 98765 43210',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male',
  },
  age: {
    type: Number,
    default: 32,
  },
  bloodGroup: {
    type: String,
    default: 'O+',
  },
  address: {
    type: String,
    default: 'Mumbai, Maharashtra, India',
  },
  avatar: {
    type: String,
    default: '',
  },

  // Doctor-specific fields
  specialization: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: '',
  },
  qualification: {
    type: String,
    default: '',
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  consultationFee: {
    type: Number,
    default: 500,
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  reviewsCount: {
    type: Number,
    default: 120,
  },
  availability: {
    type: [String],
    default: ['09:00 AM - 01:00 PM', '04:00 PM - 07:00 PM'],
  },
  roomNumber: {
    type: String,
    default: 'OPD-102',
  },
  bio: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('User', userSchema);
const MockModel = createMockModel('users');

const UserProxy = new Proxy(RealModel, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MockModel) {
      return MockModel[prop];
    }
    return target[prop];
  },
});

module.exports = UserProxy;

