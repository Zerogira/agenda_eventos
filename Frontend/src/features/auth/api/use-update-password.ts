import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface UpdatePasswordData {
  currentPassword?: string;
  newPassword: string;
}

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      await api.put('/auth/password', data);
      return true;
    },
    onSuccess: () => {
      toast.success('Senha atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar senha.');
      console.error(error);
    },
  });
};
