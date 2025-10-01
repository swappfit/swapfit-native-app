// src/components/PermissionModal.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const PermissionModal = ({ isVisible, onAllow, onSkip }) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.permissionModal}>
          <Icon name="location" size={60} color="#e74c3c" />
          <Text style={styles.permissionTitle}>Location Access</Text>
          <Text style={styles.permissionMessage}>To show you the nearest gyms, we need access to your location.</Text>
          <View style={styles.permissionButtons}>
            <TouchableOpacity onPress={onSkip} style={[styles.permissionButton, styles.skipButton]}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAllow} style={[styles.permissionButton, styles.allowButton]}>
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
// Add relevant styles from your original file here
const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
    permissionModal: { backgroundColor: 'white', width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' },
    permissionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    permissionMessage: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    permissionButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    permissionButton: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginHorizontal: 10 },
    skipButton: { backgroundColor: '#ccc' },
    skipButtonText: { color: 'white', fontWeight: 'bold' },
    allowButton: { backgroundColor: '#e74c3c' },
    allowButtonText: { color: 'white', fontWeight: 'bold' },
});