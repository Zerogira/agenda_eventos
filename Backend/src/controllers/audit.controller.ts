import { Request, Response } from 'express';
import { auditService } from '../services/audit.service';

export const createLog = async (req: Request, res: Response) => {
  try {
    const { action, resource, resourceId, details } = req.body;
    const empresaId = req.user?.empresaId;
    const userId = req.user?.id;

    if (!empresaId || !userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await auditService.log({
      empresaId,
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ message: 'Log created' });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    const filters = {
      userId: req.query.userId as string | undefined,
      action: req.query.action as string | undefined,
      resource: req.query.resource as string | undefined,
    };

    const result = await auditService.list(empresaId, page, limit, filters);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
