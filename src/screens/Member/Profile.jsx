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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
};

// Import the local boy.jpg image using require
const boyAvatar = require('../../assets/image/boy.jpg');

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);

  const tabs = [
    { id: 'profile', title: 'Profile', icon: 'person' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications' },
  ];

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileResult = await apiClient.get('/users/profile');
      if (profileResult.data.success) {
        setUserProfile(profileResult.data.data);
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

  const updateNotificationSettings = async ({ enabled }) => {
    console.log(`Notification settings updated to: ${enabled}`);
    // Mock API call
  };

  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    try {
      await updateNotificationSettings({ enabled: value });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
      setNotificationsEnabled(!value);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      // Update the local state to reflect the change
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      // Update the local state to remove the notification
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchProfileData);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

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
  const memberSinceDate = safeUserProfile.createdAt ? new Date(safeUserProfile.createdAt).toLocaleDateString() : 'N/A';

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
        <Image
          source={safeUserProfile.avatar ? { uri: safeUserProfile.avatar } : boyAvatar}
          style={styles.profileAvatar}
        />
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{memberProfile.name || 'Flexifit Member'}</Text>
          <Text style={[styles.profileSince, { color: colors.textSecondary }]}>
            Member since {memberSinceDate}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('MemberProfile')}>
          <Icon name="edit" size={16} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{safeUserProfile.email}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Phone</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {safeUserProfile.phone || 'Not provided'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Gender</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{memberProfile.gender || 'Not set'}</Text>
        </View>
      </View>

      <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.actionsTitle, { color: colors.text }]}>Quick Actions</Text>
        
        {safeUserProfile.role === 'MEMBER' && (
          <TouchableOpacity 
            style={[styles.actionButton, { borderBottomColor: colors.border }]} 
            onPress={handleManageBilling}
            disabled={isBillingLoading}
          >
            <Icon name="credit-card" size={24} color={colors.primary} style={styles.actionIcon} />
            <Text style={[styles.actionText, { color: colors.text }]}>Manage Subscription</Text>
            {isBillingLoading && <ActivityIndicator color={colors.primary} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.actionButton, { borderBottomColor: colors.border }]}>
          <Icon name="security" size={24} color={colors.primary} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: colors.text }]}>Privacy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={logout}>
          <Icon name="logout" size={24} color={colors.error} style={styles.actionIcon} />
          <Text style={[styles.actionText, { color: colors.error }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.detailsTitle, { color: colors.text }]}>Notifications</Text>
        
        {notificationsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Icon name="notifications-none" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  { backgroundColor: colors.surface },
                  !notification.read && styles.unreadNotification
                ]}
              >
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                {!notification.read && (
                  <TouchableOpacity
                    style={styles.markAsReadButton}
                    onPress={() => handleMarkAsRead(notification.id)}
                  >
                    <Icon name="check" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteNotification(notification.id)}
                >
                  <Icon name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
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
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={activeTab === tab.id ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabIcon: {
    marginBottom: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tabContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileMembership: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileSince: {
    fontSize: 12,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  actionsCard: {
    borderRadius: 16,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
    paddingHorizontal: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  actionIcon: {
    marginRight: 20,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {},
  settingsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notificationsContainer: {
    gap: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
  markAsReadButton: {
    padding: 8,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyState: {
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
});

export default Profile;