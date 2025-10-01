// src/components/TrainerDetailsModal.jsx
import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as subscriptionService from '../api/subscriptionService';

export const TrainerDetailsModal = ({ trainer, isVisible, isLoading, onClose, user }) => {
  // ✅✅✅ THE DEFINITIVE FIX IS HERE ✅✅✅
  // Conditional return MUST happen BEFORE any hooks are called.
  if (!trainer) {
    return null;
  }

  // Now, all hooks are called unconditionally on every render where the modal is visible.
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [error, setError] = useState('');

  // The plans are derived from the trainer prop, which we know exists.
  const plans = Array.isArray(trainer.plans) ? trainer.plans : [];

  const isSubscribedToThisTrainer = useMemo(() => {
    if (!user?.subscriptions || !plans) return false;
    const trainerPlanIds = new Set(plans.map(p => p.id));
    return user.subscriptions.some(sub => sub.trainerPlanId && trainerPlanIds.has(sub.trainerPlanId));
  }, [user?.subscriptions, plans]);

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
                <Image source={{ uri: trainer.gallery?.[0] || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <Text style={styles.trainerName}>{trainer.user?.email.split('@')[0] || 'Trainer'}</Text>
                <Text style={styles.experience}>{trainer.experience || 0} years of experience</Text>
                <Text style={styles.bio}>{trainer.bio}</Text>
                
                {error && <Text style={styles.errorText}>{error}</Text>}

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
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#001f3f', width: '90%', maxHeight: '85%', borderRadius: 20, paddingTop: 40, paddingBottom: 20 },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 4, borderRadius: 16 },
    content: { alignItems: 'center', paddingHorizontal: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFC107' },
    trainerName: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginTop: 15 },
    experience: { fontSize: 16, color: '#FFC107', marginVertical: 5 },
    bio: { fontSize: 14, color: '#aaa', textAlign: 'center', marginVertical: 15, lineHeight: 22 },
    section: { width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#002b5c' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginBottom: 12, textAlign: 'center' },
    planItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#002b5c', borderRadius: 12, marginBottom: 10 },
    planName: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
    planDuration: { fontSize: 14, color: '#aaa', marginTop: 2, textTransform: 'capitalize' },
    subscribeButton: { backgroundColor: '#FFC107', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center', height: 40, justifyContent: 'center' },
    subscribeButtonText: { color: '#001f3f', fontWeight: 'bold', fontSize: 14 },
    subscribedMessageContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(39, 174, 96, 0.1)', padding: 15, borderRadius: 12 },
    subscribedMessageText: { color: '#27ae60', fontSize: 16, fontWeight: '600', marginLeft: 10 },
    errorText: { color: '#ff4d4d', textAlign: 'center', marginVertical: 10 },
});