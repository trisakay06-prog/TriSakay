import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import type { GonzagaRouteFare, User } from '../types';
import { Edit3, Plus, ChevronRight, MapPin, Trash2, Building, Settings, Activity, ShieldCheck, CheckCircle2, Bike, X } from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'overview' | 'drivers' | 'users' | 'fares' | 'todas' | 'reports';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'overview' }) => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'users' | 'fares' | 'todas' | 'reports'>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  const [userFilter, setUserFilter] = useState<'all' | 'passengers' | 'drivers' | 'blocked'>('all');

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

  const pendingDrivers = state.users.filter(u => u.role === 'driver' && !u.isApproved);
  const approvedDrivers = state.users.filter(u => u.role === 'driver' && u.isApproved);
  const passengers = state.users.filter(u => u.role === 'passenger');
  const blockedUsers = state.users.filter(u => u.isBlocked);
  const completedRides = state.bookings.filter(b => b.status === 'COMPLETED');

  const handleApproveDriver = (driverId: string) => {
    store.approveDriver(driverId, true);
    alert('Driver approved successfully!');
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
    if (userFilter === 'passengers') return u.role === 'passenger';
    if (userFilter === 'drivers') return u.role === 'driver';
    if (userFilter === 'blocked') return u.isBlocked;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ADMIN HEADER BANNER */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: '20px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
              GONZAGA LGU CONTROL CENTER
            </span>
            {pendingDrivers.length > 0 && (
              <span className="pulse-badge" style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                {pendingDrivers.length} DRIVER APPROVALS PENDING
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            Municipality of Gonzaga Tricycle Admin
          </h2>
        </div>

        {/* ADMIN NAV TABS (Matching Wireframe Steps 2, 3, 4, 5, 6) */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            📊 Overview
          </button>
          <button onClick={() => setActiveTab('drivers')} className={activeTab === 'drivers' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            🛺 Driver Approvals ({pendingDrivers.length > 0 ? `⚠️ ${pendingDrivers.length}` : approvedDrivers.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            👥 Manage Users ({state.users.length})
          </button>
          <button onClick={() => setActiveTab('fares')} className={activeTab === 'fares' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            📋 Fare Matrix
          </button>
          <button onClick={() => setActiveTab('todas')} className={activeTab === 'todas' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            🏛️ Barangays & TODAs ({state.todas.length})
          </button>
          <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'btn-primary' : 'btn-outline'} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            🛡️ Reports ({state.reports.length})
          </button>
        </div>
      </div>

      {/* WIREFRAME STEP 2: DASHBOARD OVERVIEW (4 STAT CARDS) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #16a34a' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Users</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {state.users.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #0284c7' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Verified Drivers</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {approvedDrivers.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #eab308' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Total Bookings Created</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#854d0e', marginTop: '4px' }}>
                {state.bookings.length}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #7c3aed' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completed Rides</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                {completedRides.length}
              </div>
            </div>

          </div>

          {/* FUEL SURGE CONTROLLER */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '8px' }}>
              ⛽ Fuel-Based Fare Multiplier Adjustment
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Adjust temporary fuel surcharge multiplier for Gonzaga tricycle routes during price surges.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#854d0e' }}>
                Current Multiplier: {state.settings.fuelSurgeMultiplier}x
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                {[1.0, 1.1, 1.2, 1.25].map(m => (
                  <button
                    key={m}
                    onClick={() => store.updateSystemSettings({ fuelSurgeMultiplier: m })}
                    style={{
                      background: state.settings.fuelSurgeMultiplier === m ? '#16a34a' : '#f1f5f9',
                      color: state.settings.fuelSurgeMultiplier === m ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {m === 1.0 ? 'Normal (1.0x)' : `+${Math.round((m - 1) * 100)}% Surge (${m}x)`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIREFRAME STEP 4: DRIVER APPROVALS */}
      {activeTab === 'drivers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PENDING DRIVERS QUEUE */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff', border: '2px solid #eab308' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#854d0e', marginBottom: '16px' }}>
              ⏳ Pending Driver Registrations ({pendingDrivers.length})
            </h3>

            {pendingDrivers.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No pending driver registrations right now.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {pendingDrivers.map(d => (
                  <div key={d.id} className="glass-card" style={{ padding: '18px', borderRadius: '16px', background: '#fefce8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{d.name}</span>
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {d.todaName}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                      Barangay: <strong>{d.barangay}</strong> • Tricycle No: <strong>{d.plateNumber}</strong> • Mobile: <strong>{d.mobile}</strong>
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <button
                        onClick={() => setVerifyingDriver(d)}
                        style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px', fontSize: '0.8rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        🔍 Verify Details
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleRejectDriver(d.id)}
                        className="btn-danger"
                        style={{ flex: 1, padding: '8px', fontSize: '0.85rem', borderRadius: '8px' }}
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => handleApproveDriver(d.id)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '8px', fontSize: '0.85rem', borderRadius: '8px' }}
                      >
                        APPROVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VERIFIED DRIVERS LIST */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginBottom: '16px' }}>
              Verified Gonzaga Tricycle Drivers ({approvedDrivers.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Driver Name</th>
                    <th style={{ padding: '12px' }}>Mobile</th>
                    <th style={{ padding: '12px' }}>Barangay</th>
                    <th style={{ padding: '12px' }}>TODA</th>
                    <th style={{ padding: '12px' }}>Plate Number</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedDrivers.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{d.name}</td>
                      <td style={{ padding: '12px' }}>{d.mobile}</td>
                      <td style={{ padding: '12px' }}>{d.barangay}</td>
                      <td style={{ padding: '12px' }}>{d.todaName}</td>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#16a34a' }}>{d.plateNumber}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setVerifyingDriver(d)}
                            style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                            title="Verify tricycle franchise and TODA records"
                          >
                            Details 🔍
                          </button>
                          <button
                            onClick={() => store.toggleBlockUser(d.id)}
                            style={{ background: d.isBlocked ? '#dcfce7' : '#fee2e2', color: d.isBlocked ? '#15803d' : '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
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

      {/* WIREFRAME STEP 3: MANAGE USERS */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
              Manage Registered Users
            </h3>

            {/* USER FILTER TABS (Matching Wireframe Step 3) */}
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button onClick={() => setUserFilter('all')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', background: userFilter === 'all' ? '#ffffff' : 'transparent', color: userFilter === 'all' ? '#16a34a' : '#64748b', cursor: 'pointer' }}>
                All ({state.users.length})
              </button>
              <button onClick={() => setUserFilter('passengers')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', background: userFilter === 'passengers' ? '#ffffff' : 'transparent', color: userFilter === 'passengers' ? '#16a34a' : '#64748b', cursor: 'pointer' }}>
                Passengers ({passengers.length})
              </button>
              <button onClick={() => setUserFilter('drivers')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', background: userFilter === 'drivers' ? '#ffffff' : 'transparent', color: userFilter === 'drivers' ? '#16a34a' : '#64748b', cursor: 'pointer' }}>
                Drivers ({approvedDrivers.length})
              </button>
              <button onClick={() => setUserFilter('blocked')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', background: userFilter === 'blocked' ? '#ffffff' : 'transparent', color: userFilter === 'blocked' ? '#dc2626' : '#64748b', cursor: 'pointer' }}>
                Blocked ({blockedUsers.length})
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Full Name</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Mobile</th>
                  <th style={{ padding: '12px' }}>Barangay</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '0.75rem', color: u.role === 'driver' ? '#eab308' : u.role === 'admin' ? '#3b82f6' : '#16a34a' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{u.mobile}</td>
                    <td style={{ padding: '12px' }}>{u.barangay}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: u.isBlocked ? '#fee2e2' : '#dcfce7', color: u.isBlocked ? '#dc2626' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => store.toggleBlockUser(u.id)}
                          style={{ background: u.isBlocked ? '#dcfce7' : '#fee2e2', color: u.isBlocked ? '#15803d' : '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently remove user ${u.name}?`)) {
                                store.removeUser(u.id);
                              }
                            }}
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}
                            title="Permanently remove user"
                          >
                            <Trash2 size={12} />
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

      {/* WIREFRAME STEP 5: FARE MATRIX */}
      {activeTab === 'fares' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                Official Gonzaga Fare Matrix
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                LGU approved rates for Regular and Senior/Student/PWD discounts
              </p>
            </div>

            <button onClick={() => setShowAddRouteModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Custom Route
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Route Name</th>
                  <th style={{ padding: '12px' }}>Regular Rate</th>
                  <th style={{ padding: '12px' }}>Discount Rate (Senior/PWD/Student)</th>
                  <th style={{ padding: '12px' }}>CSU Campus Rate</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.fares.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{f.route}</td>
                    <td style={{ padding: '12px', color: '#16a34a', fontWeight: 800 }}>₱{f.regularRate}</td>
                    <td style={{ padding: '12px', color: '#854d0e', fontWeight: 800 }}>₱{f.discountRate}</td>
                    <td style={{ padding: '12px', color: '#0284c7' }}>{f.csuRate ? `₱${f.csuRate}` : '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => {
                          setEditingFare(f);
                          setEditRegRate(f.regularRate);
                          setEditDiscRate(f.discountRate);
                          setEditCsuRate(f.csuRate || f.regularRate);
                        }}
                        style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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

      {/* WIREFRAME STEP 6: REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>User Statistics</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>Active Registrations</div>
              </div>
              <ChevronRight color="#94a3b8" />
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Booking Reports</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{state.bookings.length} Total Logs</div>
              </div>
              <ChevronRight color="#94a3b8" />
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Completed Rides</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>{completedRides.length} Completed</div>
              </div>
              <ChevronRight color="#94a3b8" />
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Driver Performance</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>4.8 ★ Rating Avg</div>
              </div>
              <ChevronRight color="#94a3b8" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ef4444', marginBottom: '16px' }}>
              Submitted User Complaints & Incident Reports ({state.reports.length})
            </h3>

            {state.reports.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No user complaints submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {state.reports.map(r => (
                  <div key={r.id} className="glass-card" style={{ padding: '16px', borderRadius: '14px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem' }}>
                        Report by {r.reporterName} ({r.reporterRole}) ➔ Target: {r.targetName} ({r.targetRole})
                      </strong>
                      <span style={{ background: r.status === 'pending' ? '#fef08a' : '#dcfce7', color: r.status === 'pending' ? '#854d0e' : '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
                      Reason: <strong>{r.reason}</strong> — {r.details}
                    </p>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => store.resolveReport(r.id, 'resolved')} className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          Mark Resolved
                        </button>
                        <button onClick={() => store.resolveReport(r.id, 'dismissed')} style={{ background: '#f1f5f9', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
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

      {/* BARANGAYS & TODAS MANAGEMENT TAB */}
      {activeTab === 'todas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TODA ASSOCIATIONS MANAGEMENT */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={22} /> TODA Driver Associations ({state.todas.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Registered tricycle operators & drivers associations in Municipality of Gonzaga
                </p>
              </div>

              <button onClick={() => setShowAddTodaModal(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Plus size={16} /> Register New TODA
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {state.todas.map(toda => (
                <div key={toda.id} className="glass-card" style={{ padding: '18px', borderRadius: '16px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{toda.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700 }}>Zone: {toda.zoneBarangay}</span>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                      {toda.activeCount} Units
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                    President: <strong>{toda.presidentName}</strong> • Tel: <strong>{toda.contactNumber}</strong>
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${toda.name}?`)) {
                          store.removeToda(toda.id);
                        }
                      }}
                      style={{ background: 'transparent', border: '1px solid #fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Remove TODA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GONZAGA BARANGAYS COVERAGE */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={22} color="#16a34a" /> Gonzaga Barangays ({state.barangays.length})
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  All 25 official barangays & zones covered in the TriSakay booking network
                </p>
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
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                  Add
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {state.barangays.map(b => (
                <div key={b} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍 {b}</span>
                  {state.barangays.length > 5 && (
                    <button
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
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={22} color="#16a34a" /> Official Website & LGU Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Official Email</span>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{state.settings.contactEmail}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>LGU Hotline</span>
                <div style={{ fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{state.settings.contactNumber}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Facebook Page</span>
                <div style={{ fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{state.settings.facebookPage}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Max Passengers / Booking</span>
                <div style={{ fontWeight: 800, color: '#854d0e', marginTop: '2px' }}>{state.settings.maxPassengersCapacity} Passengers (Max 8)</div>
              </div>
            </div>
          </div>

          {/* SYSTEM MONITORING PANEL */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={22} color="#0284c7" /> Live System Monitoring & Network Health
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }} className="pulse-badge" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>DISPATCH GATEWAY</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Real-time Connected</div>
                <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>BroadcastChannel & Supabase Sync</span>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Activity size={14} color="#0284c7" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369a1' }}>SYNC LATENCY</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>~16ms Instant</div>
                <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Optimal Local Gonzaga Response</span>
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Bike size={14} color="#ca8a04" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#854d0e' }}>ACTIVE DRIVERS PING</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {Object.values(state.activeDriverOnline).filter(Boolean).length} Drivers Broadcasting
                </div>
                <span style={{ fontSize: '0.75rem', color: '#854d0e' }}>Ready for Instant Dispatch</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>DATABASE STATE</span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Synchronized 100%</div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{state.users.length} Users • {state.bookings.length} Bookings</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* EDIT FARE MODAL */}
      {editingFare && (
        <div className="modal-overlay" onClick={() => setEditingFare(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Edit Route Fare: {editingFare.route}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Regular Fare (₱)</label>
                <input type="number" value={editRegRate} onChange={e => setEditRegRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Discount Fare (Senior/PWD/Student) (₱)</label>
                <input type="number" value={editDiscRate} onChange={e => setEditDiscRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>CSU Campus Rate (₱)</label>
                <input type="number" value={editCsuRate} onChange={e => setEditCsuRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingFare(null)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={handleSaveFareEdit} className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                Save Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ROUTE MODAL */}
      {showAddRouteModal && (
        <div className="modal-overlay" onClick={() => setShowAddRouteModal(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Add New Gonzaga Route Rate
            </h3>

            <form onSubmit={handleAddRoute} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Route Name</label>
                <input type="text" value={newRouteName} onChange={e => setNewRouteName(e.target.value)} placeholder="e.g. Minanga to Gonzaga Market" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Regular (₱)</label>
                  <input type="number" value={newRegRate} onChange={e => setNewRegRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Discount (₱)</label>
                  <input type="number" value={newDiscRate} onChange={e => setNewDiscRate(Number(e.target.value))} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddRouteModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent' }}>
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

      {/* ADD TODA MODAL */}
      {showAddTodaModal && (
        <div className="modal-overlay" onClick={() => setShowAddTodaModal(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '420px', padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Register New TODA Association
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>TODA Name</label>
                <input type="text" value={newTodaName} onChange={e => setNewTodaName(e.target.value)} placeholder="e.g. MINANGATODA" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Operating Zone / Barangay</label>
                <input type="text" value={newTodaZone} onChange={e => setNewTodaZone(e.target.value)} placeholder="e.g. Minanga" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>President Name</label>
                <input type="text" value={newTodaPres} onChange={e => setNewTodaPres(e.target.value)} placeholder="e.g. Roberto Cruz" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Contact Phone</label>
                <input type="text" value={newTodaContact} onChange={e => setNewTodaContact(e.target.value)} placeholder="e.g. 09171112233" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddTodaModal(false)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'transparent' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  Register TODA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY TRICYCLE DETAILS MODAL */}
      {verifyingDriver && (
        <div className="modal-overlay" onClick={() => setVerifyingDriver(null)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '12px' }}>
                  <Bike size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    Tricycle & Franchise Details
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Municipality of Gonzaga LGU Registry</span>
                </div>
              </div>
              <button onClick={() => setVerifyingDriver(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
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
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TODA Association</span>
                <span style={{ background: '#fef08a', color: '#854d0e', padding: '2px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                  {verifyingDriver.todaName || 'GOTODA'}
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
                <button
                  type="button"
                  onClick={() => {
                    handleApproveDriver(verifyingDriver.id);
                    setVerifyingDriver(null);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                  <CheckCircle2 size={16} /> Approve Driver
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    alert(`Tricycle details for ${verifyingDriver.name} are verified with Gonzaga LGU.`);
                    setVerifyingDriver(null);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                  <ShieldCheck size={16} /> Verified Active
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
