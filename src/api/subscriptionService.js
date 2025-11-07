// src/api/subscriptionService.js
import apiClient from './apiClient';

/**
 * Creates a Chargebee checkout session for a specific plan.
 * @param {string} planId - The ID of the GymPlan, TrainerPlan, or MultiGymTier from our database.
 * @param {string} planType - Must be 'GYM', 'TRAINER', 'MULTI_GYM', or 'MULTI_GYM_BROWSE'.
 * @returns {Promise<object>} The backend response, containing the checkoutUrl.
 */
export const createCheckoutSession = async (planId, planType) => {
  const response = await apiClient.post('/subscriptions/create-checkout-session', {
    planId,
    planType,
  });
  return response.data;
};

/**
 * Creates a Chargebee customer portal session for the logged-in user to manage subscriptions.
 * @returns {Promise<object>} The backend response, containing the portalUrl.
 */
export const createPortalSession = async () => {
  const response = await apiClient.post('/subscriptions/portal-session');
  return response.data;
};

/**
 * Gets all available multi-gym tiers (Silver, Gold, Platinum)
 * @returns {Promise<object>} The backend response, containing the multi-gym tiers
 */
export const getMultiGymTiers = async () => {
  const response = await apiClient.get('/admin/multi-gym-tiers');
  return response.data;
};

/**
 * Gets user's profile including subscriptions and accessible gyms
 * @returns {Promise<object>} The backend response, containing user profile data
 */
export const getUserProfile = async () => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

/**
 * Gets user's check-in history
 * @returns {Promise<object>} The backend response, containing check-in data
 */
export const getUserCheckIns = async () => {
  const response = await apiClient.get('/users/check-ins');
  return response.data;
};

/**
 * Checks in a user to a gym
 * @param {string} gymId - The ID of the gym to check in to
 * @returns {Promise<object>} The backend response
 */
export const checkInToGym = async (gymId) => {
  const response = await apiClient.post('/gyms/check-in', { gymId });
  return response.data;
};

/**
 * Checks out a user from a gym
 * @param {string} checkInId - The ID of the check-in record
 * @returns {Promise<object>} The backend response
 */
export const checkOutFromGym = async (checkInId) => {
  const response = await apiClient.patch(`/gyms/check-out/${checkInId}`);
  return response.data;
};