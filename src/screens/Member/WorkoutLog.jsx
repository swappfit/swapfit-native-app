import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions,
    Image, TextInput, FlatList, SafeAreaView, Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { logWorkoutSession, deleteWorkoutSession, deleteExerciseFromSession } from '../../api/workoutService';

const { width } = Dimensions.get('window');

// --- UI HELPERS ---
const tagColorMap = {
    default: '#FFC107', chest: '#FF5252', glutes: '#FFA000', quadriceps: '#FFA000',
    shoulders: '#FF6B35', back: '#00C8C8', triceps: '#FF5252', biceps: '#9C27B0',
    core: '#2196F3', cardio: '#4CAF50',
};
const exerciseImageMap = {
    'Bench Press': require('../../assets/image/chest.jpg'),
    'Backward Lunge': require('../../assets/image/gultes.jpg'),
    'Arm Circles': require('../../assets/image/arm.jpg'),
    'Pull Up': require('../../assets/image/pullup.jpg'),
    'Pike Push-Up': require('../../assets/image/pickpush.jpg'),
    'Front raise': require('../../assets/image/frontraise.jpg'),
};

// Predefined exercises that will be used in the frontend
const predefinedExercises = [
  { name: 'Bench Press', type: 'chest', equipment: ['Barbell'], difficulty: 'Intermediate' },
  { name: 'Backward Lunge', type: 'glutes', equipment: ['Bodyweight'], difficulty: 'Beginner' },
  { name: 'Arm Circles', type: 'shoulders', equipment: ['Bodyweight'], difficulty: 'Beginner' },
  { name: 'Pull Up', type: 'back', equipment: ['Bodyweight'], difficulty: 'Intermediate' },
  { name: 'Pike Push-Up', type: 'shoulders', equipment: ['Bodyweight'], difficulty: 'Intermediate' },
  { name: 'Front raise', type: 'shoulders', equipment: ['Dumbbell'], difficulty: 'Intermediate' },
  // Add all your exercises here
];

const transformExerciseData = (exercise) => {
    const tagLabel = exercise.type || 'General';
    const tagKey = tagLabel.toLowerCase().split(',')[0];
    return {
        id: exercise.name, // Use name as ID since we're not fetching from DB
        title: exercise.name,
        type: exercise.type,
        tag: { label: tagLabel, color: tagColorMap[tagKey] || tagColorMap.default },
        image: exerciseImageMap[exercise.name] || require('../../assets/image/boy.jpg'),
        equipment: exercise.equipment || ['N/A'],
        difficulty: exercise.difficulty || 'Intermediate',
        favorite: false,
    };
};

// --- STATIC DATA ---
const categories = [ 
    { id: 'all', title: 'All' }, 
    { id: 'favorites', title: 'Favorites' }, 
    { id: 'cardio', title: 'Cardio' }, 
    { id: 'back', title: 'Back' }, 
    { id: 'chest', title: 'Chest' }, 
    { id: 'shoulders', title: 'Shoulders' }
];
const equipmentIcons = [ 
    { id: 1, source: require('../../assets/image/eq1.jpg') }, 
    { id: 2, source: require('../../assets/image/eq2.jpg') }, 
    { id: 3, source: require('../../assets/image/eq3.jpg') }, 
    { id: 4, source: require('../../assets/image/eq4.jpg') }, 
    { id: 5, source: require('../../assets/image/eq5.jpg') }, 
    { id: 6, source: require('../../assets/image/eq6.jpg') }
];

