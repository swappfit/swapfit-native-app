import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
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

  // Sample stats data
  const [workoutStats] = useState({
    sessionsCompleted: 12,
    caloriesBurned: 2847,
    weeklyGoal: 15,
    currentStreak: 5,
  });

  const [dietStats] = useState({
    caloriesConsumed: 1850,
    dailyGoal: 2200,
    proteinIntake: 125,
    waterIntake: 6,
  });

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
            
            {/* 👇 Overlay to darken video behind text/buttons */}
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
                  {workoutStats.caloriesBurned} kcal burned
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
          
            {/* 👇 Overlay to darken video behind text/buttons */}
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
    marginBottom: 30,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 👈 Dark transparent overlay for better contrast
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    padding: 25,
    justifyContent: 'space-between',
    zIndex: 2, // 👈 Ensure content is above overlay
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