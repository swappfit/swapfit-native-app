// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   TextInput,
//   FlatList,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useAuth } from '../../context/AuthContext';
// import dietService from '../../api/dietService';

// const colors = {
//   background: '#ffffff',
//   primary: '#10B981',
//   primaryText: '#ffffff',
//   text: '#333333',
//   textSecondary: '#6b7280',
//   error: '#d32f2f',
//   border: '#ddd',
// };

// const DietLog = () => {
//   const { token } = useAuth();
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [newLog, setNewLog] = useState({ meal: '', calories: '' });
//   const [updatingLogId, setUpdatingLogId] = useState(null);
//   const [updatingLogData, setUpdatingLogData] = useState({ meal: '', calories: '' });

//   // Fetch diet logs
//   const fetchLogs = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
//       const res = await dietService.getDietLogsByDate(token, today);
//       setLogs(res.data || []);
//     } catch (err) {
//       console.error(err);
//       setError('Failed to load diet logs.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Add new log
//   const addLog = async () => {
//     if (!newLog.meal || !newLog.calories) {
//       Alert.alert('Validation Error', 'Please provide meal and calories.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await dietService.addLog(token, newLog);
//       setNewLog({ meal: '', calories: '' });
//       await fetchLogs();
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to add diet log.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update existing log
//   const updateLog = async () => {
//     if (!updatingLogData.meal || !updatingLogData.calories) {
//       Alert.alert('Validation Error', 'Please provide meal and calories.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await dietService.updateLog(token, updatingLogId, updatingLogData);
//       setUpdatingLogId(null);
//       setUpdatingLogData({ meal: '', calories: '' });
//       await fetchLogs();
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to update diet log.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete log
//   const deleteLog = async (id) => {
//     Alert.alert('Confirm Delete', 'Are you sure you want to delete this entry?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           setLoading(true);
//           try {
//             await dietService.deleteLog(token, id);
//             await fetchLogs();
//           } catch (err) {
//             console.error(err);
//             Alert.alert('Error', 'Failed to delete diet log.');
//           } finally {
//             setLoading(false);
//           }
//         },
//       },
//     ]);
//   };

