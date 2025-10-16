import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: "Transform Your Fitness",
    subtitle: "Journey to a stronger you",
    description: "Discover personalized workouts, track your progress, and achieve your fitness goals with our advanced platform",
    image: require("../assets/boy.jpg"),
    gradient: ['#FF6B6B', '#FF8E8E'],
  },
  {
    id: 2,
    title: "Smart Workout Plans",
    subtitle: "AI-powered training",
    description: "Get customized workout routines designed specifically for your body type and fitness level",
    image: require("../assets/men.jpg"),
    gradient: ['#4ECDC4', '#44A08D'],
  },
  {
    id: 3,
    title: "Connect & Motivate",
    subtitle: "Join the community",
    description: "Connect with fitness enthusiasts, share achievements, and stay motivated together",
    image: require("../assets/women.jpg"),
    gradient: ['#A8E6CF', '#7FCDCD'],
  }
];

const WelcomeScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const Slide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [100, 0, 100],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width, height }]}>
        <Image 
          source={item.image}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.darkOverlay} />
        
        {/* Skip button positioned absolutely */}
        <View style={styles.headerAbsolute}>
          <TouchableOpacity style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.textContainer, {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }]
          }]}>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideDescription}>{item.description}</Text>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }]
          }]}>
            {index === slides.length - 1 ? (
              <TouchableOpacity 
                style={[styles.getStartedButton, styles.buttonShadow]}
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('OpenPage');
                }}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E8E']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <Text style={styles.buttonIcon}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.nextButton, styles.buttonShadow]}
                onPress={scrollTo}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextText}>Next</Text>
                  <Text style={styles.buttonIcon}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>

          <View style={styles.paginatorContainer}>
            {slides.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });

              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      transform: [{ scale }]
                    }
                  ]}
                  key={i.toString()}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#0f0f23' ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      
      <FlatList
        data={slides}
        renderItem={({ item, index }) => <Slide item={item} index={index} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'System',
    letterSpacing: 0.3,
  },
  slide: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 120,
    paddingBottom: 60,
    zIndex: 3,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'System',
  },
  slideTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 42,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  slideDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
    fontWeight: '400',
    fontFamily: 'System',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  getStartedButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    width: '45%',
  },
  nextButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    width: '45%',
  },
  gradientButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  nextText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});

export default WelcomeScreen;