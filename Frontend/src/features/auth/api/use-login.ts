import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LoginCredentials, AuthResponse } from '../types';
import { useNavigate } from 'react-router-dom';
import { feedback } from '@/lib/toast-utils';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      feedback.loginSuccess();
      navigate('/');
    },
    onError: (error) => {
      feedback.loginError();
      console.error(error);
    },
  });
};
