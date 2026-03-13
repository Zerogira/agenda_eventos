import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Cliente } from '../types';

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await api.get<any>('/clientes');
      // Backend retorna paginado: { data: [], meta: {} } ou array direto
      const clientesList = Array.isArray(data) ? data : (data.data || []);
      return clientesList as Cliente[];
    },
  });
};

export const useCliente = (id?: number) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
        if(!id) return null;
        const { data } = await api.get<Cliente>(`/clientes/${id}`);
        return data;
    },
    enabled: !!id
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cliente: Cliente) => {
      const { data } = await api.post<Cliente>('/clientes', cliente);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Cliente> }) => {
      const { data: response } = await api.put<Cliente>(`/clientes/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clientes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};
