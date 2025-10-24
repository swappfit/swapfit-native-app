// src/components/TrainerModal.jsx
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import * as subscriptionService from '../api/subscriptionService';

export const TrainerModal = ({ trainer, isVisible, isLoading, onClose, isSubscribed, userSubscriptions }) => {
  const navigation = useNavigation();
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [error, setError] = useState('');

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

  if (!trainer) return null;

  const specialties = Array.isArray(trainer.specialties) ? trainer.specialties : [];
  const experience = trainer.experience ? `${trainer.experience} years` : 'N/A';
  const rating = trainer.rating || '4.5';
  const plans = Array.isArray(trainer.plans) ? trainer.plans : [];

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.trainerDetailsModal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#001f3f" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Image 
                source={{ uri: trainer.gallery?.[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b' }} 
                style={styles.modalImage}
            />

            <View style={styles.modalContent}>
              {error && <Text style={styles.errorText}>{error}</Text>}

              {isLoading ? (
                <ActivityIndicator style={{ marginVertical: 60 }} color="#FFC107" size="large" />
              ) : (
                <>
                  <Text style={styles.modalTrainerName}>{trainer.user?.name || 'Trainer'}</Text>
                  <View style={styles.modalSubHeader}>
                      <View style={styles.modalRatingContainer}>
                        <Icon name="star" size={16} color="#FFC107" />
                        <Text style={styles.modalRatingText}>{rating}</Text>
                      </View>
                      <View style={styles.modalExperienceContainer}>
                        <Icon name="time-outline" size={16} color="#FFC107" />
                        <Text style={styles.modalExperienceText}>{experience}</Text>
                      </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>{trainer.bio || 'No bio available'}</Text>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Specialties</Text>
                    <View style={styles.featuresGrid}>
                      {specialties.map((item, index) => (
                        <View key={index} style={styles.featureItem}>
                          <Icon name="checkmark-circle-outline" size={16} color="#FFC107" />
                          <Text style={styles.featureText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Training Plans</Text>
                    {isSubscribed ? (
                        <View style={styles.subscribedMessageContainer}>
                            <Icon name="checkmark-circle" size={24} color="#27ae60" />
                            <Text style={styles.subscribedMessageText}>You have an active subscription with this trainer.</Text>
                        </View>
                    ) : (
                        plans.length > 0 ? (
                          <View style={styles.plansContainer}>
                            {plans.map((plan) => {
                              const isSubscribedToThisPlan = userSubscriptions.some(sub => sub.trainerPlanId === plan.id);
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
                          <Text style={styles.featureText}>This trainer has not listed any plans yet.</Text>
                        )
                    )}
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {!isLoading && (
            <View style={styles.modalActions}>
               <TouchableOpacity style={styles.modalBookButton} onPress={() => {
                 onClose();
                 navigation.navigate('TrainerDetails', { trainerId: trainer.id });
               }}>
                 <Text style={styles.modalBookButtonText}>View Full Details</Text>
               </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    trainerDetailsModal: { backgroundColor: '#001f3f', width: '90%', maxHeight: '85%', borderRadius: 20, overflow: 'hidden' },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.8)', justifyContent: 'center', alignItems: 'center' },
    modalImage: { width: '100%', height: 200 },
    modalContent: { padding: 20 },
    modalTrainerName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
    modalSubHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 20 },
    modalRatingContainer: { flexDirection: 'row', alignItems: 'center' },
    modalRatingText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', marginLeft: 6 },
    modalExperienceContainer: { flexDirection: 'row', alignItems: 'center' },
    modalExperienceText: { fontSize: 14, color: '#ffffff', marginLeft: 6 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 12 },
    bioText: { fontSize: 14, color: '#aaa', lineHeight: 20 },
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
    modalActions: { padding: 15, borderTopWidth: 1, borderTopColor: '#002b5c', backgroundColor: '#001f3f' },
    modalBookButton: { flex: 1, backgroundColor: '#FFC107', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    modalBookButtonText: { color: '#001f3f', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: '#ff4d4d', textAlign: 'center', marginBottom: 15, fontSize: 14 },
    subscribedMessageContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(39, 174, 96, 0.1)', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(39, 174, 96, 0.5)' },
    subscribedMessageText: { color: '#27ae60', fontSize: 16, fontWeight: '600', marginLeft: 10, flex: 1 },
});