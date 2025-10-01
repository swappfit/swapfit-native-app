import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/authContext';
import apiClient from '../api/apiClient';
import { useTheme } from 'react-native-paper';

const roles = [
  { label: 'Member', description: 'Access gym facilities and classes' },
  { label: 'Gym Owner', description: 'Manage your gym and members' },
  { label: 'Trainer', description: 'Coach and guide gym members' },
  { label: 'Multi-Gym Member', description: 'Access multiple gyms with one account' },
];

const RoleSelection = () => {
  const navigation = useNavigation();
  const { userProfile, refreshUserProfile } = useAuth();
  const { colors } = useTheme();

  // Function to handle role selection
  const handleRolePress = async (roleLabel) => {
    try {
      let roleValue;
      switch (roleLabel) {
        case 'Member':
          roleValue = 'MEMBER';
          break;
        case 'Multi-Gym Member':
          roleValue = 'MULTI_GYM_MEMBER';
          break;
        case 'Trainer':
          // Redirect trainers to website
          Alert.alert(
            'Trainer Registration',
            'Trainer registration is available on our website. Would you like to visit the website?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Visit Website', 
                onPress: () => Linking.openURL('https://fitnessclub.com/trainer-signup') 
              }
            ]
          );
          return;
        case 'Gym Owner':
          // Redirect gym owners to website
          Alert.alert(
            'Gym Owner Registration',
            'Gym owner registration is available on our website. Would you like to visit the website?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Visit Website', 
                onPress: () => Linking.openURL('https://fitnessclub.com/gym-signup') 
              }
            ]
          );
          return;
        default:
          return;
      }

      // Update user role in backend
      const response = await apiClient.post('/auth/auth0/select-role', { role: roleValue });
      
      if (response.data.success) {
        // Refresh user profile to get updated data
        await refreshUserProfile();
        console.log('Role selected successfully:', roleValue);
      }
    } catch (error) {
      console.error('Error selecting role:', error);
      Alert.alert('Error', 'Failed to select role. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Choose User Type</Text>
      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.label}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => handleRolePress(role.label)}
          >
            <Text style={[styles.roleLabel, { color: colors.text }]}>{role.label}</Text>
            <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>{role.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 30,
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  rolesContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 18,
    marginBottom: 22,
    alignItems: 'flex-start',
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
  },
  roleLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  roleDesc: {
    fontSize: 15,
    opacity: 0.9,
    fontFamily: 'System',
    lineHeight: 20,
    fontWeight: '400',
  },
});

export default RoleSelection;