import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";

// Screens
import MemberProfile from "../screens/MemberProfile"; // 👈 Profile creation/edit screen
import DietLog from "../screens/Member/DietLog";
import LoginScreen from "../screens/LoginScreen";
import WorkoutLog from "../screens/Member/WorkoutLog";
import BottomTabNavigator from "./BottomTabNavigator";


const Stack = createNativeStackNavigator();

// ✅ Splash screen while checking auth
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={{ marginTop: 15 }}>Loading...</Text>
  </View>
);

const AppNavigator = () => {
  const { isAuthenticated, hasProfile, loading } = useAuth();
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          hasProfile ? (
            // ✅ User authenticated + has profile → go to main app
            <>
              <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
              <Stack.Screen name="DietLog" component={DietLog} />
              <Stack.Screen name="WorkoutLog" component={WorkoutLog} />
              {/* <Stack.Screen name="WorkoutPlanDetail" component={WorkoutPlanDetail} /> */}
            </>
          ) : (
            // ✅ User authenticated but no profile → go to profile setup
            <Stack.Screen name="MemberProfile" component={MemberProfile} />
          )
        ) : (
          // ✅ User not logged in → login screen
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
