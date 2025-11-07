// src/screens/Profile.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import * as subscriptionService from '../../api/subscriptionService';

const { width } = Dimensions.get('window');

const colors = {
  background: '#001f3f',
  primary: '#FFC107',
  primaryText: '#001f3f',
  surface: '#002b5c',
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  border: 'rgba(255, 193, 7, 0.3)',
  error: '#ff5252',
  success: '#4caf50',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const boyAvatar = require('../../assets/image/boy.jpg');

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [subscribedTrainers, setSubscribedTrainers] = useState([]);
  const [trainersLoading, setTrainersLoading] = useState(false);
  const [subscribedGyms, setSubscribedGyms] = useState([]);
  const [gymsLoading, setGymsLoading] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [checkInsLoading, setCheckInsLoading] = useState(false);
  const [multiGymTiers, setMultiGymTiers] = useState([]);
  const [multiGymLoading, setMultiGymLoading] = useState(false);
  const [multiGymSubscription, setMultiGymSubscription] = useState(null);
  const [accessibleGyms, setAccessibleGyms] = useState([]);
  const [purchasingTier, setPurchasingTier] = useState(null);
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'profile', title: 'Profile', icon: 'person' },
    { id: 'gyms', title: 'My Gyms', icon: 'business' },
    { id: 'trainers', title: 'My Trainers', icon: 'fitness-center' },
    { id: 'multi-gym', title: 'Multi-Gym', icon: 'location-city' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications' },
  ];

  // Predefined multi-gym tiers with enhanced features
  const predefinedTiers = [
    {
      id: 'silver',
      name: 'Silver',
      price: 49.99,
      badge: '🥈',
      color: colors.silver,
      gradient: ['#C0C0C0', '#808080'],
      description: 'Perfect for fitness enthusiasts',
      features: [
        'Access to 50+ Silver tier gyms',
        'Basic amenities access',
        'Monthly fitness assessment',
        'Group classes access',
        'Mobile app access',
      ],
      popular: false,
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 79.99,
      badge: '🥇',
      color: colors.gold,
      gradient: ['#FFD700', '#FFA500'],
      description: 'Most popular choice',
      features: [
        'Access to 100+ Gold tier gyms',
        'Premium amenities access',
        'Weekly fitness assessment',
        'Unlimited group classes',
        '1 personal training session/month',
        'Nutrition guidance',
        'Guest passes (2/month)',
      ],
      popular: true,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 119.99,
      badge: '💎',
      color: colors.platinum,
      gradient: ['#E5E4E2', '#BCC6CC'],
      description: 'Ultimate fitness experience',
      features: [
        'Access to ALL gyms (200+)',
        'VIP amenities access',
        'Weekly fitness assessment',
        'Unlimited group classes',
        '2 personal training sessions/month',
        'Personalized nutrition plan',
        'Guest passes (5/month)',
        'Spa & wellness access',
        'Priority booking',
      ],
      popular: false,
    },
  ];

  const formatLocalTime = (dateValue, label = "Timestamp") => {
    if (!dateValue) {
      console.log(`[formatLocalTime] ${label}: Input is null or undefined.`);
      return 'N/A';
    }
    
    try {
      let date;
      if (typeof dateValue === 'string') {
        if (dateValue.includes('T') && dateValue.includes('Z')) {
          date = new Date(dateValue);
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        console.error(`[formatLocalTime] ${label}: Invalid date object:`, dateValue);
        return 'Invalid Date';
      }
      
      const formattedString = new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
      
      console.log(`[formatLocalTime] ${label}: Input="${dateValue}", Output="${formattedString}"`);
      return formattedString;
    } catch (e) {
      console.error(`[formatLocalTime] ${label}: Error formatting date "${dateValue}":`, e);
      return 'Invalid Date';
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileResult = await subscriptionService.getUserProfile();
      if (profileResult.success) {
        setUserProfile(profileResult.data);
        console.log('[Profile] Profile data fetched:', profileResult.data);
        
        // Check for multi-gym subscription in the profile data
        const activeMultiGymSub = profileResult.data.subscriptions?.find(
          sub => sub.multiGymTier && sub.status === 'active'
        );
        
        if (activeMultiGymSub) {
          console.log('[Profile] Found active multi-gym subscription:', activeMultiGymSub);
          setMultiGymSubscription(activeMultiGymSub);
          setAccessibleGyms(profileResult.data.accessibleGyms || []);
        } else {
          console.log('[Profile] No active multi-gym subscription found');
          setMultiGymSubscription(null);
          setAccessibleGyms([]);
        }
      } else {
        throw new Error('Failed to load profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const notificationsResult = await apiClient.get('/notifications/me');
      if (notificationsResult.data.success) {
        setNotifications(notificationsResult.data.data);
      }
    } catch (err) {
      console.warn('Notifications fetch failed:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchSubscribedTrainers = async () => {
    setTrainersLoading(true);
    try {
      if (!userProfile?.subscriptions || userProfile.subscriptions.length === 0) { 
        setSubscribedTrainers([]); 
        return; 
      }
      
      const trainerPlanIds = userProfile.subscriptions.filter(sub => sub.trainerPlanId).map(sub => sub.trainerPlanId);
      console.log('[Profile] Trainer plan IDs:', trainerPlanIds);
      
      if (trainerPlanIds.length === 0) { 
        setSubscribedTrainers([]); 
        return; 
      }
      
      const trainersResponse = await apiClient.post('/trainers/by-plan-ids', { planIds: trainerPlanIds });
      if (trainersResponse.data.success) { 
        setSubscribedTrainers(trainersResponse.data.data);
        console.log('[Profile] Subscribed trainers fetched:', trainersResponse.data.data);
      }
      else { 
        throw new Error('Failed to load trainers.'); 
      }
    } catch (err) {
      console.warn('Trainers fetch failed:', err);
      Alert.alert('Error', 'Failed to load your trainers. Please try again.');
    } finally {
      setTrainersLoading(false);
    }
  };

  const fetchSubscribedGyms = async () => {
    setGymsLoading(true);
    try {
      if (!userProfile?.subscriptions || userProfile.subscriptions.length === 0) { setSubscribedGyms([]); return; }
      const gymPlanIds = userProfile.subscriptions.filter(sub => sub.gymPlanId).map(sub => sub.gymPlanId);
      if (gymPlanIds.length === 0) { setSubscribedGyms([]); return; }
      const gymsResponse = await apiClient.post('/gyms/by-plan-ids', { planIds: gymPlanIds });
      if (gymsResponse.data.success) { setSubscribedGyms(gymsResponse.data.data); }
      else { throw new Error(gymsResponse.data.message || 'Failed to load gyms.'); }
    } catch (err) {
      console.error('[Profile] Failed to fetch subscribed gyms:', err);
      Alert.alert("Error", err.response?.data?.message || "Failed to load your gyms. Please try again.");
    } finally {
      setGymsLoading(false);
    }
  };

  const fetchActiveCheckIns = async () => {
    setCheckInsLoading(true);
    try {
      console.log('[Profile] Fetching ALL check-ins...');
      const response = await subscriptionService.getUserCheckIns();
      if (response.success) {
        const processedCheckIns = response.data.map(checkIn => {
          const processedCheckIn = { ...checkIn };
          if (checkIn.checkIn && typeof checkIn.checkIn === 'string') {
            processedCheckIn.checkIn = new Date(checkIn.checkIn);
          }
          if (checkIn.checkOut && typeof checkIn.checkOut === 'string') {
            processedCheckIn.checkOut = new Date(checkIn.checkOut);
          }
          return processedCheckIn;
        });
        setCheckIns(processedCheckIns);
        console.log('[Profile] Fetched check-ins successfully:', processedCheckIns);
      }
    } catch (err) {
      console.warn('[Profile] Failed to fetch check-ins:', err);
    } finally {
      setCheckInsLoading(false);
    }
  };

  const fetchMultiGymData = async () => {
    setMultiGymLoading(true);
    try {
      setMultiGymTiers(predefinedTiers);
      
      // If we already have the profile data with subscription info, use it
      if (userProfile) {
        const activeMultiGymSub = userProfile.subscriptions?.find(
          sub => sub.multiGymTier && sub.status === 'active'
        );
        
        if (activeMultiGymSub) {
          console.log('[Profile] Found active multi-gym subscription in existing profile data:', activeMultiGymSub);
          setMultiGymSubscription(activeMultiGymSub);
          setAccessibleGyms(userProfile.accessibleGyms || []);
        } else {
          console.log('[Profile] No active multi-gym subscription found in existing profile data');
          setMultiGymSubscription(null);
          setAccessibleGyms([]);
        }
      } else {
        // Otherwise fetch fresh profile data
        await fetchProfileData();
      }
    } catch (err) {
      console.error('[Profile] Failed to fetch multi-gym data:', err);
      Alert.alert('Error', 'Failed to load multi-gym plans. Please try again.');
    } finally {
      setMultiGymLoading(false);
    }
  };

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    try {
      const response = await subscriptionService.createPortalSession();
      if (response.success && response.data.portalUrl) {
        await Linking.openURL(response.data.portalUrl);
        setRefreshKey(prev => prev + 1);
      } else {
        Alert.alert("No Subscription Found", response.message || "You do not have any active subscriptions to manage.");
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      Alert.alert("Error", error.response?.data?.message || "An error occurred. Please try again later.");
    } finally {
      setIsBillingLoading(false);
    }
  };

  const handlePurchaseTier = async (tierId) => {
    setPurchasingTier(tierId);
    try {
      console.log(`[Profile] Purchasing multi-gym tier: ${tierId}`);
      const response = await subscriptionService.createCheckoutSession(tierId, 'MULTI_GYM');
      if (response.success && response.data.checkoutUrl) {
        await Linking.openURL(response.data.checkoutUrl);
        setRefreshKey(prev => prev + 1);
      } else {
        Alert.alert("Error", response.message || "Failed to open payment page.");
      }
    } catch (error) {
      console.error('[Profile] Failed to purchase tier:', error);
      Alert.alert("Error", error.response?.data?.message || "Failed to purchase tier.");
    } finally {
      setPurchasingTier(null);
    }
  };

  const handleViewGymDetails = (gym) => {
    navigation.navigate('GymDetails', { gymId: gym.id });
  };

  const handleCheckInToGym = async (gym) => {
    try {
      console.log(`[Profile] Attempting to check in to gym: ${gym.name} (ID: ${gym.id})`);
      const response = await subscriptionService.checkInToGym(gym.id);
      if (response.success) {
        Alert.alert("Check-in Successful!", `Welcome to ${gym.name}.`);
        fetchActiveCheckIns();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('[Profile] Check-in failed:', error);
      Alert.alert("Check-in Failed", error.response?.data?.message || "An unknown error occurred.");
    }
  };

  const handleCheckOutFromGym = async (checkInId) => {
    try {
      const response = await subscriptionService.checkOutFromGym(checkInId);
      if (response.success) {
        Alert.alert("Check-out Successful!", "You have successfully checked out.");
        fetchActiveCheckIns();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('[Profile] Check-out failed:', error);
      Alert.alert("Check-out Failed", error.response?.data?.message || "An unknown error occurred.");
    }
  };

  const handleViewTrainerDetails = (trainer) => {
    navigation.navigate('TrainerDetails', { trainerId: trainer.id });
  };

  const handleChatWithTrainer = async (trainer) => {
    try {
      const response = await apiClient.post('/trainers/start-conversation', { trainerId: trainer.id });
      if (response.data.success) {
        navigation.navigate('Chat', { conversationId: response.data.conversationId, trainer });
      } else {
        Alert.alert('Error', 'Failed to start conversation');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const isCheckedInToGym = (gymId) => {
    return checkIns.some(checkIn => checkIn.gymId === gymId && !checkIn.checkOut);
  };

  const getCheckInForGym = (gymId) => {
    return checkIns.find(checkIn => checkIn.gymId === gymId && !checkIn.checkOut);
  };

  useFocusEffect(React.useCallback(() => {
    fetchProfileData();
    fetchActiveCheckIns();
    return () => {};
  }, [refreshKey]));

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else if (activeTab === 'trainers' && userProfile) {
      fetchSubscribedTrainers();
    } else if (activeTab === 'gyms' && userProfile) {
      fetchSubscribedGyms();
      fetchActiveCheckIns();
    } else if (activeTab === 'multi-gym') {
      fetchMultiGymData();
    }
  }, [activeTab, userProfile, refreshKey]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: colors.error, marginBottom: 20, fontSize: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={fetchProfileData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const safeUserProfile = userProfile || {};
  const memberProfile = safeUserProfile.memberProfile || {};
  const memberSinceDate = safeUserProfile.createdAt ? formatLocalTime(safeUserProfile.createdAt, "Member Since Date") : 'N/A';

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <Image source={safeUserProfile.avatar ? { uri: safeUserProfile.avatar } : boyAvatar} style={styles.profileAvatar} />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{memberProfile.name || 'Flexifit Member'}</Text>
          <Text style={[styles.profileSince, { color: colors.textSecondary }]}>Member since {memberSinceDate}</Text>
        </View>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('MemberProfile')}>
          <Icon name="edit" size={16} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={styles.detailItem}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text><Text style={[styles.detailValue, { color: colors.text }]}>{safeUserProfile.email}</Text></View>
        <View style={styles.detailItem}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text><Text style={[styles.detailValue, { color: colors.text }]}>{safeUserProfile.phone || 'Not provided'}</Text></View>
        <View style={styles.detailItem}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Gender</Text><Text style={[styles.detailValue, { color: colors.text }]}>{memberProfile.gender || 'Not set'}</Text></View>
      </View>
      <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>Quick Actions</Text>
        {safeUserProfile.role === 'MEMBER' && (
          <TouchableOpacity style={[styles.actionButton, { borderBottomColor: colors.border }]} onPress={handleManageBilling} disabled={isBillingLoading}>
            <Icon name="credit-card" size={24} color={colors.primary} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: colors.text }]}>Manage Subscription</Text>
            {isBillingLoading && <ActivityIndicator color={colors.primary} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionButton, { borderBottomColor: colors.border }]}><Icon name="security" size={24} color={colors.primary} style={styles.actionIcon} /><Text style={[styles.actionText, { color: colors.text }]}>Privacy</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={logout}><Icon name="logout" size={24} color={colors.error} style={styles.actionIcon} /><Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderGymsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>My Gyms</Text>
        {gymsLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : subscribedGyms.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Icon name="business" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No gyms subscribed</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>When you subscribe to a gym, it will appear here.</Text>
            {safeUserProfile.role === 'MEMBER' && (
              <TouchableOpacity style={[styles.exploreButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Explore')}>
                <Text style={[styles.exploreButtonText, { color: colors.primaryText }]}>Explore Gyms</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={subscribedGyms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCheckedIn = isCheckedInToGym(item.id);
              const checkInRecord = getCheckInForGym(item.id);
              return (
                <View style={[styles.gymCard, { backgroundColor: colors.surface }]}>
                  <Image source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/150' }} style={styles.gymImage} />
                  <View style={styles.gymInfo}>
                    <Text style={[styles.gymName, { color: colors.text }]}>{item.name}</Text>
                    <View style={styles.gymLocation}><Icon name="location-on" size={14} color={colors.textSecondary} /><Text style={[styles.gymAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text></View>
                    <View style={styles.gymRating}><Icon name="star" size={14} color={colors.primary} /><Text style={[styles.ratingText, { color: colors.text }]}>{item.rating || '4.5'} ({item.reviews || '0'} reviews)</Text></View>
                    {isCheckedIn && (
                      <View style={styles.checkInStatus}>
                        <Icon name="check-circle" size={14} color={colors.success} />
                        <Text style={[styles.checkInStatusText, { color: colors.success }]}>
                          Checked in at {checkInRecord && checkInRecord.checkIn ? formatLocalTime(checkInRecord.checkIn, "Active CheckIn Time") : 'Unknown time'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.gymActions}>
                    <TouchableOpacity style={[styles.gymActionButton, { backgroundColor: colors.primary }]} onPress={() => handleViewGymDetails(item)}>
                      <Icon name="info" size={16} color={colors.primaryText} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.gymActionButton, { backgroundColor: isCheckedIn ? colors.error : colors.success, marginTop: 8 }]} onPress={() => isCheckedIn ? handleCheckOutFromGym(checkInRecord.id) : handleCheckInToGym(item)}>
                      <Icon name={isCheckedIn ? "logout" : "login"} size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={[styles.detailsCard, { backgroundColor: colors.surface, marginTop: 20 }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>All Check-ins</Text>
        {checkInsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : checkIns.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Icon name="history" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No check-in history</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Your check-in history will be displayed here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={checkIns}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              console.log(`[Profile] Rendering CheckIn Item: ID=${item.id}, CheckIn=${item.checkIn}, CheckOut=${item.checkOut}`);
              return (
                <View style={[styles.checkInHistoryCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.checkInHistoryInfo}>
                    <Text style={[styles.checkInHistoryGymName, { color: colors.text }]}>{item.gym.name}</Text>
                    <Text style={[styles.checkInHistoryTime, { color: colors.textSecondary }]}>
                      Check-in: {formatLocalTime(item.checkIn, "History CheckIn Time")}
                    </Text>
                    {item.checkOut ? (
                      <Text style={[styles.checkInHistoryTime, { color: colors.success }]}>
                        Check-out: {formatLocalTime(item.checkOut, "History CheckOut Time")}
                      </Text>
                    ) : (
                      <View style={styles.activeCheckInContainer}>
                        <Icon name="access-time" size={14} color={colors.primary} />
                        <Text style={[styles.checkInHistoryTime, { color: colors.primary }]}>
                          Currently checked in
                        </Text>
                      </View>
                    )}
                  </View>
                  {!item.checkOut && (
                    <TouchableOpacity
                      style={[styles.gymActionButton, { backgroundColor: colors.error }]}
                      onPress={() => handleCheckOutFromGym(item.id)}
                    >
                      <Icon name="logout" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );

  const renderTrainersTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>My Trainers</Text>
        {trainersLoading ? (<View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>) : subscribedTrainers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Icon name="fitness-center" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>{safeUserProfile.role === 'TRAINER' ? "You haven't been assigned any clients yet" : "No trainers subscribed"}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{safeUserProfile.role === 'TRAINER' ? "Clients will appear here when they subscribe to your plans" : "Subscribe to trainers to see them here"}</Text>
          </View>
        ) : (
          <FlatList 
            data={subscribedTrainers} 
            keyExtractor={(item) => item.id} 
            renderItem={({ item }) => (
              <View style={[styles.trainerCard, { backgroundColor: colors.surface }]}>
                <Image source={{ uri: item.gallery?.[0] || 'https://via.placeholder.com/150' }} style={styles.trainerAvatar} />
                <View style={styles.trainerInfo}>
                  <Text style={[styles.trainerName, { color: colors.text }]}>{item.user?.memberProfile?.name || item.user?.email?.split('@')[0] || 'Trainer'}</Text>
                  <Text style={[styles.trainerExperience, { color: colors.textSecondary }]}>{item.experience || 0} years of experience</Text>
                  <Text style={[styles.trainerBio, { color: colors.textSecondary }]} numberOfLines={2}>{item.bio}</Text>
                </View>
                <View style={styles.trainerActions}>
                  <TouchableOpacity style={[styles.trainerActionButton, { backgroundColor: colors.primary }]} onPress={() => handleViewTrainerDetails(item)}><Icon name="info" size={16} color={colors.primaryText} /></TouchableOpacity>
                  <TouchableOpacity style={[styles.trainerActionButton, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={() => handleChatWithTrainer(item)}><Icon name="chat" size={16} color={colors.primaryText} /></TouchableOpacity>
                </View>
              </View>
            )} 
            showsVerticalScrollIndicator={false} 
          />
        )}
      </View>
    </View>
  );

  const renderMultiGymTab = () => (
    <View style={styles.tabContent}>
      {/* Header Section */}
      <View style={styles.multiGymHeader}>
        <View style={styles.headerContent}>
          <Icon name="location-city" size={32} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Multi-Gym Membership</Text>
            <Text style={styles.headerSubtitle}>Access multiple gyms with one membership</Text>
          </View>
        </View>
      </View>

      {multiGymSubscription ? (
        /* Active Subscription View */
        <View style={styles.activeSubscriptionContainer}>
          <View style={styles.activeSubscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>
                  {multiGymSubscription.multiGymTier.name === 'Silver' ? '🥈' : 
                   multiGymSubscription.multiGymTier.name === 'Gold' ? '🥇' : '💎'}
                </Text>
              </View>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionTitle}>
                  {multiGymSubscription.multiGymTier.name} Membership
                </Text>
                <Text style={styles.subscriptionStatus}>Active</Text>
              </View>
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={handleManageBilling}
                disabled={isBillingLoading}
              >
                {isBillingLoading ? (
                  <ActivityIndicator size="small" color={colors.primaryText} />
                ) : (
                  <Icon name="settings" size={20} color={colors.primaryText} />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.subscriptionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Monthly Price</Text>
                <Text style={styles.detailValue}>
                  ${multiGymTiers.find(t => t.id === multiGymSubscription.multiGymTier.id)?.price || 0}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Accessible Gyms</Text>
                <Text style={styles.detailValue}>{accessibleGyms.length} Gyms</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Billing</Text>
                <Text style={styles.detailValue}>
                  {formatLocalTime(multiGymSubscription.endDate, "Next Billing")}
                </Text>
              </View>
            </View>
          </View>

          {/* Accessible Gyms */}
          <View style={styles.accessibleGymsSection}>
            <Text style={styles.sectionTitle}>Your Accessible Gyms</Text>
            {accessibleGyms.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="business" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No gyms available</Text>
              </View>
            ) : (
              <FlatList
                data={accessibleGyms}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.gymCard}>
                    <Image source={{ uri: item.photos?.[0] || 'https://via.placeholder.com/150' }} style={styles.gymImage} />
                    <View style={styles.gymInfo}>
                      <Text style={styles.gymName}>{item.name}</Text>
                      <Text style={styles.gymAddress}>{item.address}</Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      ) : (
        /* No Active Subscription - Show Plans */
        <View style={styles.plansContainer}>
          <View style={styles.plansHeader}>
            <Text style={styles.plansTitle}>Choose Your Plan</Text>
            <Text style={styles.plansSubtitle}>Select the perfect membership for your fitness journey</Text>
          </View>

          {multiGymLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tiersScrollView}>
              {multiGymTiers.map((tier) => (
                <View key={tier.id} style={[
                  styles.tierCard,
                  tier.popular && styles.popularTierCard,
                  { backgroundColor: colors.surface }
                ]}>
                  {tier.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  
                  <View style={styles.tierHeader}>
                    <View style={[styles.tierIcon, { backgroundColor: tier.color }]}>
                      <Text style={styles.tierIconText}>{tier.badge}</Text>
                    </View>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierDescription}>{tier.description}</Text>
                  </View>

                  <View style={styles.tierPricing}>
                    <Text style={styles.tierPrice}>${tier.price}</Text>
                    <Text style={styles.tierPricePeriod}>per month</Text>
                  </View>

                  <View style={styles.tierFeatures}>
                    {tier.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Icon name="check-circle" size={16} color={colors.success} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={[
                      styles.subscribeButton,
                      { backgroundColor: tier.color },
                      purchasingTier === tier.id && styles.disabledButton
                    ]}
                    onPress={() => handlePurchaseTier(tier.id)}
                    disabled={purchasingTier === tier.id}
                  >
                    {purchasingTier === tier.id ? (
                      <ActivityIndicator size="small" color={colors.primaryText} />
                    ) : (
                      <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Choose Multi-Gym?</Text>
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Icon name="location-on" size={24} color={colors.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Access Anywhere</Text>
                  <Text style={styles.benefitDescription}>Work out at any partner gym nationwide</Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="savings" size={24} color={colors.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Save Money</Text>
                  <Text style={styles.benefitDescription}>Get better value than individual gym memberships</Text>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <Icon name="fitness-center" size={24} color={colors.primary} />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>More Variety</Text>
                  <Text style={styles.benefitDescription}>Try different equipment and classes</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Notifications</Text>
        {notificationsLoading ? (<View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>) : notifications.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Icon name="notifications-none" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>You're all caught up!</Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <View key={notification.id} style={[styles.notificationCard, { backgroundColor: colors.surface }, !notification.read && styles.unreadNotification]}>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>{notification.message}</Text>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{formatLocalTime(notification.createdAt, "Notification Time")}</Text>
                </View>
                {!notification.read && (<TouchableOpacity style={styles.markAsReadButton} onPress={() => handleMarkAsRead(notification.id)}><Icon name="check" size={20} color={colors.primary} /></TouchableOpacity>)}
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNotification(notification.id)}><Icon name="delete" size={20} color={colors.error} /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.activeTab]} onPress={() => setActiveTab(tab.id)}>
            <Icon name={tab.icon} size={24} color={activeTab === tab.id ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'gyms' && renderGymsTab()}
        {activeTab === 'trainers' && renderTrainersTab()}
        {activeTab === 'multi-gym' && renderMultiGymTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  content: { flex: 1, paddingHorizontal: 15 },
  tabContent: { paddingTop: 20, paddingBottom: 40 },
  
  // Profile Styles
  profileHeader: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, marginRight: 15, borderWidth: 2, borderColor: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5, color: colors.text },
  profileSince: { fontSize: 12, color: colors.textSecondary },
  editButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  detailsCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: colors.text },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: 16, color: colors.textSecondary },
  detailValue: { fontSize: 16, fontWeight: '500', color: colors.text },
  actionsCard: { borderRadius: 16, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  actionsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 15, color: colors.text },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
  actionIcon: { marginRight: 20 },
  actionText: { fontSize: 16, fontWeight: '500', color: colors.text },
  logoutButton: {},
  emptyState: { borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginTop: 20 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 10, color: colors.text },
  emptySubtext: { fontSize: 14, textAlign: 'center', color: colors.textSecondary },
  exploreButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25, marginTop: 20 },
  exploreButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.primaryText },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  retryButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { padding: 20, alignItems: 'center' },
  gymCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 15, alignItems: 'center' },
  gymImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  gymInfo: { flex: 1 },
  gymName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  gymLocation: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gymAddress: { fontSize: 12, marginLeft: 4, flex: 1, color: colors.textSecondary },
  gymRating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, marginLeft: 4, color: colors.text },
  checkInStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkInStatusText: { fontSize: 12, marginLeft: 4, color: colors.success },
  gymActions: { alignItems: 'center' },
  gymActionButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  trainerCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 15, alignItems: 'center' },
  trainerAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  trainerExperience: { fontSize: 14, marginBottom: 4, color: colors.textSecondary },
  trainerBio: { fontSize: 12, color: colors.textSecondary },
  trainerActions: { alignItems: 'center' },
  trainerActionButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  checkInHistoryCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
  checkInHistoryInfo: { flex: 1 },
  checkInHistoryGymName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  checkInHistoryTime: { fontSize: 12, marginTop: 2, color: colors.textSecondary },
  activeCheckInContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  notificationsContainer: { gap: 10 },
  notificationCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  unreadNotification: { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: colors.text },
  notificationMessage: { fontSize: 14, marginBottom: 6, color: colors.textSecondary },
  notificationTime: { fontSize: 12, color: colors.textSecondary },
  markAsReadButton: { padding: 8, marginLeft: 10 },
  deleteButton: { padding: 8, marginLeft: 5 },
  
  // Multi-Gym Styles
  multiGymHeader: { marginBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  headerText: { marginLeft: 15, flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary },
  
  // Active Subscription
  activeSubscriptionContainer: { marginBottom: 20 },
  activeSubscriptionCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  subscriptionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tierBadge: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 193, 7, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  tierBadgeText: { fontSize: 24 },
  subscriptionInfo: { flex: 1 },
  subscriptionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  subscriptionStatus: { fontSize: 14, color: colors.success, fontWeight: '500' },
  manageButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  subscriptionDetails: { gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, color: colors.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  
  // Accessible Gyms
  accessibleGymsSection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15 },
  
  // Plans Container
  plansContainer: { flex: 1 },
  plansHeader: { alignItems: 'center', marginBottom: 20 },
  plansTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  plansSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  tiersScrollView: { marginBottom: 20 },
  
  // Tier Cards
  tierCard: { width: width - 40, marginHorizontal: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  popularTierCard: { borderColor: colors.primary, borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -10, left: '50%', transform: [{ translateX: -50 }], backgroundColor: colors.primary, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 12 },
  popularBadgeText: { fontSize: 10, fontWeight: 'bold', color: colors.primaryText },
  tierHeader: { alignItems: 'center', marginBottom: 20 },
  tierIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tierIconText: { fontSize: 30 },
  tierName: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  tierDescription: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  tierPricing: { alignItems: 'center', marginBottom: 20 },
  tierPrice: { fontSize: 32, fontWeight: 'bold', color: colors.text },
  tierPricePeriod: { fontSize: 14, color: colors.textSecondary },
  tierFeatures: { marginBottom: 20, gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontSize: 14, color: colors.text, marginLeft: 10, flex: 1 },
  subscribeButton: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  subscribeButtonText: { fontSize: 16, fontWeight: 'bold', color: colors.primaryText },
  
  // Benefits Section
  benefitsSection: { marginTop: 20 },
  benefitsTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' },
  benefitsList: { gap: 15 },
  benefitItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 15 },
  benefitContent: { marginLeft: 15, flex: 1 },
  benefitTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  benefitDescription: { fontSize: 14, color: colors.textSecondary },
});

export default Profile;