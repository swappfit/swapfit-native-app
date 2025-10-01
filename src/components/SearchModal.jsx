// src/components/SearchModal.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const SearchModal = ({ isVisible, onClose, query, onQueryChange }) => (
  <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.searchModal}>
        <View style={styles.searchModalHeader}>
          <Text style={styles.searchModalTitle}>Search Gyms</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#ccc" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, location..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={onQueryChange}
            autoFocus={true}
          />
        </View>
      </View>
    </View>
  </Modal>
);

// Add relevant styles from your LocationContent file here
const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    searchModal: { backgroundColor: '#002b5c', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', padding: 20 },
    searchModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    searchModalTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#001f3f', borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, paddingVertical: 12, color: '#ffffff' },
});