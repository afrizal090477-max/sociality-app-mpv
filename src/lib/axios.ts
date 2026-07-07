import axios from 'axios';

// Gunakan Environment Variable kalau ada, kalau nggak fallback langsung ke API Railway lu
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-social-media-api-production.up.railway.app/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 🚀 REQUEST INTERCEPTOR
// ==========================================
// Otomatis nyelipin Token Bearer ke setiap request kalau user udah login
axiosInstance.interceptors.request.use(
  (config) => {
    // Pastikan kode ini cuma jalan di sisi Client (Browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token'); // Nanti pas login sukses, save tokennya di localStorage dengan nama 'token'
      
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

// ==========================================
// 🛡️ RESPONSE INTERCEPTOR
// ==========================================
// Tangkap error secara global, misalnya token expired (401)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Kalau kena 401 (Unauthorized), otomatis hapus token dan tendang ke login
      if (typeof window !== 'undefined') {
        console.error('Session expired. Redirecting to login...');
        localStorage.removeItem('token');
        // window.location.href = '/login'; // Buka komen ini nanti kalau flow-nya udah siap
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;