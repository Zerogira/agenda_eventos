import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuditLog {
  id: string;
  empresaId: string;
  userId?: string;
  user?: {
    nome: string;
    email: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export const useAuditLogs = (page = 1, filters?: any) => {
  return useQuery({
    queryKey: ['audit-logs', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (filters) {
        if (filters.action) params.append('action', filters.action);
        if (filters.resource) params.append('resource', filters.resource);
        if (filters.userId) params.append('userId', filters.userId);
      }

      const { data } = await api.get<any>(`/system-logs?${params.toString()}`);
      
      // Handle nested data if present
      if (data && data.data && Array.isArray(data.data.data)) {
          return {
              data: data.data.data,
              meta: data.data.meta
          };
      }
      
      return data;
    },
  });
};
