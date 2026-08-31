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
    <div className="mobile-bottom-bar-wrapper">
      <nav className="mobile-floating-glass-dock" aria-label="Mobile Navigation">
        <button
          onClick={() => setActiveTab('home')}
          className={`mobile-dock-btn ${activeTab === 'home' ? 'active' : ''}`}
          aria-label="Home"
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('fare-matrix')}
          className={`mobile-dock-btn ${activeTab === 'fare-matrix' ? 'active' : ''}`}
          aria-label="Fare Matrix"
        >
          <FileText size={20} />
          <span>Fares</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`mobile-dock-btn center-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            aria-label={user.role === 'admin' ? 'Admin Control Center' : user.role === 'driver' ? 'Driver Cockpit' : 'My Ride'}
          >
            <div className="mobile-center-icon">
              {user.role === 'admin' ? (
                <Shield size={18} color="#ffffff" />
              ) : (
                <Bike size={20} color="#ffffff" />
              )}
            </div>
            <span>{user.role === 'driver' ? 'Driver' : user.role === 'admin' ? 'Admin' : 'Ride'}</span>
          </button>
        )}

        <button
          onClick={() => store.toggleSeniorMode()}
          className={`mobile-dock-btn ${state.seniorMode ? 'active-senior' : ''}`}
          aria-label="Toggle Senior Mode"
        >
          <Sparkles size={19} color={state.seniorMode ? '#d97706' : '#64748b'} />
          <span>{state.seniorMode ? 'Senior ON' : 'Senior'}</span>
        </button>
      </nav>

      <style>{`
        .mobile-bottom-bar-wrapper {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          padding: 0 16px calc(14px + env(safe-area-inset-bottom, 0px)) 16px;
          pointer-events: none;
          justify-content: center;
        }

        .mobile-floating-glass-dock {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.76);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 36px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          pointer-events: auto;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-dock-btn {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          min-width: 58px;
          padding: 6px 10px;
          border-radius: 20px;
          transition: all 0.2s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-dock-btn.active {
          background: rgba(22, 163, 74, 0.12);
          color: #15803d;
        }

        .mobile-dock-btn.active-senior {
          background: rgba(234, 179, 8, 0.16);
          color: #b45309;
          font-weight: 800;
        }

        .mobile-dock-btn:active {
          transform: scale(0.94);
        }

        .mobile-center-icon {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);
          transition: transform 0.2s ease;
        }

        .mobile-dock-btn:active .mobile-center-icon {
          transform: scale(0.9);
        }

        @media (max-width: 768px) {
          .mobile-bottom-bar-wrapper {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
