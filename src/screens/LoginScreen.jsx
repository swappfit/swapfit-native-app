import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const colors = {
  background: '#ffffff',
  primary: '#10B981',
  primaryText: '#ffffff',
  textSecondary: '#6b7280',
  error: '#d32f2f',
};

const LoginScreen = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      Alert.alert('Login Error', err.message || 'Login failed');
    }
  };

  // 🚀 Redirect after login success
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MemberProfile' }], // or "MainTabs" if you want bottom tabs first
      });
    }
  }, [isAuthenticated, navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerText}>Welcome to Fitness Club</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.subtitleText, { color: colors.textSecondary }]}>
            {isAuthenticated ? "You're logged in!" : "Sign in to continue"}
          </Text>

          <TouchableOpacity 
            style={[styles.signInButton, { backgroundColor: colors.primary }]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.signInButtonText}>CONTINUE</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center' },
  header: { padding: 60, alignItems: 'center' }, 
  headerText: { color: '#fff', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitleText: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  formContainer: { flex: 1, justifyContent: 'center', padding: 30 }, 
  signInButton: { padding: 15, borderRadius: 25, alignItems: 'center', marginBottom: 20 }, 
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;
