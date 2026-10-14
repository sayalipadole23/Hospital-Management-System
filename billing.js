const express = require('express');
const Billing = require('../models/Billing');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper to generate invoice number
const generateInvoiceNumber = async () => {
  const count = await Billing.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1001).padStart(5, '0')}`;
};

// @route   GET /api/billing
// @desc    Get all billing records (Patients see their own, Admin/Staff see all)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const invoices = await Billing.find(query)
      .populate('patient', 'name email phone bloodGroup')
      .sort({ paymentDate: -1, _id: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/billing/:id
// @desc    Get single invoice details
router.get('/:id', protect, async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id).populate('patient', 'name email phone address');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Patients can only access their own invoices
    if (req.user.role === 'patient' && invoice.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/billing
// @desc    Generate a new bill/invoice (Admin or Staff)
router.post('/', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { patientId, patientName, appointmentNumber, items, discount = 0, tax = 0, paymentMethod = 'UPI / QR', status = 'pending' } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please provide at least one billable item' });
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalAmount = Math.max(0, subtotal + Number(tax) - Number(discount));
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Billing.create({
      invoiceNumber,
      patient: patientId || req.user._id,
      patientName: patientName || 'OPD Patient',
      appointmentNumber: appointmentNumber || '',
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
      status,
      paymentMethod,
      paymentDate: status === 'paid' ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/billing/:id/pay
// @desc    Process payment for pending bill
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const { paymentMethod = 'UPI / QR' } = req.body;
    const invoice = await Billing.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: 'Payment received successfully',
      invoice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
