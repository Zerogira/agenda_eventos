import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Empresa {
    id: string;
    nome: string;
    cnpj?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        usuarios: number;
        clientes: number;
        eventos: number;
    };
    convites?: {
        codigo: string;
        expiresAt: string;
    }[];
    // For detailed view
    usuarios?: any[];
    clientes?: any[];
    funcionarios?: any[];
    brinquedos?: any[];
}

export interface Convite {
    id: string;
    codigo: string;
    empresaId: string;
    empresa: {
        nome: string;
    };
    usado: boolean;
    expiresAt: string;
    createdAt: string;
}

export const useEmpresas = () => {
    return useQuery({
        queryKey: ['admin', 'empresas'],
        queryFn: async () => {
            const { data } = await api.get<Empresa[]>('/admin/empresas');
            return data;
        }
    });
};

export const useEmpresaDetails = (id?: string) => {
    return useQuery({
        queryKey: ['admin', 'empresa', id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get<Empresa>(`/admin/empresas/${id}`);
            return data;
        },
        enabled: !!id
    });
};

export const useCreateEmpresa = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { nome: string; cnpj?: string }) => {
            const response = await api.post('/admin/empresas', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'empresas'] });
        }
    });
};

export const useUpdateEmpresa = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: { nome: string; cnpj?: string } }) => {
            const response = await api.put(`/admin/empresas/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'empresas'] });
        }
    });
};

export const useDeleteEmpresa = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/empresas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'empresas'] });
        }
    });
};

export const useConvites = () => {
    return useQuery({
        queryKey: ['admin', 'convites'],
        queryFn: async () => {
            const { data } = await api.get<Convite[]>('/admin/convites');
            return data;
        }
    });
};

export const useCreateConvite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { empresaId: string; expiresInDays?: number }) => {
            const response = await api.post('/admin/convites', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'convites'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'empresas'] }); // Refresh companies to show new invites if listed there
        }
    });
};
