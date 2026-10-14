const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  invoiceNumber: {
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
  appointmentNumber: {
    type: String,
    default: '',
  },
  items: [
    {
      description: { type: String, required: true },
      amount: { type: Number, required: true },
      category: { type: String, default: 'Consultation' },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid',
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'UPI / QR', 'Cash', 'Insurance', 'Net Banking'],
    default: 'UPI / QR',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
});

const { createMockModel } = require('../config/inMemoryDb');
const RealModel = mongoose.model('Billing', billingSchema);
const MockModel = createMockModel('billings');

const BillingProxy = new Proxy(RealModel, {
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

module.exports = BillingProxy;

