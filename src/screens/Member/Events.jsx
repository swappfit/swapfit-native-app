import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const events = [
  {
    id: 1,
    name: "Global Fitness Summit 2024",
    description: "Join industry leaders and fitness enthusiasts",
    date: "15 Mar 2024",
    time: "9:00 AM",
    duration: "8 hours",
    location: "Pragati Maidan, Delhi",
    city: "Delhi",
    price: "₹2,499",
    originalPrice: "₹3,999",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
    category: "Conference",
    attendees: 2500,
    speakers: 15,
    rating: 4.9,
    isPopular: true,
    gradient: ['#FFC107', '#FFA000'],
    tags: ["Networking", "Workshops", "Certification"],
  },
  {
    id: 2,
    name: "Advanced Yoga Retreat",
    description: "Transform your practice with expert guidance",
    date: "22 Mar 2024",
    time: "6:00 AM",
    duration: "3 days",
    location: "Rishikesh Wellness Center",
    city: "Rishikesh",
    price: "₹8,999",
    originalPrice: "₹12,999",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
    category: "Retreat",
    attendees: 50,
    speakers: 3,
    rating: 4.8,
    isPopular: false,
    gradient: ['#00C8C8', '#00B0B0'],
    tags: ["Meditation", "Asanas", "Pranayama"],
  },
  {
    id: 3,
    name: "CrossFit Championship",
    description: "Compete with the best athletes nationwide",
    date: "5 Apr 2024",
    time: "7:00 AM",
    duration: "2 days",
    location: "Sports Authority Complex",
    city: "Mumbai",
    price: "₹1,999",
    originalPrice: "₹2,999",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
    category: "Competition",
    attendees: 500,
    speakers: 8,
    rating: 4.7,
    isPopular: true,
    gradient: ['#FF6B35', '#FF5252'],
    tags: ["Competition", "Prizes", "Community"],
  },
];

const eventCategories = [
  { id: 'all', name: 'All Events' },
  { id: 'conference', name: 'Conferences' },
  { id: 'retreat', name: 'Retreats' },
  { id: 'competition', name: 'Competitions' },
  { id: 'workshop', name: 'Workshops' },
];

const Events = () => {
  const [selectedEventCategory, setSelectedEventCategory] = useState('all');

  const renderEventCard = ({ item: event }) => (
    <TouchableOpacity style={styles.eventCard}>
      <View style={styles.eventImageContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.eventImageOverlay}
        />
        {event.isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: '#FFC107' }]}>
            <Icon name="trending-up" size={12} color="white" />
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
        <View style={[styles.eventCategoryBadge, { backgroundColor: '#FFC107' }]}>
          <Text style={styles.eventCategoryText}>{event.category}</Text>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventName} numberOfLines={2}>{event.name}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetail}>
            <Icon name="calendar-outline" size={16} color="#aaa" />
            <Text style={styles.eventDetailText}>{event.date}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Icon name="time-outline" size={16} color="#aaa" />
            <Text style={styles.eventDetailText}>{event.time}</Text>
          </View>
          <View style={styles.eventDetail}>
            <Icon name="location-outline" size={16} color="#aaa" />
            <Text style={styles.eventDetailText}>{event.city}</Text>
          </View>
        </View>
        <View style={styles.eventStats}>
          <View style={styles.eventStat}>
            <Icon name="people-outline" size={16} color="#aaa" />
            <Text style={styles.eventStatText}>{event.attendees}</Text>
          </View>
          <View style={styles.eventStat}>
            <Icon name="mic-outline" size={16} color="#aaa" />
            <Text style={styles.eventStatText}>{event.speakers} speakers</Text>
          </View>
          <View style={styles.eventStat}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.eventStatText}>{event.rating}</Text>
          </View>
        </View>
        <View style={styles.eventFooter}>
          <View style={styles.eventPricing}>
            <Text style={styles.eventPrice}>{event.price}</Text>
            {event.originalPrice && (
              <Text style={styles.eventOriginalPrice}>{event.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.bookButton}>
            <View style={styles.buttonSolidBlueRow}>
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Icon name="arrow-forward" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroSection, { backgroundColor: '#001f3f' }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Fitness Events</Text>
          <Text style={styles.heroSubtitle}>Join amazing fitness events and workshops</Text>

          <View style={styles.heroFeatures}>
            <View style={styles.heroFeature}>
              <Icon name="people" size={16} color="white" />
              <Text style={styles.heroFeatureText}>Expert Speakers</Text>
            </View>
            <View style={styles.heroFeature}>
              <Icon name="trophy" size={16} color="white" />
              <Text style={styles.heroFeatureText}>Competitions</Text>
            </View>
            <View style={styles.heroFeature}>
              <Icon name="heart" size={16} color="white" />
              <Text style={styles.heroFeatureText}>Community</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Event Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {eventCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedEventCategory(category.id)}
              style={styles.eventCategoryButton}
            >
              <View
                style={[
                  styles.eventCategorySolidBackground,
                  selectedEventCategory === category.id && styles.eventCategorySelectedBackground,
                ]}
              >
                <Text
                  style={[
                    styles.eventCategoryName,
                    { color: selectedEventCategory === category.id ? 'white' : '#FFC107' },
                  ]}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.eventsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <Text style={styles.itemCount}>{events.length} events</Text>
        </View>

        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#001f3f',
  },
  heroSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 24,
  },
  heroFeatures: { flexDirection: 'row', flexWrap: 'wrap' },
  heroFeature: { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 8 },
  heroFeatureText: { color: 'white', fontSize: 14, marginLeft: 6, fontWeight: '500' },
  categoriesSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  categoriesScroll: { marginHorizontal: -20, paddingHorizontal: 20 },
  eventCategoryButton: { marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  eventCategorySolidBackground: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#002b5c',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  eventCategorySelectedBackground: {
    backgroundColor: '#FFC107',
    borderColor: '#FFA000',
  },
  eventCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  eventsSection: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCount: { fontSize: 14, color: '#FFC107' },
  eventCard: {
    backgroundColor: '#002b5c',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  eventImageContainer: { position: 'relative', height: 200 },
  eventImage: { width: '100%', height: '100%' },
  eventImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  eventCategoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  eventCategoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventInfo: { padding: 20 },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 28,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    lineHeight: 20,
  },
  eventDetails: { marginBottom: 16 },
  eventDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  eventDetailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
  },
  eventStat: { flexDirection: 'row', alignItems: 'center' },
  eventStatText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
    fontWeight: '500',
  },
  eventFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventPricing: { flex: 1 },
  eventPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  eventOriginalPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonSolidBlueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  bookButtonText: {
    color: '#001f3f',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 18,
  },
});

export default Events;
