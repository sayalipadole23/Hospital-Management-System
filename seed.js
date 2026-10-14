const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const WardBed = require('../models/WardBed');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const MedicalRecord = require('../models/MedicalRecord');

const departmentsData = [
  {
    name: 'Cardiology',
    code: 'CARD',
    description: 'Comprehensive adult & pediatric heart care, cath lab, and non-invasive cardiac imaging.',
    icon: 'HeartPulse',
    headDoctor: 'Dr. Anita Sharma',
    totalBeds: 24,
    availableBeds: 8,
    floor: '3rd Floor, Block A',
    emergencyAvailable: true,
  },
  {
    name: 'Neurology & Neurosurgery',
    code: 'NEUR',
    description: 'Advanced stroke management, epilepsy monitoring, neuro-navigation, and spine care.',
    icon: 'Brain',
    headDoctor: 'Dr. Vikram Patel',
    totalBeds: 18,
    availableBeds: 6,
    floor: '4th Floor, Block B',
    emergencyAvailable: true,
  },
  {
    name: 'Orthopedics & Joint Replacement',
    code: 'ORTH',
    description: 'Robotic joint replacements, sports injuries, arthroscopy, and poly-trauma stabilization.',
    icon: 'Bone',
    headDoctor: 'Dr. Arjun Rao',
    totalBeds: 20,
    availableBeds: 11,
    floor: '2nd Floor, Block A',
    emergencyAvailable: true,
  },
  {
    name: 'Pediatrics & Neonatology',
    code: 'PEDI',
    description: '24/7 Level-III NICU, developmental pediatrics, pediatric immunizations, and surgery.',
    icon: 'Baby',
    headDoctor: 'Dr. Sunita Mehta',
    totalBeds: 16,
    availableBeds: 9,
    floor: '2nd Floor, Block C',
    emergencyAvailable: false,
  },
  {
    name: 'Pulmonology & Critical Care',
    code: 'PULM',
    description: 'Advanced respiratory diagnostics, bronchoscopy, asthma, COPD, and sleep apnea care.',
    icon: 'Activity',
    headDoctor: 'Dr. Priyabrata Das',
    totalBeds: 15,
    availableBeds: 5,
    floor: '3rd Floor, Block B',
    emergencyAvailable: true,
  },
  {
    name: 'Emergency & Trauma Care',
    code: 'EMRG',
    description: '24x7 acute trauma resuscitation, triaged ICU stabilization, and emergency triage team.',
    icon: 'ShieldAlert',
    headDoctor: 'Dr. Rajesh Verma',
    totalBeds: 14,
    availableBeds: 7,
    floor: 'Ground Floor, Main Entrance',
    emergencyAvailable: true,
  },
];

