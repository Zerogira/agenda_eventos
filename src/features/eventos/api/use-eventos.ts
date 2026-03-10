import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Evento, EventoFormData } from '../types';

export const useEventos = () => {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data } = await api.get<Evento[]>('/eventos');
      return data;
    },
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evento: Omit<Evento, 'id'> | EventoFormData) => {
      const { data } = await api.post<Evento>('/eventos', evento);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

export const useUpdateEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Evento> | EventoFormData }) => {
      const { data: response } = await api.put<Evento>(`/eventos/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

export const useDeleteEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/eventos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};
