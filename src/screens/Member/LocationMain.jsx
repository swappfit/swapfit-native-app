// src/screens/LocationMain.jsx
import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Animated, AppState } from 'react-native';
import * as gymService from '../../api/gymService'; 
import { useAuth } from '../../context/AuthContext';
import { useLocationManager } from '../../hooks/useLocationManager';
import { useGymData } from '../../hooks/useGymData';
import { LocationContent } from '../../components/LocationContent';

export const LocationMain = () => {
  const mapRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // ✅✅✅ THE DEFINITIVE FIX IS HERE ✅✅✅
  // Get the LIVE user object from the context at the TOP LEVEL.
  const { user, refreshAuthStatus } = useAuth();
  
  const [selectedGymDetails, setSelectedGymDetails] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const { 
    userLocation, 
    permissionGranted, 
    isLoading: isLocationLoading, 
    error: locationError, 
    actions: locationActions 
  } = useLocationManager();

  const { 
    gyms, 
    isLoading: areGymsLoading, 
    error: gymError, 
    hasMore,
    actions: gymActions 
  } = useGymData(userLocation, permissionGranted);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filterOptions = [{label: 'All', value: 'all'}, {label: 'Premium', value: 'premium'}];
  const sortOptions = [{label: 'Distance', value: 'distance'}, {label: 'Rating', value: 'rating'}];
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('distance');

  // This AppState listener is correct.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppState] App has come to the foreground! Refreshing user data...');
        await refreshAuthStatus();
      }
      appState.current = nextAppState;
    });
    return () => { subscription.remove(); };
  }, [refreshAuthStatus]);

  const onMyLocation = () => {
    if (mapRef.current && userLocation) {
        mapRef.current.animateToRegion({ ...userLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }, 1000);
    }
  };

  const handleOpenGymDetails = async (gymFromList) => {
    setSelectedGymDetails(gymFromList);
    setIsModalLoading(true);
    try {
      const response = await gymService.getGymDetails(gymFromList.id);
      if (response.success) {
        setSelectedGymDetails(response.data);
      } else {
        console.error("Failed to fetch gym details:", response.message);
      }
    } catch (error) {
      console.error("API error fetching gym details:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedGymDetails(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#001f3f" />
      
      <LocationContent
        // ✅ PASS THE LIVE, FRESH USER OBJECT DOWN AS A PROP
        user={user}
        gyms={gyms}
        userLocation={userLocation}
        permissionGranted={permissionGranted}
        selectedGym={selectedGymDetails}
        isModalLoading={isModalLoading}
        isLoading={areGymsLoading}
        isLoadingLocation={isLocationLoading}
        error={locationError || gymError}
        mapRef={mapRef}
        pulseAnim={useRef(new Animated.Value(1)).current}
        onGymPress={handleOpenGymDetails}
        onMapMarkerPress={handleOpenGymDetails}
        onCloseGymModal={handleCloseModal}
        onMyLocation={onMyLocation}
        onCameraPress={() => console.log('Camera pressed')}
        onRequestLocationPermission={locationActions.requestPermission}
        onSkipPermission={locationActions.skipPermission}
        showSearchModal={showSearchModal}
        onSearchPress={() => setShowSearchModal(true)}
        onSearchModalClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showFilterModal={showFilterModal}
        onFilterPress={() => setShowFilterModal(true)}
        onFilterModalClose={() => setShowFilterModal(false)}
        filterOptions={filterOptions}
        sortOptions={sortOptions}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#001f3f' },
});

export default LocationMain;