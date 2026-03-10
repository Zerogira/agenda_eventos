import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Brinquedo } from '../types';

export const useBrinquedos = () => {
  return useQuery({
    queryKey: ['brinquedos'],
    queryFn: async () => {
      const { data } = await api.get<any>('/brinquedos');
      // Backend retorna paginado: { data: [], meta: {} }
      return Array.isArray(data) ? data : (data.data || []);
    },
  });
};

export const useCreateBrinquedo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (brinquedo: Brinquedo) => {
      const { data } = await api.post<Brinquedo>('/brinquedos', brinquedo);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brinquedos'] });
    },
  });
};

export const useUpdateBrinquedo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Brinquedo> }) => {
      const { data: response } = await api.put<Brinquedo>(`/brinquedos/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brinquedos'] });
    },
  });
};

export const useDeleteBrinquedo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/brinquedos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brinquedos'] });
    },
  });
};
