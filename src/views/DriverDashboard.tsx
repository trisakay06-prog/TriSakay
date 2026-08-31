import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import type { Booking } from '../types';
import { Bike, Phone, CheckCircle2, ShieldAlert, Navigation, Bell, User, Lock, Settings, ArrowLeft } from 'lucide-react';
import { DriverNotificationModal } from '../components/DriverNotificationModal';
import { INITIAL_GONZAGA_BARANGAYS, cleanBarangay } from '../services/fareCalculator';

interface DriverDashboardProps {
  initialTab?: 'requests' | 'active' | 'history' | 'notifications' | 'profile';
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ initialTab = 'requests' }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history' | 'notifications' | 'profile'>(initialTab);
  const [dismissedBookingIds, setDismissedBookingIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Profile state
  const currentDriver = state.currentUser || state.users[2];
  const [driverName, setDriverName] = useState(currentDriver.name || '');
  const [driverBarangay, setDriverBarangay] = useState(currentDriver.barangay || INITIAL_GONZAGA_BARANGAYS[0]);
  const [driverToda, setDriverToda] = useState(currentDriver.todaName || 'GOTODA (Gonzaga Toda)');
  const [driverPlate, setDriverPlate] = useState(currentDriver.plateNumber || 'TZ-9842');
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
        setDriverToda(s.currentUser.todaName || 'GOTODA (Gonzaga Toda)');
        setDriverPlate(s.currentUser.plateNumber || 'TZ-9842');
      }
    });
  }, []);

  const isOnline = !!state.activeDriverOnline[currentDriver.id];

  const pendingRequests = state.bookings.filter(b => 
    b.status === 'WAITING_FOR_DRIVER' && !dismissedBookingIds.includes(b.id)
  );

  const activeBooking = state.bookings.find(b => 
    b.driverId === currentDriver.id && 
    (b.status === 'DRIVER_ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'PASSENGER_PICKED_UP')
  );

  const completedDriverBookings = state.bookings.filter(b => 
    b.driverId === currentDriver.id && b.status === 'COMPLETED'
  );

  const totalEarnings = completedDriverBookings.reduce((sum, b) => sum + b.estimatedFare, 0);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* REAL-TIME NOTIFICATION POPUP ALARM (Matching Wireframe Step 3) */}
      {firstNotificationCandidate && (
        <DriverNotificationModal
          activeBooking={firstNotificationCandidate}
          currentDriver={currentDriver}
          onDismiss={() => setDismissedBookingIds(prev => [...prev, firstNotificationCandidate.id])}
        />
      )}

      {/* DRIVER IOS COCKPIT HEADER BANNER */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '24px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: isOnline ? '#E8F9ED' : '#FEE2E2',
              color: isOnline ? '#34C759' : '#DC2626',
              padding: '5px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnline ? '#34C759' : '#EF4444'
              }} className={isOnline ? 'pulse-badge' : ''} />
              {isOnline ? 'ONLINE & ACCEPTING TRIPS' : 'OFFLINE'}
            </span>

            <span style={{ background: '#F2F2F7', color: '#1C1C1E', padding: '5px 12px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 800, border: '1px solid #E5E5EA' }}>
              🛺 {currentDriver.todaName || 'GOTODA'} • Plate: <strong style={{ color: '#007AFF' }}>{currentDriver.plateNumber || 'TZ-9842'}</strong>
            </span>
          </div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1C1C1E', marginTop: '8px', letterSpacing: '-0.4px' }}>
            Driver Cockpit: {currentDriver.name} 🛺
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#8E8E93' }}>
            Operating Zone: <strong>{currentDriver.barangay}</strong> • Verified Gonzaga TODA Member
          </p>
        </div>

        {/* APPLE IOS MASTER TOGGLE SWITCH */}
        <div 
          onClick={handleToggleOnline}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#F2F2F7',
            padding: '8px 16px',
            borderRadius: '24px',
            cursor: 'pointer',
            userSelect: 'none',
            border: '1px solid #E5E5EA',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          title="Toggle Online / Offline status"
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isOnline ? '#34C759' : '#8E8E93' }}>
              {isOnline ? 'Active Online' : 'Go Online'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#8E8E93' }}>
              {isOnline ? 'Tap to rest' : 'Tap to drive'}
            </span>
          </div>

          <div style={{
            width: '54px',
            height: '32px',
            borderRadius: '16px',
            background: isOnline ? '#34C759' : '#D1D1D6',
            position: 'relative',
            transition: 'background 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isOnline ? '0 2px 10px rgba(52, 199, 89, 0.35)' : 'none'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#FFFFFF',
              position: 'absolute',
              top: '2px',
              left: isOnline ? '24px' : '2px',
              transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }} />
          </div>
        </div>
      </div>

      {/* DRIVER DASHBOARD WIREFRAME GRID CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        
        {/* NEW REQUESTS CARD */}
        <div onClick={() => setActiveTab('requests')} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #16a34a', cursor: 'pointer', background: activeTab === 'requests' ? '#f0fdf4' : '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>NEW REQUESTS</span>
            {pendingRequests.length > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}>
                {pendingRequests.length}
              </span>
            )}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            {pendingRequests.length} Requests
          </div>
        </div>

        {/* ACTIVE BOOKINGS CARD */}
        <div onClick={() => setActiveTab('active')} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #0284c7', cursor: 'pointer', background: activeTab === 'active' ? '#f0f9ff' : '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>MY ACTIVE BOOKING</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
            {activeBooking ? '1 Active' : 'None'}
          </div>
        </div>

        {/* RIDE HISTORY CARD */}
        <div onClick={() => setActiveTab('history')} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #7c3aed', cursor: 'pointer', background: activeTab === 'history' ? '#f5f3ff' : '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>COMPLETED TRIPS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {completedDriverBookings.length} Trips
          </div>
        </div>

        {/* TOTAL EARNINGS CARD */}
        <div className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #eab308' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>TODAY'S EARNINGS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#854d0e', marginTop: '4px' }}>
            ₱{totalEarnings}
          </div>
        </div>

        {/* NOTIFICATIONS CARD */}
        <div onClick={() => setActiveTab('notifications')} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #f97316', cursor: 'pointer', background: activeTab === 'notifications' ? '#fff7ed' : '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>NOTIFICATIONS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bell size={20} /> Alerts
          </div>
        </div>

        {/* PROFILE SETTINGS CARD */}
        <div onClick={() => setActiveTab('profile')} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #475569', cursor: 'pointer', background: activeTab === 'profile' ? '#f8fafc' : '#ffffff' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>PROFILE SETTINGS</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={20} /> Account
          </div>
        </div>

      </div>

      {/* WIREFRAME STEP 4 & 5: TRACKING / NAVIGATION & STRICT 3-STEP RIDE STATUS FLOW */}
      {activeBooking && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff', border: '2px solid #16a34a', boxShadow: '0 8px 24px rgba(22, 163, 74, 0.08)' }}>
          
          {/* 3-STEP CLEAN HORIZONTAL STEPPER */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto 1fr',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '18px',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Step 1: Pickup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: (activeBooking.status === 'DRIVER_ACCEPTED' || activeBooking.status === 'DRIVER_ARRIVING' || activeBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8' }}>
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

            {/* Step 2: Onboard */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: (activeBooking.status === 'DRIVER_ARRIVING' || activeBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8' }}>
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

            {/* Step 3: Dropoff */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: activeBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#94a3b8' }}>
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

          {/* STATUS HEADER & FARE BADGE */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span style={{
                background: activeBooking.status === 'DRIVER_ACCEPTED' ? '#fef3c7' : activeBooking.status === 'DRIVER_ARRIVING' ? '#e0f2fe' : '#dcfce7',
                color: activeBooking.status === 'DRIVER_ACCEPTED' ? '#b45309' : activeBooking.status === 'DRIVER_ARRIVING' ? '#0369a1' : '#15803d',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.75rem',
                letterSpacing: '0.2px'
              }}>
                {activeBooking.status === 'DRIVER_ACCEPTED' && 'Step 1: En Route to Pickup'}
                {activeBooking.status === 'DRIVER_ARRIVING' && 'Step 2: At Pickup Location'}
                {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Step 3: Trip in Progress'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                {activeBooking.status === 'DRIVER_ACCEPTED' && 'Driving to Pickup Point'}
                {activeBooking.status === 'DRIVER_ARRIVING' && 'Waiting for Passenger to Board'}
                {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Heading to Destination Dropoff'}
              </h3>
            </div>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>
              ₱{activeBooking.estimatedFare}
            </span>
          </div>

          {/* CLEAN NAVIGATION BANNER */}
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
                {activeBooking.status === 'DRIVER_ACCEPTED' && `En Route: ${cleanBarangay(activeBooking.pickupBarangay)}`}
                {activeBooking.status === 'DRIVER_ARRIVING' && `Arrived at ${activeBooking.pickupLandmark || cleanBarangay(activeBooking.pickupBarangay)}`}
                {activeBooking.status === 'PASSENGER_PICKED_UP' && `Dropoff: ${cleanBarangay(activeBooking.destinationBarangay)}`}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                {activeBooking.status === 'DRIVER_ACCEPTED' && 'ETA: 4-8 mins • Head to landmark'}
                {activeBooking.status === 'DRIVER_ARRIVING' && 'Tricycle waiting for passenger to board'}
                {activeBooking.status === 'PASSENGER_PICKED_UP' && 'Transit in progress to destination'}
              </div>
            </div>
          </div>

          {/* CLEAN PASSENGER & ROUTE DETAILS */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Passenger</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {activeBooking.passengerName}
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
                fontSize: '0.9rem'
              }}
            >
              <Phone size={16} color="#15803d" />
              <span>Call Passenger: {activeBooking.passengerMobile}</span>
            </a>

            {/* ROUTE POINTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>PICKUP</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {cleanBarangay(activeBooking.pickupBarangay)}
                  {activeBooking.pickupLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({activeBooking.pickupLandmark})</span>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>DROPOFF</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {cleanBarangay(activeBooking.destinationBarangay)}
                  {activeBooking.destinationLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({activeBooking.destinationLandmark})</span>}
                </span>
              </div>
              {activeBooking.specialNotes && (
                <div style={{ fontSize: '0.8rem', color: '#854d0e', marginTop: '2px' }}>
                  <strong>Notes:</strong> {activeBooking.specialNotes}
                </div>
              )}
            </div>
          </div>

          {/* STRICT SEQUENTIAL 3-STEP RIDE ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* STEP 1 BUTTON: Arrived at Pickup */}
            {activeBooking.status === 'DRIVER_ACCEPTED' && (
              <button
                onClick={() => handleStepStatus(activeBooking.id, 'DRIVER_ARRIVING')}
                className="btn-yellow"
                style={{ padding: '16px', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 800, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📍 1. ARRIVED AT PICKUP
              </button>
            )}

            {/* STEP 2 BUTTON: Passenger Onboard */}
            {activeBooking.status === 'DRIVER_ARRIVING' && (
              <button
                onClick={() => handleStepStatus(activeBooking.id, 'PASSENGER_PICKED_UP')}
                className="btn-primary"
                style={{ padding: '16px', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 800, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                🛺 2. PASSENGER ONBOARD (Start Trip)
              </button>
            )}

            {/* STEP 3 BUTTON: Complete Ride */}
            {activeBooking.status === 'PASSENGER_PICKED_UP' && (
              <button
                onClick={() => handleStepStatus(activeBooking.id, 'COMPLETED')}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '16px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
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
                borderRadius: '12px',
                padding: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px'
              }}
            >
              <ShieldAlert size={16} /> Report Issue / Passenger
            </button>
          </div>
        </div>
      )}

      {/* PENDING BOOKING REQUESTS LIST (Matching Wireframe Step 3) */}
      {activeTab === 'requests' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
              Incoming Ride Requests ({pendingRequests.length})
            </h3>
            {!isOnline && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 700 }}>
                ⚠️ Switch status to ONLINE to accept ride requests
              </span>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              <Bike size={40} color="#cbd5e1" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.95rem' }}>No new ride requests right now.</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Keep your status Online. Requests will chime automatically!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {pendingRequests.map(req => (
                <div key={req.id} className="glass-card" style={{ padding: '18px', borderRadius: '16px', border: '2px solid #eab308' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                      {req.passengerName}
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                      ₱{req.estimatedFare}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    <div><strong>Pickup:</strong> {req.pickupBarangay} ({req.pickupLandmark})</div>
                    <div><strong>Destination:</strong> {req.destinationBarangay}</div>
                    <div><strong>Passengers:</strong> {req.passengersCount} Person(s)</div>
                    {req.specialNotes && <div><strong>Notes:</strong> {req.specialNotes}</div>}
                  </div>

                  <button
                    onClick={() => store.updateBookingStatus(req.id, 'DRIVER_ACCEPTED', currentDriver)}
                    disabled={!isOnline}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px', opacity: isOnline ? 1 : 0.5 }}
                  >
                    <CheckCircle2 size={18} /> ACCEPT BOOKING
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRIVER RIDE HISTORY (Matching Wireframe Step 6) */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginBottom: '16px' }}>
            My Completed Ride History
          </h3>

          {completedDriverBookings.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No completed trips recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Time</th>
                    <th style={{ padding: '12px' }}>Passenger</th>
                    <th style={{ padding: '12px' }}>Pickup</th>
                    <th style={{ padding: '12px' }}>Destination</th>
                    <th style={{ padding: '12px' }}>Fare Collected</th>
                  </tr>
                </thead>
                <tbody>
                  {completedDriverBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{new Date(b.completedAt || b.createdAt).toLocaleTimeString()}</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{b.passengerName}</td>
                      <td style={{ padding: '12px' }}>{b.pickupBarangay}</td>
                      <td style={{ padding: '12px' }}>{b.destinationBarangay}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#16a34a' }}>₱{b.estimatedFare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DRIVER NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: '#ffffff', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <button onClick={() => setActiveTab('requests')} style={{ background: 'transparent', border: 'none', color: '#16a34a', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <ArrowLeft size={18} /> Back to Requests
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#ffedd5', color: '#ea580c', padding: '10px', borderRadius: '12px' }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Driver Alerts & Dispatch Notifications
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Live Gonzaga tricycle requests, bookings, and LGU bulletins
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingRequests.map(req => (
              <div key={req.id} className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: '4px solid #eab308' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>⚡ New Booking Request (₱{req.estimatedFare})</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Passenger {req.passengerName} is requesting a ride from {req.pickupBarangay} to {req.destinationBarangay}.
                </p>
              </div>
            ))}

            {completedDriverBookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>✅ Ride Completed — ₱{b.estimatedFare} Collected</strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(b.completedAt || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Completed trip for {b.passengerName} from {b.pickupBarangay} to {b.destinationBarangay}.
                </p>
              </div>
            ))}

            <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>ℹ️ TODA Driver Network Online</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>System</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                You are registered as a verified driver with {currentDriver.todaName || 'GOTODA'}. Remember to stay Online to receive incoming ride requests!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER PROFILE SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: '#ffffff', maxWidth: '620px', margin: '0 auto', width: '100%' }}>
          <button onClick={() => setActiveTab('requests')} style={{ background: 'transparent', border: 'none', color: '#16a34a', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <ArrowLeft size={18} /> Back to Requests
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#f1f5f9', color: '#334155', padding: '10px', borderRadius: '12px' }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Driver Profile & Vehicle Settings
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Manage tricycle vehicle details, TODA association, and account security
              </p>
            </div>
          </div>

          {driverSavedMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {driverSavedMsg}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            store.updateUser(currentDriver.id, {
              name: driverName,
              barangay: driverBarangay,
              todaName: driverToda,
              plateNumber: driverPlate
            });
            setDriverSavedMsg('Driver details updated successfully!');
            setTimeout(() => setDriverSavedMsg(''), 4000);
          }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Driver Full Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Registered Mobile Number (Read-only)
              </label>
              <input
                type="text"
                value={currentDriver.mobile}
                disabled
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.95rem', color: '#64748b' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Home Barangay
              </label>
              <select
                value={driverBarangay}
                onChange={e => setDriverBarangay(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {INITIAL_GONZAGA_BARANGAYS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  TODA Association
                </label>
                <select
                  value={driverToda}
                  onChange={e => setDriverToda(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  <option value="GOTODA (Gonzaga Toda)">GOTODA (Gonzaga Toda)</option>
                  <option value="BAUATODA">BAUATODA</option>
                  <option value="CALAYANTODA">CALAYANTODA</option>
                  <option value="PATENGTODA">PATENGTODA</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  Tricycle / Plate Number
                </label>
                <input
                  type="text"
                  value={driverPlate}
                  onChange={e => setDriverPlate(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700 }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: '0.95rem' }}>
              Save Driver Profile Changes
            </button>
          </form>

          {/* CHANGE PASSWORD */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} /> Change Password
            </h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
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
                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              >
                Update Password
              </button>
            </div>
          </div>

          {/* PRIVACY SETTINGS */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              🔒 Privacy & Driver Operational Rules
            </h4>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>✓ <strong>Online Status:</strong> You only receive incoming booking chimes and alerts when your status is set to ONLINE.</div>
              <div>✓ <strong>Passenger Phone Visibility:</strong> Passenger contact number is only revealed to you after you accept the booking.</div>
              <div>✓ <strong>Official Fare Matrix:</strong> All rides must adhere to Gonzaga LGU mandated fare rates.</div>
            </div>
          </div>

          {/* LOGOUT */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => store.setCurrentUser(null)}
              className="btn-danger"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Sign Out / Logout
            </button>
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
