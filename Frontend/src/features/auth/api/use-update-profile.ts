import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UpdateProfileData {
  name: string;
  email: string;
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const { data: responseData } = await api.put('/auth/profile', data);
      return responseData;
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar perfil.');
      console.error(error);
    },
  });
};
