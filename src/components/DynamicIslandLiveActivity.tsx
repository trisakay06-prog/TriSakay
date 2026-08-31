import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { Phone, ChevronRight } from 'lucide-react';
import { cleanBarangay } from '../services/fareCalculator';

interface DynamicIslandProps {
  onOpenTracking: () => void;
}

export const DynamicIslandLiveActivity: React.FC<DynamicIslandProps> = ({ onOpenTracking }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const user = state.currentUser;
  if (!user) return null;

  // Find active booking for this passenger or driver
  const relevantBookings = state.bookings.filter(b => {
    if (b.status === 'COMPLETED' || b.status === 'CANCELLED') return false;
    if (user.role === 'driver') return b.driverId === user.id || b.status === 'WAITING_FOR_DRIVER';
    return b.passengerId === user.id || b.passengerMobile === user.mobile;
  });

  const activeBooking = 
    relevantBookings.find(b => b.status === 'DRIVER_ACCEPTED' || b.status === 'DRIVER_ARRIVING' || b.status === 'PASSENGER_PICKED_UP') ||
    relevantBookings[0] ||
    null;

  if (!activeBooking) return null;

  const assignedDriver = state.users.find(u => u.id === activeBooking.driverId);

  const getStatusLabel = () => {
    switch (activeBooking.status) {
      case 'WAITING_FOR_DRIVER':
        return { text: 'Searching Gonzaga Drivers...', sub: 'Connecting with nearby TODA', color: '#FF9500', icon: '⏳' };
      case 'DRIVER_ACCEPTED':
        return { text: `Driver ${activeBooking.driverName || 'Assigned'} En Route`, sub: `Heading to ${cleanBarangay(activeBooking.pickupBarangay)}`, color: '#16a34a', icon: '🛺' };
      case 'DRIVER_ARRIVING':
        return { text: 'Arrived at Pickup', sub: `Tricycle waiting at ${activeBooking.pickupLandmark || cleanBarangay(activeBooking.pickupBarangay)}`, color: '#007AFF', icon: '📍' };
      case 'PASSENGER_PICKED_UP':
        return { text: 'Passenger Onboard', sub: `Heading to ${cleanBarangay(activeBooking.destinationBarangay)}`, color: '#16a34a', icon: '🚀' };
      default:
        return { text: 'TriSakay Live Ride', sub: 'Active', color: '#16a34a', icon: '🛺' };
    }
  };

  const statusInfo = getStatusLabel();

  return (
    <div className="ios-live-activity-wrapper">
      <div 
        className={`ios-dynamic-island ${expanded ? 'expanded' : ''}`}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {/* COMPACT PILL VIEW */}
        <div className="ios-island-compact">
          <div className="ios-island-left">
            <div className="ios-pulse-ring" style={{ background: statusInfo.color }}>
              <span style={{ fontSize: '0.85rem' }}>{statusInfo.icon}</span>
            </div>
            <div className="ios-island-text">
              <span className="ios-island-title">{statusInfo.text}</span>
              <span className="ios-island-sub">{cleanBarangay(activeBooking.pickupBarangay)} ➔ {cleanBarangay(activeBooking.destinationBarangay)}</span>
            </div>
          </div>

          <div className="ios-island-right">
            <span className="ios-fare-badge">₱{activeBooking.estimatedFare}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenTracking();
              }}
              className="ios-island-cta"
            >
              View <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* EXPANDED LIVE ACTIVITY DETAILS */}
        {expanded && (
          <div className="ios-island-details" onClick={(e) => e.stopPropagation()}>
            <div className="ios-island-detail-row">
              <div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>PASSENGER / DRIVER</div>
                <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 800 }}>
                  {user.role === 'driver' ? activeBooking.passengerName : (activeBooking.driverName || 'Assigning driver...')}
                </div>
              </div>

              {(assignedDriver || activeBooking.plateNumber) && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 700 }}>TRICYCLE PLATE</div>
                  <div style={{
                    background: '#fef08a',
                    color: '#713f12',
                    border: '1px solid #eab308',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    marginTop: '2px',
                    display: 'inline-block'
                  }}>
                    🛺 {assignedDriver?.plateNumber || activeBooking.plateNumber || 'TZ-9842'}
                  </div>
                </div>
              )}
            </div>

            <div className="ios-island-route-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>📍 Pickup:</span> {cleanBarangay(activeBooking.pickupBarangay)} ({activeBooking.pickupLandmark})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, marginTop: '4px' }}>
                <span>🏁 Dropoff:</span> {cleanBarangay(activeBooking.destinationBarangay)} ({activeBooking.destinationLandmark})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button 
                onClick={onOpenTracking}
                className="ios-btn-apple-green"
                style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
              >
                Open Full Tracking Sheet
              </button>

              {activeBooking.passengerMobile && (user.role === 'driver' || activeBooking.status !== 'WAITING_FOR_DRIVER') && (
                <a 
                  href={`tel:${user.role === 'driver' ? activeBooking.passengerMobile : (assignedDriver?.mobile || '09628039440')}`}
                  className="ios-btn-apple-glass"
                  style={{ padding: '10px 14px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Phone size={14} color="#16a34a" /> Call
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ios-live-activity-wrapper {
          position: fixed;
          top: 76px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          z-index: 9998;
          padding: 0 16px;
          pointer-events: none;
        }

        .ios-dynamic-island {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          color: #0f172a;
          border-radius: 28px;
          padding: 8px 14px;
          width: 100%;
          max-width: 440px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.09), 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
          pointer-events: auto;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ios-dynamic-island.expanded {
          border-radius: 28px;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
        }

        .ios-island-compact {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .ios-island-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .ios-pulse-ring {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .ios-island-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .ios-island-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ios-island-sub {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ios-island-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .ios-fare-badge {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .ios-island-cta {
          background: #16a34a;
          color: #ffffff;
          border: none;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
          transition: transform 0.15s ease;
        }

        .ios-island-cta:active {
          transform: scale(0.95);
        }

        .ios-island-details {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fade-in 0.25s ease;
        }

        .ios-island-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ios-island-route-box {
          background: rgba(241, 245, 249, 0.75);
          border: 1px solid #e2e8f0;
          padding: 10px 12px;
          border-radius: 14px;
        }

        .ios-btn-apple-green {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
        }

        .ios-btn-apple-glass {
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
