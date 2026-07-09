import axios from 'axios';


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-social-media-api-production.up.railway.app/api';
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); 
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tangkap error secara global, misalnya token expired (401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Kalau kena 401 (Unauthorized), otomatis hapus token dan kembali ke login
      if (typeof window !== 'undefined') {
        console.error('Session expired. Redirecting to login...');
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;