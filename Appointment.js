const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientPhone: {
    type: String,
    default: '',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  timeSlot: {
    type: String, // e.g. 10:30 AM
    required: true,
  },
  tokenNumber: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    enum: ['in-person', 'teleconsult', 'emergency'],
    default: 'in-person',
  },
  reason: {
    type: String,
    default: 'Regular Consultation',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  vitals: {
    bp: { type: String, default: '120/80 mmHg' },
    pulse: { type: String, default: '72 bpm' },
    temp: { type: String, default: '98.6 °F' },
    weight: { type: String, default: '68 kg' },
  },
  prescriptionNotes: {
    type: String,
    default: '',
  },
  fee: {
    type: Number,
    default: 500,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'paid',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('Appointment', appointmentSchema);
const MockModel = createMockModel('appointments');

const AppointmentProxy = new Proxy(RealModel, {
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

module.exports = AppointmentProxy;

