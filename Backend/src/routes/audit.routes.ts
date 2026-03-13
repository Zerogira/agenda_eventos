import { Router } from 'express';
import { listAuditLogs, createLog } from '../controllers/audit.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

router.use(authMiddleware);

// Rota pública para usuários logados criarem logs (ex: Frontend actions)
router.post('/log', createLog);

router.use(adminMiddleware);

router.get('/', listAuditLogs);

export default router;
