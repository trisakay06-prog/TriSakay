/**
 * Cloudinary Image Upload Service for TriSakay
 * Handles direct unsigned uploads to Cloudinary with automatic optimization
 * and graceful fallback for local previews / offline usage.
 */

// Default Cloudinary configuration (can be overridden via .env)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id?: string;
  format?: string;
  width?: number;
  height?: number;
}

/**
 * Checks if custom Cloudinary credentials have been provided in environment
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME &&
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME !== 'demo' &&
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );
};

/**
 * Uploads an image file to Cloudinary using unsigned upload preset.
 * If upload fails or if using local demo fallback, provides data URL.
 */
export const uploadImageToCloudinary = async (
  file: File | Blob,
  folder: string = 'trisakay/profiles'
): Promise<string> => {
  // Validate file type
  if (file instanceof File && !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, WebP).');
  }

  // Validate file size (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image size exceeds 8MB limit. Please choose a smaller photo.');
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET;

  // Try direct Cloudinary unsigned upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data: CloudinaryUploadResponse = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Cloudinary upload returned non-200, falling back to local storage URL:', errorData);
    }
  } catch (error) {
    console.warn('Cloudinary upload network error, falling back to local storage URL:', error);
  }

  // Fallback: Convert file to Base64 Data URL so user can still see and use their photo seamlessly
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generates an optimized Cloudinary delivery URL with face detection cropping
 */
export const getOptimizedAvatarUrl = (url?: string, size: number = 200): string => {
  if (!url) return '';
  
  // If it's a Cloudinary URL, inject smart face cropping and quality optimization
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const transformation = `w_${size},h_${size},c_fill,g_face,q_auto,f_auto`;
    return url.replace('/upload/', `/upload/${transformation}/`);
  }

  return url;
};
