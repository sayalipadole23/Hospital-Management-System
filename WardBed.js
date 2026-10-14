const mongoose = require('mongoose');

const wardBedSchema = new mongoose.Schema({
  bedNumber: {
    type: String,
    required: true,
    unique: true,
  },
  wardType: {
    type: String,
    enum: ['ICU', 'General Ward', 'Private Deluxe', 'Emergency / Trauma', 'Pediatric Ward'],
    required: true,
  },
  floor: {
    type: String,
    default: '1st Floor',
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'reserved'],
    default: 'available',
  },
  patientName: {
    type: String,
    default: '',
  },
  admittedDate: {
    type: Date,
  },
  dailyRate: {
    type: Number,
    default: 1500,
  },
  assignedNurse: {
    type: String,
    default: 'Staff Nurse Priya S.',
  },
  oxygenSupport: {
    type: Boolean,
    default: false,
  },
  ventilatorSupport: {
    type: Boolean,
    default: false,
  },
});

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('WardBed', wardBedSchema);
const MockModel = createMockModel('wardBeds');

const WardBedProxy = new Proxy(RealModel, {
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

module.exports = WardBedProxy;