// --- SUB-COMPONENTS ---
const ExerciseItem = React.memo(({ item, isSelected, isFavorite, onSelect, onToggleFavorite }) => (
    <TouchableOpacity style={[styles.exerciseItemSelectable, isSelected && styles.selectedItem]} onPress={() => onSelect(item)}>
        <View style={styles.imageContainer}>
            <Image source={item.image} style={styles.exerciseImage} />
            <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{item.difficulty.substring(0, 1)}</Text>
            </View>
        </View>
        <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseTitleSelectable} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.tag, { backgroundColor: item.tag.color }]}>
                <Text style={styles.tagText}>{item.tag.label}</Text>
            </View>
            <View style={styles.metaRow}>
                <View style={styles.equipmentRow}>
                    {item.equipment.slice(0, 2).map((eq, idx) => (
                        <Text key={idx} style={styles.equipmentText}>
                            {eq}{idx < item.equipment.length - 1 && idx < 1 ? ', ' : ''}
                        </Text>
                    ))}
                    {item.equipment.length > 2 && (
                        <Text style={styles.equipmentText}>+{item.equipment.length - 2}</Text>
                    )}
                </View>
            </View>
        </View>
        <View style={styles.actionContainer}>
            {isSelected ? (
                <Icon name="checkmark-circle" size={26} color="#4CAF50" style={styles.actionIcon} />
            ) : (
                <View style={styles.spacer} />
            )}
            <TouchableOpacity style={styles.starButton} onPress={(e) => { 
                e.stopPropagation(); 
                onToggleFavorite(item.id); 
            }}>
                <Icon name={isFavorite ? "star" : "star-outline"} size={22} color="#FFC107" />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
));