//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   if (loading) {
//     return (
//       <View style={[styles.container, styles.center]}>
//         <ActivityIndicator size="large" color={colors.primary} />
//         <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading diet logs...</Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={[styles.container, styles.center]}>
//         <Text style={{ color: colors.error, marginBottom: 10 }}>{error}</Text>
//         <TouchableOpacity onPress={fetchLogs} style={styles.retryButton}>
//           <Text style={styles.retryButtonText}>Try Again</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const renderLogItem = ({ item }) => (
//     <View style={styles.logCard}>
//       {updatingLogId === item.id ? (
//         <View style={styles.editContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Meal"
//             value={updatingLogData.meal}
//             onChangeText={(text) => setUpdatingLogData({ ...updatingLogData, meal: text })}
//           />
//           <TextInput
//             style={styles.input}
//             placeholder="Calories"
//             keyboardType="numeric"
//             value={updatingLogData.calories}
//             onChangeText={(text) => setUpdatingLogData({ ...updatingLogData, calories: text })}
//           />
//           <View style={styles.editActions}>
//             <TouchableOpacity style={styles.saveButton} onPress={updateLog}>
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.cancelButton}
//               onPress={() => setUpdatingLogId(null)}>
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <>
//           <Text style={styles.logText}>{item.meal}</Text>
//           <Text style={styles.logTextSecondary}>{item.calories} kcal</Text>
//           <View style={styles.logActions}>
//             <TouchableOpacity
//               onPress={() => {
//                 setUpdatingLogId(item.id);
//                 setUpdatingLogData({ meal: item.meal, calories: String(item.calories) });
//               }}>
//               <Icon name="edit" size={20} color={colors.primary} />
//             </TouchableOpacity>
//             <TouchableOpacity onPress={() => deleteLog(item.id)}>
//               <Icon name="delete" size={20} color={colors.error} />
//             </TouchableOpacity>
//           </View>
//         </>
//       )}
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.addLogContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Meal"
//           value={newLog.meal}
//           onChangeText={(text) => setNewLog({ ...newLog, meal: text })}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Calories"
//           keyboardType="numeric"
//           value={newLog.calories}
//           onChangeText={(text) => setNewLog({ ...newLog, calories: text })}
//         />
//         <TouchableOpacity style={styles.addButton} onPress={addLog}>
//           <Text style={styles.addButtonText}>Add</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={logs}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderLogItem}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: colors.background, padding: 16 },
//   center: { justifyContent: 'center', alignItems: 'center' },
//   retryButton: {
//     backgroundColor: colors.primary,
//     padding: 10,
//     borderRadius: 20,
//   },
//   retryButtonText: { color: colors.primaryText, fontWeight: 'bold' },
//   addLogContainer: {
//     marginBottom: 20,
//     borderRadius: 10,
//     backgroundColor: '#f8f8f8',
//     padding: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//   },
//   addButton: {
//     backgroundColor: colors.primary,
//     padding: 12,
//     borderRadius: 25,
//     alignItems: 'center',
//   },
//   addButtonText: { color: colors.primaryText, fontWeight: 'bold' },
//   logCard: {
//     padding: 15,
//     marginBottom: 12,
//     backgroundColor: '#f8f8f8',
//     borderRadius: 10,
//   },
//   logText: { fontSize: 16, color: colors.text, fontWeight: 'bold' },
//   logTextSecondary: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
//   logActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
//   editContainer: {},
//   editActions: { flexDirection: 'row', justifyContent: 'space-between' },
//   saveButton: {
//     backgroundColor: colors.primary,
//     padding: 10,
//     borderRadius: 20,
//     flex: 1,
//     marginRight: 5,
//     alignItems: 'center',
//   },
//   saveButtonText: { color: colors.primaryText, fontWeight: 'bold' },
//   cancelButton: {
//     backgroundColor: colors.error,
//     padding: 10,
//     borderRadius: 20,
//     flex: 1,
//     marginLeft: 5,
//     alignItems: 'center',
//   },
//   cancelButtonText: { color: colors.primaryText, fontWeight: 'bold' },
// });

