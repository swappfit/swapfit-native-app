import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

const Activity = () => {
  const navigation = useNavigation();

  // Separate animated values for each card
  const [workoutScaleAnim] = useState(new Animated.Value(1));
  const [dietScaleAnim] = useState(new Animated.Value(1));

  // Separate paused states for each video, initially false to autoplay both
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [dietPaused, setDietPaused] = useState(false);

  // Google Fit states
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Heart rate states
  const [heartRate, setHeartRate] = useState(0);
  const [isMonitoringHeartRate, setIsMonitoringHeartRate] = useState(false);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const heartRateIntervalRef = useRef(null);

  // Sample stats data
  const [workoutStats, setWorkoutStats] = useState({
    sessionsCompleted: 12,
    caloriesBurned: 2847,
    weeklyGoal: 15,
    currentStreak: 5,
    steps: 0,
  });

  const [dietStats, setDietStats] = useState({
    caloriesConsumed: 1850,
    dailyGoal: 2200,
    proteinIntake: 125,
    waterIntake: 6,
  });

  // Initialize Google Fit on component mount
  useEffect(() => {
    checkGoogleFitConnection();
    
    return () => {
      if (heartRateIntervalRef.current) {
        clearInterval(heartRateIntervalRef.current);
      }
    };
  }, []);

  const checkGoogleFitConnection = async () => {
    try {
      const isAuthorized = await GoogleFit.isAuthorized();
      setIsGoogleFitConnected(isAuthorized);
      
      if (isAuthorized) {
        fetchTodayData();
      }
    } catch (error) {
      console.log('Error checking Google Fit connection:', error);
    }
  };

  const connectToGoogleFit = async () => {
    setIsConnecting(true);
    try {
      const options = {
        scopes: [
          Scopes.FITNESS_ACTIVITY_READ,
          Scopes.FITNESS_BODY_READ,
          Scopes.FITNESS_HEART_RATE_READ,
          Scopes.FITNESS_NUTRITION_READ,
        ],
      };

      const authorized = await GoogleFit.authorize(options);
      
      if (authorized) {
        setIsGoogleFitConnected(true);
        Alert.alert('Success', 'Connected to Google Fit successfully!');
        fetchTodayData();
      } else {
        Alert.alert('Failed', 'Failed to connect to Google Fit');
      }
    } catch (error) {
      console.error('Google Fit connection error:', error);
      Alert.alert('Error', 'An error occurred while connecting to Google Fit');
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchTodayData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's steps
      const stepsOptions = {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
      };
      
      const stepsResult = await GoogleFit.getDailyStepCountSamples(stepsOptions);
      if (stepsResult && stepsResult.length > 0) {
        const steps = stepsResult.reduce((total, day) => total + (day.steps || 0), 0);
        setWorkoutStats(prev => ({ ...prev, steps }));
      }

      // Get today's calories burned
      const caloriesOptions = {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        basalCalculation: true,
      };
      
      const caloriesResult = await GoogleFit.getDailyCalorieSamples(caloriesOptions);
      if (caloriesResult && caloriesResult.length > 0) {
        const calories = caloriesResult.reduce((total, day) => total + (day.calories || 0), 0);
        setWorkoutStats(prev => ({ ...prev, caloriesBurned: Math.round(calories) }));
      }

      // Get today's heart rate
      const heartRateOptions = {
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        dataType: 'heart_rate',
      };
      
      const heartRateResult = await GoogleFit.getHeartRateSamples(heartRateOptions);
      if (heartRateResult && heartRateResult.length > 0) {
        // Get the latest heart rate reading
        const latestReading = heartRateResult[heartRateResult.length - 1];
        setHeartRate(Math.round(latestReading.value));
      }
    } catch (error) {
      console.error('Error fetching data from Google Fit:', error);
    }
  };

  const startHeartRateMonitoring = async () => {
    if (!isGoogleFitConnected) {
      Alert.alert('Not Connected', 'Please connect to Google Fit first');
      return;
    }
    
    setIsMonitoringHeartRate(true);
    
    // Initial fetch
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
      
      const options = {
        startDate: fiveMinutesAgo.toISOString(),
        endDate: now.toISOString(),
        dataType: 'heart_rate',
      };
      
      const heartRateResult = await GoogleFit.getHeartRateSamples(options);
      
      if (heartRateResult && heartRateResult.length > 0) {
        // Get the latest heart rate reading
        const latestReading = heartRateResult[heartRateResult.length - 1];
        const newHeartRate = Math.round(latestReading.value);
        setHeartRate(newHeartRate);
        
        // Add to history
        setHeartRateHistory(prev => [
          { value: newHeartRate, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 9) // Keep only last 10 readings
        ]);
      }
    } catch (error) {
      console.error('Error fetching initial heart rate:', error);
    }
    
    // Set up interval for continuous monitoring
    heartRateIntervalRef.current = setInterval(async () => {
      try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);
        
        const options = {
          startDate: fiveMinutesAgo.toISOString(),
          endDate: now.toISOString(),
          dataType: 'heart_rate',
        };
        
        const heartRateResult = await GoogleFit.getHeartRateSamples(options);
        
        if (heartRateResult && heartRateResult.length > 0) {
          // Get the latest heart rate reading
          const latestReading = heartRateResult[heartRateResult.length - 1];
          const newHeartRate = Math.round(latestReading.value);
          setHeartRate(newHeartRate);
          
          // Add to history if it's different from the last reading
          setHeartRateHistory(prev => {
            if (prev.length === 0 || prev[0].value !== newHeartRate) {
              return [
                { value: newHeartRate, time: new Date().toLocaleTimeString() },
                ...prev.slice(0, 9) // Keep only last 10 readings
              ];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error monitoring heart rate:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  const stopHeartRateMonitoring = () => {
    setIsMonitoringHeartRate(false);
    if (heartRateIntervalRef.current) {
      clearInterval(heartRateIntervalRef.current);
      heartRateIntervalRef.current = null;
    }
  };

  const animatePress = (anim) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleWorkoutPress = () => {
    setWorkoutPaused((prev) => !prev);
    animatePress(workoutScaleAnim);
  };

  const handleDietPress = () => {
    setDietPaused((prev) => !prev);
    animatePress(dietScaleAnim);
  };

  const handleWorkoutLogPress = () => {
    navigation.navigate('WorkoutLog');
  };

  const handleDietLogPress = () => {
    navigation.navigate('DietLog');
  };

  const handleWorkoutStatsPress = () => {
    navigation.navigate('WorkoutStats');
  };

  const handleDietStatsPress = () => {
    navigation.navigate('DietStats');
  };

  // New handler for Ollama screen navigation
  const handleOllamaPress = () => {
    navigation.navigate('ollama');
  };

  const workoutProgress =
    (workoutStats.sessionsCompleted / workoutStats.weeklyGoal) * 100;
  const dietProgress = (dietStats.caloriesConsumed / dietStats.dailyGoal) * 100;

  return (
    <LinearGradient
      colors={['#001f3f', '#002b5c']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Fitness Journey</Text>
          <Text style={styles.headerSubtitle}>Track your progress daily</Text>
        </View>

        {/* Google Fit Connection Button */}
        <View style={styles.healthConnectionContainer}>
          <TouchableOpacity
            style={[
              styles.healthConnectionButton,
              isGoogleFitConnected && styles.connectedButton
            ]}
            onPress={connectToGoogleFit}
            disabled={isConnecting || isGoogleFitConnected}
          >
            <Text style={styles.healthConnectionButtonText}>
              {isConnecting ? 'Connecting...' : 
               isGoogleFitConnected ? 
               'Connected to Google Fit' : 
               'Connect to Google Fit'}
            </Text>
          </TouchableOpacity>
          
          {isGoogleFitConnected && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={fetchTodayData}
            >
              <Text style={styles.syncButtonText}>Sync Data</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Heart Rate Monitor Section */}
        <View style={styles.heartRateSection}>
          <View style={styles.heartRateHeader}>
            <Text style={styles.heartRateTitle}>Heart Rate Monitor</Text>
            <View style={[styles.statusIndicator, isMonitoringHeartRate && styles.activeIndicator]} />
          </View>
          
          <View style={styles.heartRateDisplay}>
            <View style={styles.heartRateValueContainer}>
              <Text style={styles.heartRateValue}>{heartRate || '--'}</Text>
              <Text style={styles.heartRateUnit}>BPM</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.heartRateButton,
                isMonitoringHeartRate ? styles.stopButton : styles.startButton
              ]}
              onPress={isMonitoringHeartRate ? stopHeartRateMonitoring : startHeartRateMonitoring}
              disabled={!isGoogleFitConnected}
            >
              <Text style={styles.heartRateButtonText}>
                {isMonitoringHeartRate ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Heart Rate History */}
          {heartRateHistory.length > 0 && (
            <View style={styles.heartRateHistoryContainer}>
              <Text style={styles.historyTitle}>Recent Readings</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {heartRateHistory.map((reading, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyValue}>{reading.value}</Text>
                    <Text style={styles.historyTime}>{reading.time}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Workout Card */}
        <Animated.View
          style={[styles.card, { transform: [{ scale: workoutScaleAnim }] }]}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleWorkoutPress}
            activeOpacity={0.9}
          >
            <Video
              source={require('../../assets/video/2376809-hd_1920_1080_24fps.mp4')}
              style={styles.video}
              muted={true}
              repeat={true}
              resizeMode="cover"
              paused={workoutPaused}
              playWhenInactive={true}
              ignoreSilentSwitch="ignore"
            />
            
            {/* Overlay to darken video behind text/buttons */}
            <View style={styles.contentOverlay} />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <View style={styles.workoutIcon}>
                    <View style={styles.iconInner} />
                  </View>
                </View>
                <Text style={styles.cardTitle}>Workout</Text>
              </View>

              <View style={styles.cardStats}>
                <Text style={styles.mainStat}>
                  {workoutStats.sessionsCompleted}/{workoutStats.weeklyGoal}
                </Text>
                <Text style={styles.statLabel}>Sessions this week</Text>
                <Text style={styles.subStat}>
                  {workoutStats.caloriesBurned} kcal burned • {workoutStats.steps} steps
                </Text>
              </View>

              <View style={styles.bottomSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(workoutProgress, 100)}%` },
                    ]}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleWorkoutLogPress}
                  >
                    <Text style={styles.buttonText}>Log Workout</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statsButton}
                    onPress={handleWorkoutStatsPress}
                  >
                    <Text style={styles.buttonText}>Stats</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Diet Card */}
        <Animated.View
          style={[styles.card, { transform: [{ scale: dietScaleAnim }] }]}
        >
          <TouchableOpacity
            style={styles.cardTouchable}
            onPress={handleDietPress}
            activeOpacity={0.9}
          >
            <Video
              source={require('../../assets/video/854082-hd_1920_1080_25fps.mp4')}
              style={styles.video}
              muted={true}
              repeat={true}
              resizeMode="cover"
              paused={dietPaused}
              playWhenInactive={true}
              ignoreSilentSwitch="ignore"
            />
          
            {/* Overlay to darken video behind text/buttons */}
            <View style={styles.contentOverlay} />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <View style={styles.dietIcon}>
                    <View style={styles.leafShape} />
                    <View style={styles.leafShape2} />
                  </View>
                </View>
                <Text style={styles.cardTitle}>Nutrition</Text>
              </View>

              <View style={styles.cardStats}>
                <Text style={styles.mainStat}>
                  {dietStats.caloriesConsumed}/{dietStats.dailyGoal}
                </Text>
                <Text style={styles.statLabel}>Calories today</Text>
                <Text style={styles.subStat}>
                  {dietStats.proteinIntake}g protein • {dietStats.waterIntake}/8
                  glasses
                </Text>
              </View>

              <View style={styles.bottomSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(dietProgress, 100)}%` },
                    ]}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleDietLogPress}
                  >
                    <Text style={styles.buttonText}>Log Meal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.statsButton}
                    onPress={handleDietStatsPress}
                  >
                    <Text style={styles.buttonText}>Stats</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Ollama Button - New Addition */}
        <View style={styles.ollamaContainer}>
          <TouchableOpacity
            style={styles.ollamaButton}
            onPress={handleOllamaPress}
          >
            <Text style={styles.ollamaButtonText}>Open Ollama</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Status */}
        <View style={styles.activityStatus}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[styles.statusDot, !workoutPaused && styles.activeDot]}
              />
              <Text style={styles.statusText}>Workout Active</Text>
            </View>
            <View style={styles.statusSeparator} />
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, !dietPaused && styles.activeDot]} />
              <Text style={styles.statusText}>Diet Tracking</Text>
            </View>
          </View>

          <View style={styles.streakContainer}>
            <Text style={styles.streakText}> {workoutStats.currentStreak} day streak</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  healthConnectionContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  healthConnectionButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    width: '90%',
    alignItems: 'center',
  },
  connectedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  healthConnectionButtonText: {
    color: '#FFC107',
    fontWeight: '600',
    fontSize: 16,
  },
  syncButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.4)',
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  syncButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 14,
  },
  heartRateSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heartRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartRateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeIndicator: {
    backgroundColor: '#FF5252',
    shadowColor: '#FF5252',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  heartRateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  heartRateValueContainer: {
    alignItems: 'center',
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  heartRateUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  heartRateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.4)',
  },
  heartRateButtonText: {
    color: '#FFC107',
    fontWeight: '600',
    fontSize: 14,
  },
  heartRateHistoryContainer: {
    marginTop: 10,
  },
  historyTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  historyItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    minWidth: 60,
  },
  historyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  historyTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  card: {
    height: height * 0.4,
    marginBottom: 30,
    borderRadius: 25,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  iconContainer: {
    alignItems: 'flex-start',
  },
  workoutIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ rotate: '45deg' }],
  },
  dietIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  leafShape: {
    width: 16,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ rotate: '-20deg' }],
  },
  leafShape2: {
    width: 16,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    position: 'absolute',
    transform: [{ rotate: '20deg' }],
  },
  cardStats: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mainStat: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#FFC107',
    marginBottom: 10,
    fontWeight: '600',
  },
  subStat: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  bottomSection: {
    alignItems: 'center',
  },
  progressBar: {
    width: '90%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.25)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    minWidth: 120,
    alignItems: 'center',
  },
  statsButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFC107',
    fontWeight: '600',
    fontSize: 14,
  },
  // New styles for Ollama button
  ollamaContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  ollamaButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.4)',
    width: '80%',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ollamaButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 16,
  },
  activityStatus: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  activeDot: {
    backgroundColor: '#FFC107',
    borderColor: '#FFA000',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  statusSeparator: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  streakContainer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakText: {
    color: '#FFC107',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Activity;