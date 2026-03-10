import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  // O backend espera o prefixo /api (ex: /api/auth/login)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request details for debugging
  console.groupCollapsed(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  console.log('URL:', config.baseURL ? `${config.baseURL}${config.url}` : config.url);
  console.log('Headers:', config.headers);
  console.log('Data:', config.data);
  console.groupEnd();

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.groupCollapsed(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.groupCollapsed(`❌ API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`);
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
      
      // Handle 401 Unauthorized globally
      if (error.response.status === 401) {
        console.warn('⚠️ Unauthorized - Redirecting to login');
        
        // Remove invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
            toast.error('Sessão expirada. Faça login novamente.');
            // Using window.location to force a hard redirect and clear any state
            // setTimeout to allow toast to be seen briefly if possible, or just immediate
            window.location.href = '/login';
        }
      }
    }
    console.groupEnd();
    return Promise.reject(error);
  }
);
