import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';


const Training = () => {
  const navigation = useNavigation();
  const [showManualWorkoutModal, setShowManualWorkoutModal] = useState(false);
  const [loading, setLoading] = useState(false);


  // Manual workout form state
  const [manualWorkoutForm, setManualWorkoutForm] = useState({
    workoutType: '',
    exercises: [],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Workout type options
  const workoutTypes = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Legs',
    'Core',
    'Cardio',
    'Full Body',
    'Other'
  ];

  // Exercise options for different workout types
  const exerciseOptions = {
    'Chest': [
      'Bench Press', 'Incline Bench Press', 'Decline Bench Press',
      'Dumbbell Press', 'Incline Dumbbell Press', 'Decline Dumbbell Press',
      'Push-ups', 'Diamond Push-ups', 'Wide Push-ups',
      'Chest Flyes', 'Incline Flyes', 'Decline Flyes',
      'Cable Crossovers', 'Dips', 'Machine Chest Press'
    ],
    'Back': [
      'Pull-ups', 'Chin-ups', 'Lat Pulldowns', 'Barbell Rows',
      'Dumbbell Rows', 'T-Bar Rows', 'Cable Rows', 'Seated Rows',
      'Deadlifts', 'Romanian Deadlifts', 'Single-Arm Rows',
      'Face Pulls', 'Reverse Flyes', 'Shrugs'
    ],
    'Shoulders': [
      'Overhead Press', 'Military Press', 'Dumbbell Shoulder Press',
      'Arnold Press', 'Lateral Raises', 'Front Raises',
      'Rear Delt Flyes', 'Upright Rows', 'Shrugs',
      'Face Pulls', 'Cable Lateral Raises', 'Plate Raises'
    ],
    'Biceps': [
      'Barbell Curls', 'Dumbbell Curls', 'Hammer Curls',
      'Preacher Curls', 'Concentration Curls', 'Incline Curls',
      'Cable Curls', 'Spider Curls', '21s',
      'Zottman Curls', 'Cross-Body Hammer Curls', 'Standing Curls'
    ],
    'Triceps': [
      'Tricep Dips', 'Close-Grip Bench Press', 'Skull Crushers',
      'Tricep Pushdowns', 'Overhead Tricep Extensions', 'Diamond Push-ups',
      'Rope Pushdowns', 'Single-Arm Extensions', 'Bench Dips',
      'JM Press', 'Cable Kickbacks', 'Dumbbell Kickbacks'
    ],
    'Forearms': [
      'Wrist Curls', 'Reverse Wrist Curls', 'Hammer Curls',
      'Farmer\'s Walks', 'Plate Pinches', 'Dead Hangs',
      'Towel Pull-ups', 'Barbell Holds', 'Dumbbell Rotations',
      'Cable Wrist Curls', 'Reverse Curls', 'Zottman Curls'
    ],
    'Legs': [
      'Squats', 'Deadlifts', 'Leg Press', 'Lunges',
      'Romanian Deadlifts', 'Leg Extensions', 'Leg Curls',
      'Calf Raises', 'Hip Thrusts', 'Bulgarian Split Squats',
      'Step-ups', 'Box Jumps', 'Pistol Squats'
    ],
    'Core': [
      'Planks', 'Crunches', 'Russian Twists', 'Leg Raises',
      'Mountain Climbers', 'Bicycle Crunches', 'Ab Wheel Rollouts',
      'Side Planks', 'Dead Bugs', 'Bird Dogs',
      'Hollow Holds', 'L-Sits', 'Dragon Flags'
    ],
    'Cardio': [
      'Running', 'Cycling', 'Swimming', 'Rowing',
      'Elliptical', 'Jump Rope', 'Stair Climbing',
      'Walking', 'Hiking', 'Burpees', 'Mountain Climbers'
    ],
    'Full Body': [
      'Burpees', 'Thrusters', 'Wall Balls', 'Kettlebell Swings',
      'Box Jumps', 'Man Makers', 'Turkish Get-ups',
      'Clean and Press', 'Snatches', 'Deadlifts',
      'Squats', 'Push-ups', 'Pull-ups'
    ],
    'Other': [
      'Custom Exercise'
    ]
  };

  // Sets and reps options
  const setsOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  const repsOptions = Array.from({ length: 50 }, (_, i) => i + 1);



  // Manual workout functions
  const handleManualWorkoutInput = (key, value) => {
    setManualWorkoutForm(prev => ({ ...prev, [key]: value }));
  };

  const addExercise = () => {
    if (!manualWorkoutForm.workoutType) {
      Alert.alert('Select Workout Type', 'Please select a workout type first.');
      return;
    }
    
    const newExercise = {
      id: Date.now(),
      name: '',
      sets: 3,
      reps: 10,
      weight: '',
      duration: '',
    };
    
    setManualWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const updateExercise = (exerciseId, field, value) => {
    setManualWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.map(exercise =>
        exercise.id === exerciseId ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const removeExercise = (exerciseId) => {
    setManualWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  const handleSaveManualWorkout = async () => {
    if (!manualWorkoutForm.workoutType) {
      Alert.alert('Missing Information', 'Please select a workout type.');
      return;
    }
    
    if (manualWorkoutForm.exercises.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one exercise.');
      return;
    }

    // Validate exercises
    const invalidExercises = manualWorkoutForm.exercises.filter(exercise => !exercise.name);
    if (invalidExercises.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all exercise names.');
      return;
    }
    
    setLoading(true);
    try {
      const workoutData = {
        ...manualWorkoutForm,
        workoutName: `${manualWorkoutForm.workoutType} Workout`,
        duration: manualWorkoutForm.exercises.length * 5, // Estimate 5 minutes per exercise
      };
      
      const response = await saveWorkoutEntry(workoutData);
      if (response.success) {
        Alert.alert('Success', 'Manual workout saved successfully! 💪');
        setShowManualWorkoutModal(false);
        resetManualWorkoutForm();
      } else {
        Alert.alert('Error', response.message || 'Failed to save workout');
      }
    } catch (error) {
      console.error('Save manual workout error:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetManualWorkoutForm = () => {
    setManualWorkoutForm({
      workoutType: '',
      exercises: [],
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#ff6b6b', '#ee5a52']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Training & Workouts</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Training Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>💪 Training Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>12</Text>
              <Text style={styles.summaryLabel}>Workouts</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>8.5h</Text>
              <Text style={styles.summaryLabel}>Duration</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '42%' }]} />
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>45</Text>
              <Text style={styles.summaryLabel}>Exercises</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '90%' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton} 
              onPress={() => setShowManualWorkoutModal(true)}
            >
              <Text style={styles.quickActionIcon}>🏋️</Text>
              <Text style={styles.quickActionText}>Log Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionText}>View Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🎯</Text>
              <Text style={styles.quickActionText}>Goals</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={styles.activitiesCard}>
          <Text style={styles.cardTitle}>🏋️ Recent Workouts</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No workouts logged yet</Text>
            <Text style={styles.emptySubtext}>Start your training journey!</Text>
          </View>
        </View>
      </ScrollView>



      {/* Workout Modal */}
      <Modal visible={showManualWorkoutModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Workout</Text>
              <TouchableOpacity onPress={() => setShowManualWorkoutModal(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Workout Type Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Workout Type</Text>
                <View style={styles.optionsGrid}>
                  {workoutTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        manualWorkoutForm.workoutType === type && styles.selectedOption
                      ]}
                      onPress={() => handleManualWorkoutInput('workoutType', type)}
                    >
                      <Text style={[
                        styles.optionText,
                        manualWorkoutForm.workoutType === type && styles.selectedOptionText
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exercises Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Exercises</Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={addExercise}
                  >
                    <Text style={styles.addButtonText}>+ Add Exercise</Text>
                  </TouchableOpacity>
                </View>
                
                {manualWorkoutForm.exercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => removeExercise(exercise.id)}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Exercise Name */}
                    <View style={styles.exerciseField}>
                      <Text style={styles.fieldLabel}>Exercise Name</Text>
                      <View style={styles.optionsGrid}>
                        {exerciseOptions[manualWorkoutForm.workoutType]?.map((exerciseName) => (
                          <TouchableOpacity
                            key={exerciseName}
                            style={[
                              styles.optionButton,
                              exercise.name === exerciseName && styles.selectedOption
                            ]}
                            onPress={() => updateExercise(exercise.id, 'name', exerciseName)}
                          >
                            <Text style={[
                              styles.optionText,
                              exercise.name === exerciseName && styles.selectedOptionText
                            ]}>
                              {exerciseName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Sets and Reps */}
                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseField}>
                        <Text style={styles.fieldLabel}>Sets</Text>
                        <View style={styles.optionsGrid}>
                          {setsOptions.slice(0, 5).map((set) => (
                            <TouchableOpacity
                              key={set}
                              style={[
                                styles.optionButton,
                                exercise.sets === set && styles.selectedOption
                              ]}
                              onPress={() => updateExercise(exercise.id, 'sets', set)}
                            >
                              <Text style={[
                                styles.optionText,
                                exercise.sets === set && styles.selectedOptionText
                              ]}>
                                {set}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.exerciseField}>
                        <Text style={styles.fieldLabel}>Reps</Text>
                        <View style={styles.optionsGrid}>
                          {repsOptions.slice(0, 5).map((rep) => (
                            <TouchableOpacity
                              key={rep}
                              style={[
                                styles.optionButton,
                                exercise.reps === rep && styles.selectedOption
                              ]}
                              onPress={() => updateExercise(exercise.id, 'reps', rep)}
                            >
                              <Text style={[
                                styles.optionText,
                                exercise.reps === rep && styles.selectedOptionText
                              ]}>
                                {rep}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Weight and Duration */}
                    <View style={styles.exerciseRow}>
                      <View style={styles.exerciseField}>
                        <Text style={styles.fieldLabel}>Weight (kg)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Optional"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          value={exercise.weight}
                          onChangeText={(text) => updateExercise(exercise.id, 'weight', text)}
                        />
                      </View>
                      
                      <View style={styles.exerciseField}>
                        <Text style={styles.fieldLabel}>Duration (min)</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Optional"
                          placeholderTextColor="#999"
                          keyboardType="numeric"
                          value={exercise.duration}
                          onChangeText={(text) => updateExercise(exercise.id, 'duration', text)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Add workout notes..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={manualWorkoutForm.notes}
                  onChangeText={(text) => handleManualWorkoutInput('notes', text)}
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowManualWorkoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveManualWorkout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Workout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b6b',
    borderRadius: 2,
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionButton: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activitiesCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  inputHalf: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Manual Workout Modal Styles
  modalScrollView: {
    maxHeight: 400,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 5,
  },
  selectedOption: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff6b6b',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exerciseField: {
    marginBottom: 15,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default Training;
