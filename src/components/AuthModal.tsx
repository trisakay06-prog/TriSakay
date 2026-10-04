import React, { useEffect, useState } from 'react';
import { store } from '../services/store';
import type { UserRole } from '../types';
import { UserCheck, Bike, CheckCircle, AlertCircle, Phone, Eye, EyeOff } from 'lucide-react';
import { sendRegistrationWelcomeSMS } from '../services/smsService';
import appLogo from '../assets/Logo Glossy Green Scooter Emblem.png';
import { getBarangayCluster, REGISTRATION_BARANGAYS } from '../services/barangayClusters';
import { BackButton } from './BackButton';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode = 'login', onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [role, setRole] = useState<UserRole>('passenger');

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [barangay, setBarangay] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify' | 'complete'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetCooldown, setResetCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMsg('');
      setShowPassword(false);
      setConfirmPassword('');
      setResetStep('request');
      setVerificationCode('');
      setResetToken('');
      setResetCooldown(0);
    }
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setInterval(() => setResetCooldown(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resetCooldown]);

  const closeAuthPage = () => {
    if (successMsg && role === 'driver' && mode === 'register') {
      setMode('login');
      setRole('driver');
      setSuccessMsg('');
      setPassword('');
    } else {
      onClose();
    }
  };

  const handleAuthBack = () => {
    if (mode === 'reset') {
      setMode('login');
      setResetStep('request');
      setVerificationCode('');
      setResetToken('');
      setError('');
      setSuccessMsg('');
      return;
    }
    closeAuthPage();
  };

  if (!isOpen) return null;

  const validateMobile = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    return /^09\d{9}$/.test(cleaned) || cleaned === 'admin';
  };

  const handleResetSubmit = async (cleanedMobile: string) => {
    if (!/^09\d{9}$/.test(cleanedMobile)) {
      setError('Please enter a valid 11-digit Philippine mobile number.');
      return;
    }

    if (resetStep === 'verify' && !/^\d{6}$/.test(verificationCode.trim())) {
      setError('Enter the six-digit verification code.');
      return;
    }

    if (resetStep === 'complete') {
      if (password.length < 4) {
        setError('Your new Password/PIN must have at least four characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The Password/PIN entries do not match.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: resetStep,
          mobile: cleanedMobile,
          code: verificationCode.trim(),
          resetToken
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        setError(result.message || 'Password reset is temporarily unavailable.');
        return;
      }

      if (resetStep === 'request') {
        setSuccessMsg(result.message || 'A verification code will arrive shortly.');
        setResetCooldown(60);
        setResetStep('verify');
        return;
      }

      if (resetStep === 'verify') {
        setResetToken(result.resetToken);
        setResetStep('complete');
        setSuccessMsg('Mobile number verified. Create your new Password/PIN.');
        return;
      }

      if (!store.resetPassword(cleanedMobile, password)) {
        setError('No TriSakay account is available on this device for that mobile number.');
        return;
      }
      setPassword('');
      setConfirmPassword('');
      setVerificationCode('');
      setResetToken('');
      setResetStep('request');
      setMode('login');
      setSuccessMsg('Password/PIN reset successfully. You may now sign in.');
    } catch {
      setError('Unable to contact the verification service. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanedMobile = mobile.trim().replace(/\s+/g, '');

    if (!cleanedMobile) {
      setError('Please provide your mobile number.');
      return;
    }

    if (mode === 'reset') {
      await handleResetSubmit(cleanedMobile);
      return;
    }

    if (!password) {
      setError('Please provide your mobile number and password.');
      return;
    }

    if (mode === 'login') {
      const isAdminLogin = cleanedMobile === '09628039440' || cleanedMobile === '09000000000' || cleanedMobile === 'admin';
      if (isAdminLogin) {
        if (password !== 'admin' && password !== 'admin123') {
          setError('Invalid administrator credentials.');
          return;
        }
        const state = store.getState();
        const adminUser = state.users.find(u => u.role === 'admin') || {
          id: 'user_admin_1',
          name: 'Gonzaga LGU Admin',
          mobile: '09628039440',
          role: 'admin' as const,
          barangay: 'Poblacion',
          createdAt: new Date().toISOString()
        };
        store.setCurrentUser(adminUser);
        onSuccess();
        onClose();
        return;
      }

      if (!validateMobile(cleanedMobile)) {
        setError('Please enter a valid 11-digit Philippine Mobile Number (e.g. 09171234567).');
        return;
      }

      const state = store.getState();
      const existingUser = state.users.find(u => u.mobile === cleanedMobile);
      if (existingUser) {
        if (existingUser.password && existingUser.password !== password) {
          setError('Incorrect password/PIN. Please try again or reset it.');
          return;
        }
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
        setError('No account found with this mobile number. Please register and provide your information first.');
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

      if (store.getState().users.some(u => u.mobile === cleanedMobile)) {
        setError('This mobile number is already registered. Please sign in instead.');
        return;
      }

      const assignedCluster = getBarangayCluster(barangay);
      if (!assignedCluster) {
        setError('Please select a barangay to assign your cluster.');
        return;
      }

      if (role === 'driver' && !plateNumber) {
        setError('Drivers must specify a tricycle plate number.');
        return;
      }

      const newUser = store.registerUser({
        name,
        mobile: cleanedMobile,
        password,
        role,
        barangay,
        plateNumber: role === 'driver' ? plateNumber : undefined
      });

      // Dispatch Cellular SMS Notification
      sendRegistrationWelcomeSMS(name, cleanedMobile, role, barangay);

      if (role === 'driver') {
        store.setCurrentUser(null);
        setSuccessMsg("Registration Submitted, Waiting for Admin's Approval");
      } else {
        store.setCurrentUser(newUser);
        onSuccess();
        onClose();
      }
    }
  };

  const assignedCluster = getBarangayCluster(barangay);

  return (
    <div className="modal-overlay auth-modal-background">
      <div 
        className={`glass-panel auth-page-panel auth-mode-${mode}`}
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
        <div className="auth-page-brand-row">
          <BackButton
            onClick={handleAuthBack}
            ariaLabel={mode === 'reset' ? 'Back to Sign In' : 'Back to homepage'}
          />
          <div className="auth-brand-lockup">
            <span className="auth-brand-icon">
              <img
                src={appLogo}
                alt="TriSakay logo"
                style={{ width: '100%', height: '100%', display: 'block', borderRadius: 'inherit', objectFit: 'cover' }}
              />
            </span>
            <div><strong>TriSakay</strong><small>Municipality of Gonzaga</small></div>
            <b>GONZAGA</b>
          </div>
          <span className="auth-row-spacer" />
        </div>

        <div className="auth-form-surface">
        <div className="auth-page-heading">
          <h2>{mode === 'login' ? 'Welcome Back!' : mode === 'register' ? 'Create Your Account' : 'Reset Password / PIN'}</h2>
          <p>{mode === 'login'
            ? 'Sign in to check fares and manage your rides.'
            : mode === 'register'
              ? 'Register to start booking rides in Gonzaga.'
              : resetStep === 'request'
                ? 'Enter your registered mobile number to receive a verification code.'
                : resetStep === 'verify'
                  ? `Enter the six-digit code sent to ${mobile}.`
                  : 'Create and confirm your new Password/PIN.'}</p>
        </div>

        {/* ROLE SELECTION TABS */}
        {mode === 'register' && <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          {/* Passenger Option */}
          <button
            type="button"
            onClick={() => {
              setRole('passenger');
              setBarangay('');
            }}
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
            <UserCheck size={16} /> Passenger
          </button>

          {/* Driver Option */}
          <button
            type="button"
            onClick={() => {
              setRole('driver');
              setBarangay('');
            }}
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

        </div>}

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

        {successMsg && role === 'driver' && mode === 'register' ? (
          <div style={{ textAlign: 'center', padding: '24px 8px 8px' }}>
            <CheckCircle size={58} color="#16a34a" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.25rem', color: '#15803d', marginBottom: '8px' }}>{successMsg}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
              You will be able to sign in after the administrator approves your driver registration.
            </p>
            <button type="button" className="btn-primary" onClick={() => {
              store.setCurrentUser(null);
              setMode('login');
              setRole('driver');
              setSuccessMsg('');
              setPassword('');
            }} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        ) : successMsg && (
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

        {!(successMsg && role === 'driver' && mode === 'register') && <form className="auth-page-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                {mode === 'login' ? 'Mobile Number or Admin ID' : 'PH Mobile Number'}
              </label>
              {mode === 'register' && <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> SMS Enabled
              </span>}
            </div>
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder={mode === 'login' ? 'Mobile number or admin' : '09171234567'}
              disabled={mode === 'reset' && resetStep !== 'request'}
              inputMode={mode === 'login' ? undefined : 'tel'}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            />
            {mode === 'register' && <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
              📲 Cellular SMS notifications will be delivered to this mobile number.
            </span>}
          </div>

          {mode === 'reset' && resetStep === 'verify' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className="auth-otp-input"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Barangay
              </label>
              <select
                value={barangay}
                onChange={e => setBarangay(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              >
                <option value="" disabled>Select Barangay</option>
                {REGISTRATION_BARANGAYS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {assignedCluster && (
                <span
                  aria-label={`${assignedCluster.name}, ${assignedCluster.colorName}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginTop: '7px',
                    padding: '4px 9px',
                    border: `1px solid ${assignedCluster.borderColor}`,
                    borderRadius: '999px',
                    background: assignedCluster.backgroundColor,
                    color: assignedCluster.textColor,
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {assignedCluster.name}
                </span>
              )}
            </div>
          )}

          {mode === 'register' && role === 'driver' && (
            <>
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

          {(mode !== 'reset' || resetStep === 'complete') && <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
              {mode === 'reset' ? 'New Password / PIN' : 'Password / PIN'}
            </label>
            <div className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem'
                }}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(visible => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>}

          {mode === 'reset' && resetStep === 'complete' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                Confirm Password / PIN
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter Password/PIN"
                autoComplete="new-password"
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

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px', width: '100%' }}>
            {isSubmitting
              ? 'Please wait…'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                  ? `Register as ${role.toUpperCase()}`
                  : resetStep === 'request'
                    ? 'Send Verification Code'
                    : resetStep === 'verify'
                      ? 'Verify Code'
                      : 'Save New Password / PIN'}
          </button>
          {mode === 'login' && (
            <button type="button" onClick={() => { setMode('reset'); setResetStep('request'); setVerificationCode(''); setResetToken(''); setError(''); setSuccessMsg(''); setPassword(''); }} style={{ border: 'none', background: 'transparent', color: '#15803d', fontWeight: 700, cursor: 'pointer' }}>
              Forgot Password / PIN?
            </button>
          )}
        </form>}

        {mode === 'login' && <div className="auth-create-account-prompt">
          <span>No account?</span>{' '}
          <button type="button" onClick={() => { setMode('register'); setRole('passenger'); setError(''); setSuccessMsg(''); }}>
            Create New Account
          </button>
        </div>}

        {mode === 'reset' && resetStep === 'verify' && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            <button type="button" disabled={resetCooldown > 0} onClick={() => { setResetStep('request'); setVerificationCode(''); setError(''); setSuccessMsg(''); }} style={{ color: resetCooldown > 0 ? '#94a3b8' : '#15803d', fontWeight: 700, border: 'none', background: 'transparent', cursor: resetCooldown > 0 ? 'not-allowed' : 'pointer' }}>
              {resetCooldown > 0 ? `Resend in ${resetCooldown}s` : 'Request New Code'}
            </button>
        </div>}
        </div>
      </div>
    </div>
  );
};
