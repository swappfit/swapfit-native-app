import apiClient from './apiClient';

/**
 * @description Fetches a paginated list of all public trainer profiles.
 * @param {object} params - Optional query parameters like { page: 1, limit: 10 }.
 * @returns {Promise<object>} The API response data containing trainers, pagination info, etc.
 * @throws {Error} If the API request fails.
 */
export const browseTrainers = async () => {
  try {
    const response = await apiClient.get('/trainers/browse');
    return response.data.data;
  } catch (error) {
    console.error("Error fetching trainers:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * @description Fetches the detailed public profile of a single trainer.
 * @param {string} userId - The user ID of the trainer to fetch.
 * @returns {Promise<object>} The trainer profile data.
 * @throws {Error} If the API request fails.
 */
export const getTrainerById = async (userId) => {
    try {
        // ✅ FIXED: Corrected endpoint from '/trainer/profile' to '/trainers/profile' to match the backend route.
        const response = await apiClient.get(`/trainers/profile/${userId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching trainer profile for user ID: ${userId}`, error.response?.data || error.message);
        throw error;
    }
};