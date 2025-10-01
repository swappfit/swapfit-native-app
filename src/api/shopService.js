// src/services/shopService.js
import apiClient from './apiClient'; // Make sure the path is correct

/**
 * @description Fetches all publicly available products from the backend.
 * @param {object} params - Optional parameters for pagination like { page, limit }.
 * @returns {Promise<object>} A promise that resolves to the API response, 
 *                            which includes the `data` array of products.
 */
export const fetchProducts = async (params) => {
  try {
    // The backend route is GET /api/products, which is handled by apiClient's baseURL.
    // We pass any pagination parameters as a query string.
    const response = await apiClient.get('/products', { params });
    
    // Based on your controller, the product list is in `response.data`.
    // The controller structure is { success: true, data: [...], pagination: {...} }
    return response.data; 
  } catch (error) {
    // The apiClient's interceptor already logs detailed errors.
    // We re-throw the error so the calling component can handle UI updates.
    console.error("❌ Error fetching products in shopService:", error.message);
    throw error;
  }
};