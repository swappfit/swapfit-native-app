import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TrainerProfile = () => {
  const { colors } = useTheme();
  
  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.primary }]}>Profile Setup</Text>
      
      <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
      <TextInput 
        style={[styles.input, { 
          backgroundColor: colors.input, 
          borderColor: colors.inputBorder,
          color: colors.text 
        }]} 
        placeholder="Enter your name" 
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Gym/Business Name</Text>
      <TextInput 
        style={[styles.input, { 
          backgroundColor: colors.input, 
          borderColor: colors.inputBorder,
          color: colors.text 
        }]} 
        placeholder="Enter gym or business name" 
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Contact Details</Text>
      <TextInput 
        style={[styles.input, { 
          backgroundColor: colors.input, 
          borderColor: colors.inputBorder,
          color: colors.text 
        }]} 
        placeholder="Email or phone number" 
        keyboardType="email-address" 
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={[styles.label, { color: colors.text }]}>Verification</Text>
      <TextInput 
        style={[styles.input, { 
          backgroundColor: colors.input, 
          borderColor: colors.inputBorder,
          color: colors.text 
        }]} 
        placeholder="Enter verification code" 
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>Verify & Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    alignSelf: 'center',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    fontFamily: 'System',
    fontWeight: '400',
  },

button: {
  borderRadius: 50,
  paddingVertical: 10,
  paddingHorizontal: 22, // Adjust as needed
  marginTop: 25,
  alignItems: 'center',
  alignSelf: 'center', // Center the button horizontally
},

  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
});

export default TrainerProfile;
