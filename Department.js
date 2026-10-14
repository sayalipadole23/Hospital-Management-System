const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: 'Stethoscope',
  },
  headDoctor: {
    type: String,
    default: '',
  },
  totalBeds: {
    type: Number,
    default: 20,
  },
  availableBeds: {
    type: Number,
    default: 12,
  },
  floor: {
    type: String,
    default: '2nd Floor',
  },
  emergencyAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('Department', departmentSchema);
const MockModel = createMockModel('departments');

const DepartmentProxy = new Proxy(RealModel, {
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

module.exports = DepartmentProxy;

