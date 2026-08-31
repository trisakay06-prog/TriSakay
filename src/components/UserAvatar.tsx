import React, { useState } from 'react';
import { getOptimizedAvatarUrl } from '../services/cloudinary';

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  role?: 'passenger' | 'driver' | 'admin' | string;
  showRoleBadge?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 40,
  className = '',
  style = {},
  role,
  showRoleBadge = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Gradient colors based on role
  const getGradient = () => {
    switch (role) {
      case 'admin':
        return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
      case 'driver':
        return 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
      case 'passenger':
      default:
        return 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
    }
  };

  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const optimizedSrc = src ? getOptimizedAvatarUrl(src, size * 2) : '';

  return (
    <div
      className={`user-avatar-wrapper ${className}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
        ...style
      }}
    >
      {optimizedSrc && !imageError ? (
        <img
          src={optimizedSrc}
          alt={name}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: getGradient(),
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: `${Math.max(12, Math.round(size * 0.42))}px`,
            userSelect: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        >
          {initial}
        </div>
      )}

      {showRoleBadge && (
        <span
          title={role}
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: `${Math.max(12, Math.round(size * 0.32))}px`,
            height: `${Math.max(12, Math.round(size * 0.32))}px`,
            borderRadius: '50%',
            background: role === 'admin' ? '#2563eb' : role === 'driver' ? '#ea580c' : '#16a34a',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(8, Math.round(size * 0.2))}px`,
            color: '#ffffff'
          }}
        >
          {role === 'driver' ? '🛺' : role === 'admin' ? '🛡️' : '👤'}
        </span>
      )}
    </div>
  );
};
