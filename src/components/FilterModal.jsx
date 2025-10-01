// src/components/FilterModal.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const FilterModal = ({ 
    isVisible, 
    onClose, 
    selectedFilter, 
    onFilterChange, 
    filterOptions, 
    selectedSort, 
    onSortChange, 
    sortOptions 
}) => (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
                <View style={styles.filterModalHeader}>
                    <Text style={styles.filterModalTitle}>Filter & Sort</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                {/* Filter and Sort sections go here, using the passed props */}
                <TouchableOpacity style={styles.applyFilterButton} onPress={onClose}>
                    <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);
// Add relevant styles from your LocationContent file here
const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    filterModal: { backgroundColor: '#002b5c', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
    filterModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    filterModalTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
    applyFilterButton: { backgroundColor: '#FFC107', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    applyFilterButtonText: { color: '#001f3f', fontSize: 16, fontWeight: '700' },
});