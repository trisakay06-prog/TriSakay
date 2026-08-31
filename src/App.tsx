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
import { MobileBottomNav } from './components/MobileBottomNav';
import { DynamicIslandLiveActivity } from './components/DynamicIslandLiveActivity';

export const App: React.FC = () => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const currentUser = state.currentUser;

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <HomeView
          onStartBooking={() => {
            if (!currentUser) {
              setAuthModalOpen(true);
            } else {
              setActiveTab('dashboard');
            }
          }}
          onStartWaiting={() => {
            if (!currentUser) {
              setAuthModalOpen(true);
            } else {
              setActiveTab('dashboard');
            }
          }}
          onOpenFareMatrix={() => setActiveTab('fare-matrix')}
        />
      );
    }

    if (activeTab === 'fare-matrix') {
      return <FareMatrixView />;
    }

    if (activeTab === 'how-it-works') {
      return (
        <HomeView
          onStartBooking={() => {
            if (!currentUser) setAuthModalOpen(true);
            else setActiveTab('dashboard');
          }}
          onStartWaiting={() => {
            if (!currentUser) setAuthModalOpen(true);
            else setActiveTab('dashboard');
          }}
          onOpenFareMatrix={() => setActiveTab('fare-matrix')}
        />
      );
    }

    if (activeTab === 'profile' || activeTab === 'settings') {
      if (!currentUser) {
        return (
          <div style={{ textAlign: 'center', padding: '60px 16px' }}>
            <h2 style={{ color: '#16a34a', fontSize: '1.6rem', fontWeight: 800, marginBottom: '10px' }}>
              Sign In to View Settings
            </h2>
            <button onClick={() => setAuthModalOpen(true)} className="btn-primary" style={{ padding: '14px 28px', maxWidth: '320px', margin: '16px auto 0 auto' }}>
              Sign In / Register Account
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
      return <PassengerDashboard initialTab="profile" />;
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
              Enter your registered Philippine mobile number to book rides, track drivers, or manage trips.
            </p>
            <button onClick={() => setAuthModalOpen(true)} className="btn-primary" style={{ padding: '14px 28px', maxWidth: '320px', margin: '0 auto' }}>
              Sign In / Register Account
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

      return <PassengerDashboard />;
    }

    return (
      <HomeView
        onStartBooking={() => {
          if (!currentUser) setAuthModalOpen(true);
          else setActiveTab('dashboard');
        }}
        onStartWaiting={() => {
          if (!currentUser) setAuthModalOpen(true);
          else setActiveTab('dashboard');
        }}
        onOpenFareMatrix={() => setActiveTab('fare-matrix')}
      />
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* iOS Dynamic Island / Live Activity Floating Capsule */}
      <DynamicIslandLiveActivity onOpenTracking={() => setActiveTab('dashboard')} />

      {/* Cellular SMS Text Message Notification Banner */}
      <SMSNotificationBanner />

      {/* Navigation Header */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content-area" style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px'
      }}>
        {renderContent()}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />

      <footer className="desktop-footer" style={{
        background: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        TriSakay © 2026 Municipality of Gonzaga Tricycle Booking System • Sakay Mo, Isang Click Lang!
      </footer>

      {/* Mobile Smartphone Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

    </div>
  );
};

export default App;
