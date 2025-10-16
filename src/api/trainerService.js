// src/api/trainerService.js
import apiClient from './apiClient';
import * as chatService from './chatService';
import socketService from './socketService';

export const browseTrainers = async () => {
  try {
    const response = await apiClient.get('/trainers/browse'); // Remove /api prefix
    return response.data.data;
  } catch (error) {
    console.error("Error fetching trainers:", error.response?.data || error.message);
    throw error;
  }
};

export const getTrainerById = async (userId) => {
    try {
        const response = await apiClient.get(`/trainers/profile/${userId}`); // Remove /api prefix
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching trainer profile for user ID: ${userId}`, error.response?.data || error.message);
        throw error;
    }
};

export const startConversationWithTrainer = async (trainerId) => {
  try {
    console.log('Starting conversation with trainer ID:', trainerId);
    return await chatService.startConversation(trainerId);
  } catch (error) {
    console.error("Error starting conversation with trainer:", error.response?.data || error.message);
    throw error;
  }
};

export const getTrainerMessages = async (conversationId) => {
  try {
    return await chatService.getMessages(conversationId);
  } catch (error) {
    console.error("Error fetching trainer messages:", error.response?.data || error.message);
    throw error;
  }
};

export const sendMessageToTrainer = async (conversationId, content) => {
  try {
    return await chatService.sendMessage(conversationId, content);
  } catch (error) {
    console.error("Error sending message to trainer:", error.response?.data || error.message);
    throw error;
  }
};

export const sendMessageViaSocket = async (conversationId, content) => {
  try {
    return await socketService.sendMessage(conversationId, content);
  } catch (error) {
    console.error("Error sending message via socket:", error.message);
    throw error;
  }
};

export const initializeTrainerChat = async (token, conversationId, onNewMessage) => {
  try {
    await socketService.connect();
    socketService.joinConversation(conversationId);
    socketService.onNewMessage(onNewMessage);
  } catch (error) {
    console.error("Error initializing trainer chat:", error.message);
    throw error;
  }
};

export const endTrainerChat = (conversationId) => {
  try {
    socketService.leaveConversation(conversationId);
    socketService.offNewMessage();
    // Don't disconnect the socket here as it might be used by other conversations
  } catch (error) {
    console.error("Error ending trainer chat:", error.message);
  }
};