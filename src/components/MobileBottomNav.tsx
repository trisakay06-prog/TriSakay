import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { Home, Bike, FileText, Sparkles, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const [state, setState] = useState<AppStoreData>(store.getState());

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const user = state.currentUser;

  return (
    <div className="mobile-bottom-bar">
      <button
        onClick={() => setActiveTab('home')}
        className={`mobile-nav-btn ${activeTab === 'home' ? 'active' : ''}`}
        aria-label="Home"
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('fare-matrix')}
        className={`mobile-nav-btn ${activeTab === 'fare-matrix' ? 'active' : ''}`}
        aria-label="Fare Matrix"
      >
        <FileText size={22} />
        <span>Fares</span>
      </button>

      {user && (
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`mobile-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          aria-label={user.role === 'admin' ? 'Admin Control Center' : user.role === 'driver' ? 'Driver Cockpit' : 'My Ride'}
        >
          <div className="mobile-center-icon">
            {user.role === 'admin' ? (
              <Shield size={20} color="#ffffff" />
            ) : (
              <Bike size={22} color="#ffffff" />
            )}
          </div>
          <span>{user.role === 'driver' ? 'Driver' : user.role === 'admin' ? 'Admin' : 'Ride'}</span>
        </button>
      )}

      <button
        onClick={() => store.toggleSeniorMode()}
        className={`mobile-nav-btn ${state.seniorMode ? 'active-senior' : ''}`}
        aria-label="Toggle Senior Mode"
      >
        <Sparkles size={20} color={state.seniorMode ? '#eab308' : '#94a3b8'} />
        <span>{state.seniorMode ? 'Senior ON' : 'Senior'}</span>
      </button>

      <style>{`
        .mobile-bottom-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(14px);
          border-top: 1px solid #e2e8f0;
          padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)) 12px;
          z-index: 999;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
        }

        .mobile-nav-btn {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          min-width: 52px;
          padding: 4px 6px;
          border-radius: 12px;
          transition: all 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-nav-btn.active {
          color: #16a34a;
        }

        .mobile-nav-btn.active-senior {
          color: #ca8a04;
          font-weight: 800;
        }

        .mobile-center-icon {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -8px;
          box-shadow: 0 4px 10px rgba(22, 163, 74, 0.4);
          transition: transform 0.2s ease;
        }

        .mobile-nav-btn:active .mobile-center-icon {
          transform: scale(0.92);
        }

        @media (max-width: 768px) {
          .mobile-bottom-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