const doctorsData = [
  {
    name: 'Dr. Anita Sharma',
    email: 'doctor.sharma@swasthyacare.com',
    password: 'password123',
    role: 'doctor',
    phone: '+91 98201 23456',
    gender: 'Female',
    age: 44,
    bloodGroup: 'B+',
    address: 'Bandra West, Mumbai',
    specialization: 'Senior Interventional Cardiologist',
    department: 'Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
    experienceYears: 18,
    consultationFee: 900,
    rating: 4.9,
    reviewsCount: 312,
    availability: ['09:00 AM - 01:00 PM', '05:00 PM - 08:00 PM'],
    roomNumber: 'OPD-102 (3rd Floor)',
    bio: 'Pioneer in minimally invasive angioplasty, transcatheter aortic valve replacement, and cardiac rehabilitation.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Dr. Vikram Patel',
    email: 'doctor.patel@swasthyacare.com',
    password: 'password123',
    role: 'doctor',
    phone: '+91 98202 34567',
    gender: 'Male',
    age: 49,
    bloodGroup: 'O+',
    address: 'Juhu Scheme, Mumbai',
    specialization: 'Chief Neurosurgeon & Spine Specialist',
    department: 'Neurology & Neurosurgery',
    qualification: 'MBBS, MS (General Surgery), MCh (Neurosurgery)',
    experienceYears: 22,
    consultationFee: 1200,
    rating: 4.95,
    reviewsCount: 420,
    availability: ['10:00 AM - 02:00 PM', '04:00 PM - 07:00 PM'],
    roomNumber: 'OPD-204 (4th Floor)',
    bio: 'Specialist in minimally invasive spine fusion, awake brain surgeries, and complex micro-vascular neurosurgery.',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Dr. Sunita Mehta',
    email: 'doctor.mehta@swasthyacare.com',
    password: 'password123',
    role: 'doctor',
    phone: '+91 98203 45678',
    gender: 'Female',
    age: 38,
    bloodGroup: 'A+',
    address: 'Powai, Mumbai',
    specialization: 'Consultant Pediatrician & Neonatologist',
    department: 'Pediatrics & Neonatology',
    qualification: 'MBBS, MD (Pediatrics), Fellowship in Neonatal ICU',
    experienceYears: 13,
    consultationFee: 750,
    rating: 4.85,
    reviewsCount: 260,
    availability: ['09:30 AM - 01:30 PM', '04:30 PM - 07:30 PM'],
    roomNumber: 'OPD-108 (2nd Floor)',
    bio: 'Dedicated child specialist passionate about compassionate child wellness, growth monitoring, and newborn care.',
    avatar: 'https://images.unsplash.com/photo-1594824813589-a93f17c493fd?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Dr. Arjun Rao',
    email: 'doctor.rao@swasthyacare.com',
    password: 'password123',
    role: 'doctor',
    phone: '+91 98204 56789',
    gender: 'Male',
    age: 42,
    bloodGroup: 'AB+',
    address: 'Andheri East, Mumbai',
    specialization: 'Senior Orthopedic & Joint Surgeon',
    department: 'Orthopedics & Joint Replacement',
    qualification: 'MBBS, MS (Orthopedics), Fellowship in Robotic Arthroplasty (UK)',
    experienceYears: 16,
    consultationFee: 850,
    rating: 4.88,
    reviewsCount: 295,
    availability: ['11:00 AM - 03:00 PM', '06:00 PM - 09:00 PM'],
    roomNumber: 'OPD-115 (2nd Floor)',
    bio: 'Renowned expert in computer-guided knee and hip replacements and rapid recovery sports medicine protocols.',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Dr. Priyabrata Das',
    email: 'doctor.das@swasthyacare.com',
    password: 'password123',
    role: 'doctor',
    phone: '+91 98205 67890',
    gender: 'Male',
    age: 46,
    bloodGroup: 'O-',
    address: 'Worli, Mumbai',
    specialization: 'Pulmonologist & Critical Care Director',
    department: 'Pulmonology & Critical Care',
    qualification: 'MBBS, MD (Pulmonary Medicine), European Diploma in Intensive Care',
    experienceYears: 19,
    consultationFee: 800,
    rating: 4.79,
    reviewsCount: 188,
    availability: ['10:00 AM - 02:00 PM', '05:00 PM - 08:00 PM'],
    roomNumber: 'OPD-305 (3rd Floor)',
    bio: 'Special interest in post-viral lung fibrosis, severe asthma biologics, interventional pulmonology, and sleep studies.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
  },
];

