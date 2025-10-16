// src/screens/Community.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { postService } from '../../api/postService';
import { API_BASE_URL } from '../../api/apiClient';
import FindTrainers from './FindTrainers';
import { useImageSelection } from '../../context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

const Community = () => {
  const { isImageSelectionInProgress, setIsImageSelectionInProgress } = useImageSelection();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);

  // Add refs to track state that shouldn't trigger re-renders
  const isMounted = useRef(true);
  const appState = useRef(AppState.currentState);
  const appStateSubscription = useRef(null);
  
  // Track component mount/unmount
  useEffect(() => {
    console.log('Community component mounted');
    isMounted.current = true;
    
    // Add app state listener
    appStateSubscription.current = AppState.addEventListener('change', nextAppState => {
      console.log('AppState changed to', nextAppState);
      
      // If we're returning from background and we were in the middle of image selection,
      // we need to prevent any navigation or authentication refresh
      if (appState.current.match(/background/) && nextAppState === 'active' && isImageSelectionInProgress) {
        console.log('Returning from image selection, preventing unwanted navigation');
        // Set a flag to prevent auth refresh or navigation
        setIsImageSelectionInProgress(false);
        
        // Force the modal to stay open
        setTimeout(() => {
          if (isMounted.current) {
            setPostModalVisible(true);
          }
        }, 300);
      }
      
      appState.current = nextAppState;
    });
    
    return () => {
      console.log('Community component unmounting');
      isMounted.current = false;
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [isImageSelectionInProgress]);

  const fetchPosts = useCallback(async () => {
    // Don't fetch if we're in the middle of image selection
    if (isImageSelectionInProgress) {
      console.log('Skipping fetchPosts during image selection');
      return;
    }
    
    console.log('Fetching posts...');
    setIsLoading(true);
    try {
      const response = await postService.getAllPosts();
      console.log('Posts fetched successfully:', response.data.data.length);
      const postsWithFullUrls = response.data.data.map(post => ({
        ...post,
        imageUrl: post.imageUrl.startsWith('http') ? post.imageUrl : `${API_BASE_URL.replace('/api', '')}${post.imageUrl}`,
        userAvatar: post.author?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
        userName: post.author?.email || 'Anonymous',
      }));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setPosts(postsWithFullUrls);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Could not fetch community posts.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [isImageSelectionInProgress]);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab, fetchPosts]);

  const handleLike = async (postId) => {
    console.log('Liking post:', postId);
    const originalPosts = JSON.parse(JSON.stringify(posts));
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    const updatedPosts = posts.map(p =>
      p.id === postId
        ? {
            ...p,
            liked: !p.liked,
            _count: {
              ...p._count,
              likes: p.liked ? p._count.likes - 1 : p._count.likes + 1,
            },
          }
        : p
    );
    
    if (isMounted.current) {
      setPosts(updatedPosts);
    }

    try {
      await postService.likePost(postId);
      console.log('Post liked successfully');
    } catch (error) {
      console.error('Failed to like post:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Could not update like status.');
        setPosts(originalPosts);
      }
    }
  };

  const handleComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    console.log('Adding comment to post:', postId);
    const originalPosts = JSON.parse(JSON.stringify(posts));
    const newComment = {
      id: Date.now().toString(),
      content: commentText,
      author: { email: 'You' },
    };

    const updatedPosts = posts.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: [newComment, ...p.comments],
            _count: { ...p._count, comments: p._count.comments + 1 },
          }
        : p
    );
    
    if (isMounted.current) {
      setPosts(updatedPosts);
    }

    try {
      await postService.addComment(postId, commentText);
      console.log('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      if (isMounted.current) {
        Alert.alert('Error', 'Could not add your comment.');
        setPosts(originalPosts);
      }
    }
  };

  // ✅ --- FIXED IMAGE SELECTION FUNCTION --- ✅
  const handleSelectImage = async () => {
    console.log('=== START IMAGE SELECTION ===');
    console.log('Component mounted:', isMounted.current);
    console.log('Modal visible:', isPostModalVisible);
    
    // Check if component is still mounted
    if (!isMounted.current) {
      console.error('Component is not mounted, aborting image selection');
      return;
    }
    
    // Set context flag to indicate we're starting image selection
    setIsImageSelectionInProgress(true);
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    try {
      console.log('Launching image library...');
      const result = await launchImageLibrary(options);
      console.log('Image library result received');

      // Check if component is still mounted after async operation
      if (!isMounted.current) {
        console.error('Component was unmounted during image selection');
        return;
      }

      if (result.didCancel) {
        console.log('User cancelled image picker');
        setIsImageSelectionInProgress(false);
        return;
      }
      
      if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        setIsImageSelectionInProgress(false);
        Alert.alert('Image Error', result.errorMessage);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log('Selected image asset:', asset);
        
        console.log('Setting new post image...');
        const newImage = {
          uri: asset.uri,
          type: asset.type,
          fileName: asset.fileName,
        };
        
        // Check if modal is still visible before updating state
        if (!isPostModalVisible) {
          console.error('Modal is no longer visible, forcing it to reopen');
          // Force the modal to reopen
          setPostModalVisible(true);
          setTimeout(() => {
            if (isMounted.current) {
              setNewPostImage(newImage);
            }
          }, 300);
          setIsImageSelectionInProgress(false);
          return;
        }
        
        // Update state and verify
        setNewPostImage(newImage);
        console.log('New post image set successfully');
        
        // Verify state was updated after a short delay
        setTimeout(() => {
          console.log('Verification - newPostImage after setState:', newPostImage);
        }, 100);
      } else {
        console.error('No assets found in image picker result');
      }
    } catch (error) {
      console.error('An error occurred in launchImageLibrary: ', error);
      Alert.alert('Error', 'An unexpected error occurred while selecting the image.');
    } finally {
      // Reset the flag after a short delay to ensure app state change is processed
      setTimeout(() => {
        setIsImageSelectionInProgress(false);
        console.log('Image selection process completed');
      }, 500);
      console.log('=== END IMAGE SELECTION ===');
    }
  };

  const handleAddPost = async () => {
    console.log('Adding new post...');
    if (!newPostImage || !newPostCaption.trim()) {
      console.log('Post incomplete - missing image or caption');
      Alert.alert('Incomplete Post', 'Please select an image and write a caption.');
      return;
    }
    
    console.log('Post data is valid, starting upload...');
    setIsUploading(true);
    try {
      await postService.createPost(newPostCaption, newPostImage);
      console.log('Post created successfully');
      if (isMounted.current) {
        setPostModalVisible(false);
        setNewPostImage(null);
        setNewPostCaption('');
        fetchPosts();
      }
    } catch (error) {
      const message = error.message || 'Could not create post.';
      console.error('Failed to create post:', error);
      if (isMounted.current) {
        Alert.alert('Upload Error', message);
      }
    } finally {
      if (isMounted.current) {
        setIsUploading(false);
      }
    }
  };

  const PostCard = ({ item }) => {
    const [postComment, setPostComment] = useState('');
    const submitComment = () => {
        if (postComment.trim()) {
          handleComment(item.id, postComment);
          setPostComment('');
        }
    };

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <Text style={styles.userName}>{item.userName}</Text>
        </View>
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionButton}>
            <Icon name={item.liked ? 'heart' : 'heart-outline'} size={24} color={item.liked ? '#FF5733' : '#fff'} />
            <Text style={styles.actionText}>{item._count.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chatbubble-outline" size={24} color="#fff" />
            <Text style={styles.actionText}>{item._count.comments}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.caption}>{item.content}</Text>
        <View style={styles.commentsSection}>
          {item.comments.slice(0, 2).map(comment => (
            <Text key={comment.id} style={styles.commentText}>
              <Text style={{ fontWeight: 'bold' }}>{comment.author?.email || 'User'}:</Text> {comment.content}
            </Text>
          ))}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#aaa"
              value={postComment}
              onChangeText={setPostComment}
              onSubmitEditing={submitComment}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={submitComment}>
              <Icon name="send" size={24} color={postComment.trim() ? '#FFC107' : '#555'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  const renderPostsTab = () => (
    <>
      <TouchableOpacity style={styles.createPostButton} onPress={() => {
        console.log('Opening create post modal');
        setPostModalVisible(true);
      }}>
        <Icon name="add" size={24} color="#001f3f" />
        <Text style={styles.createPostButtonText}>Create a Post</Text>
      </TouchableOpacity>
      {isLoading && posts.length === 0 ? (
        <ActivityIndicator size="large" color="#FFC107" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PostCard item={item} />}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPosts}
          refreshing={isLoading}
          ListEmptyComponent={
            !isLoading ? (
                <Text style={styles.emptyListText}>
                No posts yet. Be the first to share!
                </Text>
            ) : null
          }
        />
      )}
    </>
  );

  const tabs = [
    { id: 'posts', title: 'Community Posts', icon: 'images-outline' },
    { id: 'trainers', title: 'Find Trainers', icon: 'fitness-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001f3f" />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPostModalVisible}
        onRequestClose={() => {
          console.log('Modal close requested');
          setPostModalVisible(false);
        }}
        onShow={() => {
          console.log('Modal shown');
        }}
        onDismiss={() => {
          console.log('Modal dismissed');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create a New Post</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={handleSelectImage}>
              {newPostImage ? (
                <Image source={{ uri: newPostImage.uri }} style={styles.imagePreview} resizeMode="cover" />
              ) : (
                <>
                  <Icon name="camera" size={40} color="#FFC107" />
                  <Text style={styles.imagePickerText}>Select an Image</Text>
                </>
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor="#aaa"
              value={newPostCaption}
              onChangeText={setNewPostCaption}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {
                console.log('Cancel button pressed');
                setPostModalVisible(false);
              }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.postButton, (isUploading || !newPostCaption.trim() || !newPostImage) && styles.disabledButton]}
                onPress={handleAddPost}
                disabled={isUploading || !newPostCaption.trim() || !newPostImage}
              >
                {isUploading ? <ActivityIndicator color="#001f3f" /> : <Text style={styles.modalButtonText}>Post</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => {
              console.log('Tab changed to:', tab.id);
              setActiveTab(tab.id);
            }}
          >
            <Icon name={tab.icon} size={22} color={activeTab === tab.id ? '#FFC107' : 'rgba(255, 255, 255, 0.6)'} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>{tab.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'posts' && renderPostsTab()}
        {activeTab === 'trainers' && <FindTrainers />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001f3f' },
  content: { flex: 1, paddingHorizontal: 20 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 7, 0.2)',
  },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 15 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#FFC107' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', marginTop: 6 },
  activeTabText: { color: '#FFC107' },
  createPostButton: {
    backgroundColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 20,
  },
  createPostButtonText: { color: '#001f3f', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  postCard: {
    backgroundColor: '#002b5c',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  postImage: { width: '100%', height: screenWidth - 40 },
  postActions: { flexDirection: 'row', padding: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionText: { color: '#fff', marginLeft: 6, fontSize: 14 },
  caption: { color: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 12, paddingBottom: 12, fontSize: 14 },
  commentsSection: { paddingHorizontal: 12, paddingBottom: 12 },
  commentText: { color: '#fff', marginBottom: 4, fontSize: 13 },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 193, 7, 0.2)',
    paddingTop: 10,
  },
  commentInput: { flex: 1, color: '#fff', fontSize: 14, marginRight: 10 },
  emptyListText: { color: '#fff', textAlign: 'center', marginTop: 40 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#002b5c',
    borderRadius: 16,
    padding: 20,
    width: screenWidth * 0.9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  imagePicker: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.5)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001f3f',
    marginBottom: 20,
  },
  imagePickerText: { color: '#FFC107', marginTop: 10, fontSize: 14 },
  imagePreview: { width: '100%', height: '100%', borderRadius: 8 },
  captionInput: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#001f3f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.4)',
    padding: 12,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#444', marginRight: 10 },
  postButton: { backgroundColor: '#FFC107', marginLeft: 10 },
  disabledButton: { opacity: 0.5 },
  modalButtonText: { color: '#001f3f', fontWeight: 'bold', fontSize: 16 },
});

export default Community;