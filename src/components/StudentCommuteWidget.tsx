import React, { useState } from 'react';
import { GraduationCap, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { INITIAL_GONZAGA_BARANGAYS } from '../services/fareCalculator';

interface StudentCommuteWidgetProps {
  onQuickBookCSU: (pickup: string, count: number) => void;
}

export const StudentCommuteWidget: React.FC<StudentCommuteWidgetProps> = ({ onQuickBookCSU }) => {
  const [pickup, setPickup] = useState(INITIAL_GONZAGA_BARANGAYS[1]); // Pateng
  const [studentCount, setStudentCount] = useState(1);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const handleBook = () => {
    onQuickBookCSU(pickup, studentCount);
    setBookedSuccess(true);
    setTimeout(() => setBookedSuccess(false), 3000);
  };

  return (
    <div className="ios-student-card">
      <div className="ios-student-header">
        <div className="ios-student-badge">
          <GraduationCap size={20} color="#007AFF" />
          <span>CSU GONZAGA STUDENT COMMUTE</span>
        </div>
        <span className="ios-discount-pill">
          <Sparkles size={12} /> 20% STUDENT DISCOUNT ACTIVE
        </span>
      </div>

      <div className="ios-student-body">
        <div>
          <h3 className="ios-student-title">
            Express Campus Ride to CSU Gonzaga 🎓
          </h3>
          <p className="ios-student-desc">
            Direct tricycle dispatch to Cagayan State University Gonzaga Campus with guaranteed student rate.
          </p>
        </div>

        <div className="ios-student-grid">
          <div>
            <label className="ios-label">Where are you departing from?</label>
            <select
              value={pickup}
              onChange={e => setPickup(e.target.value)}
              className="ios-select"
            >
              {INITIAL_GONZAGA_BARANGAYS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="ios-label">Classmates / Passengers</label>
            <div className="ios-segmented-control">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setStudentCount(num)}
                  className={`ios-segment-btn ${studentCount === num ? 'active' : ''}`}
                >
                  {num} {num === 1 ? 'Solo' : 'Students'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="ios-student-footer">
          <div className="ios-fare-preview">
            <span className="ios-fare-sub">CSU Student Rate</span>
            <span className="ios-fare-val">₱25 - ₱35 <small>/ seat</small></span>
          </div>

          <button
            onClick={handleBook}
            className="ios-btn-apple-action"
          >
            {bookedSuccess ? (
              <>
                <CheckCircle2 size={18} /> Request Sent to Drivers!
              </>
            ) : (
              <>
                1-Tap Ride to CSU <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .ios-student-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 22px;
          border: 1px solid rgba(0, 122, 255, 0.15);
          box-shadow: 0 10px 30px rgba(0, 122, 255, 0.08);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .ios-student-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 5px;
          background: linear-gradient(90deg, #007AFF 0%, #34C759 100%);
        }

        .ios-student-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ios-student-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F0F7FF;
          color: #007AFF;
          font-weight: 800;
          font-size: 0.78rem;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .ios-discount-pill {
          background: #E8F9ED;
          color: #34C759;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 4px 10px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ios-student-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1C1C1E;
          margin-bottom: 4px;
        }

        .ios-student-desc {
          font-size: 0.85rem;
          color: #8E8E93;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .ios-student-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        @media (max-width: 600px) {
          .ios-student-grid {
            grid-template-columns: 1fr;
          }
        }

        .ios-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #3A3A3C;
          margin-bottom: 6px;
        }

        .ios-select {
          width: 100%;
          padding: 12px 14px;
          background: #F2F2F7;
          border: 1px solid #E5E5EA;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1C1C1E;
          outline: none;
          min-height: 48px;
        }

        .ios-segmented-control {
          display: flex;
          background: #E5E5EA;
          padding: 3px;
          border-radius: 14px;
          gap: 2px;
        }

        .ios-segment-btn {
          flex: 1;
          border: none;
          background: transparent;
          color: #8E8E93;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 9px 4px;
          border-radius: 11px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ios-segment-btn.active {
          background: #FFFFFF;
          color: #007AFF;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }

        .ios-student-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid #F2F2F7;
          flex-wrap: wrap;
        }

        .ios-fare-preview {
          display: flex;
          flex-direction: column;
        }

        .ios-fare-sub {
          font-size: 0.75rem;
          color: #8E8E93;
          font-weight: 600;
        }

        .ios-fare-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: #34C759;
        }

        .ios-fare-val small {
          font-size: 0.75rem;
          color: #8E8E93;
          font-weight: 600;
        }

        .ios-btn-apple-action {
          background: linear-gradient(135deg, #007AFF 0%, #0056b3 100%);
          color: #ffffff;
          border: none;
          border-radius: 16px;
          padding: 13px 22px;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 18px rgba(0, 122, 255, 0.3);
          transition: all 0.2s ease;
        }

        .ios-btn-apple-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(0, 122, 255, 0.4);
        }

        .ios-btn-apple-action:active {
          transform: scale(0.97);
        }

        @media (max-width: 600px) {
          .ios-student-footer {
            flex-direction: column;
            align-items: stretch;
          }
          .ios-btn-apple-action {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
