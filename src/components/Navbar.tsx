import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { Bike, LogIn, LogOut, HelpCircle, FileText, Home, Settings, Bell, History, Menu, X, Info, HeartHandshake, ChevronRight, Phone, MapPin, Activity, ShieldCheck, User as UserIcon, Building, ShieldAlert } from 'lucide-react';
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
  const profileDropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle outside click & Escape key to close profile dropdown
  useEffect(() => {
    if (!profileDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  const user = state.currentUser;
  const isPassenger = user?.role === 'passenger';
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';
  const hasSidebarMenu = true;

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
    <>
      <nav className="app-navbar">
        <div className={hasSidebarMenu ? 'navbar-inner passenger-navbar-inner' : 'navbar-inner'}>

        <div className="navbar-left-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {hasSidebarMenu && (
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
            onClick={() => setActiveTab(user ? 'dashboard' : 'home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div className="navbar-brand-logo" style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
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
                  fontSize: '1.5rem',
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

              {/* CIRCLE PROFILE AVATAR ONLY WITH MODERN DROPDOWN */}
              <div ref={profileDropdownRef} className="profile-dropdown-wrapper">
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
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  aria-label="User Profile"
                  aria-expanded={profileDropdownOpen}
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
                  <div className="profile-dropdown-menu" role="menu">
                    {/* Header Info */}
                    <div className="profile-dropdown-header">
                      <UserAvatar
                        src={user.profileImage}
                        name={user.name}
                        size={46}
                        role={user.role}
                        showRoleBadge
                      />
                      <div className="profile-dropdown-user-info">
                        <div className="profile-dropdown-user-name" title={user.name}>
                          {user.name}
                        </div>
                        <span className={`profile-dropdown-role-badge role-badge-${user.role}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>

                    {/* Detail items */}
                    <div className="profile-dropdown-details">
                      <div className="profile-detail-row">
                        <Phone size={13} color="#16a34a" />
                        <span>Mobile</span>
                        <strong>{user.mobile}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <MapPin size={13} color="#16a34a" />
                        <span>Barangay</span>
                        <strong>{user.barangay}</strong>
                      </div>
                      {user.plateNumber && (
                        <div className="profile-detail-row">
                          <Bike size={13} color="#b45309" />
                          <span>Plate No</span>
                          <strong>{user.plateNumber}</strong>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="profile-dropdown-actions">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="profile-dropdown-action"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <Settings size={16} color="#16a34a" /> Account Settings
                        </span>
                        <ChevronRight size={15} color="#94a3b8" />
                      </button>

                      <button
                        onClick={() => {
                          store.setCurrentUser(null);
                          setProfileDropdownOpen(false);
                        }}
                        className="profile-dropdown-action profile-dropdown-logout"
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <LogOut size={16} /> Log Out
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
    </nav>

      {/* FIXED HEADER SPACER: prevents page content from jumping or being covered */}
      <div className="navbar-fixed-spacer" aria-hidden="true" />

      {/* PORTAL DRAWER: isolated from navbar DOM so header never resizes or shifts */}
      {typeof document !== 'undefined' && hasSidebarMenu && passengerMenuOpen && createPortal(
        <>
          <button
            type="button"
            className="passenger-menu-backdrop"
            onClick={() => setPassengerMenuOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="passenger-menu-drawer" aria-label={isAdmin ? 'LGU Admin navigation menu' : isDriver ? 'Driver navigation menu' : 'Passenger navigation menu'}>
            <div className="passenger-menu-header">
              <div className="passenger-drawer-brand">
                <div className="passenger-drawer-logo-wrap">
                  <img src={appLogo} alt="TriSakay" className="passenger-drawer-logo" />
                </div>
                <div className="passenger-drawer-brand-text">
                  <span className="passenger-drawer-tag">MUNICIPALITY OF GONZAGA</span>
                  <span className="passenger-drawer-caption">
                    {isAdmin ? 'LGU Admin Control' : isDriver ? 'Driver Navigation' : 'Passenger Navigation'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setPassengerMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="passenger-menu-links">
              {isAdmin ? (
                <>
                  <button type="button" onClick={() => { setActiveTab('overview'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Activity size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>LGU Overview</strong>
                      <small>Live analytics & system stats</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('drivers'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><ShieldCheck size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Driver Approvals</strong>
                      <small>Verify franchise & approve drivers</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('users'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><UserIcon size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>User Directory</strong>
                      <small>Passengers, drivers & accounts</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('fares'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><FileText size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Fare Matrix Control</strong>
                      <small>Official rates & route pricing</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('todas'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Building size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Cluster GONTODA List</strong>
                      <small>Toda associations & coverage</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('reports'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><ShieldAlert size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Incident Reports</strong>
                      <small>Passenger & driver complaints</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('how-it-works'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HelpCircle size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>How TriSakay Works</strong>
                      <small>System guidelines & workflow</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('service-benefits'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HeartHandshake size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Why Choose TriSakay</strong>
                      <small>Fuel efficiency & senior discounts</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('about'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Info size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>About TriSakay</strong>
                      <small>Gonzaga municipal transport system</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                </>
              ) : isDriver ? (
                <>
                  <button type="button" onClick={() => { setActiveTab('dashboard'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Home size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Driver Dashboard</strong>
                      <small>Live ride status & today's earnings</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('ride-history'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><History size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Trip History</strong>
                      <small>Completed rides & earnings records</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('fare-matrix'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><FileText size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Fare Rate Matrix</strong>
                      <small>Official Gonzaga fare rates</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('how-it-works'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HelpCircle size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>How TriSakay Works</strong>
                      <small>Driver guidelines & pickup steps</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('service-benefits'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HeartHandshake size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Why Choose TriSakay</strong>
                      <small>Fuel efficiency & senior discounts</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('about'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Info size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>About Us</strong>
                      <small>Learn about TriSakay Gonzaga</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('profile'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Settings size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Driver Settings</strong>
                      <small>Tricycle plate & TODA details</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => { setActiveTab('fare-matrix'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><FileText size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Fare Rate Matrix</strong>
                      <small>View official Gonzaga fare rates</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('how-it-works'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HelpCircle size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>How TriSakay Works</strong>
                      <small>Step-by-step booking guide</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('about'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><Info size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>About Us</strong>
                      <small>Learn about TriSakay Gonzaga</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                  <button type="button" onClick={() => { setActiveTab('service-benefits'); setPassengerMenuOpen(false); }}>
                    <span className="passenger-menu-link-icon"><HeartHandshake size={22} /></span>
                    <span className="passenger-menu-link-copy">
                      <strong>Why Choose TriSakay</strong>
                      <small>Accessible, efficient local rides</small>
                    </span>
                    <ChevronRight size={18} className="passenger-menu-link-arrow" />
                  </button>
                </>
              )}
            </nav>
          </aside>
        </>,
        document.body
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
    </>
  );
};
