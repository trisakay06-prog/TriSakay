import React, { useEffect, useState } from 'react';
import type { Booking, User } from '../types';
import { store } from '../services/store';
import { Bell, MapPin, Navigation, UserCheck, CheckCircle2, XCircle } from 'lucide-react';
import { playNotificationSound } from '../services/sound';

interface DriverNotificationModalProps {
  activeBooking: Booking;
  currentDriver: User;
  onDismiss: () => void;
}

export const DriverNotificationModal: React.FC<DriverNotificationModalProps> = ({
  activeBooking,
  currentDriver,
  onDismiss
}) => {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    playNotificationSound();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBooking.id]);

  const handleAccept = () => {
    store.updateBookingStatus(activeBooking.id, 'DRIVER_ACCEPTED', currentDriver);
    onDismiss();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div 
        className="glass-panel pulse-badge" 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          borderRadius: '24px',
          background: '#ffffff',
          border: '3px solid #eab308',
          boxShadow: '0 25px 50px -12px rgba(234, 179, 8, 0.4)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div className="bounce-icon" style={{
            background: '#fef08a',
            color: '#854d0e',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Bell size={32} />
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            New Booking Request!
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Municipality of Gonzaga Tricycle Network
          </p>
        </div>

        {/* PASSENGER & RIDE CARD */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {activeBooking.passengerName}
              </h4>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Phone Number (Hidden until accepted)
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>
                ₱{activeBooking.estimatedFare}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MapPin size={18} color="#15803d" />
              <div>
                <strong>Pickup:</strong> Brgy. {activeBooking.pickupBarangay} ({activeBooking.pickupLandmark})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Navigation size={18} color="#1d4ed8" />
              <div>
                <strong>Destination:</strong> {activeBooking.destinationBarangay} ({activeBooking.destinationLandmark})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <UserCheck size={18} color="#64748b" />
              <div>
                <strong>Passengers:</strong> {activeBooking.passengersCount} Person(s)
              </div>
            </div>

            {activeBooking.specialNotes && (
              <div style={{ background: '#fef9c3', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', color: '#854d0e', marginTop: '4px' }}>
                <strong>Note:</strong> {activeBooking.specialNotes}
              </div>
            )}
          </div>
        </div>

        {/* 15 SECOND COUNTDOWN TIMER */}
        <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#dc2626' }}>
          ⏳ You have <strong>{timeLeft} seconds</strong> to respond.
        </div>

        {/* ACCEPT / DECLINE BUTTONS */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onDismiss}
            style={{
              flex: 1,
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <XCircle size={18} /> DECLINE
          </button>

          <button
            onClick={handleAccept}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              fontSize: '0.95rem'
            }}
          >
            <CheckCircle2 size={18} /> ACCEPT RIDE
          </button>
        </div>
      </div>
    </div>
  );
};
