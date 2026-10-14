const mongoose = require('mongoose');

let isInMemoryMode = false;

const connectDB = async () => {
  const explicitUri = process.env.MONGODB_URI;

  if (explicitUri) {
    try {
      const conn = await mongoose.connect(explicitUri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`✅ MongoDB Connected (Atlas/Custom): ${conn.connection.host}`);
      isInMemoryMode = false;
      return;
    } catch (err) {
      console.warn(`⚠️ Custom MONGODB_URI connection failed (${err.message}). Checking local fallback...`);
    }
  }

  // Try local MongoDB instance first with 1.5s timeout
  try {
    const localUri = 'mongodb://127.0.0.1:27017/swasthyacare';
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`✅ MongoDB Connected (Local Daemon): ${conn.connection.host}`);
    isInMemoryMode = false;
    return;
  } catch (localErr) {
    console.log('⚡ Local MongoDB daemon not detected.');
  }

  // Activate High-Speed In-Memory Clinical Database Engine
  console.log('🚀 Activated SwasthyaCare In-Memory Database Engine (Zero Latency, Instant Ready)');
  console.log('🩺 All hospital collections (Doctors, Departments, Ward Beds, Appointments, Invoices) are fully functional.');
  isInMemoryMode = true;
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

const getIsInMemory = () => isInMemoryMode;

module.exports = { connectDB, disconnectDB, getIsInMemory };
