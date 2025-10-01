
import apiClient from './apiClient';
import parseApiError from '../utils/parseApiError';

/**
 * @description Saves a new diet/meal entry to the backend.
 * @param {object} dietData - The diet form data from the component.
 * @returns {Promise<{success: boolean, message: string, data: object|null}>} A structured response.
 */
export const saveDietEntry = async (dietData) => {
  try {
    console.log('[DietService] Saving diet entry:', dietData);
    
    // Transform the data to match backend expectations
    const transformedData = {
      mealName: dietData.mealName,
      mealType: dietData.mealType || 'breakfast',
      calories: parseInt(dietData.calories) || 0,
      protein: parseInt(dietData.protein) || 0,
      carbs: parseInt(dietData.carbs) || 0,
      fats: parseInt(dietData.fats) || 0,
      fiber: parseInt(dietData.fiber) || 0,
      sugar: parseInt(dietData.sugar) || 0,
      notes: dietData.notes || '',
    };

    console.log('[DietService] Transformed data:', transformedData);
    
    const response = await apiClient.post('/diet/logs', transformedData);
    
    console.log('[DietService] Raw response:', response.data);
    
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