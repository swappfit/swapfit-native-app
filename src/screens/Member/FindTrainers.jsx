// src/screens/FindTrainers.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as trainerService from '../../api/trainerService';
import { TrainerDetailsModal } from '../../components/TrainerDetailsModal';
import { useAuth } from '../../context/AuthContext';

const FindTrainers = () => {
  // ✅ ALL HOOKS ARE CALLED AT THE TOP LEVEL, UNCONDITIONALLY
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [selectedTrainerDetails, setSelectedTrainerDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const { user } = useAuth();

  const fetchTrainers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await trainerService.browseTrainers({ page: 1, limit: 20 });
      if (result && Array.isArray(result.trainers)) {
          setTrainers(result.trainers);
      } else {
          setTrainers([]);
      }
    } catch (err) {
      setError('Failed to load trainers. Please try again later.');
      console.error("Fetch Trainers Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleViewProfile = async (trainerFromList) => {
    setIsModalLoading(true);
    setSelectedTrainerDetails(trainerFromList);
    try {
      const fullProfile = await trainerService.getTrainerById(trainerFromList.user.id);
      setSelectedTrainerDetails(fullProfile);
    } catch (err) {
      console.error("Failed to load full trainer profile:", err);
      Alert.alert("Error", "Could not load trainer details. Please try again.");
      setSelectedTrainerDetails(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  // ✅ CONDITIONAL RENDERING LOGIC HAPPENS *AFTER* ALL HOOKS HAVE BEEN CALLED
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.infoText}>Loading Trainers...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centeredView}>
          <Text style={styles.infoText}>{error}</Text>
          <TouchableOpacity onPress={fetchTrainers} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (trainers.length === 0) {
      return (
        <View style={styles.centeredView}>
          <Text style={styles.infoText}>No trainers found at the moment.</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.trainersList}>
        {trainers.map(trainer => (
          <TouchableOpacity
            key={trainer.id}
            style={styles.trainerCard}
            onPress={() => handleViewProfile(trainer)}
          >
            <View style={styles.trainerHeader}>
              <View style={styles.trainerInfo}>
                <Text style={styles.trainerName}>{trainer.user?.email.split('@')[0] || 'Trainer'}</Text>
                <View style={styles.onlineStatus}>
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.statusText}>Online</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFC107" />
                <Text style={styles.rating}>{trainer.rating || 4.8}</Text>
              </View>
            </View>
            <Text style={styles.specialty}>{trainer.specialty || 'Fitness Expert'}</Text>
            <Text style={styles.trainerDescription} numberOfLines={2}>{trainer.bio || 'No bio available.'}</Text>
            <View style={styles.trainerDetails}>
                <View style={styles.detailItem}>
                    <Icon name="time-outline" size={16} color="#FFC107" />
                    <Text style={styles.detailText}>{trainer.experience || 0} years experience</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.viewProfileButton} onPress={() => handleViewProfile(trainer)}>
              <Text style={styles.viewProfileButtonText}>View Profile & Plans</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <TrainerDetailsModal
        trainer={selectedTrainerDetails}
        isVisible={!!selectedTrainerDetails}
        isLoading={isModalLoading}
        onClose={() => setSelectedTrainerDetails(null)}
        user={user}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#001f3f', paddingTop: 20 },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    infoText: { color: '#aaa', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    retryButton: { backgroundColor: '#FFC107', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
    retryButtonText: { color: '#001f3f', fontSize: 16, fontWeight: 'bold' },
    trainersList: { paddingHorizontal: 15, gap: 15, paddingBottom: 30 },
    trainerCard: { backgroundColor: '#002b5c', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.2)' },
    trainerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    trainerInfo: { flex: 1 },
    trainerName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    onlineStatus: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 12, color: '#FFC107' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    rating: { fontSize: 14, fontWeight: '600', color: '#FFC107', marginLeft: 4 },
    specialty: { fontSize: 16, color: '#FFC107', fontWeight: '600', marginBottom: 12 },
    trainerDetails: { marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap' },
    detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 6 },
    detailText: { fontSize: 14, color: '#FFC107', marginLeft: 8 },
    trainerDescription: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 15, lineHeight: 20 },
    viewProfileButton: { backgroundColor: '#FFC107', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    viewProfileButtonText: { color: '#001f3f', fontSize: 16, fontWeight: '600' },
});

export default FindTrainers;