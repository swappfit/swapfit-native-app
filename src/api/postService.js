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

<<<<<<< HEAD
  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || `upload-${Date.now()}.jpg`,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
<<<<<<< HEAD
      headers: {
        'Accept': 'application/json',
        // Note: Do not set 'Content-Type' here.
        // 'fetch' with FormData sets the correct multipart boundary automatically.
      },
      body: formData,
=======
      body: formData, // 'Content-Type' header is automatically set by fetch for FormData
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    });

    const data = await response.json();

    if (!response.ok) {
<<<<<<< HEAD
      // If the response status is not 2xx, throw a detailed error from Cloudinary
=======
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
      const errorMessage = data.error?.message || `Cloudinary returned a non-200 status: ${response.status}`;
      console.error('❌ [Cloudinary with Fetch] Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ [Cloudinary with Fetch] Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
<<<<<<< HEAD
    // This catch block handles critical network errors (like "Network request failed")
    console.error('❌ [Cloudinary with Fetch] A critical error occurred during upload:', error);
    // Re-throw the original error to be caught by the UI layer for user feedback
=======
    console.error('❌ [Cloudinary with Fetch] A critical error occurred during upload:', error);
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
    throw error;
  }
};

<<<<<<< HEAD

// --- The rest of your service functions remain the same ---

=======
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
const getAllPosts = (params = { page: 1, limit: 10 }) => {
  return apiClient.get('/community/posts', { params });
};

const createPost = async (caption, image) => {
  if (!caption || !image) {
    return Promise.reject(new Error('Caption and image are required.'));
  }

<<<<<<< HEAD
  // Step 1: Upload image to Cloudinary using the new, working fetch method.
  const imageUrl = await uploadToCloudinary(image);

  // Step 2: Send the URL to your backend (this part was already working).
  console.log('📤 [Backend] Creating post with Cloudinary URL...');
  return apiClient.post('/community/posts', {
    content: caption.trim(),
    imageUrl: imageUrl,
  });
=======
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
>>>>>>> 09b60c1281ad49f3ac2025051f0fb3439a748636
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