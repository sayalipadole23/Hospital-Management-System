const express = require('express');
const WardBed = require('../models/WardBed');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/wards
// @desc    Get all beds with optional filtering by wardType, status, floor
router.get('/', async (req, res) => {
  try {
    const { wardType, status, floor } = req.query;
    let query = {};

    if (wardType && wardType !== 'All Wards') {
      query.wardType = wardType;
    }
    if (status && status !== 'All Status') {
      query.status = status;
    }
    if (floor) {
      query.floor = floor;
    }

    const beds = await WardBed.find(query).sort({ bedNumber: 1 });

    res.json({
      success: true,
      count: beds.length,
      beds,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/wards/summary
// @desc    Get bed occupancy statistics
router.get('/summary', async (req, res) => {
  try {
    const totalBeds = await WardBed.countDocuments();
    const availableBeds = await WardBed.countDocuments({ status: 'available' });
    const occupiedBeds = await WardBed.countDocuments({ status: 'occupied' });
    const cleaningBeds = await WardBed.countDocuments({ status: 'cleaning' });
    const icuTotal = await WardBed.countDocuments({ wardType: 'ICU' });
    const icuAvailable = await WardBed.countDocuments({ wardType: 'ICU', status: 'available' });
    const oxygenBeds = await WardBed.countDocuments({ oxygenSupport: true });
    const ventilatorBeds = await WardBed.countDocuments({ ventilatorSupport: true });

    res.json({
      success: true,
      summary: {
        totalBeds,
        availableBeds,
        occupiedBeds,
        cleaningBeds,
        occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        icuTotal,
        icuAvailable,
        oxygenBeds,
        ventilatorBeds,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/wards/:id/status
// @desc    Update bed status (admit, discharge, maintenance)
router.put('/:id/status', protect, authorize('admin', 'staff', 'doctor'), async (req, res) => {
  try {
    const { status, patientName, dailyRate, assignedNurse } = req.body;
    const updateObj = {};

    if (status) {
      updateObj.status = status;
      if (status === 'available') {
        updateObj.patientName = '';
        updateObj.admittedDate = null;
      } else if (status === 'occupied') {
        updateObj.patientName = patientName || 'Admitted Patient';
        updateObj.admittedDate = new Date();
      }
    }
    if (dailyRate) updateObj.dailyRate = dailyRate;
    if (assignedNurse) updateObj.assignedNurse = assignedNurse;

    const bed = await WardBed.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Ward Bed not found' });
    }

    res.json({
      success: true,
      message: `Bed ${bed.bedNumber} status updated to ${bed.status}`,
      bed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/wards/admit
// @desc    Admit patient to an available bed
router.post('/admit', protect, authorize('admin', 'staff', 'doctor'), async (req, res) => {
  try {
    const { bedNumber, patientName, assignedNurse } = req.body;
    
    const bed = await WardBed.findOne({ bedNumber });
    if (!bed) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }
    if (bed.status === 'occupied') {
      return res.status(400).json({ success: false, message: `Bed ${bedNumber} is already occupied` });
    }

    bed.status = 'occupied';
    bed.patientName = patientName || 'Patient';
    bed.admittedDate = new Date();
    if (assignedNurse) bed.assignedNurse = assignedNurse;
    await bed.save();

    res.json({
      success: true,
      message: `Patient admitted to bed ${bedNumber} successfully`,
      bed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
