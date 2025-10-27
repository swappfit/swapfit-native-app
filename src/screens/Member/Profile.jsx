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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import * as subscriptionService from '../../api/subscriptionService';

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
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { id: 'profile', title: 'Profile', icon: 'person' },
    { id: 'gyms', title: 'My Gyms', icon: 'business' },
    { id: 'trainers', title: 'My Trainers', icon: 'fitness-center' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications' },
  ];

  // ✅ UPDATED: More robust date formatting function
  const formatLocalTime = (dateValue, label = "Timestamp") => {
    if (!dateValue) {
      console.log(`[formatLocalTime] ${label}: Input is null or undefined.`);
      return 'N/A';
    }
    
    try {
      // Handle different types of date inputs
      let date;
      if (typeof dateValue === 'string') {
        // Check if it's already in ISO format
        if (dateValue.includes('T') && dateValue.includes('Z')) {
          date = new Date(dateValue);
        } else {
          // Try to parse as ISO if it doesn't look like ISO
          date = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        // Try to convert to Date if it's a number or other type
        date = new Date(dateValue);
      }
      
      // Check if the date is valid
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
      const profileResult = await apiClient.get('/users/profile');
      if (profileResult.data.success) {
        setUserProfile(profileResult.data.data);
        console.log('[Profile] Profile data fetched:', profileResult.data.data);
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
      const response = await apiClient.get('/users/check-ins');
      if (response.data.success) {
        // Process the check-ins to ensure dates are properly handled
        const processedCheckIns = response.data.data.map(checkIn => {
          // Convert string dates to Date objects if they aren't already
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

  const handleViewGymDetails = (gym) => {
    navigation.navigate('GymDetails', { gymId: gym.id });
  };

  const handleCheckInToGym = async (gym) => {
    try {
      console.log(`[Profile] Attempting to check in to gym: ${gym.name} (ID: ${gym.id})`);
      const response = await apiClient.post('/gyms/check-in', { gymId: gym.id });
      if (response.data.success) {
        Alert.alert("Check-in Successful!", `Welcome to ${gym.name}.`);
        // Force a refresh of the check-ins data to show the new check-in
        fetchActiveCheckIns();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('[Profile] Check-in failed:', error);
      Alert.alert("Check-in Failed", error.response?.data?.message || "An unknown error occurred.");
    }
  };

  const handleCheckOutFromGym = async (checkInId) => {
    try {
      const response = await apiClient.patch(`/gyms/check-out/${checkInId}`);
      if (response.data.success) {
        Alert.alert("Check-out Successful!", "You have successfully checked out.");
        // Force a refresh of the check-ins data to show the updated checkout time
        fetchActiveCheckIns();
      } else {
        throw new Error(response.data.message);
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
              // ✅ DEBUGGING LOG: Log the raw item data before rendering
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
                        {/* ✅ DEBUGGING LOG: We are now logging the check-out time specifically */}
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
  profileHeader: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, marginRight: 15, borderWidth: 2, borderColor: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  profileSince: { fontSize: 12 },
  editButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  detailsCard: { borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { fontSize: 16 },
  detailValue: { fontSize: 16, fontWeight: '500' },
  actionsCard: { borderRadius: 16, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  actionsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 15 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15 },
  actionIcon: { marginRight: 20 },
  actionText: { fontSize: 16, fontWeight: '500' },
  logoutButton: {},
  notificationsContainer: { gap: 10 },
  notificationCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  unreadNotification: { backgroundColor: 'rgba(255, 193, 7, 0.1)' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  notificationMessage: { fontSize: 14, marginBottom: 6 },
  notificationTime: { fontSize: 12 },
  markAsReadButton: { padding: 8, marginLeft: 10 },
  deleteButton: { padding: 8, marginLeft: 5 },
  emptyState: { borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginTop: 20 },
  emptyText: { fontSize: 18, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },
  exploreButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25, marginTop: 20 },
  exploreButtonText: { fontSize: 16, fontWeight: 'bold' },
  retryButton: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', marginTop: 20 },
  retryButtonText: { color: colors.primaryText, fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { padding: 20, alignItems: 'center' },
  gymCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 15, alignItems: 'center' },
  gymImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  gymInfo: { flex: 1 },
  gymName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  gymLocation: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gymAddress: { fontSize: 12, marginLeft: 4, flex: 1 },
  gymRating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, marginLeft: 4 },
  checkInStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkInStatusText: { fontSize: 12, marginLeft: 4 },
  gymActions: { alignItems: 'center' },
  gymActionButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  trainerCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 15, alignItems: 'center' },
  trainerAvatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  trainerExperience: { fontSize: 14, marginBottom: 4 },
  trainerBio: { fontSize: 12 },
  trainerActions: { alignItems: 'center' },
  trainerActionButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  checkInHistoryCard: { flexDirection: 'row', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
  checkInHistoryInfo: { flex: 1 },
  checkInHistoryGymName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  checkInHistoryTime: { fontSize: 12, marginTop: 2 },
  activeCheckInContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
});

export default Profile;