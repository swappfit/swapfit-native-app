import axios from 'axios';
import { Platform } from 'react-native';

// Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlaij1gcp/image/upload";
const UPLOAD_PRESET = "rn_unsigned";

export async function uploadToCloudinary(imageUri) {
  try {
    console.log('Starting Cloudinary upload for:', imageUri);
    
    // Validate input
    if (!imageUri) {
      throw new Error('Image URI is required');
    }

    // Fix URI for Android
    let uri = imageUri;
    if (Platform.OS === 'android' && uri.startsWith('file://')) {
      uri = uri.replace('file://', '');
    }

    // Extract file type from URI
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: `image/${fileType}`,
      name: `photo.${fileType}`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('timestamp', Date.now().toString());

    console.log('Uploading to Cloudinary...');

    // Make the request with proper configuration
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type header when using FormData
        // It will be set automatically with the correct boundary
      },
      timeout: 60000, // 60 seconds timeout
    });

    console.log('Cloudinary response:', response.data);

    if (!response.data.secure_url) {
      throw new Error('No secure URL returned from Cloudinary');
    }

    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.error?.message || 
                         error.response.data?.message || 
                         `Server error: ${error.response.status}`;
      throw new Error(`Upload failed: ${errorMessage}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}