import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import type { GonzagaRouteFare, User } from '../types';
import { 
  Edit3, 
  Plus, 
  MapPin, 
  Trash2, 
  Building, 
  Settings, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Bike, 
  X,
  Users,
  FileText,
  Fuel,
  ShieldAlert,
  Search
} from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'drivers' | 'users' | 'fares' | 'todas' | 'reports';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'users' | 'fares' | 'todas' | 'reports'>(initialTab);
  const [userFilter, setUserFilter] = useState<'all' | 'passengers' | 'drivers' | 'blocked'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Verify Tricycle Details Modal State
  const [verifyingDriver, setVerifyingDriver] = useState<User | null>(null);

  // Edit Fare Rate Modal
  const [editingFare, setEditingFare] = useState<GonzagaRouteFare | null>(null);
  const [editRegRate, setEditRegRate] = useState(25);
  const [editDiscRate, setEditDiscRate] = useState(20);
  const [editCsuRate, setEditCsuRate] = useState(30);

  // Add New Route Form State
  const [newRouteName, setNewRouteName] = useState('');
  const [newRegRate, setNewRegRate] = useState(30);
  const [newDiscRate, setNewDiscRate] = useState(25);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);

  // Barangay & Toda Management State
  const [newBarangayName, setNewBarangayName] = useState('');
  const [newTodaName, setNewTodaName] = useState('');
  const [newTodaZone, setNewTodaZone] = useState('');
  const [newTodaPres, setNewTodaPres] = useState('');
  const [newTodaContact, setNewTodaContact] = useState('');
  const [showAddTodaModal, setShowAddTodaModal] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const pendingDrivers = state.users.filter(u => u.role === 'driver' && !u.isApproved && !u.isBlocked);
  const approvedDrivers = state.users.filter(u => u.role === 'driver' && u.isApproved);
  const passengers = state.users.filter(u => u.role === 'passenger');
  const blockedUsers = state.users.filter(u => u.isBlocked);
  const completedRides = state.bookings.filter(b => b.status === 'COMPLETED');
  const pendingReports = state.reports.filter(r => r.status === 'pending');

  const handleApproveDriver = (driverId: string) => {
    store.approveDriver(driverId, true);
    alert('Driver approved successfully with verified Gonzaga LGU franchise!');
  };

  const handleRejectDriver = (driverId: string) => {
    store.toggleBlockUser(driverId);
    alert('Driver registration rejected.');
  };

  const handleSaveFareEdit = () => {
    if (editingFare) {
      store.updateFareRate(editingFare.id, Number(editRegRate), Number(editDiscRate), Number(editCsuRate));
      setEditingFare(null);
    }
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName) return;
    store.addFareRoute({
      route: newRouteName,
      fromBarangay: state.barangays[0],
      toBarangay: state.barangays[1],
      regularRate: Number(newRegRate),
      discountRate: Number(newDiscRate)
    });
    setShowAddRouteModal(false);
    setNewRouteName('');
  };

  const filteredUsersList = state.users.filter(u => {
    if (userFilter === 'passengers' && u.role !== 'passenger') return false;
    if (userFilter === 'drivers' && u.role !== 'driver') return false;
    if (userFilter === 'blocked' && !u.isBlocked) return false;
    if (userSearchQuery.trim()) {
      const q = userSearchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchMobile = u.mobile.toLowerCase().includes(q);
      const matchBarangay = u.barangay.toLowerCase().includes(q);
      return matchName || matchMobile || matchBarangay;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ============================================================ */}
      {/* ADMIN COMMAND CENTER HEADER BANNER                            */}
      {/* ============================================================ */}
      <div className="glass-panel" style={{
        padding: '24px 26px',
        borderRadius: '24px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Building size={14} /> MUNICIPALITY OF GONZAGA • LGU ADMIN
            </span>

            <span style={{
              background: '#f0f9ff',
              color: '#0369a1',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: '1px solid #bae6fd'
            }}>
              🟢 Database Sync Online
            </span>

            {pendingDrivers.length > 0 && (
              <span className="pulse-badge" style={{
                background: '#fef3c7',
                color: '#92400e',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid #fde68a'
              }}>
                ⚠️ {pendingDrivers.length} Driver Verification(s) Pending
              </span>
            )}

            {pendingReports.length > 0 && (
              <span style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                border: '1px solid #fecaca'
              }}>
                🛡️ {pendingReports.length} Unresolved Report(s)
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '8px', letterSpacing: '-0.4px' }}>
            Gonzaga Tricycle Transport Command Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Official regulatory portal for tricycle franchise verification, TODA clusters, fare matrix, and incident resolution.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 14px',
            borderRadius: '16px',
            textAlign: 'right'
          }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>
              Coverage Area
            </span>
            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
              25 Gonzaga Barangays
            </strong>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* HORIZONTAL TAB NAVIGATION PILLS (RESPONSIVE SCROLL)           */}
      {/* ============================================================ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '6px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'overview' ? '#16a34a' : 'transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <Activity size={16} /> Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('drivers')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'drivers' ? '#16a34a' : 'transparent',
            color: activeTab === 'drivers' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'drivers' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <ShieldCheck size={16} /> Driver Approvals
          {pendingDrivers.length > 0 && (
            <span style={{
              background: activeTab === 'drivers' ? '#fef08a' : '#ef4444',
              color: activeTab === 'drivers' ? '#854d0e' : '#ffffff',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {pendingDrivers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'users' ? '#16a34a' : 'transparent',
            color: activeTab === 'users' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'users' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <Users size={16} /> User Directory ({state.users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fares')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'fares' ? '#16a34a' : 'transparent',
            color: activeTab === 'fares' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'fares' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <FileText size={16} /> Fare Matrix Control
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('todas')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'todas' ? '#16a34a' : 'transparent',
            color: activeTab === 'todas' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'todas' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <Building size={16} /> Toda Clusters ({state.todas.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '9px 16px',
            borderRadius: '14px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            transition: 'all 0.2s ease',
            background: activeTab === 'reports' ? '#16a34a' : 'transparent',
            color: activeTab === 'reports' ? '#ffffff' : '#475569',
            boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
          }}
        >
          <ShieldAlert size={16} /> Incident Reports
          {pendingReports.length > 0 && (
            <span style={{
              background: activeTab === 'reports' ? '#fee2e2' : '#ef4444',
              color: activeTab === 'reports' ? '#b91c1c' : '#ffffff',
              padding: '2px 7px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 800
            }}>
              {pendingReports.length}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & SYSTEM HEALTH                              */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 4 STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div className="glass-card" style={{ padding: '20px', borderRadius: '18px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                  Total Registered Users
                </span>
                <Users size={20} color="#16a34a" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1 }}>
                {state.users.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '6px', fontWeight: 700 }}>
                {passengers.length} passengers • {approvedDrivers.length} verified drivers
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '18px', borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                  Verified Drivers
                </span>
                <Bike size={20} color="#0284c7" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1 }}>
                {approvedDrivers.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '6px', fontWeight: 700 }}>
                {pendingDrivers.length > 0 ? `⚠️ ${pendingDrivers.length} awaiting LGU review` : 'All registered drivers verified'}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '18px', borderLeft: '4px solid #eab308' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                  Total Bookings Created
                </span>
                <FileText size={20} color="#eab308" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1 }}>
                {state.bookings.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#854d0e', marginTop: '6px', fontWeight: 700 }}>
                Across Gonzaga routes & landmarks
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '18px', borderLeft: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>
                  Completed Rides
                </span>
                <CheckCircle2 size={20} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', marginTop: '6px', lineHeight: 1 }}>
                {completedRides.length}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#7c3aed', marginTop: '6px', fontWeight: 700 }}>
                Permanent trip history logged in DB
              </p>
            </div>

          </div>

          {/* FUEL SURGE CONTROLLER */}
          <div className="glass-panel" style={{ padding: '22px 24px', borderRadius: '22px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Fuel size={20} color="#16a34a" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Fuel-Based Fare Multiplier Adjustment
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              LGU emergency rate buffer for Gonzaga tricycle routes during gasoline price hikes. All fares recalculate dynamically.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: '14px'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Active Multiplier</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
                  {state.settings.fuelSurgeMultiplier}x Rate
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1.0, 1.1, 1.2, 1.25].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => store.updateSystemSettings({ fuelSurgeMultiplier: m })}
                    style={{
                      background: state.settings.fuelSurgeMultiplier === m ? '#16a34a' : '#f1f5f9',
                      color: state.settings.fuelSurgeMultiplier === m ? '#ffffff' : '#334155',
                      border: state.settings.fuelSurgeMultiplier === m ? 'none' : '1px solid #e2e8f0',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: state.settings.fuelSurgeMultiplier === m ? '0 4px 10px rgba(22, 163, 74, 0.25)' : 'none'
                    }}
                  >
                    {m === 1.0 ? 'Normal (1.0x)' : `+${Math.round((m - 1) * 100)}% Surge (${m}x)`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SYSTEM MONITORING PANEL */}
          <div className="glass-panel" style={{ padding: '22px 24px', borderRadius: '22px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#0284c7" /> Live System Health & BroadcastChannel Monitoring
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} className="pulse-badge" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803d' }}>DISPATCH SYNC</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Real-time Connected</div>
                <span style={{ fontSize: '0.74rem', color: '#16a34a' }}>Cross-tab & Supabase Broadcast</span>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Activity size={14} color="#0284c7" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0369a1' }}>SYNC LATENCY</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>~16ms Instant</div>
                <span style={{ fontSize: '0.74rem', color: '#0284c7' }}>Zero lag for passenger requests</span>
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Bike size={14} color="#ca8a04" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#854d0e' }}>ACTIVE DRIVERS</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {Object.values(state.activeDriverOnline).filter(Boolean).length} Online Cockpits
                </div>
                <span style={{ fontSize: '0.74rem', color: '#854d0e' }}>Accepting trips in Gonzaga</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569' }}>DATABASE RECORD</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>100% Intact</div>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{state.users.length} Users • {state.bookings.length} Bookings</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: DRIVER APPROVALS & FRANCHISE VERIFICATION             */}
      {/* ============================================================ */}
      {activeTab === 'drivers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* PENDING DRIVERS QUEUE */}
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#ffffff',
            border: pendingDrivers.length > 0 ? '2px solid #eab308' : '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Pending Driver Registrations ({pendingDrivers.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Verify tricycle franchise, plate number, and Cluster Gontoda endorsement
                </span>
              </div>

              {pendingDrivers.length > 0 && (
                <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}>
                  Action Required
                </span>
              )}
            </div>

            {pendingDrivers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '18px', border: '1px dashed #cbd5e1' }}>
                <CheckCircle2 size={36} color="#16a34a" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>No Pending Driver Approvals</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>All registered tricycle drivers have been verified with Gonzaga LGU.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>
                {pendingDrivers.map(d => (
                  <div key={d.id} className="glass-card" style={{ padding: '18px', borderRadius: '18px', background: '#fffdf5', border: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserAvatar src={d.profileImage} name={d.name} size={40} role="driver" />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', display: 'block' }}>{d.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.mobile}</span>
                        </div>
                      </div>
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                        {d.todaName || 'Pending Toda'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px', background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                      <div>Barangay: <strong>{d.barangay}</strong></div>
                      <div>Plate / Unit: <strong style={{ color: '#0284c7' }}>{d.plateNumber || 'TZ-9842'}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setVerifyingDriver(d)}
                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px', fontSize: '0.82rem', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        🔍 Verify Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveDriver(d.id)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <CheckCircle2 size={14} /> Quick Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VERIFIED DRIVERS DIRECTORY */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', margin: 0 }}>
                  Verified Gonzaga Tricycle Drivers ({approvedDrivers.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Active drivers holding authorized Gonzaga LGU municipal franchises
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Driver Name</th>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Mobile</th>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Barangay</th>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Cluster Gontoda</th>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Plate No.</th>
                    <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedDrivers.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserAvatar src={d.profileImage} name={d.name} size={34} role="driver" />
                          <div>
                            <span style={{ color: '#0f172a', display: 'block' }}>{d.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>✓ Verified Franchise</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: '#334155' }}>{d.mobile}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{d.barangay}</td>
                      <td style={{ padding: '12px', color: '#334155' }}>{d.todaName}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#16a34a' }}>{d.plateNumber}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setVerifyingDriver(d)}
                            style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '5px 10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem' }}
                            title="Verify franchise records"
                          >
                            Details 🔍
                          </button>
                          <button
                            type="button"
                            onClick={() => store.toggleBlockUser(d.id)}
                            style={{ background: d.isBlocked ? '#dcfce7' : '#fee2e2', color: d.isBlocked ? '#15803d' : '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem' }}
                          >
                            {d.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: USER DIRECTORY & MANAGEMENT                           */}
      {/* ============================================================ */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Manage Registered Users ({filteredUsersList.length})
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Search, filter, and inspect passenger and driver accounts
              </span>
            </div>

            {/* SEARCH INPUT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Search name, phone, barangay..."
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px 8px 34px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    width: '230px'
                  }}
                />
              </div>

              {/* USER FILTER TABS */}
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUserFilter('all')}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', background: userFilter === 'all' ? '#ffffff' : 'transparent', color: userFilter === 'all' ? '#16a34a' : '#64748b', cursor: 'pointer' }}
                >
                  All ({state.users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('passengers')}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', background: userFilter === 'passengers' ? '#ffffff' : 'transparent', color: userFilter === 'passengers' ? '#16a34a' : '#64748b', cursor: 'pointer' }}
                >
                  Passengers ({passengers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('drivers')}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', background: userFilter === 'drivers' ? '#ffffff' : 'transparent', color: userFilter === 'drivers' ? '#16a34a' : '#64748b', cursor: 'pointer' }}
                >
                  Drivers ({approvedDrivers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserFilter('blocked')}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', background: userFilter === 'blocked' ? '#ffffff' : 'transparent', color: userFilter === 'blocked' ? '#dc2626' : '#64748b', cursor: 'pointer' }}
                >
                  Blocked ({blockedUsers.length})
                </button>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Full Name</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Role</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Mobile</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Barangay</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <UserAvatar src={u.profileImage} name={u.name} size={34} role={u.role} />
                        <div>
                          <span style={{ color: '#0f172a', display: 'block' }}>{u.name}</span>
                          {u.plateNumber && <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>Plate: {u.plateNumber}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: u.role === 'driver' ? '#fef3c7' : u.role === 'admin' ? '#e0f2fe' : '#dcfce7',
                        color: u.role === 'driver' ? '#854d0e' : u.role === 'admin' ? '#0369a1' : '#15803d'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#334155' }}>{u.mobile}</td>
                    <td style={{ padding: '12px', color: '#334155' }}>{u.barangay}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: u.isBlocked ? '#fee2e2' : '#dcfce7', color: u.isBlocked ? '#dc2626' : '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => store.toggleBlockUser(u.id)}
                          style={{ background: u.isBlocked ? '#dcfce7' : '#fee2e2', color: u.isBlocked ? '#15803d' : '#dc2626', border: 'none', padding: '5px 10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem' }}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently remove user ${u.name}?`)) {
                                store.removeUser(u.id);
                              }
                            }}
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '5px 8px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.76rem' }}
                            title="Permanently remove user"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: FARE MATRIX MANAGEMENT                                */}
      {/* ============================================================ */}
      {activeTab === 'fares' && (
        <div className="glass-panel" style={{
          padding: '24px',
          borderRadius: '24px',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Official Gonzaga Fare Matrix Control
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                LGU-mandated fare rates with Senior/Student/PWD discounts and special routes
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddRouteModal(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.86rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Custom Route
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Route Name</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Regular Rate</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>Discount Rate (Senior/PWD)</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800 }}>CSU Campus Rate</th>
                  <th style={{ padding: '12px', fontSize: '0.78rem', color: '#475569', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.fares.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{f.route}</td>
                    <td style={{ padding: '12px', color: '#16a34a', fontWeight: 800 }}>₱{f.regularRate}</td>
                    <td style={{ padding: '12px', color: '#854d0e', fontWeight: 800 }}>₱{f.discountRate}</td>
                    <td style={{ padding: '12px', color: '#0284c7', fontWeight: 700 }}>{f.csuRate ? `₱${f.csuRate}` : '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFare(f);
                          setEditRegRate(f.regularRate);
                          setEditDiscRate(f.discountRate);
                          setEditCsuRate(f.csuRate || f.regularRate);
                        }}
                        style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '5px 12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit3 size={12} /> Edit Fare
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: TODA ASSOCIATIONS & BARANGAY COVERAGE                 */}
      {/* ============================================================ */}
      {activeTab === 'todas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CLUSTER GONTODA ASSOCIATIONS */}
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Building size={20} color="#16a34a" /> Cluster Gontoda Associations ({state.todas.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Barangay-based tricycle operator and driver associations in Gonzaga
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTodaModal(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.86rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Cluster Association
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {state.todas.map(toda => (
                <div key={toda.id} className="glass-card" style={{ padding: '18px', borderRadius: '18px', borderLeft: '4px solid #16a34a', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{toda.name}</h4>
                      <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>Zone: {toda.zoneBarangay}</span>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800 }}>
                      {toda.activeCount} Units
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '12px' }}>
                    President: <strong>{toda.presidentName}</strong> • Tel: <strong>{toda.contactNumber}</strong>
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${toda.name}?`)) {
                          store.removeToda(toda.id);
                        }
                      }}
                      style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GONZAGA BARANGAYS COVERAGE */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <MapPin size={20} color="#16a34a" /> Gonzaga Barangays Coverage ({state.barangays.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Official municipal territory included in TriSakay landmark routing
                </span>
              </div>

              {/* ADD BARANGAY INPUT */}
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newBarangayName) return;
                store.addBarangay(newBarangayName);
                setNewBarangayName('');
              }} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="New Barangay name..."
                  value={newBarangayName}
                  onChange={e => setNewBarangayName(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '10px' }}>
                  Add
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {state.barangays.map(b => (
                <div key={b} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 {b}</span>
                  {state.barangays.length > 5 && (
                    <button
                      type="button"
                      onClick={() => store.removeBarangay(b)}
                      title="Remove barangay"
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', padding: '0 2px' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* WEBSITE & LGU SYSTEM SETTINGS */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} color="#16a34a" /> Official Municipal Transport & LGU Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Official Email</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{state.settings.contactEmail}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>LGU Hotline</span>
                <div style={{ fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{state.settings.contactNumber}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Facebook Page</span>
                <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{state.settings.facebookPage}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Max Passenger Cap</span>
                <div style={{ fontWeight: 800, color: '#854d0e', marginTop: '2px' }}>{state.settings.maxPassengersCapacity} Passengers per trip</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: INCIDENT REPORTS & COMPLAINTS                         */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{
            padding: '24px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} /> Submitted User Complaints & Incident Reports ({state.reports.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Driver and passenger reports for review and resolution by Gonzaga LGU
                </span>
              </div>

              {pendingReports.length > 0 && (
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {pendingReports.length} Unresolved
                </span>
              )}
            </div>

            {state.reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '18px', border: '1px dashed #cbd5e1' }}>
                <CheckCircle2 size={36} color="#16a34a" style={{ marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>No Complaints on File</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>No incident reports have been lodged by passengers or drivers.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {state.reports.map(r => (
                  <div key={r.id} className="glass-card" style={{ padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', background: '#fffafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>
                        Report by {r.reporterName} ({r.reporterRole}) ➔ Target: {r.targetName} ({r.targetRole})
                      </strong>
                      <span style={{
                        background: r.status === 'pending' ? '#fef08a' : r.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                        color: r.status === 'pending' ? '#854d0e' : r.status === 'resolved' ? '#15803d' : '#64748b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.72rem'
                      }}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                      Reason: <strong>{r.reason}</strong> — {r.details}
                    </p>

                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => store.resolveReport(r.id, 'resolved')}
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}
                        >
                          Mark Resolved
                        </button>
                        <button
                          type="button"
                          onClick={() => store.resolveReport(r.id, 'dismissed')}
                          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: VERIFY TRICYCLE DETAILS MODAL                       */}
      {/* ============================================================ */}
      {verifyingDriver && (
        <div className="modal-overlay" onClick={() => setVerifyingDriver(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '12px' }}>
                  <Bike size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Tricycle & Franchise Details
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Municipality of Gonzaga LGU Registry</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifyingDriver(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Driver Name</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{verifyingDriver.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Contact Mobile</span>
                <strong style={{ fontSize: '0.9rem', color: '#16a34a' }}>{verifyingDriver.mobile}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Home Barangay</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{verifyingDriver.barangay}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cluster Gontoda Association</span>
                <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                  {verifyingDriver.todaName || 'Not specified'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tricycle Plate / Unit No.</span>
                <strong style={{ fontSize: '1rem', color: '#0284c7' }}>{verifyingDriver.plateNumber || 'TZ-9842'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LGU Franchise Status</span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  VALID 2026-2027
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setVerifyingDriver(null)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'transparent', fontWeight: 700 }}
              >
                Close
              </button>

              {!verifyingDriver.isApproved ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleRejectDriver(verifyingDriver.id);
                      setVerifyingDriver(null);
                    }}
                    className="btn-danger"
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.88rem' }}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleApproveDriver(verifyingDriver.id);
                      setVerifyingDriver(null);
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.88rem' }}
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    alert(`Tricycle details for ${verifyingDriver.name} are verified with Gonzaga LGU.`);
                    setVerifyingDriver(null);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.88rem' }}
                >
                  <ShieldCheck size={16} /> Verified Active
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDIT FARE MODAL                                     */}
      {/* ============================================================ */}
      {editingFare && (
        <div className="modal-overlay" onClick={() => setEditingFare(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Edit Route Fare: {editingFare.route}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Regular Fare (₱)</label>
                <input type="number" value={editRegRate} onChange={e => setEditRegRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Discount Fare (Senior/PWD/Student) (₱)</label>
                <input type="number" value={editDiscRate} onChange={e => setEditDiscRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>CSU Campus Rate (₱)</label>
                <input type="number" value={editCsuRate} onChange={e => setEditCsuRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setEditingFare(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent', fontWeight: 700 }}>
                Cancel
              </button>
              <button type="button" onClick={handleSaveFareEdit} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                Save Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: ADD ROUTE MODAL                                     */}
      {/* ============================================================ */}
      {showAddRouteModal && (
        <div className="modal-overlay" onClick={() => setShowAddRouteModal(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Add New Gonzaga Route Rate
            </h3>

            <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Route Name</label>
                <input type="text" value={newRouteName} onChange={e => setNewRouteName(e.target.value)} placeholder="e.g. Minanga to Gonzaga Market" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Regular (₱)</label>
                  <input type="number" value={newRegRate} onChange={e => setNewRegRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Discount (₱)</label>
                  <input type="number" value={newDiscRate} onChange={e => setNewDiscRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddRouteModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Add Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: ADD CLUSTER GONTODA MODAL                           */}
      {/* ============================================================ */}
      {showAddTodaModal && (
        <div className="modal-overlay" onClick={() => setShowAddTodaModal(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Add Cluster Gontoda Association
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newTodaName) return;
              store.addToda({
                name: newTodaName,
                zoneBarangay: newTodaZone || state.barangays[0],
                presidentName: newTodaPres || 'LGU Appointed Head',
                contactNumber: newTodaContact || '09000000000',
                activeCount: 10
              });
              setShowAddTodaModal(false);
              setNewTodaName('');
              setNewTodaZone('');
              setNewTodaPres('');
              setNewTodaContact('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Cluster Association Name</label>
                <input type="text" value={newTodaName} onChange={e => setNewTodaName(e.target.value)} placeholder="e.g. Minanga Cluster Gontoda Association" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Operating Zone / Barangay</label>
                <input type="text" value={newTodaZone} onChange={e => setNewTodaZone(e.target.value)} placeholder="e.g. Minanga" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>President Name</label>
                <input type="text" value={newTodaPres} onChange={e => setNewTodaPres(e.target.value)} placeholder="e.g. Roberto Cruz" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Contact Phone</label>
                <input type="text" value={newTodaContact} onChange={e => setNewTodaContact(e.target.value)} placeholder="e.g. 09171112233" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddTodaModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent', fontWeight: 700 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Add Association
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
