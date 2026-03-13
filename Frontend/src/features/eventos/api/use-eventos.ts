import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Evento, EventoFormData } from '../types';

export const useEvento = (id?: string) => {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<any>(`/eventos/${id}`);
      
      const eventoData = data.success ? data.data : data;

      return {
        ...eventoData,
        dataInicio: eventoData.start || eventoData.dataInicio,
        dataFim: eventoData.end || eventoData.dataFim,
        valor: eventoData.valor || eventoData.valorTotal || 0,
        clienteId: eventoData.clienteId || eventoData.cliente?.id || 0,
        clienteNome: eventoData.cliente?.nome || eventoData.clienteNome,
      } as Evento;
    },
    enabled: !!id,
  });
};

export const useEventos = () => {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data } = await api.get<any>('/eventos');
      
      const eventosList = data.success && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);

      return eventosList.map((item: any) => ({
        ...item,
        dataInicio: item.start || item.dataInicio,
        dataFim: item.end || item.dataFim,
        valor: item.valor || item.valorTotal || 0,
        clienteId: item.clienteId || item.cliente?.id || 0,
        clienteNome: item.cliente?.nome || item.clienteNome,
        brinquedos: item.brinquedos || [],
        funcionarios: item.funcionarios || []
      })) as Evento[];
    },
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evento: Omit<Evento, 'id'> | EventoFormData) => {
      const { data } = await api.post<any>('/eventos', evento);
      return data.success ? data.data : data;
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
      const { data: response } = await api.put<any>(`/eventos/${id}`, data);
      return response.success ? response.data : response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

export const useConcluirEvento = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/eventos/${id}/concluir`);
      return data;
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