// export default DietLog;
import React, {useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video'; // Make sure you have installed 'react-native-video'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Your original API service function is imported here
import { saveDietEntry } from '../../api/dietService';

const { width } = Dimensions.get('window');

const DietLog = ({ navigation }) => {
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

  const MealItem = ({ item, mealType }) => (
    <View style={styles.mealListItem}>
      <View style={styles.mealThumb}>
        {item.photo ? <Image source={{ uri: item.photo }} style={styles.mealImage} /> : <Text style={styles.mealPlaceholderIcon}>🍽</Text>}
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
      photo: meal.photo,
      mealType: mealType.toLowerCase(), // Ensure mealType is lowercase when editing
    });
    setEditMealId(meal.id);
    setModalVisible(true);
  };

  const handleDeleteMeal = (mealType, id) => {
    const item = meals[mealType].find(m => m.id === id);
    if (!item) return;
    Alert.alert(`Delete meal`, `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          setMeals(prev => ({
            ...prev,
            [mealType]: prev[mealType].filter(m => m.id !== id),
          }));
        },
      },
    ]);
  };
  
  const handleAddOrEditMeal = async () => {
    if (!form.mealName.trim() || !form.calories.trim()) {
      return Alert.alert('Validation Error', 'Please enter at least a meal name and calories.');
    }
    setLoading(true);

    const mealData = {
      id: editMealId || Date.now().toString(),
      name: form.mealName,
      calories: parseInt(form.calories) || 0,
      protein: parseInt(form.protein) || 0,
      carbs: parseInt(form.carbs) || 0,
      fats: parseInt(form.fats) || 0,
      photo: form.photo,
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

    try {
      // The API call will use `form` state which has the correct lowercase `mealType`
      const response = await saveDietEntry(form);

      if (response.success) {
        closeModal();
        Alert.alert('Success', 'Meal logged successfully! 🎉');
      } else {
        Alert.alert(
          'Warning', 
          'Meal added locally but failed to sync with server. ' + (response.message || 'Please try again later.')
        );
        closeModal();
      }
    } catch (error) {
      console.error('Save diet error:', error);
      Alert.alert(
        'Warning', 
        'Meal added locally but failed to sync. Please check your internet connection.'
      );
      closeModal();
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

  const pickImage = async (fromCamera = false) => {
    const options = { mediaType: 'photo', quality: 0.7 };
    const action = fromCamera ? launchCamera : launchImageLibrary;

    try {
        const result = await action(options);
        if (result.didCancel) return;
        if (result.assets && result.assets.length > 0) {
            handleFormInput('photo', result.assets[0].uri);
        } else {
            Alert.alert('Error', 'No photo was selected.');
        }
    } catch (error) {
        console.log('ImagePicker error:', error);
        Alert.alert('Error', 'Could not access camera or gallery.');
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
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}><Text style={styles.primaryBtnText}>+ Add Meal</Text></TouchableOpacity>
          <TouchableOpacity style={styles.ghostBtn} onPress={mockSyncWorkout}><Text style={styles.ghostBtnText}>Sync Workout</Text></TouchableOpacity>
        </View>

        {/* Meals Lists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {Object.keys(meals).map(mealType => (
            <View key={mealType} style={{ marginBottom: 12 }}>
              <View style={styles.mealHeaderRow}>
                <Text style={styles.mealHeaderTitle}>{mealType}</Text>
                <Text style={styles.mealHeaderCount}>{meals[mealType].length} items</Text>
              </View>
              {meals[mealType].length === 0 ? (
                <View style={styles.emptyMealRow}><Text style={styles.emptyMealText}>No items logged for {mealType}</Text></View>
              ) : (
                <FlatList data={meals[mealType]} keyExtractor={i => i.id} horizontal showsHorizontalScrollIndicator={false} renderItem={({ item }) => <MealItem item={item} mealType={mealType} />} />
              )}
            </View>
          ))}
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

              <TextInput placeholder="Food name" placeholderTextColor="#ccc" style={styles.input} value={form.mealName} onChangeText={(v) => handleFormInput('mealName', v)} />

              <View style={styles.rowInputs}>
                <TextInput placeholder="Calories" placeholderTextColor="#ccc" style={[styles.input,styles.smallInput]} value={form.calories} onChangeText={(v) => handleFormInput('calories', v)} keyboardType="numeric" />
                <TextInput placeholder="Protein (g)" placeholderTextColor="#ccc" style={[styles.input,styles.smallInput]} value={form.protein} onChangeText={(v) => handleFormInput('protein', v)} keyboardType="numeric" />
              </View>
              <View style={styles.rowInputs}>
                <TextInput placeholder="Carbs (g)" placeholderTextColor="#ccc" style={[styles.input,styles.smallInput]} value={form.carbs} onChangeText={(v) => handleFormInput('carbs', v)} keyboardType="numeric" />
                <TextInput placeholder="Fats (g)" placeholderTextColor="#ccc" style={[styles.input,styles.smallInput]} value={form.fats} onChangeText={(v) => handleFormInput('fats', v)} keyboardType="numeric" />
              </View>

              <View style={styles.photoRow}>
                <TouchableOpacity onPress={() => pickImage(false)} style={styles.photoBtn}><Text style={styles.photoBtnText}>Upload</Text></TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={styles.photoBtn}><Text style={styles.photoBtnText}>Take Photo</Text></TouchableOpacity>
                {form.photo ? <Image source={{uri:form.photo}} style={styles.photoPreview} /> : <View style={styles.photoPreviewPlaceholder}><Icon name="camera" color="#ccc" size={24} /></View>}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
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
});

export default DietLog;