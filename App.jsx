import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewDashboard from './components/OverviewDashboard';
import DoctorDirectory from './components/DoctorDirectory';
import AppointmentsManager from './components/AppointmentsManager';
import WardBedTracker from './components/WardBedTracker';
import MedicalRecordsView from './components/MedicalRecordsView';
import BillingManager from './components/BillingManager';
import DepartmentsView from './components/DepartmentsView';
import AppointmentBookingModal from './components/AppointmentBookingModal';
import AuthModal from './components/AuthModal';
import { api, setAuthToken } from './services/api';
import { HeartPulse, PhoneCall, MapPin, Mail, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [wardSummary, setWardSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize and load default demo user (Rahul Sharma - Patient)
  useEffect(() => {
    const initApp = async () => {
      try {
        // Auto-login as default demo patient if no active session
        const token = localStorage.getItem('swasthya_token');
        if (!token) {
          try {
            const loginRes = await api.auth.login('patient@swasthyacare.com', 'password123');
            if (loginRes.user) {
              setCurrentUser(loginRes.user);
            }
          } catch (e) {
            console.warn('Auto demo login warning:', e);
          }
        } else {
          try {
            const meRes = await api.auth.getMe();
            if (meRes.user) {
              setCurrentUser(meRes.user);
            }
          } catch (e) {
            console.warn('Session resume error:', e);
          }
        }

        // Fetch core data
        await refreshAllData();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const refreshAllData = async () => {
    try {
      const [
        statsData, 
        doctorsData, 
        departmentsData, 
        appointmentsData, 
        wardsData, 
        summaryData,
        recordsData,
        billingData
      ] = await Promise.all([
        api.stats.getDashboard().catch(() => ({ stats: null })),
        api.doctors.getAll().catch(() => ({ doctors: [] })),
        api.departments.getAll().catch(() => ({ departments: [] })),
        api.appointments.getAll().catch(() => ({ appointments: [] })),
        api.wards.getAll().catch(() => ({ beds: [] })),
        api.wards.getSummary().catch(() => ({ summary: null })),
        api.medicalRecords.getAll().catch(() => ({ records: [] })),
        api.billing.getAll().catch(() => ({ invoices: [] })),
      ]);

      if (statsData?.stats) setStats(statsData.stats);
      if (doctorsData?.doctors) setDoctors(doctorsData.doctors);
      if (departmentsData?.departments) setDepartments(departmentsData.departments);
      if (appointmentsData?.appointments) setAppointments(appointmentsData.appointments);
      if (wardsData?.beds) setBeds(wardsData.beds);
      if (summaryData?.summary) setWardSummary(summaryData.summary);
      if (recordsData?.records) setRecords(recordsData.records);
      if (billingData?.invoices) setInvoices(billingData.invoices);
    } catch (e) {
      console.error('Data refresh error:', e);
    }
  };

  const handleSwitchUser = async (email) => {
    try {
      const res = await api.auth.login(email, 'password123');
      if (res.user) {
        setCurrentUser(res.user);
        await refreshAllData();
      }
    } catch (err) {
      alert(`User switch failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const handleOpenBooking = (doc) => {
    setSelectedDoctorForBooking(doc);
    setBookingModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <div className="container">
          {activeTab === 'overview' && (
            <OverviewDashboard
              stats={stats}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onBookAppointment={handleOpenBooking}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorDirectory
              doctors={doctors}
              departments={departments}
              onBookAppointment={handleOpenBooking}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsManager
              appointments={appointments}
              currentUser={currentUser}
              onBookAppointment={handleOpenBooking}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'wards' && (
            <WardBedTracker
              beds={beds}
              wardSummary={wardSummary}
              currentUser={currentUser}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'records' && (
            <MedicalRecordsView
              records={records}
              currentUser={currentUser}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'billing' && (
            <BillingManager
              invoices={invoices}
              currentUser={currentUser}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              doctors={doctors}
              onSelectDoctor={(doc) => {
                setActiveTab('doctors');
                handleOpenBooking(doc);
              }}
            />
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <AppointmentBookingModal
          doctor={selectedDoctorForBooking}
          doctors={doctors}
          currentUser={currentUser}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={() => {
            refreshAllData();
            setActiveTab('appointments');
          }}
        />
      )}
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          refreshAllData();
        }}
      />

      {/* Footer */}
      <footer style={{ backgroundColor: '#070b14', borderTop: '1px solid var(--border-light)', padding: '40px 0 25px', marginTop: 'auto' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px', marginBottom: '30px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HeartPulse size={18} color="#ffffff" />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>SwasthyaCare</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Premier multi-specialty healthcare & surgical hospital offering 24x7 emergency trauma stabilization, robotic joint replacements, Level-III NICU & cath lab.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#f8fafc' }}>24x7 Emergency Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={15} color="#ef4444" />
                  <span style={{ color: '#f87171', fontWeight: 600 }}>Emergency Hotline: 108 / +91 22 2650 9999</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#10b981" />
                  <span>SwasthyaCare Boulevard, Bandra West, Mumbai 400050</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} color="#06b6d4" />
                  <span>emergency@swasthyacare.com</span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: '#f8fafc' }}>Hospital Portals</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button onClick={() => handleSwitchUser('patient@swasthyacare.com')} className="badge badge-success">Patient Desk</button>
                <button onClick={() => handleSwitchUser('doctor.sharma@swasthyacare.com')} className="badge badge-info">Doctor Portal</button>
                <button onClick={() => handleSwitchUser('admin@swasthyacare.com')} className="badge badge-purple">Medical Admin</button>
                <button onClick={() => handleSwitchUser('staff@swasthyacare.com')} className="badge badge-warning">Nursing & Triage</button>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            <div>
              © 2026 SwasthyaCare Hospital & Research Centre. All Rights Reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
              <ShieldCheck size={14} /> NABH & JCI Accredited Hospital System • ISO 27001 Certified Healthcare EMR
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
