// src/api/subscriptionService.js
import apiClient from './apiClient';

/**
 * Creates a Chargebee checkout session for a specific plan.
 * @param {string} planId - The ID of the GymPlan or TrainerPlan from our database.
 * @param {string} planType - Must be 'GYM' or 'TRAINER'.
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