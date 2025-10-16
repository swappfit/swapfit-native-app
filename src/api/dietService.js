import apiClient from './apiClient';
import parseApiError from '../utils/parseApiError';
import { Platform } from 'react-native';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dlaij1gcp/image/upload';
const UPLOAD_PRESET = 'rn_unsigned';

// ✅ --- CLOUDINARY UPLOAD FUNCTION --- ✅
const uploadToCloudinary = async (image) => {
  console.log('📤 [Cloudinary] Attempting to upload image...');
  if (!image || !image.uri) {
    throw new Error('Invalid image file provided for upload.');
  }

  // Handle iOS file URI and ensure correct file type/name
  const uri = image.uri;
  const type = image.type || `image/${uri.split('.').pop()}`;
  const name = image.fileName || `photo_${Date.now()}.${uri.split('.').pop()}`;
  
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    type: type,
    name: name,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', 'dlaij1gcp');

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `Cloudinary returned a non-200 status: ${response.status}`;
      console.error('❌ [Cloudinary] Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ [Cloudinary] Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
<<<<<<< HEAD
    console.error('❌ [Cloudinary] Upload error:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please try again.');
    }
    
    // Re-throw the original error with more context
    throw new Error(`Image upload failed: ${error.message}`);
=======
    console.error('❌ [Cloudinary] A critical error occurred during upload:', error);
    throw error;
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
  }
};

/**
<<<<<<< HEAD
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
=======
 * @description Saves a new diet/meal entry to the backend with image upload.
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
 * @param {object} dietData - The diet form data from the component.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const saveDietEntry = async (dietData) => {
  try {
    console.log('[DietService] Saving diet entry:', dietData);
    
<<<<<<< HEAD
    // Validate required fields
    if (!dietData.mealName || !dietData.calories) {
      throw new Error('Meal name and calories are required');
=======
    let photoUrl = null;
    
    // Upload image to Cloudinary if provided
    if (dietData.photo) {
      try {
        photoUrl = await uploadToCloudinary(dietData.photo);
        console.log('[DietService] Image uploaded successfully:', photoUrl);
      } catch (uploadError) {
        console.warn('[DietService] Image upload failed:', uploadError.message);
        // Continue without the image, but log the warning
      }
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    }
    
    // Transform the data to match backend expectations
    const transformedData = {
<<<<<<< HEAD
      mealName: dietData.mealName.trim(),
=======
      mealName: dietData.mealName,
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
      mealType: dietData.mealType || 'breakfast',
      calories: parseInt(dietData.calories) || 0,
      protein: parseInt(dietData.protein) || 0,
      carbs: parseInt(dietData.carbs) || 0,
      fats: parseInt(dietData.fats) || 0,
<<<<<<< HEAD
      fiber: parseInt(dietData.fiber) || null,
      sugar: parseInt(dietData.sugar) || null,
      photoUrl: dietData.photoUrl || null,
      notes: dietData.notes || '',
=======
      fiber: parseInt(dietData.fiber) || 0,
      sugar: parseInt(dietData.sugar) || 0,
      notes: dietData.notes || '',
      photo: photoUrl, // Include the Cloudinary URL
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    };

    console.log('[DietService] Transformed data:', transformedData);
    
    const response = await apiClient.post('/diet/logs', transformedData);
    
<<<<<<< HEAD
    console.log('[DietService] API response:', response.data);
=======
    console.log('[DietService] Raw response:', response.data);
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    
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

<<<<<<< HEAD
// Attach the upload functions to the saveDietEntry object for easy access
saveDietEntry.uploadImageToCloudinary = uploadImageToCloudinary;
saveDietEntry.uploadImageToCloudinaryXHR = uploadImageToCloudinaryXHR;
=======
/**
 * @description Updates an existing diet log entry with optional image upload.
 * @param {string} logId - The ID of the log to update.
 * @param {object} updateData - The data to update.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const updateDietLog = async (logId, updateData) => {
  try {
    console.log('[DietService] Updating diet log:', logId, updateData);
    
    let photoUrl = updateData.photo;
    
    // If a new image is provided and it's a local URI (not already a URL), upload it
    if (updateData.photo && !updateData.photo.startsWith('http')) {
      try {
        photoUrl = await uploadToCloudinary(updateData.photo);
        console.log('[DietService] New image uploaded successfully:', photoUrl);
      } catch (uploadError) {
        console.warn('[DietService] New image upload failed:', uploadError.message);
        // Keep the existing photo if any
      }
    }
    
    // Prepare update data
    const transformedData = {
      ...updateData,
      photo: photoUrl,
    };
    
    // Remove undefined values
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });
    
    const response = await apiClient.put(`/diet/logs/${logId}`, transformedData);
    
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636

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
<<<<<<< HEAD
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
=======
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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