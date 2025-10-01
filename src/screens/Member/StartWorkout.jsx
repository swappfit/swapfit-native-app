// StartWorkout.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';

// Animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const StartWorkout = ({ navigation, route }) => {
  // optional route.params could contain workout info (title, duration)
  const workoutTitle = route?.params?.title ?? 'Full Body Strength';
  const targetMinutes = route?.params?.minutes ?? 45; // default target 45 minutes
  const targetDuration = targetMinutes * 60; // in seconds

  const [time, setTime] = useState(0); // elapsed seconds
  const [isRunning, setIsRunning] = useState(false);

  // Animated progress between 0 and 1
  const progressAnim = useRef(new Animated.Value(0)).current;

  // interval ref for clearing
  const timerRef = useRef(null);

  useEffect(() => {
    // update the animated progress whenever time changes
    const rawProgress = Math.min(time / targetDuration, 1);
    Animated.timing(progressAnim, {
      toValue: rawProgress,
      duration: 250,
      useNativeDriver: false, // SVG props don't support native driver
    }).start();
  }, [time, progressAnim, targetDuration]);

  useEffect(() => {
    // clean up on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      // start interval
      timerRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else {
      // paused => clear interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  const radius = 110;
  const strokeWidth = 12;
  const size = radius * 2 + strokeWidth * 2; // overall svg size
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // strokeDashoffset derived from animated progress: offset = circumference * (1 - progress)
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const timeRemaining = Math.max(targetDuration - time, 0);

  const handleStartPause = () => {
    setIsRunning((p) => !p);
  };

  const handleReset = () => {
    Alert.alert('Reset Workout', 'Do you want to reset the timer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          setIsRunning(false);
          setTime(0);
        },
      },
    ]);
  };

  const handleEnd = () => {
    // Confirm and navigate to WorkoutLog (or whichever screen you use)
    Alert.alert('End Workout', 'Are you sure you want to end this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End',
        style: 'destructive',
        onPress: () => {
          setIsRunning(false);
          // you might want to pass data (duration, calories, exercises) to the log
          navigation.navigate('WorkoutLog', { duration: time });
        },
      },
    ]);
  };

  const handleSkipExercise = () => {
    // placeholder to skip — implement your exercise flow
    Alert.alert('Skip', 'Next exercise (implement your own flow).');
  };

  return (
    <LinearGradient colors={['#001f3f', '#002b5c']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={26} color="#FFC107" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Start Workout</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Circular progress + timer */}
        <View style={styles.centerArea}>
          <View style={styles.svgWrap}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
              {/* background circle */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* animated progress circle */}
              <AnimatedCircle
                cx={center}
                cy={center}
                r={radius}
                stroke="#FFC107"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
              />
            </Svg>

            {/* Timer text on top */}
            <View style={styles.timerOverlay}>
              <Text style={styles.timerValue}>{formatTime(time)}</Text>
              <Text style={styles.timerSub}>
                {time >= targetDuration ? 'Goal reached' : `${targetMinutes} min target • ${formatTime(timeRemaining)} left`}
              </Text>
            </View>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{workoutTitle}</Text>
          <Text style={styles.infoSubtitle}>
            {targetMinutes} min • {Math.max(Math.round((time / 60) * 10) / 10, 0)} min elapsed
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isRunning ? styles.pauseBtn : styles.startBtn]}
            onPress={handleStartPause}
            activeOpacity={0.85}
          >
            <Icon name={isRunning ? 'pause' : 'play'} size={20} color={isRunning ? '#fff' : '#001f3f'} />
            <Text style={[styles.controlText, isRunning ? { color: '#fff' } : { color: '#001f3f' }]}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.neutralBtn]} onPress={handleSkipExercise}>
            <Icon name="skip-forward" size={20} color="#fff" />
            <Text style={[styles.controlText, { color: '#fff' }]}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.endBtn]} onPress={handleEnd}>
            <Icon name="stop" size={20} color="#fff" />
            <Text style={[styles.controlText, { color: '#fff' }]}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Reset button */}
        <View style={styles.bottomRow}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Icon name="refresh" size={18} color="#FFC107" />
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default StartWorkout;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFC107', fontSize: 18, fontWeight: '700' },

  centerArea: {
    alignItems: 'center',
    marginTop: 12,
  },
  svgWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 36,
    color: '#fff',
    fontWeight: '800',
  },
  timerSub: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 26,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  infoTitle: { color: '#FFC107', fontSize: 16, fontWeight: '700' },
  infoSubtitle: { color: 'rgba(255,255,255,0.85)', marginTop: 6 },

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginHorizontal: 10,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
    minWidth: 98,
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  startBtn: {
    backgroundColor: '#FFC107',
  },
  pauseBtn: {
    backgroundColor: '#e74c3c',
  },
  neutralBtn: {
    backgroundColor: '#1f2f44',
  },
  endBtn: {
    backgroundColor: '#444',
  },
  controlText: {
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },

  bottomRow: {
    marginTop: 24,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  resetText: {
    color: '#FFC107',
    marginLeft: 8,
    fontWeight: '700',
  },
});
