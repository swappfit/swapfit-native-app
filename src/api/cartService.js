import apiClient from './apiClient';

export const fetchCart = async () => {
  try {
    console.log('[API] Fetching cart...');
    const response = await apiClient.get('/cart');
    console.log('[API] Cart fetch successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("[API] Error fetching cart:", error.response?.data || error.message);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    console.log('[API] Adding to cart:', { productId, quantity });
    const response = await apiClient.post('/cart', { productId, quantity });
    console.log('[API] Add to cart successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("[API] Error adding to cart:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    console.log('[API] Updating cart item:', { cartItemId, quantity });
    const response = await apiClient.patch(`/cart/${cartItemId}`, { quantity });
    console.log('[API] Cart item update successful:', response.data);
    return response.data.data;
  } catch (error) {
    console.error("[API] Error updating cart item:", error.response?.data || error.message);
    throw error;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    console.log('[API] Removing from cart:', cartItemId);
    await apiClient.delete(`/cart/${cartItemId}`);
    console.log('[API] Cart item removal successful');
  } catch (error) {
    console.error("[API] Error removing from cart:", error.response?.data || error.message);
    throw error;
  }
};