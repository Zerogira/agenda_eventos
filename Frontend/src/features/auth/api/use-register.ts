import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RegisterCredentials, AuthResponse } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/register', credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Erro ao realizar cadastro.');
    },
  });
};
