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
  if (config.data) console.log('Payload/Body:', config.data);
  if (config.params) console.log('Query Params:', config.params);
  console.groupEnd();

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.groupCollapsed(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('Full Response Object:', response);
    console.log('Data (Body):', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    const status = error.response?.status || 'Network Error';
    const url = error.config?.url || 'Unknown URL';
    
    console.groupCollapsed(`❌ API Error: ${status} ${url}`);
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Response Status:', error.response.status);
    }
    console.groupEnd();
    
    if (error.response?.status === 401) {
        // ... existing 401 logic ...
        console.warn('⚠️ Unauthorized - Redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
            toast.error('Sessão expirada. Faça login novamente.');
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
  }
);
