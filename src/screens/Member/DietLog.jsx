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
<<<<<<< HEAD
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';
import { saveDietEntry, getDietLogsByDate } from '../../api/dietService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
=======
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useImageSelection } from '../../context/AuthContext';
import { saveDietEntry, getDietLogsByDate, updateDietLog, deleteDietLog } from '../../api/dietService';
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636

const { width } = Dimensions.get('window');

const DietLog = ({ navigation }) => {
<<<<<<< HEAD
=======
  // Get the image selection context
  const { isImageSelectionInProgress, setIsImageSelectionInProgress } = useImageSelection();
  
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editMealId, setEditMealId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
  const [form, setForm] = useState({
    mealName: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    photo: null,
<<<<<<< HEAD
    photoUrl: null,
    mealType: 'breakfast',
  });
  
  const isMountedRef = useRef(true);
  const navigationRef = useRef(navigation);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch today's diet logs
  useEffect(() => {
    fetchTodayLogs();
  }, []);

  const fetchTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await getDietLogsByDate(today);
      
      if (response.success && response.data) {
        const fetchedLogs = response.data.logs || [];
        
        const groupedLogs = {
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
          Breakfast: [],
          Lunch: [],
          Dinner: [],
          Snacks: [],
        };
        
<<<<<<< HEAD
        fetchedLogs.forEach(log => {
          const mealTypeKey = log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1);
          if (groupedLogs[mealTypeKey]) {
            groupedLogs[mealTypeKey].push({
              id: log.id,
              name: log.mealName,
              calories: log.calories,
              protein: log.protein || 0,
              carbs: log.carbs || 0,
              fats: log.fats || 0,
              photoUrl: log.photoUrl,
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
            });
          }
        });
        
<<<<<<< HEAD
        if (isMountedRef.current) {
          setMeals(groupedLogs);
        }
      }
    } catch (error) {
      console.error('Error fetching today logs:', error);
    }
  };
  
=======
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

>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
    if (isMountedRef.current) {
      setTotalCalories(cal);
      setTotalProtein(prot);
      setTotalCarbs(carb);
      setTotalFats(fat);
    }
=======
    setTotalCalories(cal);
    setTotalProtein(prot);
    setTotalCarbs(carb);
    setTotalFats(fat);
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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

