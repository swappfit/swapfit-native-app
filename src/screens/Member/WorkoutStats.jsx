// WorkoutStats.js — Premium Real-World UI — CLEANED & ERROR-FIXED

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const WorkoutStats = () => {
  const [activeTab, setActiveTab] = useState("Week");

  // Data
  const weekData = [320, 280, 400, 500, 350, 600, 450];
  const monthData = [1200, 1500, 1800, 1600];
  const allTimeData = [10000, 12000, 15000, 20000];

  const recentWorkouts = [
    { id: 1, date: "10 Sep", type: "Cardio", duration: "45 min", calories: 320 },
    { id: 2, date: "09 Sep", type: "Strength", duration: "1 hr", calories: 500 },
    { id: 3, date: "08 Sep", type: "Yoga", duration: "30 min", calories: 150 },
    { id: 4, date: "07 Sep", type: "HIIT", duration: "25 min", calories: 400 },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#001f3f",
    backgroundGradientTo: "#002b5c",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: "#0a1a2f" },
  };

  const getData = () => {
    switch (activeTab) {
      case "Week":
        return weekData;
      case "Month":
        return monthData;
      default:
        return allTimeData;
    }
  };

  const getLabels = () => {
    switch (activeTab) {
      case "Week":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "Month":
        return ["W1", "W2", "W3", "W4"];
      default:
        return ["2022", "2023", "2024", "2025"];
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <Text style={styles.header}>Workout Stats</Text>

      {/* Stats Overview — Dashboard Style */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>5,200</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Monthly Goal</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: "72%" }]} />
        </View>
        <Text style={styles.progressText}>72% complete — 2,800 cal to go</Text>
      </View>

      {/* Chart Tabs */}
      <View style={styles.tabBar}>
        {["Week", "Month", "All Time"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart — ✅ FIXED HERE */}
      <View style={[styles.card, { padding: 16 }]}>
        <BarChart
          data={{
            labels: getLabels(),
            datasets: [{ data: getData() }], // ✅ FIXED: Added "data:" key
          }}
          width={screenWidth - 48}
          height={200}
          yAxisSuffix=" cal"
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars={false}
        />
      </View>

      {/* Recent Workouts */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <FlatList
          data={recentWorkouts}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.workoutRow}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutDate}>{item.date}</Text>
                <Text style={styles.workoutName}>{item.type}</Text>
              </View>
              <View style={styles.workoutMeta}>
                <Text style={styles.workoutCalories}>{item.calories} cal</Text>
                <Text style={styles.workoutDuration}>{item.duration}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001f3f",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginVertical: 24,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#002b5c",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFC107",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#d1d5db",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#002b5c",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#1a365d",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFC107",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#002b5c",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#FFC107",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#d1d5db",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#001f3f",
    fontWeight: "700",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  workoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 2,
  },
  workoutName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  workoutMeta: {
    alignItems: "flex-end",
  },
  workoutCalories: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFC107",
  },
  workoutDuration: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
});

export default WorkoutStats;