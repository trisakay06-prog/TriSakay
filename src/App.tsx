import React, { useState, useEffect } from 'react';
import { store } from './services/store';
import type { AppStoreData } from './services/store';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { SMSNotificationBanner } from './components/SMSNotificationBanner';
import { HomeView } from './views/HomeView';
import { PassengerDashboard } from './views/PassengerDashboard';
import { DriverDashboard } from './views/DriverDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { FareMatrixView } from './views/FareMatrixView';
import { AboutView } from './views/AboutView';
import { DynamicIslandLiveActivity } from './components/DynamicIslandLiveActivity';
import { UserSideNavigation } from './components/UserSideNavigation';
import { DriverNotificationModal } from './components/DriverNotificationModal';
import { Bike, Clock3, Fuel, HeartHandshake, Map, MapPin, PhilippinePeso } from 'lucide-react';
import { BackButton } from './components/BackButton';

export const App: React.FC = () => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<string>(() => {
    return store.getState().currentUser ? 'dashboard' : 'home';
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [dismissedHomeRequests, setDismissedHomeRequests] = useState<string[]>([]);

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const currentUser = state.currentUser;
  const informationBackLabel = currentUser?.role === 'passenger' ? 'Back to Dashboard' : 'Back to Home';

  const navigateBackFromInformation = () => {
    setActiveTab(currentUser?.role === 'passenger' ? 'dashboard' : 'home');
  };

  const openAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <HomeView
          onStartBooking={() => {
            if (!currentUser) {
              openAuth('login');
            } else {
              setActiveTab('dashboard');
            }
          }}
          onOpenFareMatrix={() => setActiveTab('fare-matrix')}
          onOpenAbout={() => setActiveTab('about')}
        />
      );
    }

    if (activeTab === 'fare-matrix') {
      return <FareMatrixView onBack={navigateBackFromInformation} backLabel={informationBackLabel} />;
    }

    if (activeTab === 'about') {
      return <AboutView onBack={navigateBackFromInformation} backLabel={informationBackLabel} />;
    }

    if (activeTab === 'service-benefits') {
      const benefits = [
        { title: 'Reduce Waiting Time', text: 'Send ride requests directly to available local drivers instead of waiting without an update.', icon: Clock3 },
        { title: 'Senior & PWD Friendly', text: 'Clear controls, accessible booking details, and the proper discounted fare category support inclusive travel.', icon: HeartHandshake },
        { title: 'Fuel & Route Efficiency', text: 'Pickup and destination details help drivers choose practical routes and avoid unnecessary trips.', icon: Fuel }
      ];
      return (
        <div className="information-page-layout">
          <BackButton onClick={navigateBackFromInformation} ariaLabel={informationBackLabel} />
          <section className="glass-panel" style={{ padding: '32px', background: '#fff' }}>
            <h2 style={{ color: '#15803d', marginBottom: '8px' }}>Why use TriSakay?</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Designed for passengers and local tricycle drivers across Gonzaga.</p>
            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {benefits.map(({ title, text, icon: Icon }) => (
                <article key={title} className="glass-card" style={{ padding: '22px' }}>
                  <Icon size={28} color="#15803d" />
                  <h3 style={{ margin: '12px 0 8px' }}>{title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6 }}>{text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'how-it-works') {
      const steps = [
        { title: 'Set Pickup', text: 'Choose your barangay and add a clear pickup landmark.', icon: MapPin },
        { title: 'Choose Destination', text: 'Select where you are going within the available service area.', icon: Map },
        { title: 'Check Fare', text: 'Review the estimated fare before sending your request.', icon: PhilippinePeso },
        { title: 'Confirm Ride', text: 'Book and wait for an available registered driver.', icon: Bike }
      ];
      return (
        <div className="information-page-layout">
          <BackButton onClick={navigateBackFromInformation} ariaLabel={informationBackLabel} />
          <section className="glass-panel" style={{ padding: '28px', background: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <span style={{ color: '#15803d', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '.1em' }}>HOW TRISAKAY WORKS</span>
              <h2 style={{ marginTop: '5px', color: '#0f172a' }}>Book a Ride in 4 Simple Steps</h2>
            </div>
            <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {steps.map(({ title, text, icon: Icon }, index) => (
                <article key={title} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', margin: '0 auto 11px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#f0fdf4', color: '#15803d' }}>
                    <Icon size={23} />
                  </div>
                  <small style={{ color: '#eab308', fontWeight: 900 }}>STEP {index + 1}</small>
                  <h3 style={{ margin: '4px 0 6px', fontSize: '1rem' }}>{title}</h3>
                  <p style={{ color: '#64748b', fontSize: '.8rem', lineHeight: 1.45 }}>{text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'ride-history') {
      if (currentUser?.role === 'passenger') {
        return <PassengerDashboard initialTab="history" onNavigateHome={() => setActiveTab('dashboard')} />;
      }
      if (currentUser?.role === 'driver') return <DriverDashboard />;
      if (currentUser?.role === 'admin') return <AdminDashboard />;
      return <HomeView onStartBooking={() => openAuth('login')} onOpenFareMatrix={() => setActiveTab('fare-matrix')} onOpenAbout={() => setActiveTab('about')} />;
    }

    if (activeTab === 'notifications') {
      if (!currentUser) {
        return (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <h2 style={{ color: '#16a34a', fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
              Sign In to View Notifications
            </h2>
            <button onClick={() => openAuth('login')} className="btn-primary" style={{ padding: '14px 28px', maxWidth: '320px', margin: '16px auto 0 auto' }}>
              Sign In
            </button>
          </div>
        );
      }

      if (currentUser.role === 'driver') {
        return <DriverDashboard initialTab="notifications" />;
      }
      if (currentUser.role === 'admin') {
        return <AdminDashboard initialTab="overview" />;
      }
      return <PassengerDashboard initialTab="notifications" onNavigateHome={() => setActiveTab('dashboard')} />;
    }

    if (activeTab === 'profile' || activeTab === 'settings') {
      if (!currentUser) {
        return (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <h2 style={{ color: '#16a34a', fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
              Sign In to View Settings
            </h2>
            <button onClick={() => openAuth('login')} className="btn-primary" style={{ padding: '14px 28px', maxWidth: '320px', margin: '16px auto 0 auto' }}>
              Sign In
            </button>
          </div>
        );
      }

      if (currentUser.role === 'driver') {
        return <DriverDashboard initialTab="profile" />;
      }
      if (currentUser.role === 'admin') {
        return <AdminDashboard initialTab="overview" />;
      }
      return <PassengerDashboard initialTab="profile" onNavigateHome={() => setActiveTab('dashboard')} />;
    }

    if (activeTab === 'dashboard') {
      if (!currentUser) {
        return (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <div style={{ background: '#dcfce7', color: '#15803d', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              🛺
            </div>
            <h2 style={{ color: '#16a34a', fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
              Sign In to Your Dashboard
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Enter your registered Philippine mobile number to book rides or manage trips.
            </p>
            <button onClick={() => openAuth('login')} className="btn-primary" style={{ padding: '14px 28px', maxWidth: '320px', margin: '0 auto' }}>
              Sign In
            </button>
          </div>
        );
      }

      // Strictly render dashboard based on logged-in role
      if (currentUser.role === 'driver') {
        return <DriverDashboard />;
      }

      if (currentUser.role === 'admin') {
        return <AdminDashboard />;
      }

      return <PassengerDashboard onNavigateHome={() => setActiveTab('dashboard')} />;
    }

    return (
      <HomeView
        onStartBooking={() => {
          if (!currentUser) openAuth('login');
          else setActiveTab('dashboard');
        }}
        onOpenFareMatrix={() => setActiveTab('fare-matrix')}
        onOpenAbout={() => setActiveTab('about')}
      />
    );
  };

  return (
    <div className={!currentUser ? 'app-root guest-app' : 'app-root'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* iOS Dynamic Island / Live Activity Floating Capsule */}
      <DynamicIslandLiveActivity onOpenTracking={() => setActiveTab('dashboard')} />

      {/* Cellular SMS Text Message Notification Banner */}
      <SMSNotificationBanner />

      {/* Navigation Header */}
      <Navbar
        onOpenAuth={openAuth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {currentUser?.role === 'driver' && activeTab === 'home' && (() => {
        const request = state.bookings.find(b => b.status === 'WAITING_FOR_DRIVER' && !dismissedHomeRequests.includes(b.id));
        return request ? (
          <DriverNotificationModal
            activeBooking={request}
            currentDriver={currentUser}
            onDismiss={() => setDismissedHomeRequests(ids => [...ids, request.id])}
          />
        ) : null;
      })()}

      <div className="app-content-shell">
      {currentUser?.role === 'driver' && (
        <UserSideNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
      <main className={`main-content-area ${!currentUser ? 'guest-main-content' : ''}`} style={{
        flex: 1,
        maxWidth: currentUser && currentUser.role !== 'admin' ? '980px' : '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        {renderContent()}
      </main>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />

      {currentUser && <footer className="desktop-footer" style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        TriSakay © 2026 Municipality of Gonzaga • Sakay Mo, Isang Click Lang!
      </footer>}

    </div>
  );
};

export default App;
