import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { Bike, LogIn, LogOut, Menu, X, HelpCircle, FileText, Home, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  useEffect(() => {
    if (state.seniorMode) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
  }, [state.seniorMode]);

  const user = state.currentUser;

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    if (user.role === 'driver') return 'Driver Dashboard';
    if (user.role === 'admin') return 'Admin Dashboard';
    return 'Passenger Portal';
  };

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(25px) saturate(180%)',
      WebkitBackdropFilter: 'blur(25px) saturate(180%)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      position: 'sticky',
      top: '0',
      zIndex: 900,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>

        {/* LOGO & BRANDING */}
        <div 
          onClick={() => setActiveTab('home')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: '#ffffff',
            padding: '10px 14px',
            borderRadius: '14px',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bike size={28} color="#fef08a" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#16a34a',
                letterSpacing: '-0.5px'
              }}>
                TriSakay
              </span>
              <span style={{
                background: '#eab308',
                color: '#052e16',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                GONZAGA
              </span>
            </div>

            <p style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
              marginTop: '-2px'
            }}>
              Sakay Mo, Isang Click Lang!
            </p>
          </div>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div style={{ display: 'none', alignItems: 'center', gap: '20px' }} className="desktop-links">
          <button
            onClick={() => setActiveTab('home')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'home' ? '#16a34a' : '#475569',
              fontWeight: activeTab === 'home' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Home size={16} /> Home
          </button>

          <button
            onClick={() => setActiveTab('how-it-works')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'how-it-works' ? '#16a34a' : '#475569',
              fontWeight: activeTab === 'how-it-works' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={16} /> How It Works
          </button>

          <button
            onClick={() => setActiveTab('fare-matrix')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'fare-matrix' ? '#16a34a' : '#475569',
              fontWeight: activeTab === 'fare-matrix' ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} /> Fare Matrix
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              background: activeTab === 'dashboard' ? '#dcfce7' : 'transparent',
              border: 'none',
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '0.95rem',
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bike size={16} /> {getDashboardLabel()}
          </button>
        </div>

        {/* RIGHT CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => store.toggleSeniorMode()}
            className="desktop-senior-btn"
            style={{
              background: state.seniorMode ? '#fef08a' : '#f1f5f9',
              color: state.seniorMode ? '#854d0e' : '#475569',
              border: state.seniorMode ? '2px solid #eab308' : '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Toggle Senior Citizen High Contrast & Large Text Mode"
          >
            <Sparkles size={16} color={state.seniorMode ? '#d97706' : '#64748b'} />
            <span>Senior Mode: {state.seniorMode ? 'ON' : 'OFF'}</span>
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  color: '#15803d',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#16a34a'
                }} />
                {user.name.split(' ')[0]}
              </button>

              <button
                onClick={() => store.setCurrentUser(null)}
                title="Logout"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              <LogIn size={16} /> Login / Register
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#334155',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px',
              border: 'none',
              background: activeTab === 'home' ? '#f0fdf4' : 'transparent',
              color: '#16a34a',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            🏠 Home
          </button>

          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px',
              border: 'none',
              background: activeTab === 'dashboard' ? '#f0fdf4' : 'transparent',
              color: '#16a34a',
              fontWeight: 700,
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            🛺 {getDashboardLabel()}
          </button>

          <button
            onClick={() => { setActiveTab('how-it-works'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px',
              border: 'none',
              background: activeTab === 'how-it-works' ? '#f0fdf4' : 'transparent',
              color: '#334155',
              fontWeight: 600,
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            ❓ How It Works
          </button>

          <button
            onClick={() => { setActiveTab('fare-matrix'); setMobileMenuOpen(false); }}
            style={{
              textAlign: 'left',
              padding: '10px',
              border: 'none',
              background: activeTab === 'fare-matrix' ? '#f0fdf4' : 'transparent',
              color: '#334155',
              fontWeight: 600,
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          >
            📋 Official Gonzaga Fare Matrix
          </button>
        </div>
      )}

      <style>{`
        .desktop-senior-btn {
          display: flex;
        }

        @media (max-width: 768px) {
          .desktop-senior-btn {
            display: none !important;
          }
        }

        @media (min-width: 768px) {
          .desktop-links { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
