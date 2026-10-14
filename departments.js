const express = require('express');
const Department = require('../models/Department');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all hospital departments with doctor count
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    
    // Enrich with live doctor counts
    const departmentsWithDoctors = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await User.countDocuments({
          role: 'doctor',
          department: new RegExp(dept.name, 'i'),
        });
        return {
          ...dept.toObject(),
          doctorCount,
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithDoctors.length,
      departments: departmentsWithDoctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
router.get('/:id', async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const doctors = await User.find({
      role: 'doctor',
      department: new RegExp(department.name, 'i'),
    }).select('name specialization qualification consultationFee rating reviewsCount roomNumber avatar');

    res.json({
      success: true,
      department: {
        ...department.toObject(),
        doctors,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/departments
// @desc    Create a new department (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, icon, headDoctor, totalBeds, availableBeds, floor, emergencyAvailable } = req.body;
    
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department with this name already exists' });
    }

    const department = await Department.create({
      name,
      code,
      description,
      icon,
      headDoctor,
      totalBeds: totalBeds || 20,
      availableBeds: availableBeds !== undefined ? availableBeds : totalBeds || 20,
      floor,
      emergencyAvailable: emergencyAvailable !== undefined ? emergencyAvailable : true,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