<<<<<<< HEAD
  const MealItem = ({ item, mealType }) => (
    <View style={styles.mealListItem}>
      <View style={styles.mealThumb}>
        {item.photoUrl ? <Image source={{ uri: item.photoUrl }} style={styles.mealImage} /> : <Text style={styles.mealPlaceholderIcon}>🍽</Text>}
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
    if (isMountedRef.current) {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const resetForm = () => {
    if (isMountedRef.current) {
      setForm({
        mealName: '', 
        calories: '', 
        protein: '', 
        carbs: '', 
        fats: '', 
        photo: null, 
        photoUrl: null,
        mealType: 'breakfast',
      });
      setEditMealId(null);
    }
  };

  const openEditModal = (mealType, meal) => {
    if (isMountedRef.current) {
      setForm({
        mealName: meal.name,
        calories: meal.calories.toString(),
        protein: meal.protein.toString(),
        carbs: meal.carbs.toString(),
        fats: meal.fats.toString(),
        photo: null,
        photoUrl: meal.photoUrl,
        mealType: mealType.toLowerCase(),
      });
      setEditMealId(meal.id);
      setModalVisible(true);
    }
  };

  const handleDeleteMeal = (mealType, id) => {
    const item = meals[mealType].find(m => m.id === id);
    if (!item) return;
    Alert.alert(`Delete meal`, `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          if (isMountedRef.current) {
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
            setMeals(prev => ({
              ...prev,
              [mealType]: prev[mealType].filter(m => m.id !== id),
            }));
<<<<<<< HEAD
=======
            
            Alert.alert('Success', 'Meal deleted successfully!');
          } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to delete meal. Please try again.');
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
          }
        },
      },
    ]);
  };
  
  const handleAddOrEditMeal = async () => {
    if (!form.mealName.trim() || !form.calories.trim()) {
      return Alert.alert('Validation Error', 'Please enter at least a meal name and calories.');
    }
<<<<<<< HEAD
    
    if (isSaving) return;
    
    setIsSaving(true);
    setLoading(true);

    try {
      console.log('Starting meal save process...');
      
      // Upload image if there's a new photo
      let photoUrl = form.photoUrl;
      if (form.photo && !form.photoUrl) {
        console.log('Uploading new image...');
        setUploadingImage(true);
        
        try {
          photoUrl = await uploadToCloudinary(form.photo.uri);
          console.log('Image uploaded successfully:', photoUrl);
          
          if (isMountedRef.current) {
            setForm(prev => ({ ...prev, photoUrl }));
          }
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          Alert.alert('Upload Error', uploadError.message || 'Failed to upload image. Please try again.');
          setUploadingImage(false);
          setLoading(false);
          setIsSaving(false);
          return;
        } finally {
          if (isMountedRef.current) {
            setUploadingImage(false);
          }
        }
      }

      const mealData = {
        id: editMealId || Date.now().toString(),
        name: form.mealName,
        calories: parseInt(form.calories) || 0,
        protein: parseInt(form.protein) || 0,
        carbs: parseInt(form.carbs) || 0,
        fats: parseInt(form.fats) || 0,
        photoUrl: photoUrl,
      };
      
      const mealTypeKey = form.mealType.charAt(0).toUpperCase() + form.mealType.slice(1);

      const apiData = {
        mealName: form.mealName,
        calories: parseInt(form.calories) || 0,
        protein: parseInt(form.protein) || 0,
        carbs: parseInt(form.carbs) || 0,
        fats: parseInt(form.fats) || 0,
        mealType: form.mealType,
        photoUrl: photoUrl,
      };

      console.log('Saving diet entry to backend...');
      const response = await saveDietEntry(apiData);

      if (response.success) {
        console.log('Diet entry saved successfully');
        
        if (isMountedRef.current) {
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
          
          Alert.alert('Success', 'Meal logged successfully! 🎉', [
            { text: 'OK', onPress: () => closeModal() }
          ]);
        }
      } else {
        console.error('Backend error:', response.message);
        if (isMountedRef.current) {
          Alert.alert('Warning', 'Failed to save meal. ' + (response.message || 'Please try again later.'));
        }
      }
    } catch (error) {
      console.error('Save diet error:', error);
      if (isMountedRef.current) {
        Alert.alert('Error', 'Failed to save meal. ' + (error.message || 'Please try again.'));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setUploadingImage(false);
        setIsSaving(false);
      }
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    }
  };

  const closeModal = () => {
<<<<<<< HEAD
    if (!isSaving && !uploadingImage && isMountedRef.current) {
      setModalVisible(false);
      resetForm();
    }
=======
    setModalVisible(false);
    resetForm();
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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

<<<<<<< HEAD
  const pickImage = async (fromCamera = false) => {
    if (isSaving || uploadingImage) {
      console.log('Cannot pick image while saving or uploading');
      return;
    }
    
    // Check permissions for camera
    if (fromCamera) {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }
    }
    
    const options = { 
      mediaType: 'photo', 
      quality: 0.7,
      includeBase64: false,
      includeExtra: true,
    };
    
    try {
      console.log('Picking image from', fromCamera ? 'camera' : 'gallery');
      
      // Check if ImagePicker is available
      if (!ImagePicker || !ImagePicker.launchCamera || !ImagePicker.launchImageLibrary) {
        console.error('ImagePicker not properly imported');
        Alert.alert('Error', 'Image picker not available. Please restart the app.');
        return;
      }
      
      const result = await new Promise((resolve) => {
        const action = fromCamera ? ImagePicker.launchCamera : ImagePicker.launchImageLibrary;
        action(options, resolve);
      });
      
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (result.errorCode) {
        console.error('ImagePicker error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Could not access camera or gallery.');
        return;
      }
      
      if (result.assets && result.assets.length > 0) {
        console.log('Image selected:', result.assets[0]);
        if (isMountedRef.current) {
          setForm(prev => ({ 
            ...prev, 
            photo: result.assets[0],
            photoUrl: null 
          }));
        }
      } else {
        Alert.alert('Error', 'No photo was selected.');
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
      Alert.alert('Error', 'Could not access camera or gallery.');
    }
  };

=======
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

>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
        {/* Header */}
        <View style={styles.mainVideoContainer}>
          <View style={styles.videoPlaceholder}>
            <Icon name="food" size={60} color="#FFC107" />
          </View>
          <View style={styles.videoOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigationRef.current.goBack()}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
                <View style={styles.caloriesNumCol}>
                  <Text style={styles.caloriesValue}>{totalCalories}</Text>
                  <Text style={styles.caloriesLabel}>Food</Text>
                </View>
                <View style={styles.caloriesNumCol}>
                  <Text style={styles.caloriesValue}>{exerciseCalories}</Text>
                  <Text style={styles.caloriesLabel}>Exercise</Text>
                </View>
                <View style={styles.caloriesNumCol}>
                  <Text style={styles.caloriesValueRemaining}>{remainingCalories}</Text>
                  <Text style={styles.caloriesLabel}>Remaining</Text>
                </View>
=======
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValue}>{totalCalories}</Text><Text style={styles.caloriesLabel}>Food</Text></View>
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValue}>{exerciseCalories}</Text><Text style={styles.caloriesLabel}>Exercise</Text></View>
                <View style={styles.caloriesNumCol}><Text style={styles.caloriesValueRemaining}>{remainingCalories}</Text><Text style={styles.caloriesLabel}>Remaining</Text></View>
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
=======
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)} disabled={fetching}>
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
            <Text style={styles.primaryBtnText}>+ Add Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={mockSyncWorkout}>
            <Text style={styles.ghostBtnText}>Sync Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Meals Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
<<<<<<< HEAD
          {Object.keys(meals).map(mealType => (
            <View key={mealType} style={{ marginBottom: 12 }}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealHeaderTitle}>{mealType}</Text>
                <Text style={styles.mealHeaderCount}>{meals[mealType].length} items</Text>
              </View>
              {meals[mealType].length === 0 ? (
                <View style={styles.emptyMealRow}>
                  <Text style={styles.emptyMealText}>No items logged for {mealType}</Text>
                </View>
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
          ))}
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
        </View>
      </ScrollView>

      {/* Add/Edit Meal Modal */}
<<<<<<< HEAD
      <Modal 
        visible={modalVisible} 
        animationType="slide" 
        transparent
        onRequestClose={closeModal}
      >
=======
      <Modal visible={modalVisible} animationType="slide" transparent>
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editMealId ? 'Edit Meal' : 'Add Meal'}</Text>
              
<<<<<<< HEAD
=======
              {/* --- FIX APPLIED HERE --- */}
              {/* The onPress handler now converts the meal type to lowercase before saving it. */}
              {/* The style condition is also updated to work with a lowercase state value. */}
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
              <View style={styles.mealTypeRow}>
                {['Breakfast','Lunch','Dinner','Snacks'].map(t => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.mealTypeBtn, form.mealType === t.toLowerCase() && styles.mealTypeBtnActive]} 
                    onPress={() => handleFormInput('mealType', t.toLowerCase())}
<<<<<<< HEAD
                    disabled={isSaving || uploadingImage}
=======
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
                onChangeText={(v) => handleFormInput('mealName', v)}
                editable={!isSaving && !uploadingImage}
=======
                onChangeText={(v) => handleFormInput('mealName', v)} 
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
              />

              <View style={styles.rowInputs}>
                <TextInput 
                  placeholder="Calories" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.calories} 
                  onChangeText={(v) => handleFormInput('calories', v)} 
<<<<<<< HEAD
                  keyboardType="numeric"
                  editable={!isSaving && !uploadingImage}
=======
                  keyboardType="numeric" 
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
                />
                <TextInput 
                  placeholder="Protein (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.protein} 
                  onChangeText={(v) => handleFormInput('protein', v)} 
<<<<<<< HEAD
                  keyboardType="numeric"
                  editable={!isSaving && !uploadingImage}
=======
                  keyboardType="numeric" 
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
                />
              </View>
              <View style={styles.rowInputs}>
                <TextInput 
                  placeholder="Carbs (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.carbs} 
                  onChangeText={(v) => handleFormInput('carbs', v)} 
<<<<<<< HEAD
                  keyboardType="numeric"
                  editable={!isSaving && !uploadingImage}
=======
                  keyboardType="numeric" 
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
                />
                <TextInput 
                  placeholder="Fats (g)" 
                  placeholderTextColor="#ccc" 
                  style={[styles.input,styles.smallInput]} 
                  value={form.fats} 
                  onChangeText={(v) => handleFormInput('fats', v)} 
<<<<<<< HEAD
                  keyboardType="numeric"
                  editable={!isSaving && !uploadingImage}
=======
                  keyboardType="numeric" 
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
                />
              </View>

              <View style={styles.photoRow}>
<<<<<<< HEAD
                <TouchableOpacity 
                  onPress={() => pickImage(false)} 
                  style={[styles.photoBtn, (isSaving || uploadingImage) && styles.disabledBtn]}
                  disabled={isSaving || uploadingImage}
                >
                  <Text style={styles.photoBtnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => pickImage(true)} 
                  style={[styles.photoBtn, (isSaving || uploadingImage) && styles.disabledBtn]}
                  disabled={isSaving || uploadingImage}
                >
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
                {form.photo ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image source={{uri:form.photo.uri}} style={styles.photoPreview} />
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator color="#FFC107" size="small" />
                        <Text style={styles.uploadingText}>Uploading...</Text>
                      </View>
                    )}
                  </View>
                ) : form.photoUrl ? (
                  <Image source={{uri:form.photoUrl}} style={styles.photoPreview} />
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
                ) : (
                  <View style={styles.photoPreviewPlaceholder}>
                    <Icon name="camera" color="#ccc" size={24} />
                  </View>
                )}
              </View>

              <View style={styles.modalActions}>
<<<<<<< HEAD
                <TouchableOpacity 
                  style={[styles.cancelBtn, (isSaving || uploadingImage) && styles.disabledBtn]} 
                  onPress={closeModal}
                  disabled={isSaving || uploadingImage}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={handleAddOrEditMeal} 
                  disabled={isSaving || uploadingImage}
                >
                  {isSaving || uploadingImage ? 
                    <ActivityIndicator color="#001f3f" /> : 
                    <Text style={styles.saveBtnText}>{editMealId ? 'Save Changes' : 'Add Meal'}</Text>
                  }
=======
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrEditMeal} disabled={loading}>
                  {loading ? <ActivityIndicator color="#001f3f" /> : <Text style={styles.saveBtnText}>{editMealId ? 'Save Changes' : 'Add Meal'}</Text>}
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
  videoPlaceholder: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#002b5c', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
=======
  video: { ...StyleSheet.absoluteFillObject },
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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
<<<<<<< HEAD
  photoPreviewContainer: { position: 'relative' },
  photoPreview: { width: 56, height: 56, borderRadius: 10 },
  uploadingOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  uploadingText: { color: '#FFC107', fontSize: 10, marginTop: 4 },
=======
  photoPreview: { width: 56, height: 56, borderRadius: 10 },
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
  photoPreviewPlaceholder: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#002b5c', alignItems: 'center', justifyContent: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#002b5c', alignItems: 'center' },
  cancelBtnText: { color: '#ffffff', fontWeight: '700' },
  saveBtn: { flex: 1.5, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFC107', alignItems: 'center' },
  saveBtnText: { color: '#001f3f', fontWeight: '800' },
<<<<<<< HEAD
  disabledBtn: { opacity: 0.5 },
=======
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  loadingText: { color: '#aaa', marginTop: 10 },
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
});

export default DietLog;