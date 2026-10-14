const express = require('express');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medical-records
// @desc    Get medical records (Patient gets their own, Doctors/Staff/Admin get all or by patient query)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.query.patientId) {
      query.patient = req.query.patientId;
    }

    const records = await MedicalRecord.find(query)
      .populate('patient', 'name email phone bloodGroup age gender')
      .populate('doctor', 'name specialization department roomNumber')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/medical-records/:id
// @desc    Get single record
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'name email phone bloodGroup age gender address')
      .populate('doctor', 'name specialization department qualification roomNumber');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    if (req.user.role === 'patient' && record.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/medical-records
// @desc    Create prescription & clinical note (Doctor/Admin only)
router.post('/', protect, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const {
      patientId,
      appointmentNumber,
      diagnosis,
      symptoms = [],
      prescriptions = [],
      labTests = [],
      vitals,
      notes,
      followUpDate,
    } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const record = await MedicalRecord.create({
      patient: patient._id,
      doctor: req.user._id,
      doctorName: req.user.name,
      appointmentNumber: appointmentNumber || '',
      diagnosis,
      symptoms,
      prescriptions,
      labTests,
      vitals: vitals || {
        bp: '120/80 mmHg',
        heartRate: '72 bpm',
        spo2: '99%',
        temperature: '98.6 °F',
      },
      notes: notes || '',
      followUpDate: followUpDate || '',
    });

    res.status(201).json({
      success: true,
      message: 'Medical record saved successfully',
      record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
