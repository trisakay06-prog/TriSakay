import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import type { AppStoreData } from '../services/store';
import { FileText, Search, Info } from 'lucide-react';

export const FareMatrixView: React.FC = () => {
  const [state, setState] = useState<AppStoreData>(store.getState());
  const [search, setSearch] = useState('');

  useEffect(() => {
    return store.subscribe(() => setState(store.getState()));
  }, []);

  const filteredFares = state.fares.filter(f => 
    f.route.toLowerCase().includes(search.toLowerCase()) ||
    f.fromBarangay.toLowerCase().includes(search.toLowerCase()) ||
    f.toBarangay.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER CARD */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: '#fef08a', color: '#854d0e', padding: '10px', borderRadius: '14px' }}>
            <FileText size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>
              Official Gonzaga Fare Matrix
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              LGU Ordinance Temporary & Standard Tricycle Rates for Municipality of Gonzaga, Cagayan
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Barangay (e.g. Pateng, Baua, Calayan, Poblacion, CSU)..."
            style={{
              width: '100%',
              padding: '12px 14px 12px 44px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* SPECIAL NOTICE */}
      <div style={{
        background: '#fef9c3',
        border: '1px solid #fef08a',
        padding: '16px',
        borderRadius: '16px',
        color: '#854d0e',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <Info size={24} style={{ flexShrink: 0 }} />
        <div>
          <strong>Passenger Rights Notice:</strong> Senior Citizens, Students with valid IDs, and Persons with Disabilities (PWDs) are entitled to the discounted rates shown below as mandated by national law and local ordinance.
        </div>
      </div>

      {/* FARE TABLE */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '24px', background: '#ffffff' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '14px' }}>Route Coverage</th>
                <th style={{ padding: '14px' }}>Regular Rate</th>
                <th style={{ padding: '14px' }}>Senior / Student / PWD</th>
                <th style={{ padding: '14px' }}>To CSU Gonzaga</th>
                <th style={{ padding: '14px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredFares.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>
                    {f.route}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: '#16a34a' }}>
                    ₱{Math.round(f.regularRate * state.settings.fuelSurgeMultiplier)}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 800, color: '#854d0e' }}>
                    ₱{Math.round(f.discountRate * state.settings.fuelSurgeMultiplier)}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#1d4ed8' }}>
                    {f.csuRate ? `₱${Math.round(f.csuRate * state.settings.fuelSurgeMultiplier)}` : '-'}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {f.isSpecialArrangement ? (
                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        Special Arrangement
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        Standard Rate
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
