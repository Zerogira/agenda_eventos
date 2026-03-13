import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Requires Super Admin privileges' });
  }

  next();
};
