// src/api/chatService.js
import apiClient from './apiClient';
import socketService from './socketService';

export const startConversation = async (recipientId) => {
  try {
    console.log('Starting conversation with recipient:', recipientId);
    const response = await apiClient.post('/chat/conversations', { // Remove /api prefix
      recipientId
    });
    
    console.log('Start conversation response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to start conversation');
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error starting conversation:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Chat service not available. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid request');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
};

export const getConversations = async () => {
  try {
    const response = await apiClient.get('/chat/conversations'); // Remove /api prefix
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch conversations');
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error fetching conversations:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Chat service not available. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
};

export const getMessages = async (conversationId) => {
  try {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`); // Remove /api prefix
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch messages');
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error fetching messages:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Conversation not found or you do not have access.');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
};

export const sendMessage = async (conversationId, content) => {
  try {
    // Send via HTTP API
    const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { // Remove /api prefix
      content
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to send message');
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error sending message via HTTP:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 404) {
      throw new Error('Conversation not found or you do not have access.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid request');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
};

export const sendMessageViaSocket = async (conversationId, content) => {
  try {
    await socketService.sendMessage(conversationId, content);
  } catch (error) {
    console.error("Error sending message via socket:", error.message);
    throw error;
  }
};

export const initializeSocket = async () => {
  try {
    return await socketService.connect();
  } catch (error) {
    console.error("Error initializing socket:", error.message);
    throw error;
  }
};

export const joinConversation = (conversationId) => {
  socketService.joinConversation(conversationId);
};

export const leaveConversation = (conversationId) => {
  socketService.leaveConversation(conversationId);
};

export const onNewMessage = (callback) => {
  socketService.onNewMessage(callback);
};

export const offNewMessage = (callback) => {
  socketService.offNewMessage(callback);
};

export const disconnectSocket = () => {
  socketService.disconnect();
};