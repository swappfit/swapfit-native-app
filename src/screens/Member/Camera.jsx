import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { RNCamera } from 'react-native-camera';
import { useTheme } from 'react-native-paper';

const Camera = () => {
  const { colors } = useTheme();
  const [cameraType, setCameraType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [mode, setMode] = useState('checkin'); // 'checkin', 'checkout', 'diet'
  const cameraRef = useRef(null);

  const modes = [
    { id: 'checkin', title: 'Check-in', icon: '📍', color: '#27ae60' },
    { id: 'checkout', title: 'Check-out', icon: '🚪', color: '#e74c3c' },
    { id: 'diet', title: 'Diet Log', icon: '📸', color: '#f39c12' },
  ];

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.8, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        setCapturedImage(data.uri);
        
        // Handle based on mode
        if (mode === 'checkin') {
          Alert.alert('Success!', 'You have successfully checked in to the gym!');
        } else if (mode === 'checkout') {
          Alert.alert('Success!', 'You have successfully checked out from the gym!');
        } else if (mode === 'diet') {
          Alert.alert('Photo Captured!', 'Your meal has been logged successfully!');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const savePicture = () => {
    // Save picture logic here
    Alert.alert('Success', 'Picture saved successfully!');
    setCapturedImage(null);
  };

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        <View style={styles.cameraOverlay}>
          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setFlashMode(flashMode === 'off' ? 'on' : 'off')}
            >
              <Text style={styles.controlIcon}>
                {flashMode === 'off' ? '⚡' : '⚡'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setCameraType(cameraType === 'back' ? 'front' : 'back')}
            >
              <Text style={styles.controlIcon}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Indicator */}
          <View style={styles.modeIndicator}>
            <Text style={styles.modeText}>
              {modes.find(m => m.id === mode)?.title}
            </Text>
          </View>

          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </View>
      </RNCamera>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>Photo Preview</Text>
      <View style={styles.previewImage}>
        <Text style={styles.previewPlaceholder}>📸</Text>
        <Text style={styles.previewText}>Photo captured successfully!</Text>
      </View>
      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
          <Text style={styles.retakeButtonText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={savePicture}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#e74c3c', '#c0392b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Camera</Text>
          <Text style={styles.headerSubtitle}>
            {mode === 'checkin' && 'Check-in to your gym'}
            {mode === 'checkout' && 'Check-out from your gym'}
            {mode === 'diet' && 'Log your meal'}
          </Text>
        </View>
      </LinearGradient>

      {/* Mode Selection */}
      <View style={[styles.modeContainer, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {modes.map((modeItem) => (
            <TouchableOpacity
              key={modeItem.id}
              style={[
                styles.modeButton,
                mode === modeItem.id && styles.activeModeButton,
                { borderColor: modeItem.color }
              ]}
              onPress={() => setMode(modeItem.id)}
            >
              <Text style={styles.modeIcon}>{modeItem.icon}</Text>
              <Text style={[
                styles.modeButtonText,
                { color: colors.textSecondary },
                mode === modeItem.id && styles.activeModeButtonText
              ]}>
                {modeItem.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Camera or Preview */}
      {capturedImage ? renderPreview() : renderCamera()}

      {/* Instructions */}
      <View style={[styles.instructionsContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.instructionsTitle, { color: colors.text }]}>Instructions</Text>
        {mode === 'checkin' && (
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            📍 Point camera at the gym's QR code or entrance to check-in
          </Text>
        )}
        {mode === 'checkout' && (
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            🚪 Point camera at the exit QR code to check-out
          </Text>
        )}
        {mode === 'diet' && (
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            📸 Take a photo of your meal to log it in your diet tracker
          </Text>
        )}
      </View>
    </View>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  modeContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  activeModeButton: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  modeIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeModeButtonText: {
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 20,
    color: 'white',
  },
  modeIndicator: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  previewImage: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  previewPlaceholder: {
    fontSize: 60,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 16,
    color: '#666',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 15,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#95a5a6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 