import { Router } from 'express';
import { createEmpresa, listEmpresas, updateEmpresa, deleteEmpresa, createConvite, listConvites, getEmpresaDetails } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';

const router = Router();

// All routes require authentication and SUPER_ADMIN role
router.use(authMiddleware, adminMiddleware);

router.post('/empresas', createEmpresa);
router.get('/empresas', listEmpresas);
router.get('/empresas/:id', getEmpresaDetails);
router.put('/empresas/:id', updateEmpresa);
router.delete('/empresas/:id', deleteEmpresa);

router.post('/convites', createConvite);
router.get('/convites', listConvites);

export default router;
