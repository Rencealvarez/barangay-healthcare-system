import axios from 'axios';

/**
 * Axios instance configured for the Barangay Healthcare System Laravel API.
 * Base URL defaults to http://127.0.0.1:8000/api (Laravel local server).
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach bearer token or active user headers if authenticated
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling and response formatting
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized access (401)
    if (error.response && error.response.status === 401) {
      // Optional: Clear token or redirect to login
      // localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
