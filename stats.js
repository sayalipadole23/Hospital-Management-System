const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const WardBed = require('../models/WardBed');
const Department = require('../models/Department');
const Billing = require('../models/Billing');

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Get aggregate statistics for hospital dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      totalDepartments,
      totalAppointments,
      todayAppointments,
      totalBeds,
      availableBeds,
      occupiedBeds,
      icuAvailable,
      allBills,
      recentAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'staff' }),
      Department.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: today }),
      WardBed.countDocuments(),
      WardBed.countDocuments({ status: 'available' }),
      WardBed.countDocuments({ status: 'occupied' }),
      WardBed.countDocuments({ wardType: 'ICU', status: 'available' }),
      Billing.find({ status: 'paid' }).select('totalAmount'),
      Appointment.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = allBills.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalStaff,
        totalDepartments,
        totalAppointments,
        todayAppointments,
        bedStats: {
          totalBeds,
          availableBeds,
          occupiedBeds,
          icuAvailable,
          occupancyRate: bedOccupancyRate,
        },
        financial: {
          totalRevenue,
          currency: 'INR',
          symbol: '₹',
        },
        recentAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
