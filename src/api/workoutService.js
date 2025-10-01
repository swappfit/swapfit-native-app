import apiClient from './apiClient';

export const logWorkoutSession = async (sessionData) => {
  try {
    const response = await apiClient.post('/workouts/sessions', sessionData);
    return response.data.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data || new Error('Server error.');
  }
};

export const deleteWorkoutSession = async (sessionId) => {
  try {
    const response = await apiClient.delete(`/workouts/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data || new Error('Server error.');
  }
};

export const deleteExerciseFromSession = async (sessionId, exerciseId) => {
  try {
    const response = await apiClient.delete(`/workouts/sessions/${sessionId}/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error.response?.data || new Error('Server error.');
  }
};