// --- MAIN COMPONENT ---
const WorkoutLog = ({ navigation }) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [tempSelectedExercises, setTempSelectedExercises] = useState(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Initialize exercises with predefined exercises - no fetching from backend
    const [exercises, setExercises] = useState(predefinedExercises.map(transformExerciseData));

    const handleDoneSelecting = async () => {
        if (isSaving) return;
        const finalSelectedList = exercises.filter(ex => tempSelectedExercises.has(ex.id));
        if (finalSelectedList.length === 0) { 
            setIsSelecting(false); 
            return; 
        }
        setIsSaving(true);
        
        const sessionData = {
            workoutName: 'Custom Workout',
            workoutType: 'Strength Training',
            muscleGroups: [...new Set(finalSelectedList.flatMap(ex => ex.tag.label.split(', ')))],
            equipment: [...new Set(finalSelectedList.flatMap(ex => ex.equipment))],
            exercises: finalSelectedList.map(exercise => ({
                name: exercise.title,
                type: exercise.type,
                equipment: exercise.equipment,
                difficulty: exercise.difficulty,
            })),
            date: new Date().toISOString(),
        };

        try {
            const response = await logWorkoutSession(sessionData);
            console.log('Full session response:', JSON.stringify(response, null, 2));
            
            // Store the session ID
            setCurrentSessionId(response.id);
            
            // Create a map of exercise names to their database IDs
            const exerciseIdMap = {};
            if (response.logs && Array.isArray(response.logs)) {
                response.logs.forEach(log => {
                    if (log.exercise && log.exercise.name) {
                        exerciseIdMap[log.exercise.name] = {
                            dbId: log.exercise.id,
                            logId: log.id
                        };
                    }
                });
            }
            
            console.log('Exercise ID map:', exerciseIdMap);
            
            // Map the frontend exercises to include the database IDs
            const exercisesWithDbIds = finalSelectedList.map(frontendExercise => {
                const idInfo = exerciseIdMap[frontendExercise.title];
                if (idInfo) {
                    return {
                        ...frontendExercise,
                        dbId: idInfo.dbId,
                        logId: idInfo.logId
                    };
                } else {
                    console.error('No database ID found for exercise:', frontendExercise.title);
                    return frontendExercise;
                }
            });
            
            console.log('Exercises with DB IDs:', exercisesWithDbIds);
            setSelectedExercises(exercisesWithDbIds);
            Alert.alert('Success!', 'Your workout has been saved.');
            setIsSelecting(false);
        } catch (error) {
            console.error('Error saving workout:', error);
            Alert.alert('Error', 'Could not save your workout session.');
        } finally { 
            setIsSaving(false); 
        }
    };
    
    const handleAddExercise = () => {
        setTempSelectedExercises(new Set(selectedExercises.map(e => e.id)));
        setIsSelecting(true);
    };
    
    const toggleSelectExercise = (exercise) => { 
        const newSelection = new Set(tempSelectedExercises); 
        if (newSelection.has(exercise.id)) { 
            newSelection.delete(exercise.id); 
        } else { 
            newSelection.add(exercise.id); 
        } 
        setTempSelectedExercises(newSelection); 
    };
    
    // Function to remove a single exercise from the session
    const handleRemoveExercise = async (exercise) => {
        console.log('Attempting to remove exercise:', exercise);
        console.log('Exercise dbId:', exercise.dbId);
        console.log('Exercise logId:', exercise.logId);
        
        if (!currentSessionId) {
            // If no session exists, just remove from local state
            setSelectedExercises(prev => prev.filter(ex => ex.id !== exercise.id));
            return;
        }
        
        // Check if we have the database ID
        if (!exercise.dbId) {
            console.error('No database ID found for exercise:', exercise);
            Alert.alert('Error', 'Cannot remove exercise: missing database ID. Please refresh and try again.');
            return;
        }
        
        Alert.alert(
            'Remove Exercise',
            'Are you sure you want to remove this exercise from your workout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Deleting exercise with DB ID:', exercise.dbId);
                            await deleteExerciseFromSession(currentSessionId, exercise.dbId);
                            
                            // Remove from local state using the frontend ID
                            setSelectedExercises(prev => {
                                const updated = prev.filter(ex => ex.id !== exercise.id);
                                console.log('Updated exercises after removal:', updated);
                                return updated;
                            });
                            
                            Alert.alert('Success', 'Exercise removed from workout');
                        } catch (error) {
                            console.error('Error removing exercise:', error);
                            Alert.alert('Error', 'Could not remove exercise from workout');
                        }
                    }
                }
            ]
        );
    };
    
    // Function to delete the entire workout session
    const handleDeleteSession = async () => {
        if (!currentSessionId) {
            Alert.alert('Error', 'No session to delete');
            return;
        }
        
        Alert.alert(
            'Delete Workout',
            'Are you sure you want to delete this workout session?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteWorkoutSession(currentSessionId);
                            setSelectedExercises([]);
                            setCurrentSessionId(null);
                            Alert.alert('Success', 'Workout session deleted');
                        } catch (error) {
                            console.error('Error deleting workout:', error);
                            Alert.alert('Error', 'Could not delete workout session');
                        }
                    }
                }
            ]
        );
    };
    
    // Filter exercises based on search and category
    const filteredExercises = exercises.filter(ex => {
        const matchesCategory = selectedCategory === 'all' || 
            (selectedCategory === 'favorites' ? ex.favorite : ex.tag?.label?.toLowerCase().includes(selectedCategory));
        const matchesSearch = !searchText.trim() || 
            ex.title?.toLowerCase().includes(searchText.toLowerCase()) || 
            ex.tag?.label?.toLowerCase().includes(searchText.toLowerCase()) || 
            ex.equipment?.some(eq => eq.toLowerCase().includes(searchText.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (isSelecting) {
        return ( 
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#001f3f" />
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => setIsSelecting(false)} 
                        disabled={isSaving}
                    >
                        <Icon name="arrow-back" size={24} color="#FFC107" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Select Exercises</Text>
                    <TouchableOpacity 
                        style={styles.doneButton} 
                        onPress={handleDoneSelecting} 
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#001f3f" />
                        ) : (
                            <Text style={styles.doneButtonText}>Done</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="#FFC107" />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="Search..." 
                        placeholderTextColor="#aaa" 
                        value={searchText} 
                        onChangeText={setSearchText} 
                    />
                    {searchText ? (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Icon name="close-circle" size={20} color="#aaa" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <View style={styles.stickyCategories}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((cat) => (
                            <TouchableOpacity 
                                key={cat.id} 
                                style={styles.categoryTab} 
                                onPress={() => setSelectedCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.categoryText, 
                                    selectedCategory === cat.id && styles.categoryTextActive
                                ]}>
                                    {cat.title}
                                </Text>
                                {selectedCategory === cat.id && <View style={styles.underline} />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <FlatList 
                    data={filteredExercises} 
                    keyExtractor={(item) => item.id.toString()} 
                    renderItem={({ item }) => (
                        <ExerciseItem 
                            item={item} 
                            isSelected={tempSelectedExercises.has(item.id)} 
                            isFavorite={item.favorite} 
                            onSelect={toggleSelectExercise} 
                            onToggleFavorite={()=>{}} 
                        />
                    )} 
                    contentContainerStyle={styles.listContent} 
                    ItemSeparatorComponent={() => <View style={{ height: 8 }} />} 
                />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#001f3f" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.mainVideoContainer}>
                    <Video 
                        source={require('../../assets/video/2376809-hd_1920_1080_24fps.mp4')} 
                        style={styles.video} 
                        resizeMode="cover" 
                        repeat 
                        muted 
                    />
                    <View style={styles.videoOverlay} />
                    <View style={styles.videoContent}>
                        <View style={styles.workoutInfo}>
                            <Text style={styles.workoutTitle}>Hamstrings,{'\n'}Chest, Biceps</Text>
                            <View style={styles.createdInfo}>
                                <Text style={styles.createdText}>🔧 Custom Workout</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Equipment</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>6</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {equipmentIcons.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.equipmentItem}>
                                <View style={styles.equipmentIconContainer}>
                                    <Image source={item.source} style={styles.equipmentIcon} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{selectedExercises.length}</Text>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
                            <Text style={styles.addButtonText}>Add</Text>
                            <Text style={styles.addButtonIcon}>+</Text>
                        </TouchableOpacity>
                        {currentSessionId && (
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSession}>
                                <Icon name="trash-outline" size={20} color="#FF5252" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {selectedExercises.length === 0 ? (
                        <View style={styles.emptyExerciseContainer}>
                            <Icon name="barbell-outline" size={40} color="#FFC107" />
                            <Text style={styles.emptyExerciseText}>No exercises added yet.</Text>
                            <Text style={styles.emptyExerciseSubtext}>Tap 'Add' to build your workout.</Text>
                        </View>
                    ) : (
                        selectedExercises.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.exerciseItem}>
                                <View style={styles.exerciseImageContainer}>
                                    <Image source={item.image} style={styles.exerciseImageStyle} />
                                </View>
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseName}>{item.title}</Text>
                                    <Text style={styles.exerciseDetails}>{item.tag.label}</Text>
                                    {item.dbId && (
                                        <Text style={styles.debugText}>DB ID: {item.dbId.substring(0, 8)}...</Text>
                                    )}
                                </View>
                                <TouchableOpacity 
                                    style={styles.exerciseMenu} 
                                    onPress={() => handleRemoveExercise(item)}
                                >
                                    <Icon name="trash-outline" size={20} color="#FF5252" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>
            <TouchableOpacity
                style={[styles.startButton, selectedExercises.length === 0 && styles.disabledStartButton]}
                onPress={() => navigation.navigate('StartWorkout')}
                disabled={selectedExercises.length === 0}
            >
                <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
            <View style={styles.homeIndicator} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#001f3f' }, 
    scrollView: { flex: 1 }, 
    mainVideoContainer: { width: '100%', height: 420 }, 
    video: { ...StyleSheet.absoluteFillObject }, 
    videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' }, 
    videoContent: { ...StyleSheet.absoluteFillObject, padding: 24, justifyContent: 'flex-end' }, 
    workoutInfo: { flex: 1, justifyContent: 'flex-end' }, 
    workoutTitle: { fontSize: 36, fontWeight: 'bold', color: '#fff', lineHeight: 44, marginBottom: 16, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }, 
    createdInfo: { marginBottom: 16 }, 
    createdText: { color: '#FFC107', fontSize: 14, fontWeight: '500' }, 
    section: { paddingHorizontal: 20, paddingVertical: 20 }, 
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, 
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff', flex: 1 }, 
    badge: { backgroundColor: 'rgba(255, 193, 7, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.4)' }, 
    badgeText: { color: '#FFC107', fontSize: 12, fontWeight: '600' }, 
    addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 }, 
    addButtonText: { color: '#FFC107', fontSize: 16, fontWeight: '500' }, 
    addButtonIcon: { color: '#FFC107', fontSize: 18, fontWeight: '500' }, 
    deleteButton: { padding: 4 }, 
    equipmentItem: { marginRight: 12 }, 
    equipmentIconContainer: { width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.3)' }, 
    equipmentIcon: { width: '100%', height: '100%' }, 
    exerciseItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002b5c', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }, 
    exerciseImageContainer: { width: 60, height: 60, borderRadius: 12, marginRight: 16, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.1)' }, 
    exerciseImageStyle: { width: '100%', height: '100%' }, 
    exerciseInfo: { flex: 1 }, 
    exerciseName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 }, 
    exerciseDetails: { color: '#FFC107', fontSize: 14 }, 
    debugText: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10, marginTop: 2 }, 
    exerciseMenu: { padding: 8 }, 
    exerciseMenuIcon: { color: '#FFC107', fontSize: 18 }, 
    startButton: { backgroundColor: '#FFC107', marginHorizontal: 20, marginBottom: 20, paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 5 }, 
    disabledStartButton: { backgroundColor: '#555', elevation: 0 }, 
    startButtonText: { color: '#001f3f', fontSize: 18, fontWeight: '800' }, 
    homeIndicator: { width: 134, height: 5, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 3, alignSelf: 'center', marginBottom: 8 }, 
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 193, 7, 0.2)' }, 
    iconButton: { padding: 6 }, 
    headerText: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginHorizontal: 16 }, 
    doneButton: { backgroundColor: '#FFC107', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, minWidth: 70, alignItems: 'center', justifyContent: 'center' }, 
    doneButtonText: { color: '#001f3f', fontWeight: '700', fontSize: 16 }, 
    searchContainer: { flexDirection: 'row', backgroundColor: '#002b5c', margin: 16, borderRadius: 8, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.3)' }, 
    searchInput: { flex: 1, paddingVertical: 12, paddingLeft: 10, fontSize: 16, color: '#fff' }, 
    stickyCategories: { backgroundColor: '#001f3f', paddingLeft: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' }, 
    categoryTab: { marginRight: 24, paddingBottom: 10 }, 
    categoryText: { fontSize: 15, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }, 
    categoryTextActive: { color: '#FFC107' }, 
    underline: { width: '100%', height: 2, backgroundColor: '#FFC107', marginTop: 6, borderRadius: 1 }, 
    listContent: { paddingHorizontal: 16, paddingVertical: 16 }, 
    exerciseItemSelectable: { flexDirection: 'row', backgroundColor: '#002b5c', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 193, 7, 0.15)' }, 
    selectedItem: { borderColor: '#4CAF50', backgroundColor: '#00334d' }, 
    imageContainer: { width: 70, height: 70, borderRadius: 8, overflow: 'hidden', marginRight: 16 }, 
    exerciseImage: { width: '100%', height: '100%' }, 
    difficultyBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }, 
    difficultyText: { color: '#FFC107', fontSize: 12, fontWeight: '700' }, 
    exerciseTitleSelectable: { color: '#fff', fontWeight: '700', fontSize: 17, marginBottom: 6 }, 
    tag: { alignSelf: 'flex-start', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 10 }, 
    tagText: { fontSize: 12, color: '#001f3f', fontWeight: '700' }, 
    metaRow: { marginTop: 8 }, 
    equipmentRow: { flexDirection: 'row', flexWrap: 'wrap' }, 
    equipmentText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, marginRight: 4 }, 
    actionContainer: { marginLeft: 'auto', alignItems: 'center', justifyContent: 'space-between', height: '100%' }, 
    actionIcon: { marginBottom: 8 }, 
    spacer: { height: 34 }, 
    starButton: { padding: 6 }, 
    emptyExerciseContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: '#002b5c', borderRadius: 16 }, 
    emptyExerciseText: { marginTop: 16, color: '#FFFFFF', fontSize: 16, fontWeight: '600' }, 
    emptyExerciseSubtext: { marginTop: 4, color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 },
});

export default WorkoutLog;