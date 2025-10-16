// src/components/LocationContent.jsx
import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Platform, Animated, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';

import { SearchModal } from './SearchModal';
import { FilterModal } from './FilterModal';
import { GymDetailsModal } from './GymDetailsModal'; 

// ❌ NO useAuth IMPORT
export const LocationContent = ({
  user, // RECEIVES the user object as a prop
  gyms,
  isLoading,
  error,
  userLocation,
  pulseAnim,
  permissionGranted,
  isLoadingLocation,
  mapRef,
  mapSelectedGym,
  selectedGym,
  isModalLoading,
  onGymPress,
  onMapMarkerPress,
  onMyLocation,
  onCameraPress,
  onCloseGymModal,
  searchQuery, onSearchQueryChange, showSearchModal, onSearchModalClose, onSearchPress,
  filterOptions, sortOptions, selectedFilter, selectedSort, onFilterChange, onSortChange, showFilterModal, onFilterModalClose, onFilterPress,
  onRequestLocationPermission, onSkipPermission
}) => {

  const isSubscribedToThisGym = useMemo(() => {
    if (!user?.subscriptions || !selectedGym?.plans) return false;
    const gymPlanIds = new Set(selectedGym.plans.map(p => p.id));
    return user.subscriptions.some(sub => sub.gymPlanId && gymPlanIds.has(sub.gymPlanId));
  }, [user?.subscriptions, selectedGym?.plans]);
  
  useEffect(() => {
    if (userLocation && mapRef.current) {
      onMyLocation();
    }
  }, [userLocation, mapRef, onMyLocation]);

  const mapRegion = userLocation ? { ...userLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 } : null;

  const renderGymList = () => {
    if (isLoading) {
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#FFC107" />;
    }
    if (error && (!gyms || gyms.length === 0)) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!gyms || gyms.length === 0) {
      return <Text style={styles.emptyText}>No gyms found. Try expanding your search area.</Text>;
    }
    return (
      <ScrollView style={styles.gymList} showsVerticalScrollIndicator={false}>
        {gyms.map((gym) => {
          if (!gym || !gym.id) return null;
          return (
            <TouchableOpacity
              key={gym.id}
              style={styles.gymCard}
              onPress={() => onGymPress(gym)}
            >
              <View style={styles.gymImageContainer}>
                <Image
                  source={{ uri: gym.photos?.[0] || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' }}
                  style={styles.gymImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.gymInfo}>
                <Text style={styles.gymName} numberOfLines={1}>{gym.name || 'Unknown Gym'}</Text>
                <Text style={styles.gymLocation} numberOfLines={1}>{gym.address || 'Address not available'}</Text>
              </View>
              <View style={styles.gymArrow}>
                <Text style={styles.arrowText}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <>
      <GymDetailsModal
        gym={selectedGym}
        isVisible={!!selectedGym}
        isLoading={isModalLoading}
        onClose={onCloseGymModal}
        isSubscribed={isSubscribedToThisGym} 
        userSubscriptions={user?.subscriptions || []}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
          <Icon name="search" size={28} color="#001f3f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress} activeOpacity={0.8}>
          <Icon name="camera" size={32} color="#001f3f" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {!permissionGranted && !isLoadingLocation && (
          <View style={styles.locationPermissionOverlay}>
            <View style={styles.permissionCard}>
              <Icon name="location" size={48} color="#FFC107" />
              <Text style={styles.permissionTitle}>Find Gyms Near You</Text>
              <Text style={styles.permissionMessage}>Enable location access to discover nearby gyms.</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={onRequestLocationPermission} activeOpacity={0.8}>
                <Text style={styles.permissionButtonText}>Enable Location Access</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={onSkipPermission}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoadingLocation && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#FFC107" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          </View>
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ latitude: 28.7041, longitude: 77.1025, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
          region={mapRegion}
          provider={PROVIDER_GOOGLE}
        >
          {userLocation && (
            <Marker coordinate={userLocation} title="You are here">
              <View style={styles.userLocationMarker}>
                <Animated.View style={[styles.userLocationPulse, { transform: [{ scale: pulseAnim }] }]} />
                <View style={styles.userLocationDot} />
              </View>
            </Marker>
          )}
          {gyms && gyms.map((gym) => {
            if (!gym || !gym.id || !gym.coordinates) return null;
            return (
              <Marker
                key={gym.id}
                coordinate={gym.coordinates}
                title={gym.name || 'Gym'}
                pinColor={mapSelectedGym?.id === gym.id ? "#e74c3c" : "#FFC107"}
                onPress={() => onMapMarkerPress(gym)}
              />
            );
          })}
        </MapView>

        <View style={styles.myLocationButtonContainer}>
          <TouchableOpacity style={styles.myLocationButton} onPress={onMyLocation} activeOpacity={0.8}>
            <Icon name="locate" size={24} color="#001f3f" />
          </TouchableOpacity>
        </View>

        <View style={styles.mapFilterContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Icon name="filter" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>Gyms Near You</Text>
            <Text style={styles.subtitleText}>{gyms ? gyms.length : 0} fitness centers found</Text>
          </View>
          {renderGymList()}
        </View>
      </View>

      <SearchModal isVisible={showSearchModal} onClose={onSearchModalClose} query={searchQuery} onQueryChange={onSearchQueryChange} />
      <FilterModal 
        isVisible={showFilterModal} 
        onClose={onFilterModalClose}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
        selectedSort={selectedSort}
        onSortChange={onSortChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 10, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: 'transparent' },
  searchButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFC107', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  cameraButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFC107', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  mainContent: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject, height: '45%' },
  userLocationMarker: { alignItems: 'center', justifyContent: 'center' },
  userLocationDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFC107', borderWidth: 3, borderColor: '#001f3f' },
  userLocationPulse: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 193, 7, 0.3)' },
  myLocationButtonContainer: { position: 'absolute', right: 20, bottom: '58%', zIndex: 10 },
  myLocationButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFC107', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  mapFilterContainer: { position: 'absolute', left: 20, bottom: '58%', zIndex: 10 },
  filterButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#002b5c', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#001f3f', borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingTop: 10, height: '60%', elevation: 10 },
  bottomSheetHandle: { width: 50, height: 5, backgroundColor: '#FFC107', borderRadius: 3, alignSelf: 'center', marginVertical: 8 },
  bottomSheetHeader: { paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#002b5c' },
  bottomSheetTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  subtitleText: { fontSize: 14, color: '#FFC107', marginTop: 2 },
  gymList: { paddingHorizontal: 20, paddingTop: 10 },
  gymCard: { backgroundColor: '#002b5c', borderRadius: 18, marginBottom: 15, flexDirection: 'row', overflow: 'hidden' },
  gymImageContainer: { width: 100, height: 100 },
  gymImage: { width: '100%', height: '100%' },
  gymInfo: { flex: 1, padding: 15, justifyContent: 'center' },
  gymName: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  gymLocation: { fontSize: 12, color: '#aaa', marginTop: 4 },
  gymArrow: { justifyContent: 'center', paddingHorizontal: 10 },
  arrowText: { fontSize: 24, color: '#FFC107' },
  errorText: { textAlign: 'center', marginTop: 50, color: '#FFC107', fontSize: 16, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#aaa', fontSize: 16 },
  locationPermissionOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 31, 57, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  permissionCard: { backgroundColor: '#002b5c', borderRadius: 20, padding: 30, margin: 20, alignItems: 'center', elevation: 10 },
  permissionTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 15, marginBottom: 10, textAlign: 'center' },
  permissionMessage: { fontSize: 16, color: '#aaa', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  permissionButton: { backgroundColor: '#FFC107', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, width: '100%', alignItems: 'center' },
  permissionButtonText: { color: '#001f3f', fontSize: 16, fontWeight: '700' },
  skipButton: { marginTop: 15 },
  skipButtonText: { color: '#aaa', fontSize: 14, textDecorationLine: 'underline' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1500 },
  loadingCard: { backgroundColor: '#002b5c', borderRadius: 15, padding: 25, flexDirection: 'row', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#ffffff', marginLeft: 15, fontWeight: '600' },
});