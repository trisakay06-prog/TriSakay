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
import { DriverNotificationModal } from './components/DriverNotificationModal';
import { Bike, Clock3, Fuel, HeartHandshake, Map, MapPin, PhilippinePeso, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const informationBackLabel = currentUser ? 'Back to Dashboard' : 'Back to Home';

  const navigateBackFromInformation = () => {
    setActiveTab(currentUser ? 'dashboard' : 'home');
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
        {
          title: 'Set Pickup Location',
          text: 'Choose your barangay in Gonzaga and specify an exact, recognizable landmark (e.g. waiting shed, store, gate).',
          icon: MapPin
        },
        {
          title: 'Choose Destination',
          text: 'Select your target barangay or destination within the municipality coverage area.',
          icon: Map
        },
        {
          title: 'Review Official Fare',
          text: 'Review the transparent fare computed automatically under the Gonzaga Municipal Tricycle Fare Ordinance.',
          icon: PhilippinePeso
        },
        {
          title: 'Confirm & Ride',
          text: 'Submit your ride request. A nearby registered tricycle driver will accept, and you can track their arrival.',
          icon: Bike
        }
      ];

      const guidelines = [
        {
          title: 'Senior Citizen, PWD & Student Discount',
          desc: 'Eligible passengers receive a 20% statutory discount automatically computed when choosing the discounted fare category.'
        },
        {
          title: 'Direct Driver Contact',
          desc: 'Once your ride is accepted, the driver\'s phone number and plate details are shown for direct SMS or voice communication.'
        },
        {
          title: 'Accredited Tricycle Drivers',
          desc: 'All TriSakay drivers are registered residents and licensed operators verified by the local transport office.'
        }
      ];

      return (
        <div className="information-page-layout how-it-works-layout">
          <BackButton onClick={navigateBackFromInformation} ariaLabel={informationBackLabel} />

          <section className="glass-panel" style={{ padding: '28px 24px', background: '#fff' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{
                color: '#15803d',
                fontSize: '0.78rem',
                fontWeight: 900,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                background: '#f0fdf4',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid #dcfce7',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Sparkles size={14} /> HOW TRISAKAY WORKS
              </span>
              <h2 style={{ marginTop: '10px', color: '#0f172a', fontSize: '1.6rem', fontWeight: 800 }}>
                Book a Ride in 4 Simple Steps
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '540px', margin: '6px auto 0' }}>
                TriSakay connects passengers directly with registered local tricycle operators across Gonzaga for reliable and fair travel.
              </p>
            </div>

            <div className="how-it-works-steps-grid">
              {steps.map(({ title, text, icon: Icon }, index) => (
                <article
                  key={title}
                  className="glass-card"
                  style={{
                    padding: '22px 18px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    margin: '0 auto 12px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.12)'
                  }}>
                    <Icon size={24} />
                  </div>
                  <span style={{
                    color: '#eab308',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    STEP {index + 1}
                  </span>
                  <h3 style={{ margin: '2px 0 8px', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    {title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Passenger Guidelines & Safety */}
          <section className="glass-panel" style={{ padding: '24px', background: '#fff', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={22} color="#15803d" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Important Rider Guidelines
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {guidelines.map(g => (
                <div
                  key={g.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', marginBottom: '2px' }}>
                      {g.title}
                    </strong>
                    <span style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.45 }}>
                      {g.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Footer */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('fare-matrix')}
                className="btn-outline"
                style={{
                  flex: '1 1 200px',
                  minHeight: '46px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <PhilippinePeso size={17} /> View Official Fare Matrix
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) openAuth('login');
                  else setActiveTab('dashboard');
                }}
                className="btn-primary"
                style={{
                  flex: '1 1 200px',
                  minHeight: '46px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem'
                }}
              >
                <Bike size={17} /> {currentUser ? 'Go to Booking' : 'Sign In to Book'}
              </button>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'ride-history') {
      if (currentUser?.role === 'passenger') {
        return <PassengerDashboard initialTab="history" onNavigateHome={() => setActiveTab('dashboard')} />;
      }
      if (currentUser?.role === 'driver') return <DriverDashboard initialTab="history" onNavigateHome={() => setActiveTab('dashboard')} />;
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
        return <DriverDashboard initialTab="notifications" onNavigateHome={() => setActiveTab('dashboard')} />;
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
        return <DriverDashboard initialTab="profile" onNavigateHome={() => setActiveTab('dashboard')} />;
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
        return <DriverDashboard onNavigateHome={() => setActiveTab('dashboard')} />;
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
    <div className={!currentUser ? 'app-root guest-app' : 'app-root'} style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      
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
