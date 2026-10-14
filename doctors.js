const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all doctors with optional department & search filtering
router.get('/', async (req, res) => {
  try {
    const { department, search } = req.query;
    let query = { role: 'doctor' };

    if (department && department !== 'All Departments') {
      query.department = new RegExp(department, 'i');
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') },
      ];
    }

    const doctors = await User.find(query).select(
      'name email phone specialization department qualification experienceYears consultationFee rating reviewsCount availability roomNumber bio avatar'
    );

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor details
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
