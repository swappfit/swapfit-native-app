import apiClient from './apiClient';
import { Platform } from 'react-native';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlaij1gcp/image/upload";
const UPLOAD_PRESET = "rn_unsigned";

/**
 * ✅ FIXED: Replaced the failing 'axios' uploader with 'fetch'.
 * The 'fetch' API is more reliable for FormData file uploads on Android.
 * This directly solves the "Network Error", assuming internet permissions are set.
 */
const uploadToCloudinary = async (image) => {
  console.log('📤 [Cloudinary with Fetch] Attempting to upload...');
  if (!image || !image.uri) {
    throw new Error('Invalid image file provided for upload.');
  }

  const formData = new FormData();
  formData.append('file', {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.fileName || `upload-${Date.now()}.jpg`,
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        // Note: Do not set 'Content-Type' here.
        // 'fetch' with FormData sets the correct multipart boundary automatically.
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response status is not 2xx, throw a detailed error from Cloudinary
      const errorMessage = data.error?.message || `Cloudinary returned a non-200 status: ${response.status}`;
      console.error('❌ [Cloudinary with Fetch] Upload failed:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ [Cloudinary with Fetch] Upload successful:', data.secure_url);
    return data.secure_url;
  } catch (error) {
    // This catch block handles critical network errors (like "Network request failed")
    console.error('❌ [Cloudinary with Fetch] A critical error occurred during upload:', error);
    // Re-throw the original error to be caught by the UI layer for user feedback
    throw error;
  }
};


// --- The rest of your service functions remain the same ---

const getAllPosts = (params = { page: 1, limit: 10 }) => {
  return apiClient.get('/community/posts', { params });
};

const createPost = async (caption, image) => {
  if (!caption || !image) {
    return Promise.reject(new Error('Caption and image are required.'));
  }

  // Step 1: Upload image to Cloudinary using the new, working fetch method.
  const imageUrl = await uploadToCloudinary(image);

  // Step 2: Send the URL to your backend (this part was already working).
  console.log('📤 [Backend] Creating post with Cloudinary URL...');
  return apiClient.post('/community/posts', {
    content: caption.trim(),
    imageUrl: imageUrl,
  });
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