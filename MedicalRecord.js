const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
  appointmentNumber: {
    type: String,
    default: '',
  },
  diagnosis: {
    type: String,
    required: true,
  },
  symptoms: [String],
  prescriptions: [
    {
      medicine: { type: String, required: true },
      dosage: { type: String, default: '1 tablet' },
      frequency: { type: String, default: 'Twice daily (After meals)' },
      duration: { type: String, default: '5 days' },
      instructions: { type: String, default: 'Take with warm water' },
    },
  ],
  labTests: [
    {
      testName: { type: String, required: true },
      result: { type: String, default: 'Normal' },
      status: { type: String, enum: ['Completed', 'Pending', 'In-Analysis'], default: 'Completed' },
      date: { type: String, default: '2026-10-14' },
    },
  ],
  vitals: {
    bp: { type: String, default: '120/80 mmHg' },
    heartRate: { type: String, default: '74 bpm' },
    spo2: { type: String, default: '99%' },
    temperature: { type: String, default: '98.4 °F' },
  },
  notes: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('MedicalRecord', medicalRecordSchema);
const MockModel = createMockModel('medicalRecords');

const MedicalRecordProxy = new Proxy(RealModel, {
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

module.exports = MedicalRecordProxy;

