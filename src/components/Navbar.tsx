import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { Bike, LogIn, LogOut, HelpCircle, FileText, Home, UserCheck, Settings, Bell, History, Menu, X, Info, HeartHandshake, ChevronRight } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import appLogo from '../assets/Logo Glossy Green Scooter Emblem.png';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [passengerMenuOpen, setPassengerMenuOpen] = useState(false);

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
  const isPassenger = user?.role === 'passenger';

  useEffect(() => {
    setPassengerMenuOpen(false);
  }, [activeTab, user?.id]);

  const userBookings = user
    ? state.bookings.filter(b => b.passengerId === user.id || b.passengerMobile === user.mobile)
    : [];
  const activeUserBooking = userBookings.find(
    b => b.status === 'DRIVER_ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'PASSENGER_PICKED_UP'
  );
  const pendingDriverRequests = user?.role === 'driver'
    ? state.bookings.filter(b => b.status === 'WAITING_FOR_DRIVER').length
    : 0;
  const pendingAdminItems = user?.role === 'admin'
    ? state.users.filter(u => u.role === 'driver' && !u.isApproved && !u.isBlocked).length + state.reports.filter(r => r.status === 'pending').length
    : 0;

  const unreadCount = user?.role === 'driver'
    ? pendingDriverRequests
    : user?.role === 'admin'
      ? pendingAdminItems
      : (activeUserBooking ? 1 : 0);

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
      <div className={isPassenger ? 'navbar-inner passenger-navbar-inner' : 'navbar-inner'} style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>

        {isPassenger && (
          <button
            type="button"
            className="passenger-menu-trigger"
            onClick={() => setPassengerMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={passengerMenuOpen}
          >
            <Menu size={21} />
          </button>
        )}

        {/* LOGO & BRANDING */}
        <div
          className="navbar-brand"
          onClick={() => setActiveTab(isPassenger ? 'dashboard' : 'home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div className="navbar-brand-logo" style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img
              src={appLogo}
              alt="TriSakay logo"
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
            />
          </div>

          <div className="navbar-brand-copy">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="navbar-brand-title" style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#16a34a',
                letterSpacing: '-0.5px'
              }}>
                TriSakay
              </span>
              <span className="navbar-brand-location" style={{
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

          {(!user || user.role === 'admin') && <button
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
          </button>}

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
        <div className="navbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>

              {isPassenger && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ride-history')}
                  className="navbar-action-icon"
                  style={{
                    background: activeTab === 'ride-history' ? '#dcfce7' : '#ffffff',
                    color: activeTab === 'ride-history' ? '#15803d' : '#475569',
                    border: activeTab === 'ride-history' ? '1.5px solid #86efac' : '1.5px solid #e2e8f0'
                  }}
                  aria-label="Ride history"
                  title="Ride History"
                >
                  <History size={18} />
                </button>
              )}

              {/* NOTIFICATION BELL ICON (CLICKABLE) */}
              <button
                onClick={() => setActiveTab('notifications')}
                className="navbar-action-icon"
                style={{
                  background: activeTab === 'notifications' ? '#dcfce7' : '#ffffff',
                  color: activeTab === 'notifications' ? '#15803d' : '#475569',
                  border: activeTab === 'notifications' ? '1.5px solid #86efac' : '1.5px solid #e2e8f0',
                }}
                aria-label="Notifications"
                title="Notifications & Alerts"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)'
                  }} />
                )}
              </button>

              {/* CIRCLE PROFILE AVATAR ONLY (NO NAME, CLICKABLE DROPDOWN) */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="profile-avatar-control"
                style={{
                  padding: 0,
                  width: '40px',
                  height: '40px',
                  border: '2px solid #ffffff',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: profileDropdownOpen
                    ? '0 0 0 3px rgba(22, 163, 74, 0.35)'
                    : '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'box-shadow 0.2s ease',
                  flexShrink: 0
                }}
                aria-label="User Profile"
                title={`${user.name} (${user.role})`}
              >
                <UserAvatar
                  src={user.profileImage}
                  name={user.name}
                  size={36}
                  role={user.role}
                />
              </button>

              {/* PROFILE DROPDOWN MENU */}
              {profileDropdownOpen && (
                <div
                  className="profile-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '270px',
                    background: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                    padding: '16px',
                    zIndex: 10001
                  }}
                >
                  {/* Header Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <UserAvatar
                      src={user.profileImage}
                      name={user.name}
                      size={44}
                      role={user.role}
                      showRoleBadge
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </div>
                      <span style={{
                        background: user.role === 'admin' ? '#dbeafe' : user.role === 'driver' ? '#fef3c7' : '#dcfce7',
                        color: user.role === 'admin' ? '#1d4ed8' : user.role === 'driver' ? '#b45309' : '#15803d',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Detail items */}
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
                    <div>📱 Mobile: <strong>{user.mobile}</strong></div>
                    <div>📍 Barangay: <strong>{user.barangay}</strong></div>
                    {user.plateNumber && <div>🛺 Plate No: <strong>{user.plateNumber}</strong></div>}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Settings size={16} color="#16a34a" /> Account Settings
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #f1f5f9',
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <UserCheck size={16} color="#0284c7" /> My Dashboard / Ride
                    </button>

                    <button
                      onClick={() => {
                        store.setCurrentUser(null);
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>
      </div>

      {isPassenger && passengerMenuOpen && (
        <>
          <button
            type="button"
            className="passenger-menu-backdrop"
            onClick={() => setPassengerMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="passenger-menu-drawer" aria-label="Passenger information menu">
            <div className="passenger-menu-header">
              <div>
                <strong>TriSakay Menu</strong>
                <span>Passenger information</span>
              </div>
              <button type="button" onClick={() => setPassengerMenuOpen(false)} aria-label="Close navigation menu">
                <X size={21} />
              </button>
            </div>

            <nav className="passenger-menu-links">
              <button type="button" onClick={() => setActiveTab('fare-matrix')}>
                <span className="passenger-menu-link-icon"><FileText size={20} /></span>
                <span><strong>Fare Rate Matrix</strong><small>View official Gonzaga fare rates</small></span>
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={() => setActiveTab('how-it-works')}>
                <span className="passenger-menu-link-icon"><HelpCircle size={20} /></span>
                <span><strong>How TriSakay Works</strong><small>Follow the simple booking steps</small></span>
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={() => setActiveTab('about')}>
                <span className="passenger-menu-link-icon"><Info size={20} /></span>
                <span><strong>About Us</strong><small>Learn about TriSakay Gonzaga</small></span>
                <ChevronRight size={18} />
              </button>
              <button type="button" onClick={() => setActiveTab('service-benefits')}>
                <span className="passenger-menu-link-icon"><HeartHandshake size={20} /></span>
                <span><strong>Why Choose TriSakay</strong><small>Accessible, efficient local rides</small></span>
                <ChevronRight size={18} />
              </button>
            </nav>
          </aside>
        </>
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
        }
      `}</style>
    </nav>
  );
};
