// src/components/TrainerDetailsModal.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as subscriptionService from '../api/subscriptionService';
import * as trainerService from '../api/trainerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatScreen } from './ChatScreen';
import { getToken } from '../api/apiClient';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

export const TrainerDetailsModal = ({ trainer, isVisible, isLoading, onClose, navigation }) => {
  // Use the auth context instead of props
  const { userProfile, isAuthenticated } = useAuth();
  
  // Conditional return MUST happen BEFORE any hooks are called.
  if (!trainer) {
    return null;
  }

  // Now, all hooks are called unconditionally on every render where the modal is visible.
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [token, setToken] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // The plans are derived from the trainer prop, which we know exists.
  const plans = Array.isArray(trainer.plans) ? trainer.plans : [];
  const gallery = Array.isArray(trainer.gallery) ? trainer.gallery : [];

  const isSubscribedToThisTrainer = useMemo(() => {
    if (!userProfile?.subscriptions || !plans) return false;
    const trainerPlanIds = new Set(plans.map(p => p.id));
    // Fix: Check against trainerPlanId instead of trainerId
    return userProfile.subscriptions.some(sub => sub.trainerPlanId && trainerPlanIds.has(sub.trainerPlanId));
  }, [userProfile?.subscriptions, plans]);

  // Get the authentication token
  useEffect(() => {
    const getTokenFromStorage = async () => {
      try {
        const userToken = await getToken(); // Use the getToken function from apiClient
        console.log('Token retrieved on component mount:', userToken ? 'Token found' : 'No token found');
        setToken(userToken);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };
    
    getTokenFromStorage();
  }, []);

  const handleSubscribePress = async (plan) => {
    setError('');
    setSubscribingPlanId(plan.id);
    try {
      const response = await subscriptionService.createCheckoutSession(plan.id, 'TRAINER');
      if (response.success && response.data.checkoutUrl) {
        await Linking.openURL(response.data.checkoutUrl);
        onClose();
      } else {
        throw new Error(response.message || "Could not initiate subscription.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError("Could not start subscription. Please try again later.");
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const handleChatPress = async () => {
    console.log('Chat button pressed. Current user state:', userProfile);
    console.log('Current token state:', token ? 'Token exists' : 'No token');
    console.log('Is authenticated:', isAuthenticated);

    // First, check if the user is authenticated
    if (!isAuthenticated || !userProfile || !userProfile.id) {
      console.error('User object is missing or incomplete. Cannot start chat.');
      Alert.alert(
        "Authentication Required", 
        "Please log in to start a conversation.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => navigation?.navigate('Login') }
        ]
      );
      return;
    }

    setIsCheckingAuth(true);
    
    try {
      // Check if user is authenticated by retrieving the token
      let userToken = token;
      
      // If token is not in state, try to get it from AsyncStorage
      if (!userToken) {
        userToken = await getToken(); // Use the getToken function from apiClient
        console.log('Retrieved token from AsyncStorage:', userToken ? 'Token found' : 'Token NOT found');
        setToken(userToken);
      }

      if (!userToken) {
        console.error('Authentication token not found in AsyncStorage.');
        Alert.alert(
          "Session Expired", 
          "Your session may have expired. Please log in again.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Log In", onPress: () => navigation?.navigate('Login') }
          ]
        );
        setIsCheckingAuth(false);
        return;
      }
      
      // If we have the user and the token, proceed with starting the conversation
      console.log('User is authenticated. Starting conversation with trainer:', trainer.user.id);
      
      try {
        const response = await trainerService.startConversationWithTrainer(trainer.user.id);
        console.log('Conversation started successfully:', response);
        setConversationId(response.id);
        setShowChat(true);
      } catch (err) {
        console.error("Error starting conversation:", err);
        // Check for specific authentication errors from the API
        if (err.response?.status === 401) {
          // Clear the invalid token
          await AsyncStorage.removeItem('accessToken');
          setToken(null);
          
          Alert.alert(
            "Session Expired", 
            "Your session has expired. Please log in again.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Log In", onPress: () => navigation?.navigate('Login') }
            ]
          );
        } else {
          const errorMessage = err.response?.data?.message || err.message || "Could not start conversation. Please try again.";
          Alert.alert("Error", errorMessage);
        }
      }
    } catch (err) {
      console.error("An unexpected error occurred in handleChatPress:", err);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleBackToDetails = () => {
    setShowChat(false);
  };

  const handleImagePress = (index) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImageIndex(null);
  };

  if (showChat) {
    return (
      <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.chatModalContainer}>
            <ChatScreen 
              trainer={trainer}
              user={userProfile}
              onBack={handleBackToDetails}
              onClose={onClose}
              conversationId={conversationId}
              token={token}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#001f3f" />
          </TouchableOpacity>
          <ScrollView>
            {isLoading ? (
              <ActivityIndicator style={{ marginVertical: 60, alignSelf: 'center' }} size="large" color="#FFC107" />
            ) : (
              <View style={styles.content}>
                <TouchableOpacity onPress={() => handleImagePress(0)}>
                  <Image 
                    source={{ 
                      uri: gallery.length > 0 
                        ? gallery[0] 
                        : 'https://via.placeholder.com/150' 
                    }} 
                    style={styles.avatar} 
                  />
                </TouchableOpacity>
                <Text style={styles.trainerName}>{trainer.user?.email.split('@')[0] || 'Trainer'}</Text>
                <Text style={styles.experience}>{trainer.experience || 0} years of experience</Text>
                <Text style={styles.bio}>{trainer.bio}</Text>

                {/* Gallery Section */}
                {gallery.length > 1 && (
                  <View style={styles.gallerySection}>
                    <Text style={styles.galleryTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {gallery.map((image, index) => (
                        <TouchableOpacity 
                          key={index}
                          onPress={() => handleImagePress(index)}
                        >
                          <Image 
                            source={{ uri: image }} 
                            style={styles.galleryImage}
                          />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Chat Button */}
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={handleChatPress}
                  disabled={isCheckingAuth}
                >
                  {isCheckingAuth ? (
                    <ActivityIndicator size="small" color="#001f3f" />
                  ) : (
                    <Icon name="chatbubble-ellipses-outline" size={20} color="#001f3f" />
                  )}
                  <Text style={styles.chatButtonText}>
                    {isCheckingAuth ? "Checking..." : "Chat with Trainer"}
                  </Text>
                </TouchableOpacity>

                {plans.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coaching Plans</Text>
                    {isSubscribedToThisTrainer ? (
                        <View style={styles.subscribedMessageContainer}>
                          <Icon name="checkmark-circle" size={24} color="#27ae60" />
                          <Text style={styles.subscribedMessageText}>You are subscribed to this trainer.</Text>
                        </View>
                    ) : (
                      plans.map(plan => (
                        <View key={plan.id} style={styles.planItem}>
                          <View>
                            <Text style={styles.planName}>{plan.name}</Text>
                            <Text style={styles.planDuration}>₹{plan.price} / {plan.duration}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.subscribeButton}
                            onPress={() => handleSubscribePress(plan)}
                            disabled={subscribingPlanId === plan.id}
                          >
                            {subscribingPlanId === plan.id ? 
                                <ActivityIndicator color="#001f3f" size="small" /> : 
                                <Text style={styles.subscribeButtonText}>Subscribe</Text>
                            }
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Image Viewer Modal */}
      <Modal visible={showImageViewer} transparent animationType="fade" onRequestClose={closeImageViewer}>
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerCloseButton} onPress={closeImageViewer}>
            <Icon name="close" size={30} color="#ffffff" />
          </TouchableOpacity>
          {selectedImageIndex !== null && (
            <Image 
              source={{ uri: gallery[selectedImageIndex] }} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          {gallery.length > 1 && (
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>
                {selectedImageIndex + 1} / {gallery.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    backgroundColor: '#001f3f', 
    width: '90%', 
    maxHeight: '85%', 
    borderRadius: 20, 
    paddingTop: 40, 
    paddingBottom: 20 
  },
  chatModalContainer: { 
    width: '95%', 
    height: '90%', 
    backgroundColor: '#001f3f', 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  closeButton: { 
    position: 'absolute', 
    top: 15, 
    right: 15, 
    zIndex: 10, 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    padding: 4, 
    borderRadius: 16 
  },
  content: { 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 3, 
    borderColor: '#FFC107' 
  },
  trainerName: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginTop: 15 
  },
  experience: { 
    fontSize: 16, 
    color: '#FFC107', 
    marginVertical: 5 
  },
  bio: { 
    fontSize: 14, 
    color: '#aaa', 
    textAlign: 'center', 
    marginVertical: 15, 
    lineHeight: 22 
  },
  gallerySection: { 
    width: '100%', 
    marginTop: 15,
    marginBottom: 10
  },
  galleryTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 8,
    alignSelf: 'flex-start'
  },
  galleryImage: { 
    width: 100, 
    height: 100, 
    borderRadius: 10, 
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FFC107'
  },
  chatButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFC107', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    marginTop: 10,
    marginBottom: 10,
    width: '100%'
  },
  chatButtonText: { 
    color: '#001f3f', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 8 
  },
  section: { 
    width: '100%', 
    marginTop: 20, 
    paddingTop: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#002b5c' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  planItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#002b5c', 
    borderRadius: 12, 
    marginBottom: 10 
  },
  planName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#ffffff' 
  },
  planDuration: { 
    fontSize: 14, 
    color: '#aaa', 
    marginTop: 2, 
    textTransform: 'capitalize' 
  },
  subscribeButton: { 
    backgroundColor: '#FFC107', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    minWidth: 100, 
    alignItems: 'center', 
    height: 40, 
    justifyContent: 'center' 
  },
  subscribeButtonText: { 
    color: '#001f3f', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  subscribedMessageContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(39, 174, 96, 0.1)', 
    padding: 15, 
    borderRadius: 12 
  },
  subscribedMessageText: { 
    color: '#27ae60', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 10 
  },
  errorText: { 
    color: '#ff4d4d', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  // Image Viewer Styles
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageIndicatorText: {
    color: '#ffffff',
    fontSize: 16,
  },
});