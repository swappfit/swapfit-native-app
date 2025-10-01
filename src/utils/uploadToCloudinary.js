import axios from 'axios';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload";
const UPLOAD_PRESET = "<your-upload-preset>";

export async function uploadToCloudinary(uri) {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  });
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await axios.post(CLOUDINARY_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.secure_url;
}
