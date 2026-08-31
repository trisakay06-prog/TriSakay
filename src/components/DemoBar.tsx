import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { UserCheck, ShieldCheck, Bike, Sparkles, RefreshCw, Eye } from 'lucide-react';

export const DemoBar: React.FC = () => {
  const [state, setState] = useState<AppStoreData>(store.getState());

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const handleRoleSwitch = (role: 'passenger' | 'driver' | 'admin') => {
    const targetUser = state.users.find(u => u.role === role && (!u.role || u.role !== 'driver' || u.isApproved));
    if (targetUser) {
      store.setCurrentUser(targetUser);
    }
  };

  const handleSeedDemoBooking = () => {
    store.createBooking({
      pickupBarangay: 'Calayan',
      pickupLandmark: 'Near Brgy Hall',
      destinationBarangay: 'CSU Gonzaga Campus',
      destinationLandmark: 'College of Agriculture',
      passengersCount: 3,
      discountType: 'regular',
      specialNotes: 'Carrying heavy school bags',
      estimatedFare: 30
    });
  };

  const handleSeedWaitingAlert = () => {
    store.createBooking({
      pickupBarangay: 'Poblacion (Smart, Progressive, Paradise, Flourishing)',
      pickupLandmark: 'In front of Gonzaga Municipal Hall',
      destinationBarangay: 'On-The-Way Dropoff',
      destinationLandmark: 'Main Highway Route',
      passengersCount: 2,
      discountType: 'senior_student_pwd',
      specialNotes: 'Waiting along route for quick pickup',
      estimatedFare: 15,
      isWaitingAlert: true
    });
  };

  const currentUser = state.currentUser;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #052e16 0%, #15803d 100%)',
      color: '#ffffff',
      padding: '8px 16px',
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <Sparkles size={16} color="#eab308" className="bounce-icon" />
        <span>GONZAGA DEMO CONTROLLER:</span>
        <span style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 8px',
          borderRadius: '12px',
          color: '#fef08a'
        }}>
          Active User: {currentUser ? `${currentUser.name} (${currentUser.role.toUpperCase()})` : 'Guest'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Switch Role Preview:</span>
        
        <button
          onClick={() => handleRoleSwitch('passenger')}
          style={{
            background: currentUser?.role === 'passenger' ? '#eab308' : 'rgba(255,255,255,0.15)',
            color: currentUser?.role === 'passenger' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <UserCheck size={14} /> Passenger (Sheena)
        </button>

        <button
          onClick={() => handleRoleSwitch('driver')}
          style={{
            background: currentUser?.role === 'driver' ? '#eab308' : 'rgba(255,255,255,0.15)',
            color: currentUser?.role === 'driver' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Bike size={14} /> Driver (Juan Dela Cruz)
        </button>

        <button
          onClick={() => handleRoleSwitch('admin')}
          style={{
            background: currentUser?.role === 'admin' ? '#eab308' : 'rgba(255,255,255,0.15)',
            color: currentUser?.role === 'admin' ? '#000000' : '#ffffff',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={14} /> Admin (Gonzaga LGU)
        </button>

        <button
          onClick={handleSeedDemoBooking}
          title="Simulate a new ride booking request"
          style={{
            background: '#ffffff',
            color: '#15803d',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Eye size={14} /> + Test Booking
        </button>

        <button
          onClick={handleSeedWaitingAlert}
          title="Simulate 'I'm Waiting' alert"
          style={{
            background: '#fef08a',
            color: '#854d0e',
            border: 'none',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>🖐️</span> + "I'm Waiting"
        </button>

        <button
          onClick={() => store.resetToDefault()}
          title="Reset application mock state"
          style={{
            background: 'transparent',
            color: '#f87171',
            border: '1px solid #f87171',
            padding: '3px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={12} /> Reset Data
        </button>
      </div>
    </div>
  );
};
