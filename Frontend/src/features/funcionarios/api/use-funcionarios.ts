import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Funcionario } from '../types';

export const useFuncionarios = () => {
  return useQuery({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const { data } = await api.get<any>('/funcionarios');
      // Backend retorna paginado: { data: [], meta: {} }
      return Array.isArray(data) ? data : (data.data || []);
    },
  });
};

export const useCreateFuncionario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (funcionario: Funcionario) => {
      const { data } = await api.post<Funcionario>('/funcionarios', funcionario);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
};

export const useUpdateFuncionario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Funcionario> }) => {
      const { data: response } = await api.put<Funcionario>(`/funcionarios/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
};

export const useDeleteFuncionario = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/funcionarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
};
