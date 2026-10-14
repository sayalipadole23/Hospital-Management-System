const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Billing = require('../models/Billing');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to generate appointment token/number
const generateAppointmentNumber = async () => {
  const count = await Appointment.countDocuments();
  const year = new Date().getFullYear();
  return `APT-${year}-${String(count + 101).padStart(4, '0')}`;
};

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, reason, patientName, patientPhone } = req.body;

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Selected doctor not found' });
    }

    const aptNumber = await generateAppointmentNumber();

    // Calculate token number for that day & doctor
    const existingDoctorAptsToday = await Appointment.countDocuments({
      doctor: doctor._id,
      date,
    });
    const tokenNumber = existingDoctorAptsToday + 1;

    const appointment = await Appointment.create({
      appointmentNumber: aptNumber,
      patient: req.user._id,
      patientName: patientName || req.user.name,
      patientPhone: patientPhone || req.user.phone || '+91 98765 43210',
      doctor: doctor._id,
      doctorName: doctor.name,
      department: doctor.department,
      date,
      timeSlot,
      tokenNumber,
      type: type || 'in-person',
      reason: reason || 'General Consultation',
      status: 'confirmed',
      fee: doctor.consultationFee || 500,
      paymentStatus: 'paid',
    });

    // Auto-create initial billing invoice
    const invoiceCount = await Billing.countDocuments();
    await Billing.create({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCount + 1001).padStart(5, '0')}`,
      patient: req.user._id,
      patientName: appointment.patientName,
      appointmentNumber: appointment.appointmentNumber,
      items: [
        {
          description: `OPD Consultation with ${doctor.name} (${doctor.department})`,
          amount: doctor.consultationFee || 500,
          category: 'Consultation Fee',
        },
      ],
      subtotal: doctor.consultationFee || 500,
      tax: 0,
      discount: 0,
      totalAmount: doctor.consultationFee || 500,
      status: 'paid',
      paymentMethod: 'UPI / QR',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments list according to user role or filters
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    // Admin or Staff sees all appointments, or filtered by query params
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.date) {
      query.date = req.query.date;
    }

    const appointments = await Appointment.find(query).sort({ date: -1, tokenNumber: 1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment details
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization department phone roomNumber avatar')
      .populate('patient', 'name email phone bloodGroup age gender');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, prescriptionNotes, vitals } = req.body;
    const updateObj = {};
    if (status) updateObj.status = status;
    if (prescriptionNotes !== undefined) updateObj.prescriptionNotes = prescriptionNotes;
    if (vitals) updateObj.vitals = vitals;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel an appointment
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