const staffAndAdminData = [
  {
    name: 'Dr. Rajesh Verma (Medical Director)',
    email: 'admin@swasthyacare.com',
    password: 'password123',
    role: 'admin',
    phone: '+91 98000 11111',
    gender: 'Male',
    age: 52,
    bloodGroup: 'A+',
    address: 'Nariman Point, Mumbai',
    specialization: 'Chief Medical Administrator & Trauma Lead',
    department: 'Emergency & Trauma Care',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Priya Sundaram',
    email: 'staff@swasthyacare.com',
    password: 'password123',
    role: 'staff',
    phone: '+91 98111 22222',
    gender: 'Female',
    age: 33,
    bloodGroup: 'B+',
    address: 'Dadar, Mumbai',
    department: 'Inpatient Care & Triage Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  },
  {
    name: 'Rahul Sharma',
    email: 'patient@swasthyacare.com',
    password: 'password123',
    role: 'patient',
    phone: '+91 98765 43210',
    gender: 'Male',
    age: 34,
    bloodGroup: 'O+',
    address: 'Sector 14, Navi Mumbai',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
  },
];

const wardBedsData = [
  { bedNumber: 'ICU-101', wardType: 'ICU', floor: '1st Floor - Critical Wing', status: 'occupied', patientName: 'Suresh Singhania', admittedDate: new Date('2026-10-12'), dailyRate: 5000, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: true, ventilatorSupport: true },
  { bedNumber: 'ICU-102', wardType: 'ICU', floor: '1st Floor - Critical Wing', status: 'occupied', patientName: 'Kavita Joshi', admittedDate: new Date('2026-10-13'), dailyRate: 5000, assignedNurse: 'Nurse John Paul', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'ICU-103', wardType: 'ICU', floor: '1st Floor - Critical Wing', status: 'available', patientName: '', dailyRate: 5000, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: true, ventilatorSupport: true },
  { bedNumber: 'ICU-104', wardType: 'ICU', floor: '1st Floor - Critical Wing', status: 'cleaning', patientName: '', dailyRate: 5000, assignedNurse: 'Nurse Neha T.', oxygenSupport: true, ventilatorSupport: true },

  { bedNumber: 'ER-01', wardType: 'Emergency / Trauma', floor: 'Ground Floor', status: 'occupied', patientName: 'Alok Dixit', admittedDate: new Date('2026-10-14T08:00:00'), dailyRate: 2500, assignedNurse: 'Nurse Deepak K.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'ER-02', wardType: 'Emergency / Trauma', floor: 'Ground Floor', status: 'available', patientName: '', dailyRate: 2500, assignedNurse: 'Nurse Deepak K.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'ER-03', wardType: 'Emergency / Trauma', floor: 'Ground Floor', status: 'available', patientName: '', dailyRate: 2500, assignedNurse: 'Nurse Deepak K.', oxygenSupport: true, ventilatorSupport: true },

  { bedNumber: 'DELUXE-201', wardType: 'Private Deluxe', floor: '2nd Floor - Premium Suite', status: 'occupied', patientName: 'Meenakshi Iyer', admittedDate: new Date('2026-10-11'), dailyRate: 4000, assignedNurse: 'Nurse Anjali R.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'DELUXE-202', wardType: 'Private Deluxe', floor: '2nd Floor - Premium Suite', status: 'available', patientName: '', dailyRate: 4000, assignedNurse: 'Nurse Anjali R.', oxygenSupport: false, ventilatorSupport: false },
  { bedNumber: 'DELUXE-203', wardType: 'Private Deluxe', floor: '2nd Floor - Premium Suite', status: 'available', patientName: '', dailyRate: 4000, assignedNurse: 'Nurse Anjali R.', oxygenSupport: false, ventilatorSupport: false },
  { bedNumber: 'DELUXE-204', wardType: 'Private Deluxe', floor: '2nd Floor - Premium Suite', status: 'reserved', patientName: 'Ramesh K. (Post-Op)', dailyRate: 4000, assignedNurse: 'Nurse Anjali R.', oxygenSupport: true, ventilatorSupport: false },

  { bedNumber: 'GW-A1', wardType: 'General Ward', floor: '2nd Floor - East Wing', status: 'occupied', patientName: 'Dinesh Sawant', admittedDate: new Date('2026-10-10'), dailyRate: 1200, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: false, ventilatorSupport: false },
  { bedNumber: 'GW-A2', wardType: 'General Ward', floor: '2nd Floor - East Wing', status: 'available', patientName: '', dailyRate: 1200, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: false, ventilatorSupport: false },
  { bedNumber: 'GW-A3', wardType: 'General Ward', floor: '2nd Floor - East Wing', status: 'available', patientName: '', dailyRate: 1200, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'GW-A4', wardType: 'General Ward', floor: '2nd Floor - East Wing', status: 'cleaning', patientName: '', dailyRate: 1200, assignedNurse: 'Staff Nurse Priya S.', oxygenSupport: false, ventilatorSupport: false },
  { bedNumber: 'GW-B1', wardType: 'General Ward', floor: '2nd Floor - West Wing', status: 'available', patientName: '', dailyRate: 1200, assignedNurse: 'Nurse Shilpa M.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'GW-B2', wardType: 'General Ward', floor: '2nd Floor - West Wing', status: 'occupied', patientName: 'Farhan Sheikh', admittedDate: new Date('2026-10-13'), dailyRate: 1200, assignedNurse: 'Nurse Shilpa M.', oxygenSupport: false, ventilatorSupport: false },

  { bedNumber: 'PED-01', wardType: 'Pediatric Ward', floor: '2nd Floor - Block C', status: 'occupied', patientName: 'Baby Aryan (8y)', admittedDate: new Date('2026-10-13'), dailyRate: 1800, assignedNurse: 'Nurse Sneha K.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'PED-02', wardType: 'Pediatric Ward', floor: '2nd Floor - Block C', status: 'available', patientName: '', dailyRate: 1800, assignedNurse: 'Nurse Sneha K.', oxygenSupport: true, ventilatorSupport: false },
  { bedNumber: 'PED-03', wardType: 'Pediatric Ward', floor: '2nd Floor - Block C', status: 'available', patientName: '', dailyRate: 1800, assignedNurse: 'Nurse Sneha K.', oxygenSupport: false, ventilatorSupport: false },
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Hospital Database Auto-Seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Department.deleteMany({});
    await WardBed.deleteMany({});
    await Appointment.deleteMany({});
    await Billing.deleteMany({});
    await MedicalRecord.deleteMany({});

    // 1. Seed Departments
    const createdDepartments = await Department.insertMany(departmentsData);
    console.log(`✅ Seeded ${createdDepartments.length} Departments`);

    // 2. Seed Users (Doctors, Admin, Staff, Patients)
    // Note: User pre-save handles password hashing when creating individually
    const createdUsers = [];
    for (const doc of doctorsData) {
      const user = await User.create(doc);
      createdUsers.push(user);
    }
    for (const usr of staffAndAdminData) {
      const user = await User.create(usr);
      createdUsers.push(user);
    }
    console.log(`✅ Seeded ${createdUsers.length} Users (Admin, Doctors, Staff, Patient)`);

    const doctorSharma = createdUsers.find(u => u.email === 'doctor.sharma@swasthyacare.com');
    const doctorPatel = createdUsers.find(u => u.email === 'doctor.patel@swasthyacare.com');
    const doctorMehta = createdUsers.find(u => u.email === 'doctor.mehta@swasthyacare.com');
    const patientUser = createdUsers.find(u => u.email === 'patient@swasthyacare.com');

    // 3. Seed Ward Beds
    const createdBeds = await WardBed.insertMany(wardBedsData);
    console.log(`✅ Seeded ${createdBeds.length} Ward Beds across ICU, General & Deluxe`);

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // 4. Seed Appointments
    const appointmentsData = [
      {
        appointmentNumber: 'APT-2026-0101',
        patient: patientUser._id,
        patientName: patientUser.name,
        patientPhone: patientUser.phone,
        doctor: doctorSharma._id,
        doctorName: doctorSharma.name,
        department: doctorSharma.department,
        date: todayStr,
        timeSlot: '10:00 AM',
        tokenNumber: 1,
        type: 'in-person',
        reason: 'Routine Cardiac Health Checkup & Blood Pressure Monitoring',
        status: 'confirmed',
        vitals: { bp: '128/82 mmHg', pulse: '74 bpm', temp: '98.4 °F', weight: '71 kg' },
        fee: doctorSharma.consultationFee,
        paymentStatus: 'paid',
      },
      {
        appointmentNumber: 'APT-2026-0102',
        patient: patientUser._id,
        patientName: patientUser.name,
        patientPhone: patientUser.phone,
        doctor: doctorPatel._id,
        doctorName: doctorPatel.name,
        department: doctorPatel.department,
        date: tomorrowStr,
        timeSlot: '11:30 AM',
        tokenNumber: 3,
        type: 'in-person',
        reason: 'Recurring Migraine & Cervical Stiffness evaluation',
        status: 'confirmed',
        vitals: { bp: '120/80 mmHg', pulse: '70 bpm', temp: '98.6 °F', weight: '71 kg' },
        fee: doctorPatel.consultationFee,
        paymentStatus: 'paid',
      },
      {
        appointmentNumber: 'APT-2026-0103',
        patient: patientUser._id,
        patientName: 'Sunita Singhania',
        patientPhone: '+91 98333 44444',
        doctor: doctorSharma._id,
        doctorName: doctorSharma.name,
        department: doctorSharma.department,
        date: todayStr,
        timeSlot: '11:00 AM',
        tokenNumber: 2,
        type: 'in-person',
        reason: 'Post-stent Follow-up',
        status: 'in-progress',
        vitals: { bp: '135/85 mmHg', pulse: '80 bpm', temp: '98.2 °F', weight: '64 kg' },
        fee: doctorSharma.consultationFee,
        paymentStatus: 'paid',
      },
    ];

    const createdAppointments = await Appointment.insertMany(appointmentsData);
    console.log(`✅ Seeded ${createdAppointments.length} Sample Appointments`);

    // 5. Seed Medical Records
    const medicalRecordsData = [
      {
        patient: patientUser._id,
        doctor: doctorSharma._id,
        doctorName: doctorSharma.name,
        appointmentNumber: 'APT-2026-0095',
        diagnosis: 'Mild Hypertension & Dyslipidemia (Borderline)',
        symptoms: ['Mild morning headaches', 'Occasional palpitations after exertion'],
        prescriptions: [
          { medicine: 'Telmisartan 40mg', dosage: '1 tablet', frequency: 'Once daily (Morning after breakfast)', duration: '30 days', instructions: 'Monitor BP weekly; take after breakfast' },
          { medicine: 'Rosuvastatin 10mg', dosage: '1 tablet', frequency: 'Once daily (Night after dinner)', duration: '30 days', instructions: 'Avoid grapefruit; take at bedtime' },
          { medicine: 'Omega-3 Marine Triglycerides 1000mg', dosage: '1 capsule', frequency: 'Once daily (Lunch)', duration: '60 days', instructions: 'With adequate water' },
        ],
        labTests: [
          { testName: 'Lipid Profile Complete', result: 'Total Chol: 215 mg/dL, LDL: 138 mg/dL', status: 'Completed', date: '2026-10-10' },
          { testName: '12-Lead Electrocardiogram (ECG)', result: 'Normal Sinus Rhythm, No ST-T changes', status: 'Completed', date: '2026-10-10' },
          { testName: '2D Echocardiography', result: 'LVEF 62%, Normal LV systolic function', status: 'Completed', date: '2026-10-12' },
        ],
        vitals: { bp: '128/82 mmHg', heartRate: '74 bpm', spo2: '99%', temperature: '98.4 °F' },
        notes: 'Advised 30 minutes brisk walking daily. Reduce dietary sodium intake. Follow up after 4 weeks with fresh lipid report.',
        followUpDate: '2026-11-15',
        date: new Date('2026-10-10'),
      },
    ];

    const createdRecords = await MedicalRecord.insertMany(medicalRecordsData);
    console.log(`✅ Seeded ${createdRecords.length} Clinical Medical Records & Prescriptions`);

    // 6. Seed Billing Invoices
    const billingData = [
      {
        invoiceNumber: 'INV-2026-01001',
        patient: patientUser._id,
        patientName: patientUser.name,
        appointmentNumber: 'APT-2026-0101',
        items: [
          { description: 'Comprehensive OPD Cardiac Consultation - Dr. Anita Sharma', amount: 900, category: 'Consultation' },
          { description: '12-Lead Digital ECG & Interpretation', amount: 450, category: 'Diagnostics' },
          { description: 'Vitals & BMI Bio-impedance screening', amount: 150, category: 'OPD Nursing' },
        ],
        subtotal: 1500,
        tax: 0,
        discount: 100,
        totalAmount: 1400,
        status: 'paid',
        paymentMethod: 'UPI / QR',
        paymentDate: new Date(),
      },
      {
        invoiceNumber: 'INV-2026-01002',
        patient: patientUser._id,
        patientName: patientUser.name,
        appointmentNumber: 'APT-2026-0102',
        items: [
          { description: 'Specialist Neurosurgery Consultation - Dr. Vikram Patel', amount: 1200, category: 'Consultation' },
        ],
        subtotal: 1200,
        tax: 0,
        discount: 0,
        totalAmount: 1200,
        status: 'paid',
        paymentMethod: 'Credit Card',
        paymentDate: new Date(),
      },
    ];

    const createdBilling = await Billing.insertMany(billingData);
    console.log(`✅ Seeded ${createdBilling.length} Billing Invoices`);

    console.log('🎉 SwasthyaCare Database Seeding Complete!');
    return true;
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
};

// Allow running directly via node scripts/seed.js
if (require.main === module) {
  require('dotenv').config();
  const { connectDB, disconnectDB } = require('../config/db');

  connectDB()
    .then(async () => {
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
