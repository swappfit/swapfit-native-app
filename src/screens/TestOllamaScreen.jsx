import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  PermissionsAndroid
} from 'react-native';
import { generateText } from '../api/ollama';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useImageSelection } from '../context/AuthContext'; // Import the context
import { useAuth } from '../context/AuthContext'; // Import auth context

const { width, height } = Dimensions.get('window');

export default function TestOllamaScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Use the image selection context
  const { isImageSelectionInProgress, setIsImageSelectionInProgress } = useImageSelection();
  const { userProfile, isAuthenticated } = useAuth(); // Get auth state

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Animate elements on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
      image: selectedImage,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await generateText(
        inputText.trim() || "What do you see in this image?", 
        imageToSend
      );
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `⚠️ Error: ${error.message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSelectedImage(null);
  };

  const pickImage = () => {
    Alert.alert(
      "Select Image",
      "Choose an option",
      [
        { text: "📷 Take Photo", onPress: () => openCamera() },
        { text: "🖼️ Choose from Gallery", onPress: () => openGallery() },
        { text: "❌ Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async () => {
    try {
      // Set image selection in progress to prevent redirects
      setIsImageSelectionInProgress(true);
      
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission to access camera is required!");
        setIsImageSelectionInProgress(false);
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      });

      if (!result.didCancel && result.assets) {
        setSelectedImage(result.assets[0]);
      }
      
      // Reset image selection state
      setIsImageSelectionInProgress(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
      setIsImageSelectionInProgress(false);
    }
  };

  const openGallery = async () => {
    try {
      // Set image selection in progress to prevent redirects
      setIsImageSelectionInProgress(true);
      
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      });

      if (!result.didCancel && result.assets) {
        setSelectedImage(result.assets[0]);
      }
      
      // Reset image selection state
      setIsImageSelectionInProgress(false);
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
      setIsImageSelectionInProgress(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const renderMessage = (message) => (
    <Animated.View 
      key={message.id} 
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.botMessage,
        { opacity: fadeAnim }
      ]}
    >
      <View style={[
        styles.messageBubble,
        message.isUser ? styles.userBubble : styles.botBubble
      ]}>
        {message.image && (
          <Image 
            source={{ uri: message.image.uri }} 
            style={styles.messageImage}
            resizeMode="cover"
          />
        )}
        <Text style={[
          styles.messageText,
          message.isUser ? styles.userText : styles.botText
        ]}>
          {message.text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {message.timestamp}
      </Text>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* White Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🤖 llava:7b Chat</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <Icon name="trash-outline" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
            <View style={styles.welcomeIcon}>
              <Icon name="chatbubble-ellipses-outline" size={60} color="#667eea" />
            </View>
            <Text style={styles.welcomeText}>
              👋 Welcome to AI Chat
            </Text>
            <Text style={styles.welcomeSubtext}>
              I'm llava:7b! I can see images and help with anything.
            </Text>
            <Text style={styles.welcomeSubtext}>
              📷 Send photos with questions for visual analysis
            </Text>
            {isImageSelectionInProgress && (
              <Text style={styles.statusText}>
                📷 Image selection in progress...
              </Text>
            )}
          </Animated.View>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isLoading && (
          <Animated.View style={[styles.messageContainer, styles.botMessage, { opacity: fadeAnim }]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.typingIndicator}>
                  AI is thinking...
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image 
              source={{ uri: selectedImage?.uri }} 
              style={styles.modalImage}
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setImageModalVisible(false)}
            >
              <Icon name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.selectedImageContainer}>
            <Image 
              source={{ uri: selectedImage.uri }} 
              style={styles.selectedImage}
              resizeMode="cover"
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={removeImage}
            >
              <Icon name="close-circle" size={20} color="#ff4757" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={pickImage}
            disabled={isImageSelectionInProgress} // Disable during image selection
          >
            <Icon name="camera-outline" size={24} color={isImageSelectionInProgress ? "#ccc" : "#667eea"} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message or add an image..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
            editable={!isLoading && !isImageSelectionInProgress} // Disable during image selection
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() && !selectedImage) || isLoading ? styles.sendButtonDisabled : null
            ]}
            onPress={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isLoading || isImageSelectionInProgress}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#667eea',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  clearButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContent: {
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  welcomeIcon: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  statusText: {
    fontSize: 14,
    color: '#f39c12',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  messageBubble: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#667eea',
  },
  botBubble: {
    backgroundColor: '#f1f3f5',
    borderWidth: 0,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 15,
    marginBottom: 8,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#2c3e50',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#95a5a6',
    marginHorizontal: 18,
    marginTop: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingIndicator: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.8,
    height: height * 0.6,
    borderRadius: 15,
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    backgroundColor: '#ffffff',
  },
  selectedImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  removeImageButton: {
    marginLeft: 10,
    backgroundColor: '#ffe8e8',
    borderRadius: 15,
    padding: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
});