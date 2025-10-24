
// apiClient.js (axios instance with Auth0 token interceptor)
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: "dev-1de0bowjvfbbcx7q.us.auth0.com",
  clientId: "rwah022fY6bSPr5gstiKqPAErQjgynT2",
});

const apiClient = axios.create({
  baseURL: "https://ad123696d85e.ngrok-free.app/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export async function getToken() {
  try {
    const creds = await auth0.credentialsManager.getCredentials();
    if (creds?.accessToken) {
      await AsyncStorage.setItem("accessToken", creds.accessToken);
      return creds.accessToken;
    }
  } catch (e) {
    console.log("[apiClient] Credentials manager failed, falling back to AsyncStorage.");
    return await AsyncStorage.getItem("accessToken");
  }
  return null;
}

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 [Axios Request]', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      tokenLength: token?.length,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ [Axios Network Error]", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

