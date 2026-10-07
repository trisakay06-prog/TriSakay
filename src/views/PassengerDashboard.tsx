import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import type { Booking } from '../types';
import { calculateFare, INITIAL_GONZAGA_BARANGAYS, cleanBarangay } from '../services/fareCalculator';
import { Bike, MapPin, Navigation, Phone, ShieldAlert, CheckCircle2, XCircle, Home, Bell, User, Lock, Radio, Smartphone, Sparkles, PhilippinePeso, ChevronRight, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playNotificationSound } from '../services/sound';
import { BackButton } from '../components/BackButton';
import { UserAvatar } from '../components/UserAvatar';
import { ProfileAvatarUpload } from '../components/ProfileAvatarUpload';
import { getBarangayCluster, REGISTRATION_BARANGAYS } from '../services/barangayClusters';

interface PassengerDashboardProps {
  initialTab?: 'home' | 'book' | 'status' | 'history' | 'notifications' | 'profile';
  onNavigateHome?: () => void;
}

const DISMISSED_RATINGS_STORAGE_KEY = 'trisakay_dismissed_rating_booking_ids';

function getDismissedRatingIds(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_RATINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markRatingDismissed(bookingId: string): void {
  try {
    const existing = getDismissedRatingIds();
    if (!existing.includes(bookingId)) {
      existing.push(bookingId);
      localStorage.setItem(DISMISSED_RATINGS_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    // Ignore storage errors
  }
}

export const PassengerDashboard: React.FC<PassengerDashboardProps> = ({ initialTab = 'home', onNavigateHome }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'status' | 'history' | 'notifications' | 'profile'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Booking Form State
  const [pickupBarangay, setPickupBarangay] = useState(INITIAL_GONZAGA_BARANGAYS.find(b => b === 'Pateng') || INITIAL_GONZAGA_BARANGAYS[0]);
  const [pickupLandmark, setPickupLandmark] = useState('');
  const [destBarangay, setDestBarangay] = useState(INITIAL_GONZAGA_BARANGAYS.find(b => b === 'Smart') || INITIAL_GONZAGA_BARANGAYS[1]);
  const [destLandmark, setDestLandmark] = useState('');
  const [passengersCount, setPassengersCount] = useState(1);
  const [discountType, setDiscountType] = useState<'regular' | 'senior_student_pwd'>('regular');
  const [specialNotes, setSpecialNotes] = useState('');
  const [fareEstimatorOpen, setFareEstimatorOpen] = useState(false);

  const [waitingReminderBookingId, setWaitingReminderBookingId] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(state.currentUser?.name || '');
  const [profileBarangay, setProfileBarangay] = useState(state.currentUser?.barangay || INITIAL_GONZAGA_BARANGAYS[0]);
  const [profileImage, setProfileImage] = useState(state.currentUser?.profileImage || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Rating Modal & Report Modal State
  const [ratingTargetBooking, setRatingTargetBooking] = useState<Booking | null>(null);
  const [starCount, setStarCount] = useState(5);
  const [reportDriverModal, setReportDriverModal] = useState<Booking | null>(null);
  const [reportReason, setReportReason] = useState('Overcharging');
  const [reportDetails, setReportDetails] = useState('');

  // Real-time Accepted Notification & Search Timer
  const [acceptedDriverToast, setAcceptedDriverToast] = useState<{ driverName: string; todaName: string; plateNumber: string; mobile: string } | null>(null);
  const [searchTimer, setSearchTimer] = useState(0);
  const prevBookingStatusRef = React.useRef<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => {
      const s = store.getState();
      setState(s);
      if (s.currentUser) {
        setProfileName(s.currentUser.name);
        setProfileBarangay(s.currentUser.barangay);
        setProfileImage(s.currentUser.profileImage || '');
      }
    });
  }, []);

  const currentUser = state.currentUser || state.users[0];
  const passengerCluster = currentUser.cluster ?? getBarangayCluster(currentUser.barangay)?.number;

  const navigateHome = () => {
    setActiveTab('home');
    onNavigateHome?.();
  };

  const fareResult = calculateFare(
    pickupBarangay,
    destBarangay,
    discountType,
    state.fares,
    state.settings.fuelSurgeMultiplier,
    passengersCount
  );

  const passengerBookings = state.bookings.filter(b => 
    b.passengerId === currentUser.id || 
    b.passengerMobile === currentUser.mobile
  );

  const activePassengerBookings = passengerBookings.filter(b => 
    b.status === 'WAITING_FOR_DRIVER' || 
    b.status === 'DRIVER_ACCEPTED' || 
    b.status === 'DRIVER_ARRIVING' || 
    b.status === 'PASSENGER_PICKED_UP'
  );

  // ALWAYS prioritize an accepted/in-transit booking over a pending waiting booking
  const currentActiveBooking = 
    activePassengerBookings.find(b => b.status === 'DRIVER_ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'PASSENGER_PICKED_UP') ||
    activePassengerBookings[0] ||
    null;

  useEffect(() => {
    let interval: any;
    if (currentActiveBooking?.status === 'WAITING_FOR_DRIVER') {
      interval = setInterval(() => {
        setSearchTimer(prev => prev + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [currentActiveBooking?.status]);

  useEffect(() => {
    if (currentActiveBooking) {
      if (prevBookingStatusRef.current === 'WAITING_FOR_DRIVER' && currentActiveBooking.status === 'DRIVER_ACCEPTED') {
        // Driver accepted the ride in real-time!
        playNotificationSound();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setAcceptedDriverToast({
          driverName: currentActiveBooking.driverName || 'Gonzaga Driver',
          todaName: currentActiveBooking.todaName || 'Cluster Gontoda Association',
          plateNumber: currentActiveBooking.plateNumber || 'TZ-9842',
          mobile: currentActiveBooking.driverMobile || '09185551234'
        });
        setActiveTab('status');
      }
      prevBookingStatusRef.current = currentActiveBooking.status;
    } else {
      prevBookingStatusRef.current = null;
    }
  }, [currentActiveBooking?.status]);

  const prevBookingStatusesRef = React.useRef<Record<string, string>>({});
  const isInitialMountRef = React.useRef(true);

  // Trigger driver rating prompt ONLY when an active ride transitions to COMPLETED in real-time
  useEffect(() => {
    // On first mount (e.g. page refresh, back navigation from sidebar/other views),
    // record existing statuses without showing any rating prompts.
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const initialMap: Record<string, string> = {};
      passengerBookings.forEach(b => {
        initialMap[b.id] = b.status;
      });
      prevBookingStatusesRef.current = initialMap;
      return;
    }

    const dismissedIds = getDismissedRatingIds();

    for (const b of passengerBookings) {
      const prevStatus = prevBookingStatusesRef.current[b.id];
      const wasActiveRide = prevStatus === 'PASSENGER_PICKED_UP' ||
                            prevStatus === 'DRIVER_ARRIVING' ||
                            prevStatus === 'DRIVER_ACCEPTED' ||
                            prevStatus === 'WAITING_FOR_DRIVER';

      // Only trigger if an active in-flight ride just transitioned to COMPLETED
      if (wasActiveRide && b.status === 'COMPLETED' && !b.rating && !dismissedIds.includes(b.id)) {
        playNotificationSound();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setRatingTargetBooking(b);
        break;
      }
    }

    // Keep tracked statuses up to date
    const updatedMap: Record<string, string> = {};
    passengerBookings.forEach(b => {
      updatedMap[b.id] = b.status;
    });
    prevBookingStatusesRef.current = updatedMap;
  }, [state.bookings, passengerBookings]);

  const handleDismissRating = (bookingId: string) => {
    markRatingDismissed(bookingId);
    setRatingTargetBooking(null);
  };

  const handleSubmitRating = (bookingId: string) => {
    store.rateBooking(bookingId, starCount, 'Great ride!');
    markRatingDismissed(bookingId);
    setRatingTargetBooking(null);
  };

  const handleBookRide = (e: React.FormEvent) => {
    e.preventDefault();
    const booking = store.createBooking({
      pickupBarangay,
      pickupLandmark: pickupLandmark || 'Main Road',
      destinationBarangay: destBarangay,
      destinationLandmark: destLandmark || 'Standard Dropoff',
      passengersCount,
      discountType,
      specialNotes,
      estimatedFare: fareResult.finalFare
    });

    confetti({ particleCount: 40, spread: 50 });
    setWaitingReminderBookingId(booking.id);
    setActiveTab('status');
  };

  const handleCancelBooking = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'CANCELLED');
    setActiveTab('home');
  };

  const submitReport = () => {
    if (reportDriverModal && reportDriverModal.driverId) {
      store.submitReport({
        reporterId: currentUser.id,
        reporterName: currentUser.name,
        reporterRole: 'passenger',
        targetId: reportDriverModal.driverId,
        targetName: reportDriverModal.driverName || 'Driver',
        targetRole: 'driver',
        reason: reportReason,
        details: reportDetails
      });
      setReportDriverModal(null);
      setReportDetails('');
      alert('Report submitted to Gonzaga LGU Admin for investigation.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: activeTab === 'book' ? '0px' : '24px' }}>

      {waitingReminderBookingId && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '430px', padding: '26px', background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>🖐️</div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '8px' }}>Are you already waiting?</h3>
            <p style={{ color: '#64748b', lineHeight: 1.55, marginBottom: '20px' }}>
              Send an “I’m Waiting” reminder so nearby drivers know you are ready at the pickup point.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-outline" onClick={() => setWaitingReminderBookingId(null)} style={{ flex: 1 }}>Not Now</button>
              <button type="button" className="btn-yellow" onClick={() => {
                store.markBookingWaiting(waitingReminderBookingId);
                setWaitingReminderBookingId(null);
              }} style={{ flex: 1 }}>Send Reminder</button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME DRIVER ACCEPTANCE CELEBRATION TOAST */}
      {acceptedDriverToast && (
        <div style={{
          position: 'fixed',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          width: '92%',
          maxWidth: '480px',
          background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          borderRadius: '22px',
          boxShadow: '0 20px 40px rgba(22, 163, 74, 0.4), 0 0 0 2px #86efac',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{
            background: '#fef08a',
            color: '#854d0e',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            🎉
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Ride Accepted!</div>
            <div style={{ fontSize: '0.82rem', opacity: 0.95, marginTop: '2px', lineHeight: 1.3 }}>
              Driver <strong>{acceptedDriverToast.driverName}</strong> ({acceptedDriverToast.todaName}) with Plate <strong style={{ color: '#fef08a' }}>{acceptedDriverToast.plateNumber}</strong> is on the way!
            </div>
          </div>
          <button
            onClick={() => setAcceptedDriverToast(null)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 2: PASSENGER DASHBOARD HOME (Matching Wireframe Grid Cards) */}
      {activeTab === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* WELCOME BANNER */}
          <div className="glass-panel passenger-welcome-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                  PASSENGER DASHBOARD
                </span>
                {currentActiveBooking && (
                  <span className="pulse-badge" style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                    1 ACTIVE RIDE IN PROGRESS
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                Welcome, {currentUser.name}! 👋
              </h2>
              <p className="passenger-welcome-location">
                <MapPin size={16} aria-hidden="true" />
                <strong>{currentUser.barangay}</strong>
                {passengerCluster && <><span aria-hidden="true">•</span><span>Cluster {passengerCluster}</span></>}
              </p>
            </div>
          </div>

          <section className="passenger-booking-actions" aria-label="Passenger booking actions">
            <button type="button" className="passenger-booking-cta" onClick={() => setActiveTab('book')}>
              <span className="passenger-booking-cta-icon"><Bike size={30} /></span>
              <span className="passenger-booking-cta-copy">
                <strong>Book a Ride Now</strong>
                <small>Choose your pickup and destination</small>
              </span>
              <ChevronRight size={25} />
            </button>

            <button
              type="button"
              className="passenger-fare-estimate-trigger"
              onClick={() => setFareEstimatorOpen(open => !open)}
              aria-expanded={fareEstimatorOpen}
              aria-controls="passenger-fare-estimator"
            >
              <PhilippinePeso size={20} />
              <span>Check Fare Estimate</span>
              <ChevronRight className={fareEstimatorOpen ? 'expanded' : ''} size={20} />
            </button>
          </section>

          {fareEstimatorOpen && (
            <section id="passenger-fare-estimator" className="passenger-fare-estimator">
              <div className="passenger-fare-estimator-fields">
                <label>
                  <span>Pickup Barangay</span>
                  <select value={pickupBarangay} onChange={event => setPickupBarangay(event.target.value)}>
                    {INITIAL_GONZAGA_BARANGAYS.map(barangay => (
                      <option key={barangay} value={barangay}>{barangay}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Destination Barangay</span>
                  <select value={destBarangay} onChange={event => setDestBarangay(event.target.value)}>
                    {INITIAL_GONZAGA_BARANGAYS.map(barangay => (
                      <option key={barangay} value={barangay}>{barangay}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="passenger-fare-estimator-result">
                <span>Estimated fare</span>
                <strong>₱{fareResult.finalFare}</strong>
                <small>
                  {fareResult.routeName}
                  {passengersCount > 1 && !fareResult.isSpecialArrangement ? ` (₱${fareResult.perPassengerFare} × ${passengersCount} pax)` : ''}
                </small>
              </div>
            </section>
          )}

          {/* ACTIVE RIDE QUICK CARD IF AVAILABLE */}
          {currentActiveBooking && (
            <div 
              onClick={() => setActiveTab('status')}
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                padding: '20px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#fef08a', color: '#052e16', padding: '12px', borderRadius: '50%' }}>
                  <Bike size={28} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: 800, textTransform: 'uppercase' }}>LIVE RIDE ACTIVE</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {currentActiveBooking.status === 'WAITING_FOR_DRIVER' ? 'Searching for available Gonzaga Driver...' : `Driver ${currentActiveBooking.driverName} on the way!`}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#dcfce7' }}>
                    Fare: <strong>₱{currentActiveBooking.estimatedFare}</strong> • Pickup: {currentActiveBooking.pickupBarangay}
                  </p>
                </div>
              </div>

              <span style={{ background: '#ffffff', color: '#15803d', padding: '10px 18px', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem' }}>
                Track Live →
              </span>
            </div>
          )}

        </div>
      )}

      {/* STEP 3: BOOK A RIDE FORM (Streamlined Single-Screen Mobile Layout) */}
      {activeTab === 'book' && (
        <div className="booking-panel-container">
          <div className="booking-panel-header">
            <BackButton onClick={navigateHome} />
            <div className="booking-header-text">
              <div className="booking-header-badge-row">
                <span className="booking-lgu-badge">LGU GONZAGA</span>
                <span className="booking-live-badge">OFFICIAL RATES</span>
              </div>
              <h2 className="booking-header-title">Book a Ride</h2>
              <p className="booking-header-sub">Select pickup & destination barangays in Gonzaga</p>
            </div>
          </div>

          <form onSubmit={handleBookRide} className="booking-form-compact">
            {/* UNIFIED ROUTE CARD */}
            <div className="booking-route-card">
              {/* PICKUP ROW */}
              <div className="booking-stop-row pickup-stop">
                <div className="booking-stop-indicator">
                  <span className="stop-dot pickup-dot" />
                  <span className="stop-line" />
                </div>
                <div className="booking-stop-content">
                  <div className="booking-stop-label">
                    <MapPin size={13} />
                    <span>PICKUP POINT</span>
                  </div>
                  <div className="booking-stop-inputs">
                    <div className="booking-field-barangay">
                      <select
                        value={pickupBarangay}
                        onChange={e => setPickupBarangay(e.target.value)}
                        className="booking-select"
                        aria-label="Pickup Barangay"
                      >
                        {INITIAL_GONZAGA_BARANGAYS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="booking-field-landmark">
                      <input
                        type="text"
                        value={pickupLandmark}
                        onChange={e => setPickupLandmark(e.target.value)}
                        placeholder="Landmark (e.g. Market, School)"
                        className="booking-input"
                        aria-label="Pickup Landmark"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DESTINATION ROW */}
              <div className="booking-stop-row dest-stop">
                <div className="booking-stop-indicator">
                  <span className="stop-dot dest-dot" />
                </div>
                <div className="booking-stop-content">
                  <div className="booking-stop-label">
                    <Navigation size={13} />
                    <span>DESTINATION</span>
                  </div>
                  <div className="booking-stop-inputs">
                    <div className="booking-field-barangay">
                      <select
                        value={destBarangay}
                        onChange={e => setDestBarangay(e.target.value)}
                        className="booking-select"
                        aria-label="Destination Barangay"
                      >
                        {INITIAL_GONZAGA_BARANGAYS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="booking-field-landmark">
                      <input
                        type="text"
                        value={destLandmark}
                        onChange={e => setDestLandmark(e.target.value)}
                        placeholder="Landmark (e.g. CSU Main Gate)"
                        className="booking-input"
                        aria-label="Destination Landmark"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PASSENGERS & DISCOUNT */}
            <div className="booking-two-col">
              <div className="booking-field-box">
                <label className="booking-micro-label">Passengers Count (1 - 8)</label>
                <select
                  value={passengersCount}
                  onChange={e => setPassengersCount(Number(e.target.value))}
                  className="booking-select"
                  aria-label="Passengers Count"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="booking-field-box">
                <label className="booking-micro-label">Rate Category</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as 'regular' | 'senior_student_pwd')}
                  className="booking-select"
                  aria-label="Rate Category"
                >
                  <option value="regular">Regular Fare Rate</option>
                  <option value="senior_student_pwd">Senior / Student / PWD Rate</option>
                </select>
              </div>
            </div>

            {/* SPECIAL NOTES */}
            <div className="booking-field-box">
              <input
                type="text"
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                placeholder="Special notes (Optional, e.g. carrying heavy luggage)"
                className="booking-input booking-input-notes"
                aria-label="Special Notes"
              />
            </div>

            {/* FARE PREVIEW BANNER */}
            <div className="booking-fare-banner">
              <div className="fare-banner-left">
                <span className="fare-banner-pill">ESTIMATED FARE</span>
                <div className="fare-banner-route">{fareResult.routeName}</div>
                {passengersCount > 1 && !fareResult.isSpecialArrangement && (
                  <div className="fare-banner-calc">
                    ₱{fareResult.perPassengerFare} × {passengersCount} passengers
                  </div>
                )}
              </div>

              <div className="fare-banner-right">
                <div className="fare-banner-amount">₱{fareResult.finalFare}</div>
                {passengersCount > 1 && !fareResult.isSpecialArrangement && (
                  <div className="fare-banner-pax-tag">Total for {passengersCount} pax</div>
                )}
              </div>
            </div>

            <button type="submit" className="booking-submit-btn">
              <Bike size={20} />
              <span>BOOK RIDE</span>
            </button>
          </form>
        </div>
      )}

      {/* ACTIVE RIDE STATUS WORKFLOW */}
      {activeTab === 'status' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: '#ffffff', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <BackButton onClick={navigateHome} />

          {!currentActiveBooking ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Bike size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#64748b' }}>No Active Ride Booking</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Return to the passenger dashboard when you are ready to create a booking.
              </p>
            </div>
          ) : (
            <div>

              {/* WIREFRAME STEP 4: ENHANCED WAITING FOR DRIVER CONSOLE */}
              {currentActiveBooking.status === 'WAITING_FOR_DRIVER' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* RADAR SEARCHING CARD */}
                  <div style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fefce8 100%)',
                    border: '2px solid #eab308',
                    borderRadius: '24px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    boxShadow: '0 12px 30px rgba(234, 179, 8, 0.15)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    
                    {/* RADAR PULSE ANIMATION */}
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fef08a 0%, rgba(234,179,8,0.2) 70%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      position: 'relative',
                      border: '2px solid #eab308'
                    }} className="pulse-ring">
                      <span style={{ fontSize: '2.2rem' }}>🛺</span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#fef08a',
                      color: '#854d0e',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      marginBottom: '10px'
                    }}>
                      <Radio size={14} className="spin-icon" />
                      <span>SEARCHING DRIVERS • {Math.floor(searchTimer / 60)}:{(searchTimer % 60) < 10 ? '0' : ''}{searchTimer % 60}</span>
                    </div>

                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                      Broadcasting to Nearby Cluster Gontodas
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
                      Paging drivers in the registered <strong>Cluster Gontoda associations</strong>.
                    </p>

                    {/* CELLULAR SMS GUARANTEE BANNER */}
                    <div style={{
                      background: '#f0fdf4',
                      border: '1.5px solid #86efac',
                      borderRadius: '16px',
                      padding: '12px 14px',
                      margin: '18px 0 14px 0',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '12px', flexShrink: 0 }}>
                        <Smartphone size={20} />
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.4 }}>
                        <strong>SMS Guarantee Active:</strong> Even if you close your browser or lock your phone, an SMS will be sent to <strong>{currentUser.mobile}</strong> as soon as a driver accepts!
                      </div>
                    </div>

                    {/* BOOKING DETAILS CARD */}
                    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Pickup Location</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>
                          {cleanBarangay(currentActiveBooking.pickupBarangay)}
                          {currentActiveBooking.pickupLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({currentActiveBooking.pickupLandmark})</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Dropoff Destination</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>
                          {cleanBarangay(currentActiveBooking.destinationBarangay)}
                          {currentActiveBooking.destinationLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({currentActiveBooking.destinationLandmark})</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                        <span style={{ color: '#64748b', fontWeight: 600 }}>Fare Total ({currentActiveBooking.passengersCount} Pax)</span>
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.25rem' }}>
                          ₱{currentActiveBooking.estimatedFare}
                        </span>
                      </div>
                    </div>

                    {/* MICRO TRAVEL TIPS */}
                    <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} color="#eab308" style={{ flexShrink: 0 }} />
                      <span><strong>Tip while waiting:</strong> Please wait near your specified landmark so your driver can spot you easily upon arrival.</span>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(currentActiveBooking.id)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1.5px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <XCircle size={17} /> Cancel Booking Request
                    </button>
                  </div>
                </div>
              )}

              {/* WIREFRAME STEP 5 & 6: TRACKING DRIVER & 3-STEP RIDE STATUS FLOW */}
              {(currentActiveBooking.status === 'DRIVER_ACCEPTED' || currentActiveBooking.status === 'DRIVER_ARRIVING' || currentActiveBooking.status === 'PASSENGER_PICKED_UP') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* 3-STEP CLEAN HORIZONTAL STEPPER */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr auto 1fr',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '10px 14px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {/* Step 1: Pickup */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: (currentActiveBooking.status === 'DRIVER_ACCEPTED' || currentActiveBooking.status === 'DRIVER_ARRIVING' || currentActiveBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: currentActiveBooking.status === 'DRIVER_ACCEPTED' ? '#eab308' : '#16a34a',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: (currentActiveBooking.status === 'DRIVER_ARRIVING' || currentActiveBooking.status === 'PASSENGER_PICKED_UP') ? '#16a34a' : '#94a3b8' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: currentActiveBooking.status === 'DRIVER_ARRIVING' ? '#0284c7' : currentActiveBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#e2e8f0',
                        color: (currentActiveBooking.status === 'DRIVER_ARRIVING' || currentActiveBooking.status === 'PASSENGER_PICKED_UP') ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>2</span>
                      <span>Onboard</span>
                    </div>

                    <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>➔</span>

                    {/* Step 3: Dropoff */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: currentActiveBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#94a3b8' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: currentActiveBooking.status === 'PASSENGER_PICKED_UP' ? '#16a34a' : '#e2e8f0',
                        color: currentActiveBooking.status === 'PASSENGER_PICKED_UP' ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem'
                      }}>3</span>
                      <span>Dropoff</span>
                    </div>
                  </div>

                  {/* DRIVER IS ON THE WAY HEADER */}
                  <div style={{ background: '#ffffff', border: '2px solid #16a34a', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 16px rgba(22, 163, 74, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <span style={{
                          background: currentActiveBooking.status === 'DRIVER_ARRIVING' ? '#e0f2fe' : '#dcfce7',
                          color: currentActiveBooking.status === 'DRIVER_ARRIVING' ? '#0369a1' : '#15803d',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.2px'
                        }}>
                          {currentActiveBooking.status === 'DRIVER_ACCEPTED' && 'Step 1: Driver En Route'}
                          {currentActiveBooking.status === 'DRIVER_ARRIVING' && 'Step 2: Driver at Pickup'}
                          {currentActiveBooking.status === 'PASSENGER_PICKED_UP' && 'Step 3: Trip in Progress'}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                          {currentActiveBooking.status === 'DRIVER_ACCEPTED' && 'Driver is Heading to Pickup'}
                          {currentActiveBooking.status === 'DRIVER_ARRIVING' && '📍 Driver Arrived! Meet at landmark'}
                          {currentActiveBooking.status === 'PASSENGER_PICKED_UP' && '🚀 Passenger Onboard (Heading to dropoff)'}
                        </h3>
                      </div>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>
                        ₱{currentActiveBooking.estimatedFare}
                      </span>
                    </div>

                    {/* CLEAN ROUTE NAVIGATION BANNER */}
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: currentActiveBooking.status === 'DRIVER_ACCEPTED'
                        ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                        : currentActiveBooking.status === 'DRIVER_ARRIVING'
                        ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                        : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
                        <Navigation size={22} color="#ffffff" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          {currentActiveBooking.status === 'DRIVER_ACCEPTED' && `Heading to ${cleanBarangay(currentActiveBooking.pickupBarangay)}`}
                          {currentActiveBooking.status === 'DRIVER_ARRIVING' && `Arrived at ${currentActiveBooking.pickupLandmark || cleanBarangay(currentActiveBooking.pickupBarangay)}`}
                          {currentActiveBooking.status === 'PASSENGER_PICKED_UP' && `Dropoff at ${cleanBarangay(currentActiveBooking.destinationBarangay)}`}
                        </div>
                        <div style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '2px' }}>
                          {currentActiveBooking.status === 'DRIVER_ACCEPTED' && 'ETA: 5-8 mins • Please wait at landmark'}
                          {currentActiveBooking.status === 'DRIVER_ARRIVING' && 'Tricycle waiting for you to board'}
                          {currentActiveBooking.status === 'PASSENGER_PICKED_UP' && 'Transit in progress to destination'}
                        </div>
                      </div>
                    </div>

                    {/* DRIVER INFO CARD (Matching Wireframe Step 5 & 6) */}
                    <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <UserAvatar
                          src={currentActiveBooking.driverProfileImage}
                          name={currentActiveBooking.driverName || 'Driver'}
                          size={46}
                          role="driver"
                          showRoleBadge
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                              {currentActiveBooking.driverName}
                            </h4>
                            <span style={{ color: '#eab308', fontWeight: 800, fontSize: '0.85rem' }}>★ 4.8</span>
                          </div>
                        
                          {/* TRICYCLE PLATE NUMBER BADGE */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <span style={{
                              background: '#fef08a',
                              color: '#713f12',
                              border: '1.5px solid #eab308',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px'
                            }}>
                              🛺 {currentActiveBooking.plateNumber || 'TZ-9842'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                              {currentActiveBooking.todaName || 'Cluster Gontoda Association'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <a href={`tel:${currentActiveBooking.driverMobile}`} className="btn-primary" style={{ textDecoration: 'none', padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={16} /> Call Driver
                      </a>
                    </div>

                    {/* CLEAN ROUTE POINTS */}
                    <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>PICKUP</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {cleanBarangay(currentActiveBooking.pickupBarangay)}
                          {currentActiveBooking.pickupLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({currentActiveBooking.pickupLandmark})</span>}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>DROPOFF</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                          {cleanBarangay(currentActiveBooking.destinationBarangay)}
                          {currentActiveBooking.destinationLandmark && <span style={{ color: '#64748b', fontWeight: 500 }}> ({currentActiveBooking.destinationLandmark})</span>}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setReportDriverModal(currentActiveBooking)}
                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <ShieldAlert size={15} /> Report Driver
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* WIREFRAME STEP 7: RIDE COMPLETED (Celebration Screen) */}
      {ratingTargetBooking && (
        <div className="modal-overlay" style={{ zIndex: 100000 }} onClick={() => handleDismissRating(ratingTargetBooking.id)}>
          <div
            className="glass-panel"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '24px 20px',
              borderRadius: '28px',
              background: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{
              background: '#dcfce7',
              color: '#15803d',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              border: '2px solid #86efac'
            }}>
              <CheckCircle2 size={38} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>Thank you!</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '14px' }}>
              Your ride is completed.
            </p>

            <div style={{
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '16px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>Fare Total</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>₱{ratingTargetBooking.estimatedFare}</div>
            </div>

            <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
              Rate Driver {ratingTargetBooking.driverName || 'Juan'}:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setStarCount(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: star <= starCount ? '#eab308' : '#cbd5e1',
                    padding: '2px 4px',
                    touchAction: 'manipulation'
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleSubmitRating(ratingTargetBooking.id)}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '0.98rem', fontWeight: 800 }}
              >
                <Home size={18} /> SUBMIT RATING & CONTINUE
              </button>
              <button
                onClick={() => handleDismissRating(ratingTargetBooking.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  padding: '6px',
                  cursor: 'pointer'
                }}
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIDE HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
          <BackButton onClick={navigateHome} />

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginBottom: '16px' }}>
            Your Ride History
          </h3>

          {passengerBookings.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No past rides yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px' }}>Pickup</th>
                    <th style={{ padding: '12px' }}>Destination</th>
                    <th style={{ padding: '12px' }}>Fare</th>
                    <th style={{ padding: '12px' }}>Driver</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengerBookings.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{b.pickupBarangay}</td>
                      <td style={{ padding: '12px' }}>{b.destinationBarangay}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#16a34a' }}>₱{b.estimatedFare}</td>
                      <td style={{ padding: '12px' }}>{b.driverName || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: b.status === 'COMPLETED' ? '#dcfce7' : '#fef08a', color: b.status === 'COMPLETED' ? '#15803d' : '#854d0e', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                        {b.status === 'COMPLETED' && !b.rating && (
                          <button
                            type="button"
                            onClick={() => setRatingTargetBooking(b)}
                            style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #eab308',
                              background: '#fefce8',
                              color: '#854d0e',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ★ Rate
                          </button>
                        )}
                        {b.rating && (
                          <span style={{ marginLeft: '8px', color: '#eab308', fontSize: '0.8rem', fontWeight: 700 }}>
                            {'★'.repeat(b.rating)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: '#ffffff', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
          <BackButton onClick={navigateHome} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: '#ffedd5', color: '#ea580c', padding: '10px', borderRadius: '12px' }}>
              <Bell size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Ride & System Notifications
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Real-time booking updates, driver status and SMS confirmations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {passengerBookings.map(b => (
              <div key={b.id} className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: b.status === 'COMPLETED' ? '4px solid #16a34a' : b.status === 'CANCELLED' ? '4px solid #ef4444' : '4px solid #eab308' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                    {b.status === 'COMPLETED' ? '✅ Ride Completed' : b.status === 'CANCELLED' ? '❌ Booking Cancelled' : b.status === 'DRIVER_ACCEPTED' ? '🛺 Driver Accepted Ride' : b.status === 'DRIVER_ARRIVING' ? '📍 Driver Arrived' : '⏳ Waiting for Driver'}
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  {b.status === 'DRIVER_ACCEPTED' && `Driver ${b.driverName} (${b.todaName || 'Cluster Gontoda Association'} ${b.plateNumber || 'TZ-9842'}) accepted your ride to ${b.destinationBarangay}.`}
                  {b.status === 'DRIVER_ARRIVING' && `Driver ${b.driverName} has arrived at ${b.pickupLandmark || b.pickupBarangay}. Please proceed to the tricycle.`}
                  {b.status === 'COMPLETED' && `Your ride from ${b.pickupBarangay} to ${b.destinationBarangay} was completed. Fare paid: ₱${b.estimatedFare}.`}
                  {b.status === 'WAITING_FOR_DRIVER' && `Booking placed for ${b.pickupBarangay} to ${b.destinationBarangay}. Searching for nearby drivers...`}
                  {b.status === 'CANCELLED' && `This booking was cancelled.`}
                </p>
              </div>
            ))}

            <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>🎉 Welcome to TriSakay Gonzaga!</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>System</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>
                You are registered with mobile number {currentUser.mobile}. You will receive SMS alerts and in-app chimes for your trips!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE SETTINGS TAB */}
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
            <BackButton onClick={navigateHome} />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                Profile Settings
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Manage your personal details & security
              </span>
            </div>
          </div>

          {profileSavedMsg && (
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
              <CheckCircle2 size={17} /> {profileSavedMsg}
            </div>
          )}

          {/* SECTION 1: PERSONAL DETAILS (COMPACT SIDE-BY-SIDE / 2-COL) */}
          <form onSubmit={(e) => {
            e.preventDefault();
            store.updateUser(currentUser.id, {
              name: profileName,
              barangay: profileBarangay,
              profileImage: profileImage || undefined
            });
            setProfileSavedMsg('Profile details updated successfully!');
            setTimeout(() => setProfileSavedMsg(''), 4000);
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
                <User size={15} /> Personal Information
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '16px',
                alignItems: 'center'
              }} className="profile-details-grid">

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProfileAvatarUpload
                    currentImageUrl={profileImage}
                    name={profileName}
                    role="passenger"
                    onImageUploaded={(url) => {
                      setProfileImage(url);
                      store.updateUser(currentUser.id, { profileImage: url });
                      setProfileSavedMsg('Profile photo updated!');
                      setTimeout(() => setProfileSavedMsg(''), 3000);
                    }}
                    onImageRemoved={() => {
                      setProfileImage('');
                      store.updateUser(currentUser.id, { profileImage: '' });
                      setProfileSavedMsg('Profile photo removed.');
                      setTimeout(() => setProfileSavedMsg(''), 3000);
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
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
                      value={currentUser.mobile}
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

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                      Home Barangay
                    </label>
                    <select
                      value={profileBarangay}
                      onChange={e => setProfileBarangay(e.target.value)}
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
                  setProfileSavedMsg('Password updated successfully!');
                  setTimeout(() => setProfileSavedMsg(''), 4000);
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

          {/* SECTION 3: PRIVACY & SYSTEM POLICIES (COMPACT HORIZONTAL CHIPS) */}
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
              <ShieldCheck size={14} color="#16a34a" /> Privacy Guarantees
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '8px'
            }}>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>📱 Mobile Privacy</strong>
                Hidden until ride is accepted.
              </div>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>📍 Landmark Routing</strong>
                No constant GPS tracking needed.
              </div>
              <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#334155' }}>
                <strong style={{ color: '#0f172a', display: 'block' }}>🏛️ Gonzaga LGU</strong>
                Stored in municipal database.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT DRIVER MODAL */}
      {reportDriverModal && (
        <div className="modal-overlay" onClick={() => setReportDriverModal(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '12px' }}>
              <ShieldAlert size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Report Driver to Gonzaga LGU</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Target Driver: <strong>{reportDriverModal.driverName}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Reason</label>
                <select value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Overcharging">Overcharging Fare Matrix</option>
                  <option value="Reckless Driving">Reckless Driving / Safety Concern</option>
                  <option value="Refused Service">Refused Pickup after Accepting</option>
                  <option value="Unprofessional Behavior">Unprofessional Behavior</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Details</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Describe incident..."
                  style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setReportDriverModal(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={submitReport} className="btn-danger" style={{ flex: 1, padding: '10px' }}>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
