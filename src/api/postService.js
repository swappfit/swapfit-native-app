import apiClient from './apiClient';
import { Platform } from 'react-native';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dlaij1gcp/image/upload';
const UPLOAD_PRESET = 'rn_unsigned';

// ✅ --- CORRECTED FUNCTION --- ✅
const uploadToCloudinary = async (image) => {
  console.log('📤 [Cloudinary with Fetch] Attempting to upload...');
  if (!image || !image.uri) {
    throw new Error('Invalid image file provided for upload.');
  }

  // FIX: Handle iOS file URI and ensure correct file type/name
  const uri = image.uri;
  const type = image.type || `image/${uri.split('.').pop()}`;
  const name = image.fileName || `photo_${Date.now()}.${uri.split('.').pop()}`;
  
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    type: type,
    name: name,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', 'dlaij1gcp'); // Add your cloud name

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData, // 'Content-Type' header is automatically set by fetch for FormData
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message || `Cloudinary returned a non-200 status: ${response.status}`;
      console.error('❌ [Cloudinary with Fetch] Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ [Cloudinary with Fetch] Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error('❌ [Cloudinary with Fetch] A critical error occurred during upload:', error);
    throw error;
  }
};

const getAllPosts = (params = { page: 1, limit: 10 }) => {
  return apiClient.get('/community/posts', { params });
};

const createPost = async (caption, image) => {
  if (!caption || !image) {
    return Promise.reject(new Error('Caption and image are required.'));
  }

  try {
    // Step 1: Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(image);

    // Step 2: Send the URL to your backend
    console.log('📤 [Backend] Creating post with Cloudinary URL...');
    const response = await apiClient.post('/community/posts', {
      content: caption.trim(),
      imageUrl: imageUrl,
    });
    
    return response;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};

const addComment = (postId, commentText) => {
  return apiClient.post(`/community/posts/${postId}/comments`, { content: commentText.trim() });
};

const likePost = (postId) => {
  return apiClient.post(`/community/posts/${postId}/like`);
};

export const postService = {
  getAllPosts,
  createPost,
  addComment,
  likePost,
};