import apiClient from './apiClient';
import parseApiError from '../utils/parseApiError';
import { Platform } from 'react-native';

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlaij1gcp/image/upload";
const UPLOAD_PRESET = "rn_unsigned";

/**
 * Uploads an image to Cloudinary using fetch API
 * @param {object} image - The image object from react-native-image-picker
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImageToCloudinary = async (image) => {
  console.log('📤 [Cloudinary] Attempting to upload image:', image);
  
  if (!image || !image.uri) {
    const error = new Error('Invalid image file provided for upload.');
    console.error('❌ [Cloudinary] Error:', error.message);
    throw error;
  }

  // Create FormData
  const formData = new FormData();
  
  // Handle different image formats
  let uri = image.uri;
  
  // Fix for Android file:// URI
  if (Platform.OS === 'android' && uri.startsWith('file://')) {
    uri = uri.replace('file://', '');
  }
  
  // Get file type and name
  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];
  const fileName = image.fileName || `upload-${Date.now()}.${fileType}`;
  
  // Add file to FormData with proper type
  formData.append('file', {
    uri: uri,
    type: image.type || `image/${fileType}`,
    name: fileName,
  });
  
  // Add upload preset
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('resource_type', 'auto');
  
  // Add timestamp to prevent caching issues
  formData.append('timestamp', Date.now().toString());

  console.log('📤 [Cloudinary] FormData prepared, starting upload...');
  console.log('📤 [Cloudinary] File info:', { uri, type: image.type || `image/${fileType}`, name: fileName });

  try {
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60 seconds

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type header when using FormData, it will be set automatically with boundary
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📤 [Cloudinary] Response status:', response.status);
    
    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Cloudinary] Error response:', errorText);
      
      try {
        // Try to parse as JSON first
        const errorData = JSON.parse(errorText);
        const errorMessage = errorData.error?.message || errorData.message || `Cloudinary returned status: ${response.status}`;
        throw new Error(errorMessage);
      } catch (parseError) {
        // If not JSON, use the text directly
        throw new Error(`Cloudinary error: ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('📤 [Cloudinary] Response data:', data);

    if (!data.secure_url) {
      const error = new Error('No secure URL returned from Cloudinary');
      console.error('❌ [Cloudinary] Error:', error.message);
      throw error;
    }

    console.log('✅ [Cloudinary] Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('❌ [Cloudinary] Upload error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please try again.');
    }
    
    // Re-throw the original error with more context
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Alternative upload method using XMLHttpRequest for better compatibility
 * @param {object} image - The image object from react-native-image-picker
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
const uploadImageToCloudinaryXHR = async (image) => {
  console.log('📤 [Cloudinary XHR] Attempting to upload image:', image);
  
  return new Promise((resolve, reject) => {
    if (!image || !image.uri) {
      reject(new Error('Invalid image file provided for upload.'));
      return;
    }

    // Handle different image formats
    let uri = image.uri;
    
    // Fix for Android file:// URI
    if (Platform.OS === 'android' && uri.startsWith('file://')) {
      uri = uri.replace('file://', '');
    }
    
    // Get file type and name
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = image.fileName || `upload-${Date.now()}.${fileType}`;
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: image.type || `image/${fileType}`,
      name: fileName,
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('resource_type', 'auto');
    formData.append('timestamp', Date.now().toString());

    console.log('📤 [Cloudinary XHR] FormData prepared, starting upload...');

    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    
    // Set timeout
    xhr.timeout = 60000; // 60 seconds
    
    // Handle response
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ [Cloudinary XHR] Upload successful:', response.secure_url);
            resolve(response.secure_url);
          } catch (parseError) {
            console.error('❌ [Cloudinary XHR] Error parsing response:', parseError);
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          console.error('❌ [Cloudinary XHR] Error status:', xhr.status, xhr.responseText);
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            const errorMessage = errorResponse.error?.message || errorResponse.message || `Upload failed with status ${xhr.status}`;
            reject(new Error(errorMessage));
          } catch (parseError) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      }
    };
    
    // Handle errors
    xhr.onerror = () => {
      console.error('❌ [Cloudinary XHR] Network error');
      reject(new Error('Network error during upload'));
    };
    
    // Handle timeout
    xhr.ontimeout = () => {
      console.error('❌ [Cloudinary XHR] Upload timeout');
      reject(new Error('Upload timed out. Please try again.'));
    };
    
    // Open and send request
    xhr.open('POST', CLOUDINARY_URL);
    xhr.send(formData);
  });
};

/**
 * @description Saves a new diet/meal entry to the backend.
 * @param {object} dietData - The diet form data from the component.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const saveDietEntry = async (dietData) => {
  try {
    console.log('[DietService] Saving diet entry:', dietData);
    
    // Validate required fields
    if (!dietData.mealName || !dietData.calories) {
      throw new Error('Meal name and calories are required');
    }
    
    // Transform the data to match backend expectations
    const transformedData = {
      mealName: dietData.mealName.trim(),
      mealType: dietData.mealType || 'breakfast',
      calories: parseInt(dietData.calories) || 0,
      protein: parseInt(dietData.protein) || 0,
      carbs: parseInt(dietData.carbs) || 0,
      fats: parseInt(dietData.fats) || 0,
      fiber: parseInt(dietData.fiber) || null,
      sugar: parseInt(dietData.sugar) || null,
      photoUrl: dietData.photoUrl || null,
      notes: dietData.notes || '',
    };

    console.log('[DietService] Transformed data:', transformedData);
    
    const response = await apiClient.post('/diet/logs', transformedData);
    
    console.log('[DietService] API response:', response.data);
    
    return {
      success: true,
      message: 'Diet entry saved successfully!',
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error('[DietService] Error saving diet entry:', error);
    const errorMessage = parseApiError(error);
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

// Attach the upload functions to the saveDietEntry object for easy access
saveDietEntry.uploadImageToCloudinary = uploadImageToCloudinary;
saveDietEntry.uploadImageToCloudinaryXHR = uploadImageToCloudinaryXHR;

/**
 * @description Fetches diet logs for a specific date.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const getDietLogsByDate = async (date) => {
  try {
    console.log('[DietService] Fetching diet logs for date:', date);
    
    const response = await apiClient.get(`/diet/logs/date/${date}`);
    
    console.log('[DietService] Raw response:', response.data);
    
    return {
      success: true,
      message: 'Diet logs fetched successfully.',
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error('[DietService] Error fetching diet logs:', error);
    const errorMessage = parseApiError(error);
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * @description Updates an existing diet log entry.
 * @param {string} logId - The ID of the log to update.
 * @param {object} updateData - The data to update.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const updateDietLog = async (logId, updateData) => {
  try {
    console.log('[DietService] Updating diet log:', logId, updateData);
    
    const response = await apiClient.put(`/diet/logs/${logId}`, updateData);
    
    console.log('[DietService] Raw response:', response.data);
    
    return {
      success: true,
      message: 'Diet log updated successfully!',
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error('[DietService] Error updating diet log:', error);
    const errorMessage = parseApiError(error);
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};

/**
 * @description Deletes a diet log entry.
 * @param {string} logId - The ID of the log to delete.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const deleteDietLog = async (logId) => {
  try {
    console.log('[DietService] Deleting diet log:', logId);
    
    await apiClient.delete(`/diet/logs/${logId}`);
    
    return {
      success: true,
      message: 'Diet log deleted successfully!',
      data: null,
    };
  } catch (error) {
    console.error('[DietService] Error deleting diet log:', error);
    const errorMessage = parseApiError(error);
    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
};