import React, { useState } from 'react';
import { store } from '../services/store';
import type { UserRole } from '../types';
import { X, UserCheck, Bike, ShieldCheck, CheckCircle, AlertCircle, Phone, Lock } from 'lucide-react';
import { INITIAL_GONZAGA_BARANGAYS } from '../services/fareCalculator';
import { sendRegistrationWelcomeSMS } from '../services/smsService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('passenger');

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [barangay, setBarangay] = useState(INITIAL_GONZAGA_BARANGAYS[0]);
  const [todaName, setTodaName] = useState('GOTODA (Gonzaga Toda)');
  const [plateNumber, setPlateNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const validateMobile = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    return /^09\d{9}$/.test(cleaned) || cleaned === 'admin';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanedMobile = mobile.trim().replace(/\s+/g, '');

    if (!cleanedMobile || !password) {
      setError('Please provide your mobile number and password.');
      return;
    }

    if (mode === 'login') {
      // Hardcoded Admin Credentials Check
      if (role === 'admin') {
        if ((cleanedMobile === '09628039440' || cleanedMobile === '09000000000' || cleanedMobile === 'admin') && 
            (password === 'admin' || password === 'admin123')) {
          const state = store.getState();
          const adminUser = state.users.find(u => u.role === 'admin') || {
            id: 'user_admin_1',
            name: 'Gonzaga LGU Admin',
            mobile: '09628039440',
            role: 'admin',
            barangay: 'Poblacion',
            createdAt: new Date().toISOString()
          };
          store.setCurrentUser(adminUser);
          onSuccess();
          onClose();
          return;
        } else {
          setError('Invalid Admin credentials. Mobile: 09628039440 | Password: admin');
          return;
        }
      }

      if (!validateMobile(cleanedMobile)) {
        setError('Please enter a valid 11-digit Philippine Mobile Number (e.g. 09171234567).');
        return;
      }

      const state = store.getState();
      const existingUser = state.users.find(u => u.mobile === cleanedMobile);
      if (existingUser) {
        if (existingUser.isBlocked) {
          setError('This account has been blocked by the Administrator.');
          return;
        }
        if (existingUser.role === 'driver' && !existingUser.isApproved) {
          setError('Your Driver account is currently PENDING approval by Gonzaga LGU Admin.');
          return;
        }
        store.setCurrentUser(existingUser);
        onSuccess();
        onClose();
      } else {
        if (role === 'passenger') {
          const registered = store.registerUser({
            name: cleanedMobile === '09396591974' ? 'Sheena Soriano (Student)' : `Passenger ${cleanedMobile.slice(-4)}`,
            mobile: cleanedMobile,
            role: 'passenger',
            barangay: 'Calayan'
          });
          sendRegistrationWelcomeSMS(registered.name, registered.mobile, registered.role, registered.barangay);
          onSuccess();
          onClose();
          return;
        }
        setError('No driver account found with this mobile number. Please register your driver account first!');
      }
    } else {
      // REGISTRATION MODE: Admin role cannot be registered
      if (role === 'admin') {
        setError('Admin accounts cannot be registered publicly. Please log in with LGU Admin credentials.');
        return;
      }

      if (!name) {
        setError('Please enter your full name.');
        return;
      }

      if (!validateMobile(cleanedMobile)) {
        setError('Please enter a valid 11-digit Philippine Mobile Number (e.g. 09171234567).');
        return;
      }

      if (role === 'driver' && (!plateNumber || !todaName)) {
        setError('Drivers must specify TODA Association and Tricycle Plate Number.');
        return;
      }

      const newUser = store.registerUser({
        name,
        mobile: cleanedMobile,
        role,
        barangay,
        todaName: role === 'driver' ? todaName : undefined,
        plateNumber: role === 'driver' ? plateNumber : undefined
      });

      // Dispatch Cellular SMS Notification
      sendRegistrationWelcomeSMS(name, cleanedMobile, role, barangay);

      if (role === 'driver') {
        setSuccessMsg('Registration submitted! Welcome SMS sent. Driver accounts require Admin verification.');
      } else {
        store.setCurrentUser(newUser);
        onSuccess();
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          borderRadius: '20px',
          background: '#ffffff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
              {mode === 'login' ? 'Sign In to TriSakay' : 'Register Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Municipality of Gonzaga Tricycle Booking System
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* ROLE SELECTION TABS */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          {/* Passenger / Student Option */}
          <button
            type="button"
            onClick={() => setRole('passenger')}
            style={{
              flex: 1,
              padding: '10px 6px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: role === 'passenger' ? '#ffffff' : 'transparent',
              color: role === 'passenger' ? '#16a34a' : '#64748b',
              boxShadow: role === 'passenger' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserCheck size={16} /> Passenger / Student
          </button>

          {/* Driver Option */}
          <button
            type="button"
            onClick={() => setRole('driver')}
            style={{
              flex: 1,
              padding: '10px 6px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: role === 'driver' ? '#ffffff' : 'transparent',
              color: role === 'driver' ? '#16a34a' : '#64748b',
              boxShadow: role === 'driver' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Bike size={16} /> Driver
          </button>

          {/* Admin Option ONLY in LOGIN MODE */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setRole('admin')}
              style={{
                flex: 1,
                padding: '10px 6px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: role === 'admin' ? '#ffffff' : 'transparent',
                color: role === 'admin' ? '#16a34a' : '#64748b',
                boxShadow: role === 'admin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          )}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        {/* ADMIN CREDENTIALS HINT BOX FOR ADMIN LOGIN */}
        {mode === 'login' && role === 'admin' && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Lock size={16} />
            <div>
              <strong>Gonzaga LGU Admin Login Credentials:</strong>
              <div style={{ fontFamily: 'monospace', marginTop: '2px' }}>
                Mobile: <strong>09628039440</strong> | Password: <strong>admin</strong>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Full Name (First + Last Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sheena Soriano"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                PH Mobile Number (Cellular SMS)
              </label>
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> SMS Enabled
              </span>
            </div>
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder={role === 'admin' ? '09628039440' : '09171234567'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
              📲 Cellular SMS notifications will be delivered to this mobile number.
            </span>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Barangay
              </label>
              <select
                value={barangay}
                onChange={e => setBarangay(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              >
                {INITIAL_GONZAGA_BARANGAYS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'register' && role === 'driver' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  TODA Association
                </label>
                <select
                  value={todaName}
                  onChange={e => setTodaName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="GOTODA (Gonzaga Toda)">GOTODA (Gonzaga Toda)</option>
                  <option value="BAUATODA">BAUATODA (Baua Drivers Association)</option>
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
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                  placeholder="e.g. TZ-9842"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem'
                  }}
                />
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              Password / PIN
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
            {mode === 'login' ? `Login as ${role.toUpperCase()}` : `Register as ${role.toUpperCase()}`}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          {mode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button 
                onClick={() => { setMode('register'); setRole('passenger'); setError(''); }} 
                style={{ color: '#16a34a', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                Register Now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button 
                onClick={() => { setMode('login'); setError(''); }} 
                style={{ color: '#16a34a', fontWeight: 700, border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
