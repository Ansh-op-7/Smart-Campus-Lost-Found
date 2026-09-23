import api from './api';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Service for uploading images to the backend.
 */
export const uploadService = {
  /**
   * Validate image file on client before uploading.
   * @param {File} file
   * @returns {{ valid: boolean, error?: string }}
   */
  validateImage(file) {
    if (!file) {
      return { valid: false, error: 'No file selected.' };
    }
    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: 'Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported.',
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit. Please choose a smaller image.',
      };
    }
    return { valid: true };
  },

  /**
   * Upload an item photo to POST /api/uploads/items.
   * @param {File} file
   * @param {Function} onProgress - optional progress callback (percentage)
   * @returns {Promise<{ filename: string, imageUrl: string, contentType: string, sizeBytes: number }>}
   */
  async uploadItemImage(file, onProgress) {
    const validation = this.validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/uploads/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },
};

export default uploadService;
