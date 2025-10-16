import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const FlexiFitAI = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: 'ai',
      message: 'Hello! I\'m FlexiFit AI, your personal fitness coach. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const tabs = [
    { id: 'chat', title: 'AI Coach', icon: 'chatbubble-ellipses' },
    { id: 'workouts', title: 'Workouts', icon: 'fitness' },
    { id: 'nutrition', title: 'Nutrition', icon: 'restaurant' },
    { id: 'progress', title: 'Progress', icon: 'trending-up' },
  ];

  const aiFeatures = [
    {
      id: 'workout-plan',
      title: 'Create Workout Plan',
      description: 'Get a personalized workout plan based on your goals',
      icon: 'fitness',
      color: '#e74c3c',
    },
    {
      id: 'form-check',
      title: 'Form Check',
      description: 'Analyze your exercise form with AI',
      icon: 'camera',
      color: '#3498db',
    },
    {
      id: 'nutrition-plan',
      title: 'Nutrition Plan',
      description: 'Get personalized meal recommendations',
      icon: 'restaurant',
      color: '#27ae60',
    },
    {
      id: 'progress-analysis',
      title: 'Progress Analysis',
      description: 'AI-powered insights on your fitness journey',
      icon: 'analytics',
      color: '#9b59b6',
    },
  ];

  const workoutRecommendations = [
    {
      id: 1,
      name: 'Beginner Strength Training',
      duration: '45 min',
      difficulty: 'Beginner',
      focus: 'Full Body',
      calories: 250,
      exercises: 8,
      aiScore: 95,
    },
    {
      id: 2,
      name: 'Cardio HIIT Blast',
      duration: '30 min',
      difficulty: 'Intermediate',
      focus: 'Cardio',
      calories: 400,
      exercises: 6,
      aiScore: 92,
    },
    {
      id: 3,
      name: 'Advanced Powerlifting',
      duration: '60 min',
      difficulty: 'Advanced',
      focus: 'Strength',
      calories: 350,
      exercises: 5,
      aiScore: 88,
    },
  ];

  const nutritionInsights = [
    {
      category: 'Protein Intake',
      current: 120,
      target: 150,
      unit: 'g',
      status: 'below',
      recommendation: 'Increase protein intake by 30g daily',
    },
    {
      category: 'Calories',
      current: 1850,
      target: 2200,
      unit: 'kcal',
      status: 'below',
      recommendation: 'Add 350 calories to meet your goal',
    },
    {
      category: 'Water Intake',
      current: 6,
      target: 8,
      unit: 'glasses',
      status: 'below',
      recommendation: 'Drink 2 more glasses of water daily',
    },
  ];

  const sendMessage = () => {
    if (message.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on your fitness profile, I recommend focusing on compound movements for better results.",
        "Your form looks great! Keep your core engaged throughout the movement.",
        "For your goals, I suggest increasing your protein intake to 1.6g per kg of body weight.",
        "Great progress! You've improved your strength by 15% this month.",
        "Let's adjust your workout plan to include more recovery days.",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: randomResponse,
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatHistory}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {chatHistory.map((chat) => (
          <View
            key={chat.id}
            style={[
              styles.chatBubble,
              chat.type === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={[
              styles.chatText,
              chat.type === 'user' ? styles.userText : styles.aiText,
            ]}>
              {chat.message}
            </Text>
            <Text style={styles.chatTimestamp}>
              {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.chatBubble, styles.aiBubble]}>
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>FlexiFit AI is typing</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Ask FlexiFit AI anything..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWorkoutsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.aiFeaturesGrid}>
        {aiFeatures.map((feature) => (
          <TouchableOpacity key={feature.id} style={styles.aiFeatureCard}>
            <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
              <Icon name={feature.icon} size={24} color="white" />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI-Recommended Workouts</Text>
        <Text style={styles.sectionSubtitle}>Personalized for your fitness level</Text>
        
        {workoutRecommendations.map((workout) => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDetails}>
                  {workout.duration} • {workout.difficulty} • {workout.focus}
                </Text>
              </View>
              <View style={styles.aiScoreContainer}>
                <Text style={styles.aiScore}>{workout.aiScore}%</Text>
                <Text style={styles.aiScoreLabel}>AI Match</Text>
              </View>
            </View>
            
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Text style={styles.statValue}>{workout.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.workoutStat}>
                <Text style={styles.statValue}>{workout.exercises}</Text>
                <Text style={styles.statLabel}>Exercises</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.startWorkoutButton}>
              <Text style={styles.startWorkoutText}>Start Workout</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderNutritionTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.nutritionOverview}>
        <Text style={styles.sectionTitle}>AI Nutrition Insights</Text>
        <Text style={styles.sectionSubtitle}>Personalized recommendations based on your data</Text>
        
        {nutritionInsights.map((insight, index) => (
          <View key={index} style={styles.nutritionCard}>
            <View style={styles.nutritionHeader}>
              <Text style={styles.nutritionCategory}>{insight.category}</Text>
              <View style={styles.nutritionProgress}>
                <Text style={styles.nutritionCurrent}>{insight.current}</Text>
                <Text style={styles.nutritionTarget}>/ {insight.target} {insight.unit}</Text>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((insight.current / insight.target) * 100, 100)}%`,
                    backgroundColor: insight.status === 'below' ? '#e74c3c' : '#27ae60'
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.nutritionRecommendation}>{insight.recommendation}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aiMealPlan}>
        <Text style={styles.sectionTitle}>AI-Generated Meal Plan</Text>
        <TouchableOpacity style={styles.generateMealPlanButton}>
          <Icon name="refresh" size={20} color="white" />
          <Text style={styles.generateMealPlanText}>Generate New Meal Plan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProgressTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.progressOverview}>
        <Text style={styles.sectionTitle}>AI Progress Analysis</Text>
        <Text style={styles.sectionSubtitle}>Advanced insights powered by machine learning</Text>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Strength Progress</Text>
          <Text style={styles.progressValue}>+23%</Text>
          <Text style={styles.progressDescription}>
            Your bench press has improved by 23% over the last 3 months
          </Text>
        </View>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Endurance Score</Text>
          <Text style={styles.progressValue}>85/100</Text>
          <Text style={styles.progressDescription}>
            Excellent cardiovascular fitness level
          </Text>
        </View>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Recovery Rate</Text>
          <Text style={styles.progressValue}>Optimal</Text>
          <Text style={styles.progressDescription}>
            Your recovery patterns are ideal for continued progress
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#e74c3c', '#c0392b']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.aiIcon}>
            <Icon name="sparkles" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>FlexiFit AI</Text>
          <Text style={styles.headerSubtitle}>Your AI Fitness Coach</Text>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Icon 
              name={tab.icon} 
              size={20} 
              color={activeTab === tab.id ? colors.primary : colors.textSecondary} 
            />
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === tab.id && [styles.activeTabText, { color: colors.primary }]]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'workouts' && renderWorkoutsTab()}
        {activeTab === 'nutrition' && renderNutritionTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  aiIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fef2f2',
  },
  tabText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },

  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatHistory: {
    flex: 1,
    padding: 20,
  },
  chatBubble: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#e74c3c',
    borderRadius: 20,
    borderBottomRightRadius: 5,
    padding: 15,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: '#333',
  },
  chatTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // AI Features Styles
  aiFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  aiFeatureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Section Styles
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },

  // Workout Card Styles
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
  },
  aiScoreContainer: {
    alignItems: 'center',
  },
  aiScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  aiScoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  workoutStat: {
    marginRight: 30,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  startWorkoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startWorkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Nutrition Styles
  nutritionOverview: {
    marginBottom: 30,
  },
  nutritionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  nutritionCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  nutritionCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  nutritionTarget: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  nutritionRecommendation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  aiMealPlan: {
    marginBottom: 30,
  },
  generateMealPlanButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
  },
  generateMealPlanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },

  // Progress Styles
  progressOverview: {
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  progressDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default FlexiFitAI; 