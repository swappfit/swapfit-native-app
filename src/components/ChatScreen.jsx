// src/components/ChatScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as trainerService from '../api/trainerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export const ChatScreen = ({ trainer, user, onBack, onClose, conversationId, token }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [currentToken, setCurrentToken] = useState(token);
  const flatListRef = useRef(null);

  // Use the user from context if not provided as prop
  const currentUser = user || userProfile;

  useEffect(() => {
    if (conversationId) {
      // If no token was passed, try to get it from AsyncStorage
      if (!currentToken) {
        const getTokenFromStorage = async () => {
          try {
            const userToken = await getToken();
            setCurrentToken(userToken);
            if (userToken) {
              loadMessages();
              initializeChat();
            } else {
              setError("Authentication required. Please log in again.");
              setLoading(false);
            }
          } catch (error) {
            console.error('Error getting token:', error);
            setError("Failed to authenticate. Please log in again.");
            setLoading(false);
          }
        };
        getTokenFromStorage();
      } else {
        loadMessages();
        initializeChat();
      }
    }

    return () => {
      if (conversationId) {
        trainerService.endTrainerChat(conversationId);
      }
    };
  }, [conversationId, currentToken]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await trainerService.getTrainerMessages(conversationId);
      console.log('Loaded messages:', fetchedMessages);
      setMessages(fetchedMessages || []);
    } catch (err) {
      console.error("Error loading messages:", err);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('accessToken');
        setCurrentToken(null);
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to load messages. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');
      await trainerService.initializeTrainerChat(currentToken, conversationId, handleNewMessage);
      setConnectionStatus('connected');
    } catch (err) {
      console.error("Error initializing chat:", err);
      setConnectionStatus('error');
      setError("Failed to initialize chat. Messages may not update in real-time.");
    }
  };

  const handleNewMessage = (newMessage) => {
    console.log('Received new message via socket:', newMessage);
    
    // Validate the message object
    if (!newMessage || !newMessage.id) {
      console.error('Invalid message object received:', newMessage);
      return;
    }
    
    setMessages(prevMessages => {
      // Check if message already exists to avoid duplicates
      const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
      if (!messageExists) {
        return [...prevMessages, newMessage];
      }
      return prevMessages;
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      
      // Create a temporary message for optimistic update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        senderId: currentUser.id,
        sender: { email: currentUser.email },
        createdAt: new Date().toISOString(),
        pending: true
      };

      // Add optimistic message
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setNewMessage('');

      // Send message via socket
      await trainerService.sendMessageViaSocket(conversationId, messageContent);
      
      // Remove the temporary message (the real message will come via socket)
      setTimeout(() => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
      }, 1000);
      
    } catch (err) {
      console.error("Error sending message:", err);
      if (err.response?.status === 401) {
        await AsyncStorage.removeItem('accessToken');
        setCurrentToken(null);
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUserMessage = item.senderId === currentUser.id;
    const messageStyle = isUserMessage ? styles.userMessage : styles.trainerMessage;
    const textStyle = isUserMessage ? styles.userMessageText : styles.trainerMessageText;
    const timeStyle = isUserMessage ? styles.userMessageTime : styles.trainerMessageTime;

    return (
      <View style={[styles.messageBubble, messageStyle, item.pending && styles.pendingMessage]}>
        <Text style={[styles.messageText, textStyle]}>{item.content}</Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, timeStyle]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isUserMessage && (
            <Icon 
              name={item.pending ? "time" : "checkmark-done"} 
              size={14} 
              color={item.pending ? "#888" : "#4CAF50"} 
              style={styles.readReceipt}
            />
          )}
        </View>
      </View>
    );
  };

  const renderConnectionStatus = () => {
    if (connectionStatus === 'connected') return null;
    
    return (
      <View style={styles.connectionStatus}>
        <Icon 
          name={connectionStatus === 'connecting' ? "sync" : "alert-circle"} 
          size={16} 
          color="#ff9800" 
        />
        <Text style={styles.connectionStatusText}>
          {connectionStatus === 'connecting' ? "Connecting..." : "Connection error"}
        </Text>
      </View>
    );
  };

  const handleLoginRedirect = () => {
    Alert.alert(
      "Authentication Required",
      "You need to log in to continue chatting.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log In", onPress: () => onClose() }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#FFC107" />
        </TouchableOpacity>
        <Image source={{ uri: trainer.gallery?.[0] || 'https://via.placeholder.com/150' }} style={styles.chatAvatar} />
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{trainer.user?.email.split('@')[0] || 'Trainer'}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, styles.statusOnline]} />
            <Text style={styles.chatHeaderStatus}>Online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeChatButton} onPress={onClose}>
          <Icon name="close" size={24} color="#FFC107" />
        </TouchableOpacity>
      </View>

      {renderConnectionStatus()}

      {!currentToken ? (
        <View style={styles.authRequiredContainer}>
          <Icon name="lock-closed" size={48} color="#FFC107" />
          <Text style={styles.authRequiredText}>Authentication Required</Text>
          <Text style={styles.authRequiredSubtext}>Please log in to continue chatting</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLoginRedirect}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMessages}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Icon name="chatbubble-ellipses-outline" size={48} color="#888" />
          <Text style={styles.emptyStateText}>No messages yet. Start a conversation!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || `message-${index}`}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
          maxLength={500}
          editable={!!currentToken}
        />
        <TouchableOpacity 
          style={[styles.sendButton, sending && styles.disabledSendButton]} 
          onPress={handleSendMessage}
          disabled={sending || !newMessage.trim() || !currentToken}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#001f3f" />
          ) : (
            <Icon name="send" size={20} color="#001f3f" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  chatContainer: { 
    flex: 1, 
    backgroundColor: '#001f3f' 
  },
  chatHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#002b5c', 
    paddingVertical: 15, 
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC107'
  },
  backButton: { 
    padding: 5 
  },
  chatAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginLeft: 10 
  },
  chatHeaderInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  chatHeaderName: { 
    color: '#ffffff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  statusContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  statusIndicator: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 5 
  },
  statusOnline: { 
    backgroundColor: '#27ae60' 
  },
  statusOffline: { 
    backgroundColor: '#999' 
  },
  chatHeaderStatus: { 
    color: '#ffffff', 
    fontSize: 12 
  },
  closeChatButton: { 
    padding: 5 
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  authRequiredText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10
  },
  authRequiredSubtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 20
  },
  loginButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  loginButtonText: {
    color: '#001f3f',
    fontWeight: 'bold'
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 20 
  },
  loadingText: { 
    color: '#ffffff', 
    marginTop: 10,
    fontSize: 14
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    color: '#ff4d4d', 
    textAlign: 'center', 
    marginVertical: 10,
    fontSize: 14
  },
  retryButton: { 
    backgroundColor: '#FFC107', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    marginTop: 10 
  },
  retryButtonText: { 
    color: '#001f3f', 
    fontWeight: 'bold' 
  },
  emptyStateContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  emptyStateText: { 
    color: '#888', 
    marginTop: 10,
    fontSize: 14
  },
  messagesContainer: { 
    flex: 1, 
    padding: 10 
  },
  messagesContent: { 
    paddingBottom: 20 
  },
  messageBubble: { 
    maxWidth: '80%', 
    padding: 12, 
    borderRadius: 18, 
    marginVertical: 5,
  },
  userMessage: { 
    backgroundColor: '#FFC107', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 5 
  },
  trainerMessage: { 
    backgroundColor: '#002b5c', 
    alignSelf: 'flex-start', 
    borderBottomLeftRadius: 5 
  },
  pendingMessage: { 
    opacity: 0.7 
  },
  messageText: { 
    fontSize: 16, 
    lineHeight: 20 
  },
  userMessageText: { 
    color: '#001f3f' 
  },
  trainerMessageText: { 
    color: '#ffffff' 
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4
  },
  messageTime: { 
    fontSize: 10, 
    color: '#888',
    marginRight: 5
  },
  userMessageTime: { 
    color: '#001f3f' 
  },
  trainerMessageTime: { 
    color: '#aaa' 
  },
  sendingMessage: { 
    backgroundColor: '#FFC107', 
    alignSelf: 'flex-end', 
    borderBottomRightRadius: 5,
    opacity: 0.7 
  },
  readReceipt: {
    marginLeft: 5
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  connectionStatusText: {
    color: '#ff9800',
    fontSize: 12,
    marginLeft: 5
  },
  messageInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    backgroundColor: '#002b5c',
    borderTopWidth: 1,
    borderTopColor: '#FFC107'
  },
  messageInput: { 
    flex: 1, 
    backgroundColor: '#001f3f', 
    color: '#ffffff', 
    borderRadius: 20, 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    marginRight: 10,
    maxHeight: 100
  },
  sendButton: { 
    backgroundColor: '#FFC107', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledSendButton: {
    backgroundColor: '#555',
  }
});