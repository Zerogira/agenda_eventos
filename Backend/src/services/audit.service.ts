import prisma from '../prisma';

export interface CreateAuditLogData {
  empresaId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(data: CreateAuditLogData) {
    try {
      await prisma.auditLog.create({
        data: {
          empresaId: data.empresaId,
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // We don't throw error to avoid failing the main request
    }
  },

  async list(empresaId: string, page = 1, limit = 20, filters?: { userId?: string, action?: string, resource?: string }) {
    const skip = (page - 1) * limit;
    
    const where: any = { empresaId };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.resource) where.resource = { contains: filters.resource, mode: 'insensitive' };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              nome: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  },
};
