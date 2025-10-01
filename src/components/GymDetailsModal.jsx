// src/components/GymDetailsModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as subscriptionService from '../api/subscriptionService';
import * as gymService from '../api/gymService';

export const GymDetailsModal = ({ gym, isVisible, isLoading, onClose, isSubscribed, userSubscriptions }) => {
  const navigation = useNavigation();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [error, setError] = useState('');

  const handleBookNowPress = () => {
    onClose();
    navigation.navigate('GymDetails', { gymId: gym?.id });
  };

  const handleSubscribePress = async (plan) => {
    setError('');
    setSubscribingPlanId(plan.id);
    try {
      const response = await subscriptionService.createCheckoutSession(plan.id, 'GYM');
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

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    setError('');
    try {
        const response = await gymService.checkInToGym(gym.id);
        if (response.success) {
            Alert.alert("Check-in Successful!", `Welcome to ${gym.name}.`);
            onClose();
        } else {
            throw new Error(response.message);
        }
    } catch (error) {
        Alert.alert(
            "Check-in Failed", 
            error.response?.data?.message || "An unknown error occurred."
        );
    } finally {
        setIsCheckingIn(false);
    }
  };

  if (!gym) return null;

  const amenities = Array.isArray(gym.facilities) ? gym.facilities : [];
  const distance = gym.distance ? `${gym.distance.toFixed(1)} km away` : 'N/A';
  const rating = gym.rating || '4.5';
  const plans = Array.isArray(gym.plans) ? gym.plans : [];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.gymDetailsModal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#001f3f" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image 
                source={{ uri: gym.photos?.[0] || 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f' }} 
                style={styles.modalImage}
            />

            <View style={styles.modalContent}>
              {error && <Text style={styles.errorText}>{error}</Text>}

              {isLoading ? (
                <ActivityIndicator style={{ marginVertical: 60 }} color="#FFC107" size="large" />
              ) : (
                <>
                  <Text style={styles.modalGymName}>{gym.name}</Text>
                  <View style={styles.modalSubHeader}>
                      <View style={styles.modalRatingContainer}>
                        <Icon name="star" size={16} color="#FFC107" />
                        <Text style={styles.modalRatingText}>{rating}</Text>
                      </View>
                      <View style={styles.modalStatusIndicator}>
                        <View style={styles.modalStatusDot} />
                        <Text style={styles.modalStatusText}>Open Now</Text>
                      </View>
                  </View>

                  <View style={styles.modalAddressContainer}>
                    <Icon name="location-outline" size={18} color="#FFC107" />
                    <Text style={styles.modalAddressText}>{gym.address}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.featuresGrid}>
                      {amenities.map((item, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Icon name="checkmark-circle-outline" size={16} color="#FFC107" />
                          <Text style={styles.featureText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Membership</Text>
                    {isSubscribed ? (
                        <View style={styles.subscribedMessageContainer}>
                            <Icon name="checkmark-circle" size={24} color="#27ae60" />
                            <Text style={styles.subscribedMessageText}>You have an active membership at this gym.</Text>
                        </View>
                    ) : (
                        plans.length > 0 ? (
                          <View style={styles.plansContainer}>
                            {plans.map((plan) => {
                              const isSubscribedToThisPlan = userSubscriptions.some(sub => sub.gymPlanId === plan.id);
                              return (
                                <View key={plan.id} style={styles.planItem}>
                                  <View style={styles.planDetails}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planDuration}>₹{plan.price} / {plan.duration}</Text>
                                  </View>
                                  {isSubscribedToThisPlan ? (
                                    <View style={styles.subscribedBadge}>
                                      <Icon name="checkmark-circle" size={20} color="#27ae60" />
                                      <Text style={styles.subscribedText}>Active</Text>
                                    </View>
                                  ) : (
                                    <TouchableOpacity 
                                        style={[styles.subscribeButton, isSubscribed && styles.disabledButton]}
                                        onPress={() => handleSubscribePress(plan)}
                                        disabled={subscribingPlanId === plan.id || isSubscribed}
                                    >
                                      {subscribingPlanId === plan.id ? (
                                          <ActivityIndicator color="#001f3f" size="small" />
                                      ) : (
                                          <Text style={styles.subscribeButtonText}>Subscribe</Text>
                                      )}
                                    </TouchableOpacity>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <Text style={styles.featureText}>This gym has not listed any plans yet.</Text>
                        )
                    )}
                  </View>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                      <Icon name="navigate-outline" size={16} color="#FFC107" />
                      <Text style={styles.infoText}>{distance}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="people-outline" size={16} color="#FFC107" />
                      <Text style={styles.infoText}>Medium Crowd</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {!isLoading && (
            <View style={styles.modalActions}>
               {isSubscribed ? (
                 <TouchableOpacity 
                    style={styles.checkInButton} 
                    onPress={handleCheckIn}
                    disabled={isCheckingIn}
                 >
                   {isCheckingIn ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.checkInButtonText}>Check In Now</Text>}
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity style={styles.modalBookButton} onPress={handleBookNowPress}>
                   <Text style={styles.modalBookButtonText}>View Full Details</Text>
                 </TouchableOpacity>
               )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    gymDetailsModal: { backgroundColor: '#001f3f', width: '90%', maxHeight: '85%', borderRadius: 20, overflow: 'hidden' },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalImage: { width: '100%', height: 200 },
    modalContent: { padding: 20 },
    modalGymName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
    modalSubHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 20 },
    modalRatingContainer: { flexDirection: 'row', alignItems: 'center' },
    modalRatingText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginLeft: 6 },
    modalStatusIndicator: { flexDirection: 'row', alignItems: 'center' },
    modalStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27ae60', marginRight: 6 },
    modalStatusText: { fontSize: 14, color: '#27ae60', fontWeight: '600' },
    modalAddressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    modalAddressText: { fontSize: 14, color: '#aaa', marginLeft: 8, flex: 1 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    featureItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    featureText: { fontSize: 14, color: '#aaa', marginLeft: 6 },
    plansContainer: { gap: 10 },
    planItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#002b5c', borderRadius: 12 },
    planDetails: { flex: 1, marginRight: 10 },
    planName: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    planDuration: { fontSize: 14, color: '#aaa', marginTop: 2, textTransform: 'capitalize' },
    subscribeButton: { backgroundColor: '#FFC107', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 110, height: 40, justifyContent: 'center', alignItems: 'center' },
    subscribeButtonText: { color: '#001f3f', fontWeight: 'bold', fontSize: 14 },
    disabledButton: { backgroundColor: '#888' },
    subscribedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    subscribedText: { color: '#27ae60', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
    infoContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#002b5c' },
    infoItem: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, color: '#aaa', marginLeft: 6 },
    modalActions: { padding: 15, borderTopWidth: 1, borderTopColor: '#002b5c', backgroundColor: '#001f3f' },
    modalBookButton: { flex: 1, backgroundColor: '#FFC107', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBookButtonText: { color: '#001f3f', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: '#ff4d4d', textAlign: 'center', marginBottom: 15, fontSize: 14 },
    checkInButton: { flex: 1, backgroundColor: '#27ae60', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    checkInButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    subscribedMessageContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(39, 174, 96, 0.1)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(39, 174, 96, 0.5)' },
    subscribedMessageText: { color: '#27ae60', fontSize: 16, fontWeight: '600', marginLeft: 10, flex: 1 },
});
