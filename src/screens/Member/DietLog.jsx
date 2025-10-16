import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useImageSelection } from '../../context/AuthContext';
import { saveDietEntry, getDietLogsByDate, updateDietLog, deleteDietLog } from '../../api/dietService';

const { width } = Dimensions.get('window');

const DietLog = ({ navigation }) => {
  // Get the image selection context
  const { isImageSelectionInProgress, setIsImageSelectionInProgress } = useImageSelection();
  
  // --- STATE MANAGEMENT ---
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFats, setTotalFats] = useState(0);
  const [exerciseCalories, setExerciseCalories] = useState(200);

  const [dailyCalorieGoal] = useState(2000);
  const [dailyProteinGoal] = useState(140);
  const [dailyCarbGoal] = useState(250);
  const [dailyFatGoal] = useState(70);

  const [meals, setMeals] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snacks: [],
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMealId, setEditMealId] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Add refs to track state that shouldn't trigger re-renders
  const isMounted = useRef(true);
  const appState = useRef(AppState.currentState);
  const appStateSubscription = useRef(null);
  
  // Track component mount/unmount
  useEffect(() => {
    console.log('DietLog component mounted');
    isMounted.current = true;
    
    // Add app state listener
    appStateSubscription.current = AppState.addEventListener('change', nextAppState => {
      console.log('AppState changed to', nextAppState);
      
      // If we're returning from background and we were in the middle of image selection,
      // we need to prevent any navigation or authentication refresh
      if (appState.current.match(/background/) && nextAppState === 'active' && isImageSelectionInProgress) {
        console.log('Returning from image selection, preventing unwanted navigation');
        // Set a flag to prevent auth refresh or navigation
        setIsImageSelectionInProgress(false);
        
        // Force the modal to stay open
        setTimeout(() => {
          if (isMounted.current) {
            setModalVisible(true);
          }
        }, 300);
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      console.log('DietLog component unmounting');
      isMounted.current = false;
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [isImageSelectionInProgress]);

  // --- FIX APPLIED HERE ---
  // The mealType is now initialized in lowercase to match the backend requirement.
  const [form, setForm] = useState({
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    photo: null,
    mealType: 'breakfast', // Default meal type is now lowercase
  });

  // Fetch today's diet logs
  const fetchTodayDietLogs = async () => {
    if (isImageSelectionInProgress) {
      console.log('Skipping fetchTodayDietLogs during image selection');
      return;
    }
    
    setFetching(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await getDietLogsByDate(today);
      
      if (response.success && response.data) {
        // FIX: Check the structure of the response data
        console.log('[DietLog] Response data structure:', response.data);
        
        // Transform the data to match our local state structure
        const transformedMeals = {
          Breakfast: [],
          Lunch: [],
          Dinner: [],
          Snacks: [],
        };
        
        // FIX: Handle different response structures
        const logsArray = response.data.logs || response.data || [];
        
        logsArray.forEach(log => {
          const mealType = log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1);
          if (transformedMeals[mealType]) {
            transformedMeals[mealType].push({
              id: log.id,
              name: log.mealName,
              calories: log.calories,
              protein: log.protein,
              carbs: log.carbs,
              fats: log.fats,
              // FIX: Ensure photo is a string or null
              photo: log.photoUrl || log.photo || null,
            });
          }
        });
        
        setMeals(transformedMeals);
      }
    } catch (error) {
      console.error('Error fetching diet logs:', error);
      Alert.alert('Error', 'Failed to fetch diet logs. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTodayDietLogs();
  }, []);

  useEffect(() => {
    let cal = 0, prot = 0, carb = 0, fat = 0;
    for (const mealType in meals) {
      meals[mealType].forEach(meal => {
        cal += parseInt(meal.calories) || 0;
        prot += parseInt(meal.protein) || 0;
        carb += parseInt(meal.carbs) || 0;
        fat += parseInt(meal.fats) || 0;
      });
    }
    setTotalCalories(cal);
    setTotalProtein(prot);
    setTotalCarbs(carb);
    setTotalFats(fat);
  }, [meals]);

  // --- HELPER COMPONENTS ---
  const MacroRow = ({ label, value, goal, color }) => {
    const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
    return (
      <View style={styles.macroRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.macroValue}>{value}/{goal}g</Text>
      </View>
    );
  };

  // FIX: Added proper image handling in MealItem
  const MealItem = ({ item, mealType }) => (
    <View style={styles.mealListItem}>
      <View style={styles.mealThumb}>
        {item.photo ? (
          <Image 
            source={{ uri: item.photo }} 
            style={styles.mealImage} 
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.mealPlaceholderIcon}>🍽</Text>
        )}
      </View>
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{item.name}</Text>
        <Text style={styles.mealStats}>{item.calories} kcal · {item.protein}P · {item.carbs}C · {item.fats}F</Text>
      </View>
      <View style={styles.mealActionIcons}>
        <TouchableOpacity onPress={() => openEditModal(mealType, item)} style={{ marginRight: 6 }}>
          <Icon name="pencil" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteMeal(mealType, item.id)}>
          <Icon name="delete" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- FUNCTIONS ---
  const handleFormInput = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // --- FIX APPLIED HERE ---
  // The reset function also sets the default mealType to lowercase.
  const resetForm = () => {
    setForm({
      mealName: '', calories: '', protein: '', carbs: '', fats: '', photo: null, mealType: 'breakfast',
    });
    setEditMealId(null);
  };

  const openEditModal = (mealType, meal) => {
    setForm({
      mealName: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString(),
      // FIX: Ensure photo is handled correctly
      photo: meal.photo ? { uri: meal.photo } : null,
      mealType: mealType.toLowerCase(), // Ensure mealType is lowercase when editing
    });
    setEditMealId(meal.id);
    setModalVisible(true);
  };

  const handleDeleteMeal = async (mealType, id) => {
    const item = meals[mealType].find(m => m.id === id);
    if (!item) return;
    
    Alert.alert(`Delete meal`, `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            // Delete from backend
            await deleteDietLog(id);
            
            // Update local state
            setMeals(prev => ({
              ...prev,
              [mealType]: prev[mealType].filter(m => m.id !== id),
            }));
            
            Alert.alert('Success', 'Meal deleted successfully!');
          } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to delete meal. Please try again.');
          }
        },
      },
    ]);
  };
  
  const handleAddOrEditMeal = async () => {
    if (!form.mealName.trim() || !form.calories.trim()) {
      return Alert.alert('Validation Error', 'Please enter at least a meal name and calories.');
    }
    setLoading(true);

    try {
      let response;
      
      if (editMealId) {
        // Update existing meal
        response = await updateDietLog(editMealId, form);
      } else {
        // Create new meal
        response = await saveDietEntry(form);
      }

      if (response.success) {
        // Create the meal data for local state
        const mealData = {
          id: editMealId || response.data?.id || Date.now().toString(),
          name: form.mealName,
          calories: parseInt(form.calories) || 0,
          protein: parseInt(form.protein) || 0,
          carbs: parseInt(form.carbs) || 0,
          fats: parseInt(form.fats) || 0,
          // FIX: Ensure photo is a string or null
          photo: response.data?.photo || response.data?.photoUrl || null,
        };
        
        // The mealType name needs to be capitalized for the local state object key
        const mealTypeKey = form.mealType.charAt(0).toUpperCase() + form.mealType.slice(1);

        if (editMealId) {
          setMeals(prev => ({
            ...prev,
            [mealTypeKey]: prev[mealTypeKey].map(item => 
              item.id === editMealId ? mealData : item
            ),
          }));
        } else {
          setMeals(prev => ({
            ...prev,
            [mealTypeKey]: [mealData, ...prev[mealTypeKey]],
          }));
        }

        closeModal();
        Alert.alert('Success', `Meal ${editMealId ? 'updated' : 'added'} successfully! 🎉`);
        
        // Refresh the diet logs after adding/updating
        fetchTodayDietLogs();
      } else {
        Alert.alert(
          'Warning', 
          response.message || 'Operation failed. Please try again later.'
        );
      }
    } catch (error) {
      console.error('Save diet error:', error);
      Alert.alert(
        'Warning', 
        'Operation failed. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  }

  // --- IMAGE PICKER LOGIC ---
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          { title: "Camera Permission", message: "We need access to your camera to take meal photos", buttonPositive: "OK" }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  // ✅ --- FIXED IMAGE PICKER FUNCTION --- ✅
  const pickImage = async (fromCamera = false) => {
    // Check if component is still mounted
    if (!isMounted.current) {
      console.error('Component is not mounted, aborting image selection');
      return;
    }
    
    // Set context flag to indicate we're starting image selection
    setIsImageSelectionInProgress(true);
    
    const options = { mediaType: 'photo', quality: 0.7 };
    const action = fromCamera ? launchCamera : launchImageLibrary;

    try {
        const result = await action(options);
        
        // Check if component is still mounted after async operation
        if (!isMounted.current) {
          console.error('Component was unmounted during image selection');
          setIsImageSelectionInProgress(false);
          return;
        }
        
        if (result.didCancel) {
          setIsImageSelectionInProgress(false);
          return;
        }
        
        if (result.assets && result.assets.length > 0) {
            handleFormInput('photo', result.assets[0]);
        } else {
            Alert.alert('Error', 'No photo was selected.');
        }
    } catch (error) {
        console.log('ImagePicker error:', error);
        Alert.alert('Error', 'Could not access camera or gallery.');
    } finally {
      // Reset the flag after a short delay to ensure app state change is processed
      setTimeout(() => {
        setIsImageSelectionInProgress(false);
        console.log('Image selection process completed');
      }, 500);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) pickImage(true);
  };

  const mockSyncWorkout = () => {
    const burned = 320; 
    setExerciseCalories(p => p + burned);
    Alert.alert('Workout synced', `${burned} kcal added to exercise`);
  };

  const remainingCalories = Math.max(dailyCalorieGoal - totalCalories + exerciseCalories, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001f3f" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Video Header */}
        <View style={styles.mainVideoContainer}>
          <Video 
            // source={require('../../assets/video/854082-hd_1920_1080_25fps.mp4')} 
            style={styles.video} 
            resizeMode="cover" 
            repeat 
            muted 
          />
          <View style={styles.videoOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.workoutTitle}>Fuel Your Gains</Text>
            <Text style={styles.workoutSubtitle}>Track calories & macros to achieve your goals</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRowWrapper}>
          <View style={styles.statsRow}>
            <View style={styles.caloriesCard}>
              <Text style={styles.cardHeading}>Calories</Text>
              <View style={styles.caloriesNumRow}>
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValue}>{totalCalories}</Text><Text style={styles.caloriesLabel}>Food</Text></View>
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValue}>{exerciseCalories}</Text><Text style={styles.caloriesLabel}>Exercise</Text></View>
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValueRemaining}>{remainingCalories}</Text><Text style={styles.caloriesLabel}>Remaining</Text></View>
              </View>
              <View style={styles.calorieProgressTrack}>
                <View style={[styles.calorieProgressFill, { width: `${dailyCalorieGoal > 0 ? Math.min(100, (totalCalories / dailyCalorieGoal) * 100) : 0}%` }]} />
              </View>
              <Text style={styles.calorieGoalText}>Goal {dailyCalorieGoal} kcal · Consumed {totalCalories} kcal</Text>
            </View>

            <View style={styles.macrosCard}>
              <Text style={styles.cardHeading}>Macros</Text>
              <MacroRow label="Carbs" value={totalCarbs} goal={dailyCarbGoal} color="#FFC107" />
              <MacroRow label="Protein" value={totalProtein} goal={dailyProteinGoal} color="#FFA000" />
              <MacroRow label="Fats" value={totalFats} goal={dailyFatGoal} color="#FF5722" />
            </View>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)} disabled={fetching}>
            <Text style={styles.primaryBtnText}>+ Add Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={mockSyncWorkout}>
            <Text style={styles.ghostBtnText}>Sync Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Meals Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {fetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFC107" />
              <Text style={styles.loadingText}>Loading meals...</Text>
            </View>
          ) : (
            Object.keys(meals).map(mealType => (
              <View key={mealType} style={{ marginBottom: 12 }}>
                <View style={styles.mealHeaderRow}>
                  <Text style={styles.mealHeaderTitle}>{mealType}</Text>
                  <Text style={styles.mealHeaderCount}>{meals[mealType].length} items</Text>
                </View>
                {meals[mealType].length === 0 ? (
                  <View style={styles.emptyMealRow}><Text style={styles.emptyMealText}>No items logged for {mealType}</Text></View>
                ) : (
                  <FlatList 
                    data={meals[mealType]} 
                    keyExtractor={i => i.id} 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    renderItem={({ item }) => <MealItem item={item} mealType={mealType} />} 
                  />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Meal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editMealId ? 'Edit Meal' : 'Add Meal'}</Text>
              
              {/* --- FIX APPLIED HERE --- */}
              {/* The onPress handler now converts the meal type to lowercase before saving it. */}
              {/* The style condition is also updated to work with a lowercase state value. */}
              <View style={styles.mealTypeRow}>
                {['Breakfast','Lunch','Dinner','Snacks'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.mealTypeBtn, form.mealType === t.toLowerCase() && styles.mealTypeBtnActive]} 
                    onPress={() => handleFormInput('mealType', t.toLowerCase())}
                  >
                    <Text style={[styles.mealTypeBtnText, form.mealType === t.toLowerCase() && styles.mealTypeBtnTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                placeholder="Food name" 
                placeholderTextColor="#ccc" 
                style={styles.input} 
                value={form.mealName} 
                onChangeText={(v) => handleFormInput('mealName', v)} 
              />

              <View style={styles.rowInputs}>
                <TextInput 
                  placeholder="Calories" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.calories} 
                  onChangeText={(v) => handleFormInput('calories', v)} 
                  keyboardType="numeric" 
                />
                <TextInput 
                  placeholder="Protein (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.protein} 
                  onChangeText={(v) => handleFormInput('protein', v)} 
                  keyboardType="numeric" 
                />
              </View>
              <View style={styles.rowInputs}>
                <TextInput 
                  placeholder="Carbs (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.carbs} 
                  onChangeText={(v) => handleFormInput('carbs', v)} 
                  keyboardType="numeric" 
                />
                <TextInput 
                  placeholder="Fats (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.fats} 
                  onChangeText={(v) => handleFormInput('fats', v)} 
                  keyboardType="numeric" 
                />
              </View>

              <View style={styles.photoRow}>
                <TouchableOpacity onPress={() => pickImage(false)} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={styles.photoBtn}>
                  <Text style={styles.photoBtnText}>Take Photo</Text>
                </TouchableOpacity>
                {form.photo ? (
                  <Image 
                    source={{ uri: form.photo.uri }} 
                    style={styles.photoPreview} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPreviewPlaceholder}>
                    <Icon name="camera" color="#ccc" size={24} />
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrEditMeal} disabled={loading}>
                  {loading ? <ActivityIndicator color="#001f3f" /> : <Text style={styles.saveBtnText}>{editMealId ? 'Save Changes' : 'Add Meal'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001f3f' },
  mainVideoContainer: { width: '100%', height: 250 },
  video: { ...StyleSheet.absoluteFillObject },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,31,57,0.6)', padding: 16, justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 16, left: 16, padding: 8 },
  workoutTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 6, marginTop: 40 },
  workoutSubtitle: { color: '#FFC107', fontSize: 14, fontWeight: '500' },
  statsRowWrapper: { paddingHorizontal: 16, marginTop: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  caloriesCard: { flex: 1, backgroundColor: '#002b5c', borderRadius: 16, padding: 12, marginRight: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  cardHeading: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  caloriesNumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  caloriesNumCol: { alignItems: 'center' },
  caloriesValue: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  caloriesValueRemaining: { color: '#FFC107', fontSize: 18, fontWeight: 'bold' },
  caloriesLabel: { color: '#aaa', fontSize: 12 },
  calorieProgressTrack: { backgroundColor: 'rgba(0,0,0,0.2)', height: 6, borderRadius: 3, marginVertical: 8 },
  calorieProgressFill: { height: 6, borderRadius: 3, backgroundColor: '#FFC107' },
  calorieGoalText: { color: '#aaa', fontSize: 10, marginTop: 2 },
  macrosCard: { flex: 1, backgroundColor: '#002b5c', borderRadius: 16, padding: 12, marginLeft: 8 },
  macroRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  macroLabel: { color: '#aaa', fontSize: 14, width: 60 },
  progressBarBackground: { flex: 1, height: 6, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 3, marginHorizontal: 8 },
  progressBarFill: { height: 6, borderRadius: 3 },
  macroValue: { color: '#aaa', fontSize: 12, width: 60, textAlign: 'right' },
  actionRow: { paddingHorizontal: 16, marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  primaryBtn: { backgroundColor: '#FFC107', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#FFC107', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryBtnText: { color: '#001f3f', fontWeight: '800', fontSize: 14 },
  ghostBtn: { backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#003b7c', marginLeft: 12, alignItems: 'center' },
  ghostBtnText: { color: '#aaa', fontWeight: '700' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 10 },
  mealHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mealHeaderTitle: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  mealHeaderCount: { color: '#aaa', fontWeight: '700' },
  emptyMealRow: { backgroundColor: '#002b5c', padding: 12, borderRadius: 10, height: 90, justifyContent: 'center', alignItems: 'center' },
  emptyMealText: { color: '#aaa' },
  mealListItem: { backgroundColor: '#002b5c', borderRadius: 12, padding: 10, marginRight: 12, width: width * 0.75, flexDirection: 'row', alignItems: 'center' },
  mealThumb: { width: 70, height: 70, borderRadius: 14, overflow: 'hidden', backgroundColor: '#001f3f', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  mealImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  mealPlaceholderIcon: { fontSize: 26, color: '#aaa' },
  mealInfo: { flex: 1 },
  mealName: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  mealStats: { color: '#aaa', marginTop: 4, fontSize: 12, fontWeight: '600' },
  mealActionIcons: { flexDirection: 'row', paddingLeft: 10 },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: '#001f3f', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 20 },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  mealTypeRow: { flexDirection: 'row', marginBottom: 16, justifyContent: 'center' },
  mealTypeBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#002b5c', marginRight: 8 },
  mealTypeBtnActive: { backgroundColor: '#FFC107' },
  mealTypeBtnText: { color: '#aaa', fontWeight: '700', fontSize: 12 },
  mealTypeBtnTextActive: { color: '#001f3f' },
  input: { backgroundColor: '#002b5c', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, color: '#ffffff', marginBottom: 10, fontSize: 14 },
  smallInput: { flex: 1 },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  photoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  photoBtn: { backgroundColor: '#002b5c', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10 },
  photoBtnText: { color: '#FFC107', fontWeight: '700' },
  photoPreview: { width: 56, height: 56, borderRadius: 10 },
  photoPreviewPlaceholder: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#002b5c', alignItems: 'center', justifyContent: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#002b5c', alignItems: 'center' },
  cancelBtnText: { color: '#ffffff', fontWeight: '700' },
  saveBtn: { flex: 1.5, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFC107', alignItems: 'center' },
  saveBtnText: { color: '#001f3f', fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  loadingText: { color: '#aaa', marginTop: 10 },
});

export default DietLog;