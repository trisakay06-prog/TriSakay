import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface IOSBackButtonProps {
  onClick: () => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const IOSBackButton: React.FC<IOSBackButtonProps> = ({
  onClick,
  title,
  className = '',
  style
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px', ...style }}>
      <button
        onClick={onClick}
        className={`ios-back-btn ${className}`}
        aria-label="Back"
        title="Back"
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          color: '#0f172a',
          padding: 0,
          flexShrink: 0
        }}
      >
        <ChevronLeft size={22} strokeWidth={2.6} style={{ marginLeft: '-1px' }} />
      </button>

      {title && (
        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          letterSpacing: '-0.3px'
        }}>
          {title}
        </h2>
      )}
    </div>
  );
};
