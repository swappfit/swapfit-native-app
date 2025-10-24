// src/api/gymService.js
import apiClient from './apiClient';
import parseApiError from '../utils/parseApiError';
export const discoverGyms = async (params) => {
  try {
    console.log('[GymService] Discovering gyms with params:', params);
    
    const response = await apiClient.get('/gyms/discover', { params });
    console.log('[GymService] Raw API response:', response);
    console.log('[GymService] Response data:', response.data);
    
    // Handle empty or null response data
    if (!response.data) {
      console.log('[GymService] Empty response data, returning no gyms');
      return {
        success: true,
        message: 'No gyms found in your area',
        data: []
      };
    }
    
    // If response.data is already in the correct format, return it
    if (response.data.success !== undefined) {
      console.log('[GymService] Response already in correct format');
      return response.data;
    }
    
    // If response.data is an array, wrap it in the expected format
    if (Array.isArray(response.data)) {
      console.log('[GymService] Response is array, wrapping in format');
      return {
        success: true,
        message: response.data.length > 0 ? 'Gyms found' : 'No gyms found in your area',
        data: response.data
      };
    }
    
    // If response.data is a string, treat it as a message
    if (typeof response.data === 'string') {
      console.log('[GymService] Response is string, treating as message');
      return {
        success: true,
        message: response.data,
        data: []
      };
    }
    
    // If response.data is an object but doesn't have success property, try to extract data
    if (typeof response.data === 'object' && response.data !== null) {
      console.log('[GymService] Response is object, extracting data');
      // Check if it has a data property
      if (response.data.data !== undefined) {
        return {
          success: true,
          message: response.data.message || 'Gyms found',
          data: Array.isArray(response.data.data) ? response.data.data : []
        };
      }
      // If it has gyms property
      if (response.data.gyms !== undefined) {
        return {
          success: true,
          message: response.data.message || 'Gyms found',
          data: Array.isArray(response.data.gyms) ? response.data.gyms : []
        };
      }
      // If it's an object with gym-like properties, treat as single gym
      if (response.data.id || response.data.name) {
        return {
          success: true,
          message: 'Gym found',
          data: [response.data]
        };
      }
    }
    
    // Default case - return as success with empty data
    console.log('[GymService] Default case, returning success with empty data');
    return {
      success: true,
      message: 'No gyms found in your area',
      data: []
    };
  } catch (error) {
    console.error('[GymService] Discover gyms error:', error);
    console.error('[GymService] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout - please try again',
        data: []
      };
    } else if (!error.response) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        data: []
      };
    } else if (error.response.status === 404) {
      return {
        success: true,
        message: 'No gyms found in your area',
        data: []
      };
    } else if (error.response.status === 200) {
      // If we get 200 but still have an error, try to extract data
      if (error.response.data) {
        return {
          success: true,
          message: 'Gyms found',
          data: Array.isArray(error.response.data) ? error.response.data : []
        };
      }
    } else {
      return {
        success: false,
        message: parseApiError(error),
        data: []
      };
    }
  }
};

// src/services/gymService.js (add this function)
export const getGymsByPlanIds = async (planIds) => {
  if (!planIds || planIds.length === 0) {
    return [];
  }

  const gymPlans = await prisma.gymPlan.findMany({
    where: {
      id: { in: planIds }
    },
    include: {
      gym: true
    }
  });

  // Extract unique gyms from the plans
  const uniqueGyms = gymPlans.reduce((acc, plan) => {
    if (plan.gym && !acc.find(gym => gym.id === plan.gym.id)) {
      acc.push(plan.gym);
    }
    return acc;
  }, []);

  return uniqueGyms;
};
/**
 * @description Fetches the details of a single gym by its ID.
 * @param {string} gymId - The ID of the gym.
 * @returns {Promise<object>} The backend response with the gym details.
 */
export const getGymDetails = async (gymId) => {
  try {
    console.log('[GymService] Getting gym details for:', gymId);
    
    const response = await apiClient.get(`/gyms/profile/${gymId}`);
    console.log('[GymService] Gym details response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('[GymService] Get gym details error:', error);
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Request timeout - please try again',
        data: null
      };
    } else if (!error.response) {
      return {
        success: false,
        message: 'Network error - please check your connection',
        data: null
      };
    } else {
      return {
        success: false,
        message: parseApiError(error),
        data: null
      };
    }
  }
};
/**
 * Attempts to check the logged-in user into a specific gym.
 * @param {string} gymId - The ID of the gym to check into.
 * @returns {Promise<object>} The backend response.
 */
export const checkInToGym = async (gymId) => {
  // We send the gymId in the body, as expected by the backend controller.
  const response = await apiClient.post('/gyms/check-in', { gymId });
  return response.data;
};