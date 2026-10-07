import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import type { Booking } from '../types';
import { 
  Bike, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  Navigation, 
  User, 
  Lock, 
  MapPin, 
  PhilippinePeso, 
  ShieldCheck, 
  Check, 
  History, 
  Radio
} from 'lucide-react';
import { DriverNotificationModal } from '../components/DriverNotificationModal';
import { cleanBarangay } from '../services/fareCalculator';
import { BackButton } from '../components/BackButton';
import { UserAvatar } from '../components/UserAvatar';
import { ProfileAvatarUpload } from '../components/ProfileAvatarUpload';
import { REGISTRATION_BARANGAYS } from '../services/barangayClusters';

interface DriverDashboardProps {
  initialTab?: 'requests' | 'active' | 'history' | 'notifications' | 'profile';
  onNavigateHome?: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ 
  initialTab = 'requests',
  onNavigateHome
}) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'notifications' | 'profile'>(
    initialTab === 'active' ? 'requests' : initialTab
  );
  const [dismissedBookingIds, setDismissedBookingIds] = useState<string[]>([]);
  const [todayDateKey, setTodayDateKey] = useState(() => new Date().toDateString());

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'active' ? 'requests' : initialTab);
    }
  }, [initialTab]);

  // Midnight day-rollover listener: automatically updates Today's Earnings at 12:00 AM
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date().toDateString();
      if (current !== todayDateKey) {
        setTodayDateKey(current);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [todayDateKey]);

  // Current driver user
  const currentDriver = state.currentUser || state.users[2];
  const [driverName, setDriverName] = useState(currentDriver.name || '');
  const [driverBarangay, setDriverBarangay] = useState(currentDriver.barangay || 'Centro Gonzaga (Poblacion)');
  const [driverToda, setDriverToda] = useState(currentDriver.todaName || 'Poblacion Cluster Gontoda Association');
  const [driverPlate, setDriverPlate] = useState(currentDriver.plateNumber || 'TZ-9842');
  const [driverProfileImage, setDriverProfileImage] = useState(currentDriver.profileImage || '');
  const [newPassword, setNewPassword] = useState('');
  const [driverSavedMsg, setDriverSavedMsg] = useState('');

  // Report passenger modal
  const [reportPassengerModal, setReportPassengerModal] = useState<Booking | null>(null);
  const [reportReason, setReportReason] = useState('No Show / Cancelled');
  const [reportDetails, setReportDetails] = useState('');

  useEffect(() => {
    return store.subscribe(() => {
      const s = store.getState();
      setState(s);
      if (s.currentUser) {
        setDriverName(s.currentUser.name);
        setDriverBarangay(s.currentUser.barangay);
        setDriverToda(s.currentUser.todaName || 'Poblacion Cluster Gontoda Association');
        setDriverPlate(s.currentUser.plateNumber || 'TZ-9842');
        setDriverProfileImage(s.currentUser.profileImage || '');
      }
    });
  }, []);

  const isOnline = !!state.activeDriverOnline[currentDriver.id];

  const pendingRequests = state.bookings.filter(b => 
    b.status === 'WAITING_FOR_DRIVER' && !dismissedBookingIds.includes(b.id)
  );

  const isDriverMatch = (b: Booking) => {
    return (
      b.driverId === currentDriver.id ||
      (b.driverMobile && b.driverMobile === currentDriver.mobile) ||
      (b.driverName && b.driverName === currentDriver.name)
    );
  };

  const activeBooking = state.bookings.find(b => 
    isDriverMatch(b) && 
    (b.status === 'DRIVER_ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'PASSENGER_PICKED_UP')
  );

  // All-time completed driver bookings (preserved permanently in database for history/reports)
  const completedDriverBookings = state.bookings.filter(b => 
    isDriverMatch(b) && b.status === 'COMPLETED'
  );

  const totalLifetimeEarnings = completedDriverBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);

  // Helper to determine if an ISO date string falls on the current calendar day (local timezone)
  const isDateToday = (isoString?: string): boolean => {
    if (!isoString) return false;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // Today's completed bookings: only rides completed on the current day
  const todayCompletedBookings = completedDriverBookings.filter(b => 
    isDateToday(b.completedAt || b.createdAt)
  );

  // Today's Earnings: updates automatically on completed trip, auto-resets to ₱0 at next day!
  const todayEarnings = todayCompletedBookings.reduce((sum, b) => sum + (b.estimatedFare || 0), 0);

  const firstNotificationCandidate = isOnline && pendingRequests.length > 0 ? pendingRequests[0] : null;

  const handleToggleOnline = () => {
    store.setDriverOnlineStatus(currentDriver.id, !isOnline);
  };

  const handleStepStatus = (bookingId: string, nextStatus: 'DRIVER_ARRIVING' | 'PASSENGER_PICKED_UP' | 'COMPLETED') => {
    store.updateBookingStatus(bookingId, nextStatus, currentDriver);
  };

  const submitPassengerReport = () => {
    if (reportPassengerModal) {
      store.submitReport({
        reporterId: currentDriver.id,
        reporterName: currentDriver.name,
        reporterRole: 'driver',
        targetId: reportPassengerModal.passengerId,
        targetName: reportPassengerModal.passengerName,
        targetRole: 'passenger',
        reason: reportReason,
        details: reportDetails
      });
      setReportPassengerModal(null);
      setReportDetails('');
      alert('Passenger report submitted to Gonzaga LGU Admin.');
    }
  };

  const navigateToDashboard = () => {
    if (onNavigateHome) onNavigateHome();
    else setActiveTab('requests');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* REAL-TIME NOTIFICATION POPUP ALARM */}
      {firstNotificationCandidate && (
        <DriverNotificationModal
          activeBooking={firstNotificationCandidate}
          currentDriver={currentDriver}
          onDismiss={() => setDismissedBookingIds(prev => [...prev, firstNotificationCandidate.id])}
        />
      )}

      {/* ============================================================ */}
      {/* MAIN SCREEN (FOCUSED ONLY ON TODAY'S EARNINGS & RIDE STATUS) */}
      {/* ============================================================ */}
      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* DRIVER COCKPIT HEADER / WELCOME CARD */}
          <div className="glass-panel" style={{
            padding: '22px 24px',
            borderRadius: '22px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: isOnline ? '#dcfce7' : '#fee2e2',
                  color: isOnline ? '#15803d' : '#dc2626',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isOnline ? '#16a34a' : '#ef4444'
                  }} className={isOnline ? 'pulse-badge' : ''} />
                  {isOnline ? 'ONLINE & ACCEPTING TRIPS' : 'OFFLINE'}
                </span>

                <span style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid #e2e8f0'
                }}>
                  Plate: <strong style={{ color: '#0284c7' }}>{currentDriver.plateNumber || 'TZ-9842'}</strong>
                </span>
              </div>

              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', letterSpacing: '-0.4px' }}>
                Welcome, {currentDriver.name}! 🛺
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', flexWrap: 'wrap' }}>
                <MapPin size={15} color="#16a34a" />
                <strong>{currentDriver.barangay}</strong>
                <span>•</span>
                <span>{currentDriver.todaName || 'Cluster Gontoda Association'}</span>
              </p>
            </div>

            {/* MASTER ONLINE/OFFLINE TOGGLE SWITCH */}
            <div 
              onClick={handleToggleOnline}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                userSelect: 'none',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
              title="Toggle Online / Offline status"
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isOnline ? '#15803d' : '#64748b' }}>
                  {isOnline ? 'Active Online' : 'Currently Offline'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {isOnline ? 'Tap to go offline' : 'Tap to receive rides'}
                </span>
              </div>

              <div style={{
                width: '52px',
                height: '30px',
                borderRadius: '15px',
                background: isOnline ? '#16a34a' : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.25s ease',
                boxShadow: isOnline ? '0 2px 8px rgba(22, 163, 74, 0.35)' : 'none'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: isOnline ? '25px' : '3px',
                  transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }} />
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TODAY'S EARNINGS CARD (PROMINENT & AUTO-RESETS DAILY TO ₱0)   */}
          {/* ============================================================ */}
          <div className="glass-panel" style={{
            padding: '20px 24px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1px solid #bbf7d0',
            boxShadow: '0 6px 20px rgba(22, 163, 74, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
              }}>
                <PhilippinePeso size={28} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Today's Earnings
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    fontWeight: 700
                  }}>
                    Auto-resets daily at 12:00 AM
                  </span>
                </div>

                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginTop: '2px' }}>
                  ₱{todayEarnings}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  <strong>{todayCompletedBookings.length}</strong> trip{todayCompletedBookings.length === 1 ? '' : 's'} completed today
                  {completedDriverBookings.length > 0 && (
                    <span> • All-time total: ₱{totalLifetimeEarnings} ({completedDriverBookings.length} trips preserved)</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="btn-outline"
              style={{
                padding: '9px 16px',
                fontSize: '0.85rem',
                minHeight: '38px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700
              }}
            >
              <History size={15} /> View Trip History
            </button>
          </div>

          {/* ============================================================ */}
          {/* CURRENT BOOKING / RIDE REQUEST STATUS SECTION                */}
          {/* ============================================================ */}

          {/* CASE 1: ACTIVE RIDE IN PROGRESS */}
          {activeBooking && (
            <div className="glass-panel" style={{
              padding: '24px',
              borderRadius: '22px',
              background: '#ffffff',
              border: '2px solid #16a34a',
              boxShadow: '0 8px 30px rgba(22, 163, 74, 0.1)'
            }}>
              {/* Stepper Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto 1fr',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '18px',
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: (activeBooking.status === 'DRIVER_ACCEPTED' || activeBooking.status === 'DRIVER_ARRIVING' || activeBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8'
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: activeBooking.status === 'DRIVER_ACCEPTED' ? '#eab308' : '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}>1</span>
                  <span>Pickup</span>
                </div>

                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>➔</span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: (activeBooking.status === 'DRIVER_ARRIVING' || activeBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8'
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: activeBooking.status === 'DRIVER_ARRIVING' ? '#0284c7' : activeBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#e2e8f0',
                    color: (activeBooking.status === 'DRIVER_ARRIVING' || activeBooking.status === 'PASSENGER_PICKED_UP') ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}>2</span>
                  <span>Onboard</span>
                </div>

                <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>➔</span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: activeBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#94a3b8'
                }}>
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: activeBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#e2e8f0',
                    color: activeBooking.status === 'PASSENGER_PICKED_UP' ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem'
                  }}>3</span>
                  <span>Dropoff</span>
                </div>
              </div>

              {/* Status Title & Fare */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{
                    background: activeBooking.status === 'DRIVER_ACCEPTED' ? '#fef3c7' : activeBooking.status === 'DRIVER_ARRIVING' ? '#e0f2fe' : '#dcfce7',
                    color: activeBooking.status === 'DRIVER_ACCEPTED' ? '#b45309' : activeBooking.status === 'DRIVER_ARRIVING' ? '#0369a1' : '#15803d',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.75rem'
                  }}>
                    {activeBooking.status === 'DRIVER_ACCEPTED' && 'Step 1: En Route to Pickup'}
                    {activeBooking.status === 'DRIVER_ARRIVING' && 'Step 2: At Pickup Location (Waiting)'}
                    {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Step 3: Trip in Progress (To Destination)'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                    {activeBooking.status === 'DRIVER_ACCEPTED' && 'Driving to Pickup Point'}
                    {activeBooking.status === 'DRIVER_ARRIVING' && 'Waiting for Passenger to Board'}
                    {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Heading to Destination Dropoff'}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', display: 'block', lineHeight: 1 }}>
                    ₱{activeBooking.estimatedFare}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Fare Amount</span>
                </div>
              </div>

              {/* Navigation Bar */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '16px',
                background: activeBooking.status === 'DRIVER_ACCEPTED' 
                  ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                  : activeBooking.status === 'DRIVER_ARRIVING'
                  ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                  : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
                  <Navigation size={22} color="#ffffff" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                    {activeBooking.status === 'DRIVER_ACCEPTED' && `Pickup: ${cleanBarangay(activeBooking.pickupBarangay)}`}
                    {activeBooking.status === 'DRIVER_ARRIVING' && `Arrived at ${activeBooking.pickupLandmark || cleanBarangay(activeBooking.pickupBarangay)}`}
                    {activeBooking.status === 'PASSENGER_PICKED_UP' && `Dropoff: ${cleanBarangay(activeBooking.destinationBarangay)}`}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                    {activeBooking.status === 'DRIVER_ACCEPTED' && 'Navigate to pickup landmark • ETA: 4-8 mins'}
                    {activeBooking.status === 'DRIVER_ARRIVING' && 'Tricycle parked • Waiting for passenger'}
                    {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Trip active • Proceeding safely to destination'}
                  </div>
                </div>
              </div>

              {/* Passenger Info & Phone Button */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserAvatar
                      src={activeBooking.passengerProfileImage}
                      name={activeBooking.passengerName}
                      size={40}
                      role="passenger"
                      showRoleBadge
                    />
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Passenger</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        {activeBooking.passengerName}
                      </div>
                    </div>
                  </div>
                  <span style={{ background: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {activeBooking.passengersCount} Person{activeBooking.passengersCount > 1 ? 's' : ''}
                  </span>
                </div>

                <a 
                  href={`tel:${activeBooking.passengerMobile}`}
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    color: '#15803d',
                    fontWeight: 800,
                    fontSize: '0.88rem'
                  }}
                >
                  <Phone size={15} color="#15803d" />
                  <span>Call Passenger: {activeBooking.passengerMobile}</span>
                </a>

                {/* Route Points */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>FROM</span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {cleanBarangay(activeBooking.pickupBarangay)}
                      {activeBooking.pickupLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({activeBooking.pickupLandmark})</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>TO</span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                      {cleanBarangay(activeBooking.destinationBarangay)}
                      {activeBooking.destinationLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({activeBooking.destinationLandmark})</span>}
                    </span>
                  </div>
                  {activeBooking.specialNotes && (
                    <div style={{ fontSize: '0.78rem', color: '#854d0e', marginTop: '2px' }}>
                      <strong>Notes:</strong> {activeBooking.specialNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Sequential 3-Step Action Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeBooking.status === 'DRIVER_ACCEPTED' && (
                  <button
                    onClick={() => handleStepStatus(activeBooking.id, 'DRIVER_ARRIVING')}
                    className="btn-yellow"
                    style={{ padding: '14px', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    📍 1. ARRIVED AT PICKUP
                  </button>
                )}

                {activeBooking.status === 'DRIVER_ARRIVING' && (
                  <button
                    onClick={() => handleStepStatus(activeBooking.id, 'PASSENGER_PICKED_UP')}
                    className="btn-primary"
                    style={{ padding: '14px', borderRadius: '14px', fontSize: '1rem', fontWeight: 800, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    🛺 2. PASSENGER ONBOARD (Start Trip)
                  </button>
                )}

                {activeBooking.status === 'PASSENGER_PICKED_UP' && (
                  <button
                    onClick={() => handleStepStatus(activeBooking.id, 'COMPLETED')}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '14px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    ✅ 3. COMPLETE RIDE (Collect ₱{activeBooking.estimatedFare})
                  </button>
                )}

                <button
                  onClick={() => setReportPassengerModal(activeBooking)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    borderRadius: '10px',
                    padding: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ShieldAlert size={15} /> Report Issue / Passenger
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: NO ACTIVE RIDE — DISPLAY INCOMING REQUESTS OR STATUS RADAR */}
          {!activeBooking && isOnline && (
            <div className="glass-panel" style={{
              padding: '24px',
              borderRadius: '22px',
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Ride Requests Status
                  </h3>
                  {pendingRequests.length > 0 && (
                    <span style={{ background: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {pendingRequests.length} New
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} className="pulse-badge" />
                  Live Dispatch Active
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '36px 16px',
                  background: '#f8fafc',
                  borderRadius: '18px',
                  border: '1px dashed #cbd5e1'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto'
                  }} className="pulse-badge">
                    <Radio size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    Online & Ready for Trips
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px', margin: '0 auto' }}>
                    Currently scanning for passenger requests across <strong>{currentDriver.barangay}</strong> and Gonzaga clusters. You will be alerted with a chime immediately!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {pendingRequests.map(req => (
                    <div key={req.id} className="glass-card" style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: '2px solid #eab308',
                      background: '#fffdf5'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserAvatar
                            src={req.passengerProfileImage}
                            name={req.passengerName}
                            size={38}
                            role="passenger"
                          />
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            {req.passengerName}
                          </span>
                        </div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
                          ₱{req.estimatedFare}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                        <div><strong>Pickup:</strong> {cleanBarangay(req.pickupBarangay)} ({req.pickupLandmark || 'Waiting area'})</div>
                        <div><strong>Dropoff:</strong> {cleanBarangay(req.destinationBarangay)}</div>
                        <div><strong>Passengers:</strong> {req.passengersCount} pax</div>
                      </div>

                      <button
                        onClick={() => store.updateBookingStatus(req.id, 'DRIVER_ACCEPTED', currentDriver)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '11px', fontSize: '0.92rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <CheckCircle2 size={16} /> ACCEPT BOOKING
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CASE 3: NO ACTIVE RIDE & OFFLINE */}
          {!activeBooking && !isOnline && (
            <div className="glass-panel" style={{
              padding: '32px 24px',
              borderRadius: '22px',
              background: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Bike size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Driver Cockpit is Currently Offline
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
                You will not receive trip requests from passengers while offline. Turn on your status to start accepting rides in Gonzaga.
              </p>
              <button
                type="button"
                onClick={handleToggleOnline}
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '0.9rem', borderRadius: '12px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Go Online Now
              </button>
            </div>
          )}

        </div>
      )}

      {/* ============================================================ */}
      {/* RIDE HISTORY TAB (PRESERVED IN DATABASE)                      */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{
          padding: '24px 22px',
          borderRadius: '24px',
          background: '#ffffff',
          maxWidth: '820px',
          margin: '0 auto',
          width: '100%',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <BackButton onClick={navigateToDashboard} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                My Completed Ride History
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                All-time record log permanently preserved in Gonzaga municipal database
              </span>
            </div>
          </div>

          {/* Quick Summary Pill Banner */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            marginBottom: '18px'
          }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 14px', borderRadius: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase' }}>Today's Earnings</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                ₱{todayEarnings}
              </div>
              <small style={{ color: '#16a34a', fontSize: '0.72rem' }}>{todayCompletedBookings.length} trip(s) today</small>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '14px' }}>
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>All-Time Earnings</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                ₱{totalLifetimeEarnings}
              </div>
              <small style={{ color: '#64748b', fontSize: '0.72rem' }}>{completedDriverBookings.length} total completed trip(s)</small>
            </div>
          </div>

          {completedDriverBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
              <Bike size={38} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 700 }}>No completed trips recorded yet.</p>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Completed passenger rides will be logged here permanently.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Date & Time</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Passenger</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Pickup</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Destination</th>
                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Fare</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDriverBookings.map(b => {
                    const isBToday = isDateToday(b.completedAt || b.createdAt);
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', background: isBToday ? '#f0fdf455' : 'transparent' }}>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {new Date(b.completedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {new Date(b.completedAt || b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            {isBToday && <span style={{ color: '#16a34a', fontWeight: 800, marginLeft: '4px' }}>• Today</span>}
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{b.passengerName}</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{cleanBarangay(b.pickupBarangay)}</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>{cleanBarangay(b.destinationBarangay)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a', textAlign: 'right' }}>
                          ₱{b.estimatedFare}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* NOTIFICATIONS TAB                                            */}
      {/* ============================================================ */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{
          padding: '24px 22px',
          borderRadius: '24px',
          background: '#ffffff',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <BackButton onClick={navigateToDashboard} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Driver Alerts & Dispatch
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Live Gonzaga tricycle requests, bookings, and LGU bulletins
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} className="glass-card" style={{ padding: '14px', borderRadius: '14px', borderLeft: '4px solid #eab308' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>⚡ New Booking Request (₱{req.estimatedFare})</strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Passenger {req.passengerName} is requesting a ride from {cleanBarangay(req.pickupBarangay)} to {cleanBarangay(req.destinationBarangay)}.
                </p>
              </div>
            ))}

            {completedDriverBookings.slice(0, 5).map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '14px', borderRadius: '14px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>✅ Ride Completed — ₱{b.estimatedFare}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {new Date(b.completedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                  Completed trip for {b.passengerName} ({cleanBarangay(b.pickupBarangay)} ➔ {cleanBarangay(b.destinationBarangay)}).
                </p>
              </div>
            ))}

            <div className="glass-card" style={{ padding: '14px', borderRadius: '14px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>ℹ️ Cluster Gontoda Association Online</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>System</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                You are registered with {currentDriver.todaName || 'Gonzaga Cluster Gontoda'}. Remember to stay Online to receive incoming ride requests!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DRIVER PROFILE SETTINGS TAB (MATCHING PASSENGER PROFILE UI/UX) */}
      {/* ============================================================ */}
      {activeTab === 'profile' && (
        <div className="glass-panel profile-settings-panel" style={{
          padding: '24px 22px',
          borderRadius: '24px',
          background: '#ffffff',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <BackButton onClick={navigateToDashboard} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Driver Profile & Vehicle Settings
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Manage tricycle vehicle details, TODA association & credentials
              </span>
            </div>
          </div>

          {driverSavedMsg && (
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #bbf7d0'
            }}>
              <CheckCircle2 size={17} /> {driverSavedMsg}
            </div>
          )}

          {/* SECTION 1: PERSONAL & VEHICLE DETAILS (COMPACT 2-COL) */}
          <form onSubmit={(e) => {
            e.preventDefault();
            store.updateUser(currentDriver.id, {
              name: driverName,
              barangay: driverBarangay,
              todaName: driverToda,
              plateNumber: driverPlate,
              profileImage: driverProfileImage || undefined
            });
            setDriverSavedMsg('Driver and vehicle details updated successfully!');
            setTimeout(() => setDriverSavedMsg(''), 4000);
          }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              padding: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#15803d',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                <User size={15} /> Driver & Vehicle Information
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '16px',
                alignItems: 'center'
              }} className="profile-details-grid">

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProfileAvatarUpload
                    currentImageUrl={driverProfileImage}
                    name={driverName}
                    role="driver"
                    onImageUploaded={(url) => {
                      setDriverProfileImage(url);
                      store.updateUser(currentDriver.id, { profileImage: url });
                      setDriverSavedMsg('Driver photo updated!');
                      setTimeout(() => setDriverSavedMsg(''), 3000);
                    }}
                    onImageRemoved={() => {
                      setDriverProfileImage('');
                      store.updateUser(currentDriver.id, { profileImage: '' });
                      setDriverSavedMsg('Driver photo removed.');
                      setTimeout(() => setDriverSavedMsg(''), 3000);
                    }}
                    size={80}
                    label="Avatar"
                  />
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Driver Full Name
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={e => setDriverName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        background: '#ffffff'
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Mobile Number (Verified)
                    </label>
                    <input
                      type="text"
                      value={currentDriver.mobile}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: '#f1f5f9',
                        fontSize: '0.9rem',
                        color: '#64748b',
                        fontWeight: 600
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Home Barangay
                    </label>
                    <select
                      value={driverBarangay}
                      onChange={e => setDriverBarangay(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: '#ffffff'
                      }}
                    >
                      {REGISTRATION_BARANGAYS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Tricycle Plate Number
                    </label>
                    <input
                      type="text"
                      value={driverPlate}
                      onChange={e => setDriverPlate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: '#ffffff'
                      }}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Cluster Gontoda Association
                    </label>
                    <select
                      value={driverToda}
                      onChange={e => setDriverToda(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        background: '#ffffff'
                      }}
                    >
                      {state.todas.map(cluster => (
                        <option key={cluster.id} value={cluster.name}>{cluster.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '9px 18px',
                    minHeight: '38px',
                    fontSize: '0.88rem',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </div>
          </form>

          {/* SECTION 2: PASSWORD & SECURITY (COMPACT INLINE) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '14px 16px',
            marginTop: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              <Lock size={15} color="#16a34a" /> Security & Password
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="password"
                placeholder="Enter new account password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{
                  flex: '1 1 200px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newPassword) {
                    alert('Please enter a new password.');
                    return;
                  }
                  setNewPassword('');
                  setDriverSavedMsg('Password updated successfully!');
                  setTimeout(() => setDriverSavedMsg(''), 4000);
                }}
                className="btn-outline"
                style={{
                  padding: '9px 16px',
                  minHeight: '38px',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                Update Password
              </button>
            </div>
          </div>

          {/* SECTION 3: OPERATIONAL POLICIES (COMPACT CHIPS) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            padding: '12px 14px',
            marginTop: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#475569',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px'
            }}>
              <ShieldCheck size={14} color="#16a34a" /> Operational Guarantees
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '8px'
            }}>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>🟢 Online Status</strong>
                Trips chime when online.
              </div>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>📱 Contact Privacy</strong>
                Phone shown upon accept.
              </div>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>🏛️ Gonzaga LGU Fare</strong>
                Mandated municipal rates.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT PASSENGER MODAL */}
      {reportPassengerModal && (
        <div className="modal-overlay" onClick={() => setReportPassengerModal(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', marginBottom: '12px' }}>
              Report Passenger to Gonzaga LGU
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Passenger: <strong>{reportPassengerModal.passengerName}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Reason</label>
                <select value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="No Show / Cancelled">Passenger No-Show at Pickup Location</option>
                  <option value="Fake Booking">Fake Booking / Unreachable Number</option>
                  <option value="Unprofessional">Unprofessional Behavior</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Details</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Describe incident..."
                  style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setReportPassengerModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={submitPassengerReport} className="btn-danger" style={{ flex: 1, padding: '10px' }}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
