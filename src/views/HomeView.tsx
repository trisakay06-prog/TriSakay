import React, { useState, useEffect } from 'react';
import { Bike, Shield, Users, MapPin, Phone, Mail, Sparkles } from 'lucide-react';
import { FareCalculatorWidget } from '../components/FareCalculatorWidget';
import { store } from '../services/store';

interface HomeViewProps {
  onStartBooking: () => void;
  onStartWaiting: () => void;
  onOpenFareMatrix: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartBooking,
  onStartWaiting,
  onOpenFareMatrix
}) => {
  const [currentUser, setCurrentUser] = useState(store.getState().currentUser);

  useEffect(() => {
    return store.subscribe(() => {
      setCurrentUser(store.getState().currentUser);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>

      {/* HERO SECTION */}
      <section className="hero-banner" style={{
        background: 'linear-gradient(135deg, #052e16 0%, #15803d 60%, #16a34a 100%)',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '48px 32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(22, 163, 74, 0.4)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(234, 179, 8, 0.15)',
          filter: 'blur(50px)'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fef08a',
            marginBottom: '16px'
          }}>
            <Sparkles size={16} /> Municipality of Gonzaga Tricycle Booking System
          </div>

          <h1 style={{
            fontSize: '2.8rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '12px',
            fontFamily: 'Outfit, sans-serif'
          }}>
            TriSakay
          </h1>

          <p style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#fef08a',
            marginBottom: '16px',
            letterSpacing: '-0.3px'
          }}>
            Sakay Mo, Isang Click Lang!
          </p>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            maxWidth: '650px',
            margin: '0 auto 28px auto'
          }}>
            {currentUser?.role === 'admin'
              ? 'Administrator account active. Access driver approvals, user management, and system monitoring below.'
              : currentUser?.role === 'driver'
              ? 'Driver account active. Manage ride requests, track passenger pickups, and view today earnings.'
              : 'Connecting passengers directly with registered local tricycle drivers across Gonzaga. Fast, easy, and senior-friendly transportation at your fingertips.'}
          </p>

          <div className="hero-btn-group" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap'
          }}>
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  onClick={onStartBooking}
                  className="btn-yellow hero-btn"
                  style={{
                    fontSize: '1.15rem',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 20px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Shield size={24} /> Open Admin Control Center
                </button>

                <button
                  onClick={onOpenFareMatrix}
                  className="hero-btn"
                  style={{
                    background: '#ffffff',
                    color: '#15803d',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 28px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                  }}
                >
                  📋 View Fare Matrix & Rates
                </button>
              </>
            ) : currentUser?.role === 'driver' ? (
              <>
                <button
                  onClick={onStartBooking}
                  className="btn-yellow hero-btn"
                  style={{
                    fontSize: '1.15rem',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 20px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Bike size={24} /> Open Driver Cockpit
                </button>

                <button
                  onClick={onOpenFareMatrix}
                  className="hero-btn"
                  style={{
                    background: '#ffffff',
                    color: '#15803d',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 28px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                  }}
                >
                  📋 View Official Fare Matrix
                </button>
              </>
            ) : currentUser?.role === 'passenger' ? (
              <>
                <button
                  onClick={onStartBooking}
                  className="btn-yellow hero-btn"
                  style={{
                    fontSize: '1.15rem',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 20px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  <Bike size={24} /> Book a Ride Now
                </button>

                <button
                  onClick={onStartWaiting}
                  className="hero-btn"
                  style={{
                    background: '#ffffff',
                    color: '#15803d',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 28px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                  }}
                >
                  🖐️ "I'm Waiting" Quick Alert
                </button>
              </>
            ) : (
              /* GUEST / VISITOR NOT LOGGED IN YET */
              <>
                <button
                  onClick={onStartBooking}
                  className="btn-yellow hero-btn"
                  style={{
                    fontSize: '1.15rem',
                    padding: '16px 32px',
                    borderRadius: '16px',
                    boxShadow: '0 8px 20px rgba(234, 179, 8, 0.4)'
                  }}
                >
                  🚀 Sign In / Register to Book
                </button>

                <button
                  onClick={onOpenFareMatrix}
                  className="hero-btn"
                  style={{
                    background: '#ffffff',
                    color: '#15803d',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px 28px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 20px rgba(255,255,255,0.2)'
                  }}
                >
                  📋 Check Gonzaga Fare Rates
                </button>
              </>
            )}
          </div>
        </div>
      </section>



      {/* FARE CALCULATOR & ABOUT US GRID */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }} className="grid-responsive">
        
        <div className="glass-panel" style={{ padding: '32px', borderRadius: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '12px' }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>About TriSakay</h2>
          </div>

          <p style={{ color: '#334155', lineHeight: 1.7, fontSize: '1rem', marginBottom: '20px' }}>
            <strong>TriSakay</strong> is a community-based tricycle booking platform that connects passengers with registered tricycle drivers in the <strong>Municipality of Gonzaga</strong>. We provide a simple, reliable, and accessible way to make local transportation more convenient and efficient.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', borderLeft: '4px solid #16a34a' }}>
              <h4 style={{ color: '#15803d', fontWeight: 800, marginBottom: '4px' }}>🎯 Our Mission</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                To provide safe, reliable, and accessible transportation solutions by connecting rural communities through innovative digital technology.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', borderLeft: '4px solid #eab308' }}>
              <h4 style={{ color: '#854d0e', fontWeight: 800, marginBottom: '4px' }}>🌟 Our Vision</h4>
              <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                To be the leading digital transportation platform that empowers rural communities with smarter, more connected, and sustainable mobility.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFareMatrix}
            className="btn-outline"
            style={{ marginTop: '20px', width: '100%', fontSize: '0.9rem' }}
          >
            📋 View Complete Official Fare Matrix
          </button>
        </div>

        <FareCalculatorWidget />
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="glass-panel" style={{ padding: '36px', borderRadius: '24px', background: '#ffffff' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 32px auto' }}>
          <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            SIMPLE STEP-BY-STEP PROCESS
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            How TriSakay Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="grid-responsive">
          <div style={{ background: '#f0fdf4', padding: '24px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} /> For Passengers
            </h3>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', color: '#1e293b' }}>
              <li>Open TriSakay website (No installation required!)</li>
              <li>Choose <strong>Book a Ride</strong> or <strong>I'm Waiting</strong></li>
              <li>Enter pickup & destination barangays and landmarks</li>
              <li>Select number of passengers & discount category</li>
              <li>View auto-calculated estimated fare</li>
              <li>Click <strong>Book Ride</strong> & wait for driver acceptance!</li>
            </ol>
          </div>

          <div style={{ background: '#fefce8', padding: '24px', borderRadius: '20px', border: '1px solid #fef08a' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#854d0e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bike size={22} /> For Tricycle Drivers
            </h3>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', color: '#1e293b' }}>
              <li>Log in to your TriSakay driver account</li>
              <li>Set status to <strong>Online</strong></li>
              <li>Receive real-time booking alert chime on your phone</li>
              <li>View pickup location, passengers count, & notes</li>
              <li>Click <strong>ACCEPT</strong> to unlock passenger contact number</li>
              <li>Pick up passenger & complete ride!</li>
            </ol>
          </div>
        </div>
      </section>

      {/* CONTACT US FOOTER */}
      <section style={{
        background: '#0f172a',
        color: '#ffffff',
        padding: '36px',
        borderRadius: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fef08a', marginBottom: '8px' }}>
            TriSakay Gonzaga
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Official Municipality of Gonzaga Tricycle Booking System. Dedicated to safe, accessible, and connected community transport.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
            Contact Details
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#16a34a" /> Municipality of Gonzaga, Cagayan
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#16a34a" /> trisakay@gmail.com
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#16a34a" /> 09628039440
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🌐</span> Facebook: TriSakay Gonzaga
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
            TODA Coverage
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Partnered with GOTODA, BAUATODA, CALAYANTODA, and PATENGTODA tricycle driver associations.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .hero-banner { padding: 28px 16px !important; border-radius: 20px !important; }
          .hero-btn-group { flex-direction: column !important; width: 100% !important; }
          .hero-btn { width: 100% !important; min-height: 52px !important; }
        }
      `}</style>
    </div>
  );
};
