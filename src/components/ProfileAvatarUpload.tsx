import React, { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Cloud, Check } from 'lucide-react';
import { uploadImageToCloudinary, getOptimizedAvatarUrl, isCloudinaryConfigured } from '../services/cloudinary';

interface ProfileAvatarUploadProps {
  currentImageUrl?: string;
  name: string;
  role?: 'passenger' | 'driver' | 'admin' | string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  size?: number;
  label?: string;
}

export const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  currentImageUrl,
  name,
  role = 'passenger',
  onImageUploaded,
  onImageRemoved,
  size = 110,
  label = 'Profile Photo'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = (name || 'U').trim().charAt(0).toUpperCase();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsUploading(true);
    setUploadSuccess(false);

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const uploadedUrl = await uploadImageToCloudinary(file, `trisakay/${role}s`);
      setPreviewUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setErrorMsg('');
    if (onImageRemoved) {
      onImageRemoved();
    } else {
      onImageUploaded('');
    }
  };

  const displayUrl = previewUrl ? getOptimizedAvatarUrl(previewUrl, size * 2) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', alignSelf: 'flex-start' }}>
        {label}
      </label>

      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        {/* Avatar Circle */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: isUploading ? 'wait' : 'pointer',
            border: '3px solid #16a34a',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
            background: role === 'driver' 
              ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' 
              : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
          title="Click to change profile picture"
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: isUploading ? 0.4 : 1,
                transition: 'opacity 0.2s'
              }}
            />
          ) : (
            <span style={{ fontSize: `${Math.round(size * 0.42)}px`, fontWeight: 800, color: '#ffffff', userSelect: 'none' }}>
              {initial}
            </span>
          )}

          {/* Hover / Loading Overlay */}
          {isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Uploading</span>
            </div>
          )}
        </div>

        {/* Camera action badge */}
        <button
          type="button"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#16a34a',
            color: '#ffffff',
            border: '2.5px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease'
          }}
          title="Upload from device"
        >
          <Camera size={16} />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* Actions and Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#16a34a',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <Camera size={14} /> {previewUrl ? 'Change Photo' : 'Upload Photo'}
        </button>

        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#ef4444',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {/* Cloudinary Integration Status Pill */}
      <div style={{
        fontSize: '0.72rem',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: '#f8fafc',
        padding: '3px 8px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <Cloud size={12} color="#0284c7" />
        <span>Powered by <strong>Cloudinary</strong></span>
        {isCloudinaryConfigured() && <Check size={12} color="#16a34a" />}
      </div>

      {uploadSuccess && (
        <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
          ✓ Photo uploaded successfully!
        </span>
      )}

      {errorMsg && (
        <span style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, textAlign: 'center' }}>
          {errorMsg}
        </span>
      )}
    </div>
  );
};
