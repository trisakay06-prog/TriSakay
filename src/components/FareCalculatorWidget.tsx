import React, { useState } from 'react';
import { calculateFare, INITIAL_GONZAGA_BARANGAYS } from '../services/fareCalculator';
import { Calculator, Tag } from 'lucide-react';
import { store } from '../services/store';

export const FareCalculatorWidget: React.FC = () => {
  const [pickup, setPickup] = useState(INITIAL_GONZAGA_BARANGAYS.find(b => b === 'Pateng') || INITIAL_GONZAGA_BARANGAYS[0]);
  const [destination, setDestination] = useState(INITIAL_GONZAGA_BARANGAYS.find(b => b === 'Smart') || INITIAL_GONZAGA_BARANGAYS[1]);
  const [discountType, setDiscountType] = useState<'regular' | 'senior_student_pwd'>('regular');
  const [passengersCount, setPassengersCount] = useState(1);

  const state = store.getState();
  const fareResult = calculateFare(
    pickup,
    destination,
    discountType,
    state.fares,
    state.settings.fuelSurgeMultiplier,
    passengersCount
  );

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px', background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#fef08a', padding: '8px', borderRadius: '10px', color: '#854d0e' }}>
          <Calculator size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>
            Gonzaga Fare Matrix Estimator
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Auto-calculated standard and temporary rates per LGU matrix
          </p>
        </div>
      </div>

      <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
            Pickup Barangay
          </label>
          <select
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {INITIAL_GONZAGA_BARANGAYS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>
            Destination Barangay
          </label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            {INITIAL_GONZAGA_BARANGAYS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Passenger Type / Discount Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
          Passenger Type Rate
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setDiscountType('regular')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: discountType === 'regular' ? '2px solid #16a34a' : '1px solid #cbd5e1',
              background: discountType === 'regular' ? '#f0fdf4' : '#ffffff',
              color: discountType === 'regular' ? '#15803d' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Regular Passenger
          </button>

          <button
            type="button"
            onClick={() => setDiscountType('senior_student_pwd')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: discountType === 'senior_student_pwd' ? '2px solid #eab308' : '1px solid #cbd5e1',
              background: discountType === 'senior_student_pwd' ? '#fefce8' : '#ffffff',
              color: discountType === 'senior_student_pwd' ? '#854d0e' : '#64748b',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Tag size={14} /> Senior / Student / PWD
          </button>
        </div>
      </div>

      {/* Passenger Count Selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>
            Number of Passengers
          </label>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
            {passengersCount} {passengersCount > 1 ? 'Passengers' : 'Passenger'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setPassengersCount(num)}
              style={{
                padding: '8px 0',
                borderRadius: '8px',
                border: passengersCount === num ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: passengersCount === num ? '#f0fdf4' : '#ffffff',
                color: passengersCount === num ? '#15803d' : '#64748b',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* RESULT DISPLAY */}
      <div style={{
        background: 'linear-gradient(135deg, #052e16 0%, #15803d 100%)',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fef08a' }}>
            {fareResult.routeName}
          </span>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Estimated Standard Fare
          </div>
          {passengersCount > 1 && !fareResult.isSpecialArrangement && (
            <div style={{ fontSize: '0.75rem', color: '#bbf7d0', marginTop: '2px', fontWeight: 600 }}>
              ₱{fareResult.perPassengerFare} × {passengersCount} passengers
            </div>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fef08a' }}>
            ₱{fareResult.finalFare}
          </span>
          <span style={{ fontSize: '0.75rem', display: 'block', opacity: 0.8 }}>
            {passengersCount > 1 && !fareResult.isSpecialArrangement ? `Total for ${passengersCount} pax` : '/ per seat passenger'}
          </span>
        </div>
      </div>
    </div>
  );
};
